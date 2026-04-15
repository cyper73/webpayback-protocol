import { db } from "../db";
import { citationTracking, aiKnowledgeIndex, creators, rewardDistributions, contentTracking } from "@shared/schema";
import { eq, sql, and, desc } from "drizzle-orm";
import { PoolHealthRewardScaler } from "./poolHealthRewardScaler";
import { humanityService } from "./humanityProtocol";

export interface CitationEvent {
  sourceUrl: string;
  citationContext: string;
  citationType: 'content_reference' | 'direct_quote' | 'paraphrase' | 'factual_data';
  querySource: string;
  aiModel: string;
  userAgent?: string;
  sessionId?: string;
  confidence?: number;
}

export interface KnowledgeIndexEntry {
  creatorId: number;
  contentFingerprint: string;
  contentSummary: string;
  keyTopics: string[];
}

export class CitationRewardEngine {
  private static instance: CitationRewardEngine;
  
  // Citation reward multipliers based on type and AI model - SUSTAINABLE EDITION
  private readonly REWARD_MULTIPLIERS = {
    // Citation type multipliers (sustainable rates)
    citationType: {
      'direct_quote': 1.5,        // +50% bonus: 0.015 WPT total
      'content_reference': 1.2,   // +20% bonus: 0.012 WPT total  
      'paraphrase': 1.0,          // Standard: 0.01 WPT
      'factual_data': 0.8,        // Lower reward for facts/data
    },
    
    // AI model multipliers (reduced to sustainable levels)
    aiModel: {
      'claude': 1.1,     // Max 0.011 WPT (was 1.3)
      'gpt': 1.05,       // Max 0.0105 WPT (was 1.2) 
      'grok': 1.08,      // Max 0.0108 WPT (was 1.25)
      'gemini': 1.03,    // Max 0.0103 WPT (was 1.1)
      'perplexity': 1.0, // Base rate: 0.01 WPT
      'deepseek': 0.98,  // Slightly below base
    },
    
    // Base citation reward amount - DRASTICALLY REDUCED FOR SUSTAINABILITY
    baseReward: 0.01, // 0.01 WPT per citation (15x reduction from 0.15!)
  };

  public static getInstance(): CitationRewardEngine {
    if (!CitationRewardEngine.instance) {
      CitationRewardEngine.instance = new CitationRewardEngine();
    }
    return CitationRewardEngine.instance;
  }

  /**
   * Process a citation event and calculate reward
   */
  async processCitation(citation: CitationEvent): Promise<{
    success: boolean;
    rewardAmount: number;
    citationId?: number;
    error?: string;
  }> {
    try {
      // Find creator by source URL
      const [creator] = await db
        .select()
        .from(creators)
        .where(sql`${creators.websiteUrl} = ${citation.sourceUrl} OR ${citation.sourceUrl} LIKE ${creators.websiteUrl} || '%'`)
        .limit(1);

      if (!creator) {
        return { success: false, rewardAmount: 0, error: 'Creator not found for URL' };
      }

      // Calculate base reward amount
      const baseReward = this.calculateCitationReward(citation);
      
      // Apply pool health scaling for sustainability
      const poolHealthScaler = PoolHealthRewardScaler.getInstance();
      const scaledRewardData = await poolHealthScaler.scaleRewardByPoolHealth(baseReward);
      let rewardAmount = scaledRewardData.scaledReward;

      // Check Humanity Protocol status and apply multiplier
      let humanityMultiplier = 1.0;
      let humanityScore = 0;
      let isHumanVerified = false;
      
      try {
        const humanityStatus = await humanityService.getStatus(creator.id);
        isHumanVerified = humanityStatus.isVerified;
        if (humanityStatus.isVerified) {
          humanityScore = humanityStatus.score;
          // Apply multiplier based on score (matches contract logic)
          if (humanityScore >= 95) humanityMultiplier = 2.0;
          else if (humanityScore >= 85) humanityMultiplier = 1.75;
          else if (humanityScore >= 75) humanityMultiplier = 1.5;
          else if (humanityScore > 0) humanityMultiplier = 1.25;
          
          // Apply multiplier to the reward amount
          rewardAmount = rewardAmount * humanityMultiplier;
        }
      } catch (err) {
        console.warn(`Failed to check Humanity status for creator ${creator.id}`, err);
      }

      // Insert citation tracking record
      const [citationRecord] = await db
        .insert(citationTracking)
        .values({
          creatorId: creator.id,
          sourceUrl: citation.sourceUrl,
          citationContext: citation.citationContext,
          citationType: citation.citationType,
          querySource: citation.querySource,
          aiModel: citation.aiModel,
          userAgent: citation.userAgent,
          sessionId: citation.sessionId,
          citationConfidence: citation.confidence?.toString() || "0.95",
          rewardAmount: rewardAmount.toString(),
          metadata: {
            timestamp: new Date().toISOString(),
            rewardCalculation: {
              baseReward: this.REWARD_MULTIPLIERS.baseReward,
              citationTypeMultiplier: this.REWARD_MULTIPLIERS.citationType[citation.citationType],
              aiModelMultiplier: (this.REWARD_MULTIPLIERS.aiModel as Record<string, number>)[citation.aiModel] || 1.0,
              originalReward: scaledRewardData.originalReward,
              poolHealthScaleFactor: scaledRewardData.scaleFactor,
              poolHealthStatus: scaledRewardData.healthStatus,
              humanityMultiplier: humanityMultiplier,
              humanityScore: humanityScore,
              isHumanVerified: isHumanVerified
            }
          }
        })
        .returning();

      // Update AI knowledge index
      await this.updateKnowledgeIndex(creator.id, citation);

      // Create reward distribution
      await this.distributeReward(creator.id, rewardAmount);

      console.log(`📝 Citation reward processed: ${rewardAmount} WPT for ${citation.aiModel} citing ${creator.websiteUrl}`);

      return {
        success: true,
        rewardAmount,
        citationId: citationRecord.id,
      };

    } catch (error) {
      console.error('Citation processing error:', error);
      return { success: false, rewardAmount: 0, error: error instanceof Error ? error.message : String(error) };
    }
  }

  /**
   * Calculate reward amount based on citation characteristics
   */
  private calculateCitationReward(citation: CitationEvent): number {
    const baseReward = this.REWARD_MULTIPLIERS.baseReward;
    const citationMultiplier = this.REWARD_MULTIPLIERS.citationType[citation.citationType] || 1.0;
    const aiMultiplier = (this.REWARD_MULTIPLIERS.aiModel as Record<string, number>)[citation.aiModel] || 1.0;
    const confidenceMultiplier = citation.confidence || 0.95;

    return baseReward * citationMultiplier * aiMultiplier * confidenceMultiplier;
  }

  /**
   * Update or create knowledge index entry
   */
  private async updateKnowledgeIndex(creatorId: number, citation: CitationEvent): Promise<void> {
    const contentFingerprint = this.generateContentFingerprint(citation.sourceUrl, citation.citationContext);

    // Check if knowledge index entry exists
    const [existing] = await db
      .select()
      .from(aiKnowledgeIndex)
      .where(and(
        eq(aiKnowledgeIndex.creatorId, creatorId),
        eq((aiKnowledgeIndex as any).contentFingerprint, contentFingerprint)
      ))
      .limit(1);

    if (existing) {
      // Update existing entry
      await db
        .update(aiKnowledgeIndex)
        .set({
          lastCitationDate: new Date(),
          totalCitations: ((existing as any).totalCitations || 0) + 1,
          cumulativeRewards: (parseFloat((existing as any).cumulativeRewards || '0') + this.calculateCitationReward(citation)).toString(),
        } as any)
        .where(eq(aiKnowledgeIndex.id, existing.id));
    } else {
      // Create new knowledge index entry
      await db
        .insert(aiKnowledgeIndex)
        .values({
          creatorId,
          contentHash: contentFingerprint, // Fallback schema match
          aiModel: citation.aiModel,
          sourceUrl: citation.sourceUrl,
          contentFingerprint,
          contentSummary: this.generateContentSummary(citation.citationContext),
          keyTopics: this.extractKeyTopics(citation.citationContext),
          accessTimestamp: new Date(),
          lastCitationDate: new Date(),
          totalCitations: 1,
          cumulativeRewards: this.calculateCitationReward(citation).toString(),
        } as any);
    }
  }

  /**
   * Generate unique fingerprint for content
   */
  private generateContentFingerprint(url: string, context: string): string {
    const crypto = require('crypto');
    return crypto
      .createHash('sha256')
      .update(`${url}:${context.slice(0, 100)}`)
      .digest('hex')
      .slice(0, 16);
  }

  /**
   * Generate AI-powered content summary
   */
  private generateContentSummary(context: string): string {
    // Simplified summary - in production could use AI for better summaries
    return context.length > 200 
      ? context.slice(0, 200) + "..."
      : context;
  }

  /**
   * Extract key topics from citation context
   */
  private extractKeyTopics(context: string): string[] {
    // Simple keyword extraction - in production could use NLP
    const words = context
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    return [...new Set(words)].slice(0, 10);
  }

  /**
   * Distribute reward to creator
   */
  private async distributeReward(creatorId: number, amount: number): Promise<void> {
    await db
      .insert(rewardDistributions)
      .values({
        creatorId,
        amount: amount.toString(),
        status: 'pending',
      });
  }

  /**
   * Get citation statistics for a creator - using AUTHENTIC content_tracking data
   */
  async getCitationStats(creatorId: number): Promise<{
    totalCitations: number;
    totalRewards: number;
    citationsByType: Record<string, number>;
    citationsByAI: Record<string, number>;
    recentCitations: any[];
  }> {
    try {
      // Use imported contentTracking table
      
      // Get total authentic accesses and rewards from content_tracking
      const stats = await db
        .select({
          totalCitations: sql<number>`count(*)`,
          totalRewards: sql<number>`sum(${contentTracking.rewardAmount})`,
        })
        .from(contentTracking)
        .where(eq(contentTracking.creatorId, creatorId));

      // Get accesses by AI model
      const citationsByAI = await db
        .select({
          aiModel: contentTracking.aiModel,
          count: sql<number>`count(*)`,
        })
        .from(contentTracking)
        .where(eq(contentTracking.creatorId, creatorId))
        .groupBy(contentTracking.aiModel);

      // Get recent authentic accesses
      const recentAccesses = await db
        .select()
        .from(contentTracking)
        .where(eq(contentTracking.creatorId, creatorId))
        .orderBy(desc(contentTracking.timestamp))
        .limit(10);

      // Get creator info for source URL
      const [creatorInfo] = await db
        .select({ websiteUrl: creators.websiteUrl })
        .from(creators)
        .where(eq(creators.id, creatorId))
        .limit(1);

      // Convert content_tracking records to citation format for display
      const recentCitations = recentAccesses.map(access => {
        let sourceUrl = creatorInfo?.websiteUrl || 'Unknown Source'; // Use REAL creator URL
        let citationContext = 'AI content access detected';
        
        // Extract more details from metadata if available
        try {
          const metadata = access.metadata as any;
          if (metadata?.fingerprint?.title) {
            citationContext = `AI accessed content: "${metadata.fingerprint.title}"`;
          }
        } catch (e) {
          // Use defaults if metadata parsing fails
        }

        return {
          id: access.id,
          creatorId: access.creatorId,
          sourceUrl,
          citationContext,
          citationType: 'content_reference', // Default type for authentic accesses
          querySource: 'Authentic AI content access',
          aiModel: access.aiModel || 'unknown',
          userAgent: null,
          sessionId: null,
          citationConfidence: access.detectionConfidence || '0.85',
          rewardAmount: access.rewardAmount || '0.00000000',
          timestamp: access.timestamp,
          metadata: access.metadata
        };
      });

      // Create citation types based on authentic access patterns
      const citationsByType = {
        'content_reference': stats[0]?.totalCitations || 0
      };

      return {
        totalCitations: stats[0]?.totalCitations || 0,
        totalRewards: parseFloat(stats[0]?.totalRewards?.toString() || '0'),
        citationsByType,
        citationsByAI: Object.fromEntries(
          citationsByAI.map(item => [item.aiModel || 'unknown', item.count])
        ),
        recentCitations,
      };
    } catch (error) {
      console.error('Error getting authentic citation stats:', error);
      // Return empty stats if error occurs
      return {
        totalCitations: 0,
        totalRewards: 0,
        citationsByType: {},
        citationsByAI: {},
        recentCitations: [],
      };
    }
  }

  /**
   * Simulate AI citation detection (for testing)
   */
  async simulateCitation(params: {
    creatorUrl: string;
    userQuery: string;
    aiModel: string;
    citationType?: string;
  }): Promise<{ success: boolean; rewardAmount: number; message: string }> {
    const citationEvent: CitationEvent = {
      sourceUrl: params.creatorUrl,
      citationContext: `Content referenced in response to: "${params.userQuery}"`,
      citationType: (params.citationType as any) || 'content_reference',
      querySource: params.userQuery,
      aiModel: params.aiModel,
      userAgent: 'WebPayback-Simulator',
      sessionId: `sim-${Date.now()}`,
      confidence: 0.95,
    };

    const result = await this.processCitation(citationEvent);
    
    return {
      success: result.success,
      rewardAmount: result.rewardAmount,
      message: result.success 
        ? `Citation reward: ${result.rewardAmount} WPT for ${params.aiModel} citing your content`
        : result.error || 'Citation processing failed'
    };
  }
}

export const citationRewardEngine = CitationRewardEngine.getInstance();