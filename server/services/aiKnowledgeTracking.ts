import { storage } from "../storage";
import { contentMonitoringService } from "./contentMonitoring";

interface AIKnowledgeUsage {
  channelId: string;
  channelName: string;
  aiModel: string;
  usageType: 'knowledge_base' | 'direct_access' | 'training_data';
  confidence: number;
  timestamp: Date;
  userQuery?: string;
  aiResponse?: string;
}

class AIKnowledgeTrackingService {
  private readonly YOUTUBE_CHANNEL_PATTERNS = [
    /youtube\.com\/@([^\/\s]+)/,
    /youtube\.com\/channel\/([^\/\s]+)/,
    /youtube\.com\/c\/([^\/\s]+)/,
    /youtube\.com\/user\/([^\/\s]+)/
  ];

  /**
   * Tracks AI knowledge usage when AI mentions YouTube channels
   * This works for cases where AI uses pre-existing knowledge
   */
  async trackAIKnowledgeUsage(
    aiModel: string,
    userQuery: string,
    aiResponse: string
  ): Promise<boolean> {
    try {
      // Extract YouTube channel mentions from AI response
      const channelMentions = this.extractYouTubeChannelMentions(aiResponse);
      
      if (channelMentions.length === 0) {
        return false;
      }

      // Process each channel mention
      for (const mention of channelMentions) {
        const registeredCreator = await this.findRegisteredCreator(mention);
        
        if (registeredCreator) {
          // Create knowledge usage record
          const knowledgeUsage: AIKnowledgeUsage = {
            channelId: mention,
            channelName: mention,
            aiModel,
            usageType: 'knowledge_base',
            confidence: this.calculateKnowledgeConfidence(aiResponse, mention),
            timestamp: new Date(),
            userQuery,
            aiResponse
          };

          // Process as AI access for reward distribution
          await this.processKnowledgeBasedReward(registeredCreator, knowledgeUsage);
          
          console.log(`🧠 AI Knowledge Usage Detected:
            Channel: ${mention}
            AI Model: ${aiModel}
            Creator: ${registeredCreator.name || registeredCreator.id}
            Type: Knowledge Base Access`);
        }
      }

      return true;
    } catch (error) {
      console.error(`Failed to track AI knowledge usage: ${error}`);
      return false;
    }
  }

  private extractYouTubeChannelMentions(text: string): string[] {
    const mentions = new Set<string>();
    
    // Extract channel mentions using patterns
    for (const pattern of this.YOUTUBE_CHANNEL_PATTERNS) {
      const matches = text.match(new RegExp(pattern, 'gi'));
      if (matches) {
        matches.forEach(match => {
          const channelId = match.split('/').pop() || match;
          mentions.add(channelId.replace('@', ''));
        });
      }
    }

    // Also look for @channel mentions
    const atMentions = text.match(/@([a-zA-Z0-9_]+)/g);
    if (atMentions) {
      atMentions.forEach(mention => {
        mentions.add(mention.replace('@', ''));
      });
    }

    return Array.from(mentions);
  }

  private async findRegisteredCreator(channelMention: string): Promise<any> {
    const creators = await storage.getAllCreators();
    
    return creators.find(creator => 
      creator.websiteUrl.includes(channelMention) ||
      creator.websiteUrl.includes(`@${channelMention}`) ||
      creator.name?.toLowerCase().includes(channelMention.toLowerCase())
    );
  }

  private calculateKnowledgeConfidence(aiResponse: string, channelMention: string): number {
    let confidence = 0.4; // Base confidence for knowledge base usage
    
    // Higher confidence if AI provides specific details
    if (aiResponse.includes('subscriber') || aiResponse.includes('video')) {
      confidence += 0.2;
    }
    
    // Higher confidence if AI mentions recent activity
    if (aiResponse.includes('recent') || aiResponse.includes('latest')) {
      confidence += 0.1;
    }
    
    // Higher confidence if AI provides accurate channel info
    if (aiResponse.includes('channel') && aiResponse.includes(channelMention)) {
      confidence += 0.2;
    }

    return Math.min(confidence, 0.9);
  }

  private async processKnowledgeBasedReward(creator: any, knowledgeUsage: AIKnowledgeUsage): Promise<void> {
    // Simulate AI access for reward processing
    const simulatedAccess = {
      url: creator.websiteUrl,
      userAgent: `${knowledgeUsage.aiModel}-Knowledge-Base/1.0`,
      aiType: this.mapAIModelToType(knowledgeUsage.aiModel),
      confidence: knowledgeUsage.confidence,
      ipAddress: '127.0.0.1', // Knowledge base access
      timestamp: knowledgeUsage.timestamp
    };

    await contentMonitoringService.processAIAccess(simulatedAccess);
  }

  private mapAIModelToType(aiModel: string): any {
    const modelMap: { [key: string]: any } = {
      'chatgpt': 'gpt',
      'gpt': 'gpt',
      'claude': 'claude',
      'gemini': 'gemini',
      'bard': 'gemini',
      'copilot': 'bing',
      'bing': 'bing'
    };

    return modelMap[aiModel.toLowerCase()] || 'unknown';
  }

  /**
   * API endpoint for external systems to report AI knowledge usage
   */
  async reportAIKnowledgeUsage(data: {
    aiModel: string;
    userQuery: string;
    aiResponse: string;
    source?: string;
  }): Promise<{ success: boolean; channelsDetected: number }> {
    const success = await this.trackAIKnowledgeUsage(
      data.aiModel,
      data.userQuery,
      data.aiResponse
    );

    const channelsDetected = this.extractYouTubeChannelMentions(data.aiResponse).length;

    return {
      success,
      channelsDetected
    };
  }

  /**
   * Get statistics about AI knowledge usage
   */
  async getKnowledgeUsageStats(): Promise<{
    totalKnowledgeUsages: number;
    byAIModel: { [key: string]: number };
    byChannel: { [key: string]: number };
    recentUsages: any[];
  }> {
    // This would query a dedicated knowledge_usage table in a real implementation
    return {
      totalKnowledgeUsages: 0,
      byAIModel: {},
      byChannel: {},
      recentUsages: []
    };
  }
}

export const aiKnowledgeTrackingService = new AIKnowledgeTrackingService();