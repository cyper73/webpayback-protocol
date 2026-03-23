import { Request, Response, NextFunction } from 'express';
import { twoFactorAuthService } from '../services/twoFactorAuth';
import { storage } from '../storage';

// Extend Request interface to include 2FA status
declare global {
  namespace Express {
    interface Request {
      twoFactorPassed?: boolean;
      twoFactorRequired?: boolean;
    }
  }
}

interface TwoFactorOptions {
  requireFor?: 'all' | 'sensitive' | 'none';
  skipFor?: string[]; // Array of endpoints to skip 2FA
}

/**
 * Middleware to require 2FA verification for ALL users (NO EXCEPTIONS)
 */
export function require2FA(options: TwoFactorOptions = { requireFor: 'all' }) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { creatorId, token, backupCode, walletAddress } = req.body;

      if (!creatorId) {
        return res.status(400).json({
          success: false,
          error: 'Creator ID required for 2FA verification'
        });
      }

      // Get creator from storage
      const creator = await storage.getCreator(parseInt(creatorId));
      if (!creator) {
        return res.status(404).json({
          success: false,
          error: 'Creator not found'
        });
      }

      // SECURITY REQUIREMENT: 2FA is MANDATORY for ALL users including founder wallet
      if (!creator.twoFactorEnabled || !creator.twoFactorSecret) {
        console.log(`❌ 2FA NOT ENABLED for creator ${creatorId} (wallet: ${walletAddress || 'unknown'})`);
        return res.status(403).json({
          success: false,
          error: 'Two-Factor Authentication is required for this operation. Please enable 2FA first.',
          requireSetup: true,
          message: 'Security policy requires 2FA for all users including founders. Please set up Google Authenticator first.'
        });
      }

      // 2FA is enabled, check for token or backup code
      if (!token && !backupCode) {
        return res.status(403).json({
          success: false,
          error: 'Two-Factor Authentication token required',
          require2FA: true
        });
      }

      let isValid = false;

      // Verify TOTP token
      if (token) {
        isValid = await twoFactorAuthService.validateToken(creator.twoFactorSecret, token);
        
        if (isValid) {
          // Update last used timestamp
          await storage.updateCreator(creator.id, {
            lastTwoFactorUsed: new Date()
          });
        }
      }

      // Verify backup code if TOTP failed or not provided
      if (!isValid && backupCode && creator.twoFactorBackupCodes) {
        const backupResult = twoFactorAuthService.validateBackupCode(
          creator.twoFactorBackupCodes, 
          backupCode
        );
        
        if (backupResult.isValid) {
          isValid = true;
          
          // Update backup codes (remove used one)
          await storage.updateCreator(creator.id, {
            twoFactorBackupCodes: backupResult.remainingCodes,
            lastTwoFactorUsed: new Date()
          });
          
          console.log(`🔐 Backup code used for creator ${creator.id}. Remaining codes: ${backupResult.remainingCodes.length}`);
        }
      }

      if (!isValid) {
        return res.status(403).json({
          success: false,
          error: 'Invalid 2FA token or backup code'
        });
      }

      // Mark 2FA as passed for this request
      req.twoFactorPassed = true;
      console.log(`✅ 2FA verification passed for creator ${creator.id}`);
      
      next();
    } catch (error) {
      console.error('2FA middleware error:', error);
      res.status(500).json({
        success: false,
        error: 'Two-Factor Authentication verification failed'
      });
    }
  };
}

/**
 * Middleware to suggest 2FA setup for sensitive operations
 */
export function suggest2FA() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { creatorId } = req.body;

      if (!creatorId) {
        return next(); // Skip if no creator ID
      }

      const creator = await storage.getCreator(parseInt(creatorId));
      if (!creator) {
        return next(); // Skip if creator not found
      }

      // Add suggestion header if 2FA is not enabled
      if (!creator.twoFactorEnabled) {
        res.setHeader('X-Suggest-2FA', 'true');
        res.setHeader('X-2FA-Setup-URL', '/creator-portal?tab=security');
      }

      req.twoFactorRequired = !creator.twoFactorEnabled;
      next();
    } catch (error) {
      console.error('2FA suggestion middleware error:', error);
      next(); // Don't block the request if suggestion fails
    }
  };
}

/**
 * Check if 2FA is required for a specific creator
 */
export async function check2FAStatus(creatorId: number): Promise<{
  enabled: boolean;
  required: boolean;
  setupUrl?: string;
}> {
  try {
    const creator = await storage.getCreator(creatorId);
    
    if (!creator) {
      return { enabled: false, required: false };
    }

    return {
      enabled: creator.twoFactorEnabled || false,
      required: false, // Could be configurable based on creator tier/settings
      setupUrl: creator.twoFactorEnabled ? undefined : '/creator-portal?tab=security'
    };
  } catch (error) {
    console.error('2FA status check error:', error);
    return { enabled: false, required: false };
  }
}