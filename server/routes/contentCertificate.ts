import { Router } from "express";
import { contentCertificateNftService } from "../services/contentCertificateNft";
import { getUserSession } from "../security/idorProtection";
import { z } from "zod";

const router = Router();

// Mint Content Certificate NFT with IDOR protection
router.post('/mint', async (req, res) => {
  try {
    const mintSchema = z.object({
      creatorId: z.number(),
      contentUrl: z.string().url(),
      contentTitle: z.string().min(1),
      contentText: z.string().min(50), // Minimum 50 characters
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
      querySearched: z.string().min(1),
      aiOverviewText: z.string().min(10),
      detectionMethod: z.string().optional()
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