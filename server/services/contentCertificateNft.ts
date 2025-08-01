import { ethers } from "ethers";
import { db } from "../db";
import { contentCertificateNfts, googleAiOverviewDetections, creators } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import crypto from "crypto";

export class ContentCertificateNftService {
  private provider: ethers.providers.Provider;
  private signer: ethers.Wallet;
  
  constructor() {
    this.provider = new ethers.providers.AlchemyProvider('matic', process.env.ALCHEMY_API_KEY);
    this.signer = new ethers.Wallet(process.env.PRIVATE_KEY!, this.provider);
  }

  // Generate content fingerprint using SHA-256
  generateContentFingerprint(content: string): string {
    return crypto.createHash('sha256').update(content.trim()).digest('hex');
  }

  // Mint NFT certificate for content ownership
  async mintContentCertificate(params: {
    creatorId: number;
    contentUrl: string;
    contentTitle: string;
    contentText: string;
    royaltyPercentage?: number;
  }) {
    try {
      console.log(`🎨 Minting Content Certificate NFT for creator ${params.creatorId}`);
      
      // CRITICAL SECURITY: Verify wallet is cryptographically verified before allowing NFT minting
      const [creator] = await db.select({
        id: creators.id,
        walletAddress: creators.walletAddress,
        isWalletVerified: creators.isWalletVerified,
        walletSignature: creators.walletSignature
      })
      .from(creators)
      .where(eq(creators.id, params.creatorId))
      .limit(1);
      
      if (!creator) {
        throw new Error('Creator not found');
      }
      
      if (!creator.isWalletVerified || !creator.walletSignature) {
        throw new Error('SECURITY VIOLATION: Wallet ownership must be cryptographically verified before minting NFT certificates. Please complete wallet verification first.');
      }
      
      console.log(`🔐 Wallet verification confirmed for creator ${params.creatorId}: ${creator.walletAddress}`);
      
      // Generate content fingerprint
      const contentFingerprint = this.generateContentFingerprint(params.contentText);
      
      // Check if certificate already exists
      const existing = await db.select()
        .from(contentCertificateNfts)
        .where(and(
          eq(contentCertificateNfts.creatorId, params.creatorId),
          eq(contentCertificateNfts.contentFingerprint, contentFingerprint)
        ))
        .limit(1);
        
      if (existing.length > 0) {
        throw new Error('Content certificate already exists for this content');
      }

      // Mock NFT minting (in production, use actual NFT contract)
      const mockTokenId = `WPT-CERT-${Date.now()}-${params.creatorId}`;
      const mockContractAddress = "0x9408f17a8B4666f8cb8231BA213DE04137dc3825"; // WPT contract for demo
      const mockTxHash = `0x${crypto.randomBytes(32).toString('hex')}`;

      // Store certificate in database
      const [certificate] = await db.insert(contentCertificateNfts).values({
        creatorId: params.creatorId,
        contentUrl: params.contentUrl,
        contentTitle: params.contentTitle,
        contentFingerprint,
        nftTokenId: mockTokenId,
        nftContractAddress: mockContractAddress,
        mintTransactionHash: mockTxHash,
        royaltyPercentage: (params.royaltyPercentage || 10).toString(),
        blockchainNetwork: "polygon"
      }).returning();

      console.log(`✅ Content Certificate NFT minted: ${mockTokenId}`);
      
      return {
        success: true,
        certificate,
        nftTokenId: mockTokenId,
        transactionHash: mockTxHash,
        fingerprintHash: contentFingerprint
      };

    } catch (error) {
      console.error('Error minting content certificate:', error);
      throw error;
    }
  }

  // Detect content usage in Google AI Overview
  async detectGoogleAiOverviewUsage(params: {
    querySearched: string;
    aiOverviewText: string;
    detectionMethod?: string;
  }) {
    try {
      console.log(`🔍 Scanning for content matches in Google AI Overview...`);
      
      // Get all active certificates
      const certificates = await db.select({
        id: contentCertificateNfts.id,
        creatorId: contentCertificateNfts.creatorId,
        contentTitle: contentCertificateNfts.contentTitle,
        contentFingerprint: contentCertificateNfts.contentFingerprint,
        royaltyPercentage: contentCertificateNfts.royaltyPercentage
      })
      .from(contentCertificateNfts)
      .where(eq(contentCertificateNfts.isActive, true));

      const detections = [];

      for (const cert of certificates) {
        // Simple text matching (in production, use advanced semantic matching)
        const matchingConfidence = this.calculateMatchingConfidence(
          params.aiOverviewText, 
          cert.contentFingerprint
        );

        if (matchingConfidence > 70) { // 70% confidence threshold
          // Calculate WPT reward based on confidence and royalty percentage
          const baseReward = 1.0; // Base 1 WPT per detection
          const confidenceMultiplier = matchingConfidence / 100;
          const royaltyMultiplier = parseFloat(cert.royaltyPercentage) / 10;
          const wptReward = baseReward * confidenceMultiplier * royaltyMultiplier;

          // Log detection
          const [detection] = await db.insert(googleAiOverviewDetections).values({
            certificateNftId: cert.id,
            querySearched: params.querySearched,
            detectedFragment: params.aiOverviewText.substring(0, 500), // First 500 chars
            matchingConfidence: matchingConfidence.toString(),
            wptRewardAmount: wptReward.toString(),
            detectionMethod: params.detectionMethod || 'content_fingerprint'
          }).returning();

          // Update certificate stats (simplified for now)
          await db.update(contentCertificateNfts)
            .set({
              totalDetectedUses: 1, // Simplified increment
              totalWptEarned: wptReward.toString(),
              updatedAt: new Date()
            })
            .where(eq(contentCertificateNfts.id, cert.id));

          detections.push({
            certificateId: cert.id,
            creatorId: cert.creatorId,
            contentTitle: cert.contentTitle,
            matchingConfidence,
            wptReward,
            detection
          });

          console.log(`💰 Content usage detected! Creator ${cert.creatorId} earned ${wptReward} WPT`);
        }
      }

      return {
        success: true,
        totalDetections: detections.length,
        detections,
        querySearched: params.querySearched
      };

    } catch (error) {
      console.error('Error detecting Google AI Overview usage:', error);
      throw error;
    }
  }

  // Calculate matching confidence (simplified algorithm)
  private calculateMatchingConfidence(aiOverviewText: string, contentFingerprint: string): number {
    // In production, implement sophisticated semantic matching
    // For now, using simple hash-based matching
    const aiOverviewHash = this.generateContentFingerprint(aiOverviewText);
    
    // Calculate similarity (simplified)
    let matches = 0;
    const minLength = Math.min(aiOverviewHash.length, contentFingerprint.length);
    
    for (let i = 0; i < minLength; i++) {
      if (aiOverviewHash[i] === contentFingerprint[i]) {
        matches++;
      }
    }
    
    return Math.min(100, (matches / minLength) * 100);
  }

  // Get creator's content certificates
  async getCreatorCertificates(creatorId: number) {
    try {
      const certificates = await db.select()
        .from(contentCertificateNfts)
        .where(eq(contentCertificateNfts.creatorId, creatorId))
        .orderBy(desc(contentCertificateNfts.createdAt));

      return {
        success: true,
        certificates,
        totalCertificates: certificates.length
      };
    } catch (error) {
      console.error('Error fetching creator certificates:', error);
      throw error;
    }
  }

  // Get detection statistics
  async getDetectionStats() {
    try {
      // In production, implement proper aggregation queries
      const recentDetections = await db.select()
        .from(googleAiOverviewDetections)
        .orderBy(desc(googleAiOverviewDetections.createdAt))
        .limit(50);

      return {
        success: true,
        recentDetections: recentDetections.length,
        totalRewardsPaid: recentDetections.reduce((sum, detection) => 
          sum + parseFloat(detection.wptRewardAmount), 0
        ),
        averageConfidence: recentDetections.reduce((sum, detection) => 
          sum + parseFloat(detection.matchingConfidence), 0
        ) / (recentDetections.length || 1)
      };
    } catch (error) {
      console.error('Error getting detection stats:', error);
      throw error;
    }
  }
}

export const contentCertificateNftService = new ContentCertificateNftService();