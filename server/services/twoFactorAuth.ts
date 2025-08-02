import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';

export interface TwoFactorConfig {
  secret: string;
  qrCodeUrl: string;
  manualEntryCode: string;
  backupCodes: string[];
}

export interface SetupInstructions {
  steps: string[];
  recommendedApps: string[];
  troubleshooting: string[];
}

export class TwoFactorAuthService {
  /**
   * Generate a new 2FA secret and QR code for a user
   */
  async generateTwoFactorSecret(email: string, serviceName: string): Promise<TwoFactorConfig> {
    // Generate secret
    const secret = speakeasy.generateSecret({
      name: email,
      issuer: `WebPayback Protocol - ${serviceName}`,
      length: 32
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

    // Generate backup codes
    const backupCodes = this.generateBackupCodes();

    return {
      secret: secret.base32!,
      qrCodeUrl,
      manualEntryCode: secret.base32!,
      backupCodes
    };
  }

  /**
   * Validate a TOTP token during setup
   */
  async validateSetup(secret: string, token: string): Promise<boolean> {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2, // Allow 2-step time drift (30 sec x 2 = 60 sec window)
    });
  }

  /**
   * Validate a TOTP token for authentication
   */
  async validateToken(secret: string, token: string): Promise<boolean> {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 1, // Stricter window for regular auth
    });
  }

  /**
   * Validate a backup code
   */
  validateBackupCode(backupCodes: string[], providedCode: string): { isValid: boolean; remainingCodes: string[] } {
    const normalizedCode = providedCode.replace(/[-\s]/g, '').toUpperCase();
    const codeIndex = backupCodes.findIndex(code => 
      code.replace(/[-\s]/g, '').toUpperCase() === normalizedCode
    );

    if (codeIndex === -1) {
      return { isValid: false, remainingCodes: backupCodes };
    }

    // Remove used backup code
    const remainingCodes = [...backupCodes];
    remainingCodes.splice(codeIndex, 1);

    return { isValid: true, remainingCodes };
  }

  /**
   * Generate backup codes
   */
  private generateBackupCodes(): string[] {
    const codes: string[] = [];
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    
    for (let i = 0; i < 10; i++) {
      let code = '';
      for (let j = 0; j < 8; j++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      // Format as XXXX-XXXX
      codes.push(code.substring(0, 4) + '-' + code.substring(4));
    }
    
    return codes;
  }

  /**
   * Get setup instructions for users
   */
  getSetupInstructions(): SetupInstructions {
    return {
      steps: [
        "Download and install a TOTP authenticator app on your smartphone",
        "Open the app and tap 'Add Account' or 'Scan QR Code'",
        "Scan the QR code displayed above with your phone's camera",
        "If you can't scan the QR code, manually enter the secret code",
        "Your app will generate a 6-digit code that changes every 30 seconds",
        "Enter the current 6-digit code below to verify the setup",
        "Save your backup codes in a secure location"
      ],
      recommendedApps: [
        "Google Authenticator",
        "Authy",
        "Microsoft Authenticator",
        "1Password",
        "LastPass Authenticator"
      ],
      troubleshooting: [
        "Make sure your phone's time is synchronized",
        "Try refreshing the QR code if it doesn't scan",
        "Ensure your authenticator app supports TOTP (Time-based OTP)",
        "Check that you entered the complete 6-digit code",
        "Contact support if you continue having issues"
      ]
    };
  }

  /**
   * Generate new backup codes
   */
  regenerateBackupCodes(): string[] {
    return this.generateBackupCodes();
  }
}

export const twoFactorAuthService = new TwoFactorAuthService();