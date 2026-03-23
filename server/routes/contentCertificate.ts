import { Router } from "express";
import { contentCertificateNftService } from "../services/contentCertificateNft";
import { getUserSession } from "../security/idorProtection";
import { require2FA } from "../middleware/twoFactorProtection";
import { z } from "zod";
import { urlValidationSchema, escapeHtml } from "../security/inputValidation";

const router = Router();

// Wallet-based access verification
router.post('/verify-wallet', async (req, res) => {
  try {
    const { walletAddress } = req.body;
    
    if (!walletAddress || typeof walletAddress !== 'string') {
      return res.status(400).json({ 
        success: false, 
        error: 'Wallet address is required' 
      });
    }

    // Validate wallet address format
    if (!walletAddress.startsWith('0x') || walletAddress.length !== 42) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid wallet address format' 
      });
    }

    // Get creators by wallet address from storage
    const { storage } = await import('../storage');
    const creators = await storage.getAllCreators();
    
    // Find creator with matching wallet address
    const matchingCreator = creators.find(creator => 
      creator.walletAddress?.toLowerCase() === walletAddress.toLowerCase()
    );

    if (!matchingCreator) {
      return res.status(404).json({
        success: false,
        error: 'Wallet address not found in Creator Portal. Please register as a creator first.',
        action: 'register'
      });
    }

    // Check if wallet is cryptographically verified
    if (!matchingCreator.isWalletVerified) {
      return res.status(403).json({
        success: false,
        error: 'Wallet verification required. Please complete cryptographic signature verification in Creator Portal.',
        action: 'verify',
        creator: {
          id: matchingCreator.id,
          websiteUrl: matchingCreator.websiteUrl,
          walletAddress: matchingCreator.walletAddress
        }
      });
    }

    // Success - wallet is registered and verified
    res.json({
      success: true,
      message: 'Wallet verification successful',
      creator: matchingCreator
    });

  } catch (error) {
    console.error('Wallet verification failed:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Mint Content Certificate NFT with IDOR protection and MANDATORY 2FA
router.post('/mint', require2FA({ requireFor: 'all' }), async (req, res) => {
  try {
    const mintSchema = z.object({
      creatorId: z.number(),
      contentUrl: urlValidationSchema, // Use secure URL validation with XSS protection
      contentTitle: z.string().min(1).max(200).transform(escapeHtml), // Sanitize title
      contentText: z.string().min(50).max(50000).transform(escapeHtml), // Sanitize content with length limit
      royaltyPercentage: z.number().min(0).max(50).optional() // Max 50% royalty
    });

    const data = mintSchema.parse(req.body);
    
    // CRITICAL: Verify user owns the creator
    const userSession = getUserSession(req);
    if (!userSession) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    if (!userSession.authenticatedCreatorIds.includes(data.creatorId) && !userSession.isAdmin) {
      console.log(`IDOR BLOCKED: User ${userSession.userId} attempted to mint for creator ${data.creatorId}`);
      return res.status(403).json({ 
        success: false, 
        error: 'Access denied: You can only mint certificates for your own content' 
      });
    }
    
    const result = await contentCertificateNftService.mintContentCertificate(data);

    res.json(result);
  } catch (error) {
    console.error('Content certificate minting failed:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Detect Google AI Overview usage
router.post('/detect-usage', async (req, res) => {
  try {
    const detectionSchema = z.object({
      querySearched: z.string().min(1).max(500).transform(escapeHtml), // Sanitize query
      aiOverviewText: z.string().min(10).max(10000).transform(escapeHtml), // Sanitize AI text
      detectionMethod: z.string().max(100).optional().transform(val => val ? escapeHtml(val) : val) // Sanitize method
    });

    const data = detectionSchema.parse(req.body);
    const result = await contentCertificateNftService.detectGoogleAiOverviewUsage(data);

    res.json(result);
  } catch (error) {
    console.error('Usage detection failed:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Get creator's certificates with IDOR protection
router.get('/creator/:creatorId', async (req, res) => {
  try {
    const creatorId = parseInt(req.params.creatorId);
    if (isNaN(creatorId)) {
      return res.status(400).json({ success: false, error: 'Invalid creator ID' });
    }

    // CRITICAL: IDOR protection - verify user owns this creator
    const userSession = getUserSession(req);
    if (!userSession) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    // Check if user owns this creator
    if (!userSession.authenticatedCreatorIds.includes(creatorId) && !userSession.isAdmin) {
      console.log(`IDOR BLOCKED: User ${userSession.userId} attempted to access creator ${creatorId}`);
      return res.status(403).json({ 
        success: false, 
        error: 'Access denied: You can only view your own certificates' 
      });
    }

    const result = await contentCertificateNftService.getCreatorCertificates(creatorId);
    res.json(result);
  } catch (error) {
    console.error('Error fetching creator certificates:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Get detection statistics
router.get('/stats', async (req, res) => {
  try {
    const result = await contentCertificateNftService.getDetectionStats();
    res.json(result);
  } catch (error) {
    console.error('Error fetching detection stats:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

export { router as contentCertificateRouter };