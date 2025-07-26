import { Router, type Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { users, creators, rewardDistributions } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { csrfProtection } from '../security/csrfProtection';
import { isUserAdmin, getUserOwnedCreators } from '../security/idorProtection';

const router = Router();

// GDPR Data Request Schema
const dataRequestSchema = z.object({
  email: z.string().email(),
  requestType: z.enum(['access', 'delete', 'portability', 'rectification']),
  details: z.string().optional()
});

// GDPR Consent Schema
const consentSchema = z.object({
  dataProcessing: z.boolean(),
  marketing: z.boolean(),
  analytics: z.boolean(),
  timestamp: z.number()
});

// Get user data for GDPR access request
router.get('/data/export/:userId', async (req: Request, res: Response) => {
  // IDOR Protection check
  const isAdmin = isUserAdmin(req);
  const ownedCreators = getUserOwnedCreators(req);
  const requestedUserId = parseInt(req.params.userId);
  
  if (!isAdmin && !ownedCreators.includes(requestedUserId)) {
    return res.status(403).json({ 
      error: 'Access denied', 
      code: 'IDOR_PROTECTION_GDPR' 
    });
  }
  try {
    const userId = parseInt(req.params.userId);
    
    // Get user data
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get creator data
    const userCreators = await db.select().from(creators).where(eq(creators.userId, userId));
    
    // Get rewards data
    const creatorIds = userCreators.map(c => c.id);
    const userRewards = creatorIds.length > 0 
      ? await db.select().from(rewardDistributions).where(
          eq(rewardDistributions.creatorId, creatorIds[0]) // Simplified for demo
        )
      : [];

    // Compile GDPR data export
    const gdprData = {
      exportDate: new Date().toISOString(),
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      creators: userCreators.map(creator => ({
        id: creator.id,
        websiteUrl: creator.websiteUrl,
        walletAddress: creator.walletAddress,
        contentCategory: creator.contentCategory,
        isVerified: creator.isVerified,
        createdAt: creator.createdAt,
        updatedAt: creator.updatedAt
      })),
      rewards: userRewards.map(reward => ({
        id: reward.id,
        amount: reward.amount,
        transactionHash: reward.transactionHash,
        status: reward.status,
        createdAt: reward.createdAt,
        completedAt: reward.completedAt
      })),
      dataProcessingBasis: [
        'Legitimate interest for service provision',
        'Contract performance for token distribution',
        'Legal compliance for anti-fraud measures'
      ],
      retentionPeriods: {
        userAccount: '7 years after account closure',
        transactionData: 'Permanent (blockchain immutability)',
        analyticsData: '2 years from collection'
      }
    };

    res.json({
      success: true,
      data: gdprData,
      note: 'Blockchain transaction data cannot be deleted due to immutable nature'
    });

  } catch (error) {
    console.error('GDPR data export error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to export user data' 
    });
  }
});

// Submit GDPR data request
router.post('/request', csrfProtection, async (req: Request, res: Response) => {
  try {
    const validatedData = dataRequestSchema.parse(req.body);
    
    // In production, this would:
    // 1. Verify email ownership
    // 2. Create support ticket
    // 3. Notify DPO (Data Protection Officer)
    // 4. Start legal compliance process
    
    console.log('GDPR Request received:', {
      email: validatedData.email,
      type: validatedData.requestType,
      timestamp: new Date().toISOString()
    });

    // Simulate request processing
    const requestId = `GDPR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    res.json({
      success: true,
      requestId,
      message: 'GDPR request received and is being processed',
      expectedResponse: '30 days (as per GDPR Article 12)',
      contact: 'cyper73@gmail.com',
      nextSteps: [
        'Identity verification email sent',
        'Legal team notified',
        'Data processing team assigned',
        'Response within 30 days as required by GDPR'
      ]
    });

  } catch (error) {
    console.error('GDPR request error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to process GDPR request' 
    });
  }
});

// Update consent preferences
router.post('/consent', csrfProtection, async (req: Request, res: Response) => {
  try {
    const validatedData = consentSchema.parse(req.body);
    
    // Store consent preferences (in production: database table)
    const consentRecord = {
      userId: req.session?.userId || null,
      dataProcessing: validatedData.dataProcessing,
      marketing: validatedData.marketing,
      analytics: validatedData.analytics,
      timestamp: new Date(validatedData.timestamp),
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    };

    console.log('Consent updated:', consentRecord);

    res.json({
      success: true,
      message: 'Consent preferences updated successfully',
      consent: consentRecord,
      rights: {
        withdraw: 'You can withdraw consent at any time',
        access: 'Request access to your personal data',
        rectification: 'Request correction of inaccurate data',
        erasure: 'Request deletion of personal data (subject to legal obligations)',
        portability: 'Request data in machine-readable format',
        restriction: 'Request restriction of processing'
      }
    });

  } catch (error) {
    console.error('Consent update error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update consent' 
    });
  }
});

// Get GDPR compliance information
router.get('/info', async (req: Request, res: Response) => {
  res.json({
    success: true,
    gdprCompliance: {
      dataController: {
        name: 'WebPayback Protocol',
        email: 'cyper73@gmail.com',
        dpo: 'cyper73@gmail.com' // Data Protection Officer
      },
      legalBasis: [
        'Article 6(1)(b) GDPR: Contract performance',
        'Article 6(1)(f) GDPR: Legitimate interests',
        'Article 6(1)(c) GDPR: Legal compliance'
      ],
      userRights: [
        'Right of access (Article 15)',
        'Right to rectification (Article 16)', 
        'Right to erasure (Article 17)',
        'Right to restrict processing (Article 18)',
        'Right to data portability (Article 20)',
        'Right to object (Article 21)',
        'Rights related to automated decision making (Article 22)'
      ],
      dataRetention: {
        userAccounts: '7 years after account closure',
        blockchainData: 'Permanent (immutable by design)',
        analyticsData: '2 years from collection',
        logData: '1 year for security purposes'
      },
      supervisoryAuthority: {
        name: 'To be determined based on primary establishment',
        website: 'https://edpb.europa.eu/about-edpb/about-edpb/members_en'
      },
      lastUpdated: '2025-01-19'
    }
  });
});

export default router;