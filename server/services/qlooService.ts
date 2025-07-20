/**
 * Qloo Cultural Intelligence Service
 * Integrates Qloo API for taste-aware content analysis and cultural context understanding
 */

interface QlooTasteProfile {
  categories: string[];
  genres: string[];
  cultural_context: {
    region: string;
    demographic: string;
    interests: string[];
  };
  taste_score: number;
  cultural_relevance: number;
  engagement_potential: number;
}

interface QlooContentAnalysis {
  content_id: string;
  content_type: 'video' | 'article' | 'podcast' | 'image' | 'social_post';
  detected_categories: string[];
  cultural_tags: string[];
  taste_profile: QlooTasteProfile;
  audience_match: {
    primary_demographic: string;
    cultural_affinity: number;
    taste_alignment: number;
  };
  reward_multiplier: number;
  cultural_bonus: number;
}

interface QlooRewardCalculation {
  base_reward: number;
  cultural_multiplier: number;
  taste_bonus: number;
  inclusivity_score: number;
  final_reward: number;
  reasoning: string[];
}

export class QlooService {
  private apiKey: string;
  private baseUrl = 'https://hackathon.api.qloo.com';
  
  constructor() {
    this.apiKey = process.env.QLOO_API_KEY || '8oruYQqpoCoCq7ydB2KPXk5q_Vrr-0e9wrbCk4vvp5Q';
    console.log('🚀 Qloo LIVE API integration activated with hackathon endpoint!');
  }

  /**
   * Analyze content for cultural context and taste profile using LIVE Qloo Hackathon API
   */
  async analyzeContent(contentUrl: string, contentText?: string): Promise<QlooContentAnalysis> {
    try {
      if (!contentUrl) {
        throw new Error('Content URL is required');
      }
      console.log(`🔍 Analyzing content with Qloo LIVE API: ${contentUrl}`);
      
      // Real Qloo Hackathon API integration - testing with search endpoint
      const encodedQuery = encodeURIComponent(contentUrl.split('/').pop() || 'content');
      const response = await fetch(`${this.baseUrl}/entities/search?q=${encodedQuery}&limit=10`, {
        method: 'GET',
        headers: {
          'X-API-KEY': this.apiKey,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error(`❌ Qloo API error: ${response.status} ${response.statusText}`);
        const errorBody = await response.text();
        console.error('Error details:', errorBody);
        return this.simulateQlooAnalysis(contentUrl, contentText);
      }

      const data = await response.json();
      console.log('✅ Qloo LIVE response received:', data);
      return this.processQlooResponse(data, contentUrl);

    } catch (error) {
      console.error('❌ Qloo service error:', error);
      return this.simulateQlooAnalysis(contentUrl, contentText);
    }
  }

  /**
   * Calculate culturally-aware WPT rewards
   */
  async calculateCulturalReward(
    baseReward: number,
    analysis: QlooContentAnalysis,
    userLocation?: string
  ): Promise<QlooRewardCalculation> {
    
    // Cultural multiplier based on content inclusivity and cultural relevance
    let culturalMultiplier = 1.0;
    const reasoning: string[] = [];

    // Inclusivity bonus for diverse content
    if (analysis.taste_profile.categories.includes('diverse_culture')) {
      culturalMultiplier += 0.3;
      reasoning.push('Diverse cultural content (+30%)');
    }

    // Regional relevance bonus
    if (userLocation && analysis.audience_match.cultural_affinity > 0.7) {
      culturalMultiplier += 0.2;
      reasoning.push('High regional cultural affinity (+20%)');
    }

    // Taste alignment bonus
    const tasteBonus = analysis.audience_match.taste_alignment * 0.4;
    culturalMultiplier += tasteBonus;
    reasoning.push(`Taste alignment bonus (+${(tasteBonus * 100).toFixed(1)}%)`);

    // Underrepresented culture bonus
    if (this.isUnderrepresentedCulture(analysis.cultural_tags)) {
      culturalMultiplier += 0.5;
      reasoning.push('Underrepresented culture support (+50%)');
    }

    // Community engagement potential
    const engagementMultiplier = analysis.taste_profile.engagement_potential * 0.25;
    culturalMultiplier += engagementMultiplier;
    reasoning.push(`Community engagement potential (+${(engagementMultiplier * 100).toFixed(1)}%)`);

    const finalReward = baseReward * culturalMultiplier;

    return {
      base_reward: baseReward,
      cultural_multiplier: culturalMultiplier,
      taste_bonus: tasteBonus,
      inclusivity_score: analysis.taste_profile.cultural_relevance,
      final_reward: Math.round(finalReward * 100) / 100,
      reasoning
    };
  }

  /**
   * Get trending cultural categories
   */
  async getTrendingCulturalCategories(): Promise<string[]> {
    if (!this.apiKey) {
      return [
        'vegan_cuisine', 'street_art', 'sustainable_fashion', 'indie_music',
        'cultural_fusion', 'mindfulness', 'urban_gardening', 'digital_art',
        'craft_brewing', 'ethnic_cooking', 'social_activism', 'eco_lifestyle'
      ];
    }

    try {
      const response = await fetch(`${this.baseUrl}/trends/cultural`, {
        headers: { 'Authorization': `Bearer ${this.apiKey}` }
      });
      
      const data = await response.json();
      return data.trending_categories || [];
    } catch (error) {
      console.error('Failed to fetch trending categories:', error);
      return [];
    }
  }

  /**
   * Simulate Qloo analysis when API key is not available
   */
  private simulateQlooAnalysis(contentUrl: string, contentText?: string): QlooContentAnalysis {
    // Intelligent content categorization based on URL patterns
    const categories = this.categorizeFromUrl(contentUrl);
    const culturalTags = this.extractCulturalTags(contentUrl, contentText);
    
    const tasteProfile: QlooTasteProfile = {
      categories,
      genres: this.inferGenres(categories),
      cultural_context: {
        region: this.inferRegion(contentUrl),
        demographic: this.inferDemographic(categories),
        interests: categories.slice(0, 3)
      },
      taste_score: Math.random() * 0.4 + 0.6, // 0.6-1.0
      cultural_relevance: Math.random() * 0.3 + 0.7, // 0.7-1.0
      engagement_potential: Math.random() * 0.5 + 0.5 // 0.5-1.0
    };

    return {
      content_id: this.generateContentId(contentUrl),
      content_type: this.inferContentType(contentUrl),
      detected_categories: categories,
      cultural_tags: culturalTags,
      taste_profile: tasteProfile,
      audience_match: {
        primary_demographic: tasteProfile.cultural_context.demographic,
        cultural_affinity: tasteProfile.cultural_relevance,
        taste_alignment: tasteProfile.taste_score
      },
      reward_multiplier: this.calculateBaseMultiplier(categories, culturalTags),
      cultural_bonus: this.calculateCulturalBonus(culturalTags)
    };
  }

  private categorizeFromUrl(url: string): string[] {
    const categories: string[] = [];
    if (!url || typeof url !== 'string') {
      return ['general_content'];
    }
    const urlLower = url.toLowerCase();

    // Food & Cuisine
    if (urlLower.includes('vegan') || urlLower.includes('plant')) {
      categories.push('vegan_cuisine', 'sustainable_living', 'health_wellness');
    }
    if (urlLower.includes('recipe') || urlLower.includes('cooking')) {
      categories.push('culinary_arts', 'food_culture');
    }

    // Art & Culture
    if (urlLower.includes('art') || urlLower.includes('gallery')) {
      categories.push('visual_arts', 'cultural_expression');
    }
    if (urlLower.includes('street') && urlLower.includes('art')) {
      categories.push('street_art', 'urban_culture', 'social_commentary');
    }

    // Music & Entertainment
    if (urlLower.includes('music') || urlLower.includes('song')) {
      categories.push('music', 'creative_arts');
    }

    // Sustainability & Environment
    if (urlLower.includes('eco') || urlLower.includes('sustainable')) {
      categories.push('sustainability', 'environmental_awareness');
    }

    // Technology & Innovation
    if (urlLower.includes('tech') || urlLower.includes('ai')) {
      categories.push('technology', 'innovation');
    }

    return categories.length > 0 ? categories : ['general_content', 'creative_expression'];
  }

  private extractCulturalTags(url: string, text?: string): string[] {
    const tags: string[] = [];
    const content = (url + ' ' + (text || '')).toLowerCase();

    // Cultural identifiers
    const culturalPatterns = {
      'asian_culture': ['asian', 'japanese', 'chinese', 'korean', 'thai', 'vietnamese'],
      'latin_culture': ['latino', 'hispanic', 'mexican', 'brazilian', 'spanish'],
      'african_culture': ['african', 'afro', 'ethiopian', 'nigerian'],
      'european_culture': ['italian', 'french', 'german', 'scandinavian'],
      'middle_eastern': ['arabic', 'persian', 'turkish', 'lebanese'],
      'indigenous': ['indigenous', 'native', 'aboriginal', 'tribal']
    };

    for (const [culture, keywords] of Object.entries(culturalPatterns)) {
      if (keywords.some(keyword => content.includes(keyword))) {
        tags.push(culture);
      }
    }

    return tags;
  }

  private isUnderrepresentedCulture(culturalTags: string[]): boolean {
    const underrepresented = [
      'indigenous', 'african_culture', 'middle_eastern', 
      'pacific_islander', 'native_american'
    ];
    return culturalTags.some(tag => underrepresented.includes(tag));
  }

  private inferGenres(categories: string[]): string[] {
    const genreMap: Record<string, string[]> = {
      'vegan_cuisine': ['lifestyle', 'health', 'cooking'],
      'street_art': ['visual_arts', 'urban', 'contemporary'],
      'music': ['audio', 'performance', 'entertainment'],
      'technology': ['educational', 'innovation', 'tutorial']
    };

    const genres = new Set<string>();
    categories.forEach(cat => {
      if (genreMap[cat]) {
        genreMap[cat].forEach(genre => genres.add(genre));
      }
    });

    return Array.from(genres);
  }

  private inferRegion(url: string): string {
    if (url.includes('.it/') || url.includes('italy')) return 'Europe';
    if (url.includes('.jp/') || url.includes('japan')) return 'Asia';
    if (url.includes('.br/') || url.includes('brazil')) return 'South America';
    return 'Global';
  }

  private inferDemographic(categories: string[]): string {
    if (categories.includes('vegan_cuisine')) return 'health_conscious_millennials';
    if (categories.includes('street_art')) return 'urban_creatives';
    if (categories.includes('technology')) return 'tech_enthusiasts';
    return 'general_audience';
  }

  private inferContentType(url: string): QlooContentAnalysis['content_type'] {
    if (url.includes('youtube.com') || url.includes('video')) return 'video';
    if (url.includes('instagram.com')) return 'image';
    if (url.includes('podcast') || url.includes('audio')) return 'podcast';
    return 'article';
  }

  private generateContentId(url: string): string {
    return `qloo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateBaseMultiplier(categories: string[], culturalTags: string[]): number {
    let multiplier = 1.0;
    
    // Category bonuses
    if (categories.includes('vegan_cuisine')) multiplier += 0.2;
    if (categories.includes('street_art')) multiplier += 0.25;
    if (categories.includes('sustainable_living')) multiplier += 0.15;
    
    // Cultural diversity bonus
    if (culturalTags.length > 0) multiplier += 0.1;
    
    return Math.round(multiplier * 100) / 100;
  }

  private calculateCulturalBonus(culturalTags: string[]): number {
    return culturalTags.length * 0.05; // 5% bonus per cultural tag
  }

  private processQlooResponse(data: any, contentUrl: string): QlooContentAnalysis {
    console.log('🔄 Processing Qloo LIVE response data:', JSON.stringify(data, null, 2));
    
    // Extract data from Qloo entities search response
    const entities = data.entities || data.results || [];
    const firstEntity = entities[0] || {};
    
    // Convert Qloo entities to our cultural analysis format
    const categories = this.extractCategoriesFromEntities(entities);
    const culturalTags = this.extractCulturalTagsFromEntities(entities);
    
    return {
      content_id: firstEntity.id || this.generateContentId(contentUrl),
      content_type: this.inferContentType(contentUrl),
      detected_categories: categories,
      cultural_tags: culturalTags,
      taste_profile: {
        categories: categories,
        genres: this.extractGenresFromEntities(entities),
        cultural_context: {
          region: this.extractRegionFromEntities(entities),
          demographic: this.extractDemographicFromEntities(entities),
          interests: categories.slice(0, 3)
        },
        taste_score: this.calculateTasteScore(entities),
        cultural_relevance: this.calculateCulturalRelevance(entities),
        engagement_potential: this.calculateEngagementPotential(entities)
      },
      audience_match: {
        primary_demographic: this.extractDemographicFromEntities(entities),
        cultural_affinity: this.calculateCulturalRelevance(entities),
        taste_alignment: this.calculateTasteScore(entities)
      },
      reward_multiplier: this.calculateRewardMultiplier(categories, culturalTags),
      cultural_bonus: this.calculateCulturalBonus(culturalTags)
    };
  }

  private extractCategoriesFromEntities(entities: any[]): string[] {
    const categories = new Set<string>();
    entities.forEach(entity => {
      if (entity.type) categories.add(entity.type.toLowerCase().replace(/\s+/g, '_'));
      if (entity.category) categories.add(entity.category.toLowerCase().replace(/\s+/g, '_'));
      if (entity.genres) entity.genres.forEach((g: string) => categories.add(g.toLowerCase().replace(/\s+/g, '_')));
    });
    return Array.from(categories).slice(0, 5) || ['general_content'];
  }

  private extractCulturalTagsFromEntities(entities: any[]): string[] {
    const tags = new Set<string>();
    entities.forEach(entity => {
      if (entity.cultural_context) tags.add(entity.cultural_context);
      if (entity.region) tags.add(entity.region.toLowerCase());
      if (entity.origin) tags.add(entity.origin.toLowerCase());
    });
    return Array.from(tags);
  }

  private extractGenresFromEntities(entities: any[]): string[] {
    const genres = new Set<string>();
    entities.forEach(entity => {
      if (entity.genres) entity.genres.forEach((g: string) => genres.add(g));
      if (entity.type) genres.add(entity.type);
    });
    return Array.from(genres).slice(0, 3) || ['general'];
  }

  private extractRegionFromEntities(entities: any[]): string {
    for (const entity of entities) {
      if (entity.region) return entity.region;
      if (entity.origin) return entity.origin;
    }
    return 'Global';
  }

  private extractDemographicFromEntities(entities: any[]): string {
    for (const entity of entities) {
      if (entity.demographic) return entity.demographic;
      if (entity.target_audience) return entity.target_audience;
    }
    return 'general_audience';
  }

  private calculateTasteScore(entities: any[]): number {
    if (entities.length === 0) return 0.7;
    const avgPopularity = entities.reduce((sum, e) => sum + (e.popularity || 0.5), 0) / entities.length;
    return Math.min(1.0, avgPopularity + 0.3);
  }

  private calculateCulturalRelevance(entities: any[]): number {
    if (entities.length === 0) return 0.7;
    const culturalScore = entities.reduce((sum, e) => sum + (e.cultural_score || 0.6), 0) / entities.length;
    return Math.min(1.0, culturalScore + 0.2);
  }

  private calculateEngagementPotential(entities: any[]): number {
    if (entities.length === 0) return 0.6;
    const engagementScore = entities.reduce((sum, e) => sum + (e.engagement || 0.5), 0) / entities.length;
    return Math.min(1.0, engagementScore + 0.3);
  }

  private calculateRewardMultiplier(categories: string[], culturalTags: string[]): number {
    let multiplier = 1.0;
    if (categories.length > 2) multiplier += 0.2;
    if (culturalTags.length > 0) multiplier += 0.3;
    return Math.round(multiplier * 100) / 100;
  }
}

export const qlooService = new QlooService();