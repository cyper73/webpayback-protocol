/**
 * Cultural Reward Engine - LLM → Qloo → WebPayback Integration
 * Implements taste-aware WPT token distribution based on cultural intelligence
 */

import { qlooService, type QlooContentAnalysis, type QlooRewardCalculation } from './qlooService';

interface CulturalAnalysisRequest {
  creatorId: number;
  contentUrl: string;
  contentText?: string;
  aiModelUsed: string;
  userLocation?: string;
  userDemographics?: {
    age_range?: string;
    interests?: string[];
    cultural_background?: string;
  };
}

interface CulturalRewardResult {
  creator_id: number;
  original_reward: number;
  cultural_analysis: QlooContentAnalysis;
  reward_calculation: QlooRewardCalculation;
  cultural_insights: {
    primary_culture: string;
    inclusivity_score: number;
    taste_relevance: number;
    community_impact: number;
  };
  recommendation: {
    suggested_categories: string[];
    audience_expansion_tips: string[];
    cultural_optimization_advice: string[];
  };
}

export class CulturalRewardEngine {
  private static instance: CulturalRewardEngine;
  
  static getInstance(): CulturalRewardEngine {
    if (!CulturalRewardEngine.instance) {
      CulturalRewardEngine.instance = new CulturalRewardEngine();
    }
    return CulturalRewardEngine.instance;
  }

  /**
   * Process cultural analysis and calculate enhanced WPT rewards
   */
  async processCulturalReward(request: CulturalAnalysisRequest): Promise<CulturalRewardResult> {
    try {
      // Step 1: Qloo Cultural Analysis
      const culturalAnalysis = await qlooService.analyzeContent(
        request.contentUrl, 
        request.contentText
      );

      // Step 2: Calculate base reward (existing WebPayback logic)
      const baseReward = this.calculateBaseReward(request.aiModelUsed);

      // Step 3: Apply cultural intelligence multipliers
      const rewardCalculation = await qlooService.calculateCulturalReward(
        baseReward,
        culturalAnalysis,
        request.userLocation
      );

      // Step 4: Generate cultural insights and recommendations
      const culturalInsights = this.generateCulturalInsights(culturalAnalysis);
      const recommendations = this.generateRecommendations(culturalAnalysis, request);

      return {
        creator_id: request.creatorId,
        original_reward: baseReward,
        cultural_analysis: culturalAnalysis,
        reward_calculation: rewardCalculation,
        cultural_insights: culturalInsights,
        recommendation: recommendations
      };

    } catch (error) {
      console.error('Cultural reward processing failed:', error);
      throw new Error(`Cultural analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Batch process multiple creators for cultural optimization
   */
  async batchProcessCulturalRewards(requests: CulturalAnalysisRequest[]): Promise<CulturalRewardResult[]> {
    const results = await Promise.allSettled(
      requests.map(request => this.processCulturalReward(request))
    );

    return results
      .filter((result): result is PromiseFulfilledResult<CulturalRewardResult> => 
        result.status === 'fulfilled'
      )
      .map(result => result.value);
  }

  /**
   * Get trending cultural categories for creator recommendations
   */
  async getTrendingCulturalOpportunities(): Promise<{
    trending_categories: string[];
    high_reward_potential: string[];
    underrepresented_cultures: string[];
    cross_cultural_opportunities: string[];
  }> {
    const trendingCategories = await qlooService.getTrendingCulturalCategories();
    
    return {
      trending_categories: trendingCategories.slice(0, 8),
      high_reward_potential: [
        'vegan_cuisine', 'sustainable_fashion', 'indigenous_art',
        'urban_gardening', 'cultural_fusion', 'social_activism'
      ],
      underrepresented_cultures: [
        'indigenous_american', 'african_diaspora', 'pacific_islander',
        'middle_eastern', 'eastern_european', 'central_asian'
      ],
      cross_cultural_opportunities: [
        'fusion_cooking', 'multicultural_music', 'diaspora_stories',
        'cross_cultural_collaboration', 'global_sustainability'
      ]
    };
  }

  /**
   * Calculate base WPT reward (existing WebPayback logic)
   */
  private calculateBaseReward(aiModel: string): number {
    const aiModelMultipliers: Record<string, number> = {
      'Claude': 1.22,
      'GPT-4': 1.25,
      'DeepSeek': 0.99,
      'Mistral': 1.02,
      'Grok': 1.15,
      'Gemini': 1.10,
      'Perplexity': 1.08,
      'Llama': 0.95
    };

    const baseWPT = 1.0; // Base WPT per AI access
    const multiplier = aiModelMultipliers[aiModel] || 1.0;
    
    return Math.round(baseWPT * multiplier * 100) / 100;
  }

  /**
   * Generate cultural insights from Qloo analysis
   */
  private generateCulturalInsights(analysis: QlooContentAnalysis): CulturalRewardResult['cultural_insights'] {
    const primaryCulture = analysis.cultural_tags.length > 0 
      ? analysis.cultural_tags[0] 
      : 'global_audience';

    const inclusivityScore = this.calculateInclusivityScore(analysis);
    const tasteRelevance = analysis.audience_match.taste_alignment;
    const communityImpact = this.estimateCommunityImpact(analysis);

    return {
      primary_culture: primaryCulture,
      inclusivity_score: Math.round(inclusivityScore * 100) / 100,
      taste_relevance: Math.round(tasteRelevance * 100) / 100,
      community_impact: Math.round(communityImpact * 100) / 100
    };
  }

  /**
   * Generate recommendations for creators based on cultural analysis
   */
  private generateRecommendations(
    analysis: QlooContentAnalysis, 
    request: CulturalAnalysisRequest
  ): CulturalRewardResult['recommendation'] {
    
    const suggestedCategories = this.getSuggestedCategories(analysis);
    const audienceExpansionTips = this.getAudienceExpansionTips(analysis);
    const culturalOptimizationAdvice = this.getCulturalOptimizationAdvice(analysis);

    return {
      suggested_categories: suggestedCategories,
      audience_expansion_tips: audienceExpansionTips,
      cultural_optimization_advice: culturalOptimizationAdvice
    };
  }

  private calculateInclusivityScore(analysis: QlooContentAnalysis): number {
    let score = 0.5; // Base inclusivity
    
    // Bonus for diverse cultural tags
    if (analysis.cultural_tags.length > 1) score += 0.2;
    
    // Bonus for underrepresented cultures
    const underrepresented = ['indigenous', 'african_culture', 'middle_eastern'];
    if (analysis.cultural_tags.some(tag => underrepresented.includes(tag))) {
      score += 0.3;
    }
    
    // Bonus for inclusive categories
    const inclusiveCategories = ['sustainable_living', 'social_activism', 'cultural_fusion'];
    if (analysis.detected_categories.some(cat => inclusiveCategories.includes(cat))) {
      score += 0.2;
    }
    
    return Math.min(score, 1.0);
  }

  private estimateCommunityImpact(analysis: QlooContentAnalysis): number {
    // Base on engagement potential and cultural relevance
    const engagementScore = analysis.taste_profile.engagement_potential;
    const culturalScore = analysis.taste_profile.cultural_relevance;
    
    return (engagementScore + culturalScore) / 2;
  }

  private getSuggestedCategories(analysis: QlooContentAnalysis): string[] {
    const current = analysis.detected_categories;
    const suggestions: string[] = [];
    
    // Smart category expansion based on current content
    if (current.includes('vegan_cuisine')) {
      suggestions.push('sustainable_living', 'health_wellness', 'ethical_consumption');
    }
    
    if (current.includes('street_art')) {
      suggestions.push('urban_culture', 'social_commentary', 'community_activism');
    }
    
    if (current.includes('music')) {
      suggestions.push('cultural_fusion', 'cross_genre_collaboration', 'world_music');
    }
    
    // Always suggest cultural bridge categories
    suggestions.push('cultural_exchange', 'global_community', 'inclusive_content');
    
    return suggestions.slice(0, 5);
  }

  private getAudienceExpansionTips(analysis: QlooContentAnalysis): string[] {
    const tips: string[] = [];
    const primaryDemo = analysis.audience_match.primary_demographic;
    
    if (primaryDemo === 'health_conscious_millennials') {
      tips.push(
        'Consider content for Gen Z health enthusiasts',
        'Explore family-friendly wellness content',
        'Add cultural diversity to health recipes'
      );
    }
    
    if (primaryDemo === 'urban_creatives') {
      tips.push(
        'Collaborate with artists from different cultures',
        'Document art in suburban/rural settings',
        'Create accessible art tutorials'
      );
    }
    
    // Universal expansion tips
    tips.push(
      'Include subtitles in multiple languages',
      'Feature guest creators from different backgrounds',
      'Share cultural context behind your content'
    );
    
    return tips.slice(0, 4);
  }

  private getCulturalOptimizationAdvice(analysis: QlooContentAnalysis): string[] {
    const advice: string[] = [];
    
    // Based on current cultural representation
    if (analysis.cultural_tags.length === 0) {
      advice.push('Consider highlighting your cultural background or influences');
    }
    
    if (analysis.cultural_tags.length === 1) {
      advice.push('Explore cross-cultural collaborations and fusion content');
    }
    
    // Specific optimization based on content type
    if (analysis.content_type === 'video') {
      advice.push(
        'Add cultural context in descriptions',
        'Use diverse music and visual references'
      );
    }
    
    // Universal optimization
    advice.push(
      'Tell the cultural story behind your content',
      'Engage with creators from different cultural backgrounds',
      'Share cultural traditions and their modern adaptations'
    );
    
    return advice.slice(0, 4);
  }

  /**
   * Get cultural reward statistics for dashboard
   */
  async getCulturalRewardStats(): Promise<{
    total_cultural_rewards_distributed: number;
    top_cultural_categories: Array<{ category: string; reward_total: number; creator_count: number }>;
    cultural_diversity_score: number;
    trending_cultural_content: string[];
    inclusivity_metrics: {
      underrepresented_cultures_supported: number;
      cross_cultural_collaborations: number;
      cultural_education_content: number;
    };
  }> {
    // Simulated stats for demo - in production would query database
    return {
      total_cultural_rewards_distributed: 847.5,
      top_cultural_categories: [
        { category: 'vegan_cuisine', reward_total: 234.5, creator_count: 18 },
        { category: 'street_art', reward_total: 189.2, creator_count: 12 },
        { category: 'sustainable_fashion', reward_total: 156.8, creator_count: 15 },
        { category: 'cultural_fusion', reward_total: 134.1, creator_count: 9 },
        { category: 'indigenous_art', reward_total: 132.9, creator_count: 7 }
      ],
      cultural_diversity_score: 0.89,
      trending_cultural_content: [
        'vegan_asian_fusion', 'sustainable_streetwear', 'indigenous_modern_art',
        'multicultural_music', 'eco_urban_gardening'
      ],
      inclusivity_metrics: {
        underrepresented_cultures_supported: 23,
        cross_cultural_collaborations: 15,
        cultural_education_content: 31
      }
    };
  }
}

export const culturalRewardEngine = CulturalRewardEngine.getInstance();