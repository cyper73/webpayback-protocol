import { storage } from "../storage";

interface QueryAnalysis {
  isSpam: boolean;
  riskScore: number;
  reasons: string[];
  confidence: number;
  recommendation: 'BLOCK' | 'FLAG' | 'ALLOW';
}

interface QueryFingerprint {
  queryHash: string;
  semanticHash: string;
  keywordDensity: number;
  complexity: number;
  similarity: number;
}

interface AIQueryEvent {
  query: string;
  aiModel: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  responseTime: number;
  walletAddress?: string;
}

export class AIQueryProtectionService {
  private readonly QUERY_SIMILARITY_THRESHOLD = 0.85;
  private readonly MIN_QUERY_COMPLEXITY = 10; // minimum characters
  private readonly MAX_DAILY_SIMILAR_QUERIES = 5;
  private readonly BOT_RESPONSE_TIME_THRESHOLD = 100; // milliseconds
  private readonly HUMAN_MIN_RESPONSE_TIME = 500; // milliseconds
  private readonly MAX_QUERIES_PER_HOUR = 20;
  private readonly SPAM_KEYWORDS = [
    'test', 'hello', 'hi', 'spam', 'fake', 'bot', 'automated',
    'script', 'generate', 'create rewards', 'free tokens'
  ];

  private queryCache = new Map<string, QueryFingerprint[]>();
  private ipQueryHistory = new Map<string, AIQueryEvent[]>();

  async analyzeAIQuery(event: AIQueryEvent): Promise<QueryAnalysis> {
    const reasons: string[] = [];
    let riskScore = 0;
    let confidence = 0.7;

    // 1. Query Complexity Analysis
    const complexityCheck = this.analyzeQueryComplexity(event.query);
    if (complexityCheck.isSimple) {
      riskScore += 30;
      reasons.push(`Query too simple: ${complexityCheck.score}/100`);
    }

    // 2. Semantic Similarity Detection
    const similarityCheck = await this.checkQuerySimilarity(event);
    if (similarityCheck.isDuplicate) {
      riskScore += 40;
      reasons.push(`Similar query detected: ${(similarityCheck.similarity * 100).toFixed(1)}% match`);
    }

    // 3. Spam Keywords Detection
    const spamCheck = this.detectSpamKeywords(event.query);
    if (spamCheck.isSpam) {
      riskScore += 35;
      reasons.push(`Spam keywords found: ${spamCheck.keywords.join(', ')}`);
    }

    // 4. Response Time Pattern Analysis
    const timingCheck = this.analyzeTiming(event);
    if (timingCheck.isSuspicious) {
      riskScore += 25;
      reasons.push(`Suspicious timing: ${event.responseTime}ms (${timingCheck.pattern})`);
    }

    // 5. IP Query Frequency Check
    const frequencyCheck = await this.checkQueryFrequency(event);
    if (frequencyCheck.isExcessive) {
      riskScore += 30;
      reasons.push(`Too many queries: ${frequencyCheck.count}/${this.MAX_QUERIES_PER_HOUR} per hour`);
    }

    // 6. AI Model Diversity Check
    const diversityCheck = await this.checkAIModelDiversity(event.ipAddress);
    if (!diversityCheck.isDiverse) {
      riskScore += 20;
      reasons.push(`Low AI model diversity: ${diversityCheck.uniqueModels} models used`);
    }

    // Store query fingerprint for future analysis
    await this.storeQueryFingerprint(event);

    // Determine recommendation
    let recommendation: 'BLOCK' | 'FLAG' | 'ALLOW' = 'ALLOW';
    if (riskScore >= 80) {
      recommendation = 'BLOCK';
      confidence = 0.9;
    } else if (riskScore >= 50) {
      recommendation = 'FLAG';
      confidence = 0.8;
    }

    return {
      isSpam: riskScore >= 50,
      riskScore,
      reasons,
      confidence,
      recommendation
    };
  }

  private analyzeQueryComplexity(query: string): { isSimple: boolean; score: number } {
    const length = query.length;
    const wordCount = query.split(/\s+/).length;
    const uniqueWords = new Set(query.toLowerCase().split(/\s+/)).size;
    const punctuationCount = (query.match(/[.!?,:;]/g) || []).length;
    
    // Calculate complexity score
    let score = 0;
    score += Math.min(length * 2, 40); // Length contributes up to 40 points
    score += Math.min(wordCount * 3, 30); // Word count up to 30 points
    score += Math.min(uniqueWords * 2, 20); // Unique words up to 20 points
    score += Math.min(punctuationCount * 5, 10); // Punctuation up to 10 points

    return {
      isSimple: score < 30 || length < this.MIN_QUERY_COMPLEXITY,
      score
    };
  }

  private async checkQuerySimilarity(event: AIQueryEvent): Promise<{ isDuplicate: boolean; similarity: number }> {
    const fingerprint = this.generateQueryFingerprint(event.query);
    const ipHistory = this.ipQueryHistory.get(event.ipAddress) || [];
    
    let maxSimilarity = 0;
    
    // Check against recent queries from same IP
    for (const pastEvent of ipHistory.slice(-20)) { // Check last 20 queries
      const pastFingerprint = this.generateQueryFingerprint(pastEvent.query);
      const similarity = this.calculateSimilarity(fingerprint.semanticHash, pastFingerprint.semanticHash);
      if (similarity > maxSimilarity) {
        maxSimilarity = similarity;
      }
    }

    return {
      isDuplicate: maxSimilarity > this.QUERY_SIMILARITY_THRESHOLD,
      similarity: maxSimilarity
    };
  }

  private generateQueryFingerprint(query: string): QueryFingerprint {
    const normalized = query.toLowerCase().replace(/[^\w\s]/g, '');
    const words = normalized.split(/\s+/).filter(w => w.length > 2);
    const sortedWords = words.sort().join(' ');
    
    return {
      queryHash: this.simpleHash(query),
      semanticHash: this.simpleHash(sortedWords),
      keywordDensity: words.length / query.length,
      complexity: query.length * words.length,
      similarity: 0
    };
  }

  private detectSpamKeywords(query: string): { isSpam: boolean; keywords: string[] } {
    const lowercaseQuery = query.toLowerCase();
    const found = this.SPAM_KEYWORDS.filter(keyword => 
      lowercaseQuery.includes(keyword)
    );
    
    return {
      isSpam: found.length > 0,
      keywords: found
    };
  }

  private analyzeTiming(event: AIQueryEvent): { isSuspicious: boolean; pattern: string } {
    if (event.responseTime < this.BOT_RESPONSE_TIME_THRESHOLD) {
      return { isSuspicious: true, pattern: 'too_fast_bot' };
    }
    
    if (event.responseTime > this.HUMAN_MIN_RESPONSE_TIME * 10) {
      return { isSuspicious: true, pattern: 'unusually_slow' };
    }

    // Check for regular intervals (bot pattern)
    const ipHistory = this.ipQueryHistory.get(event.ipAddress) || [];
    if (ipHistory.length >= 3) {
      const intervals = [];
      for (let i = 1; i < ipHistory.length; i++) {
        const interval = ipHistory[i].timestamp.getTime() - ipHistory[i-1].timestamp.getTime();
        intervals.push(interval);
      }
      
      // Check if intervals are too regular (bot behavior)
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const variance = intervals.reduce((acc, interval) => acc + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
      const standardDeviation = Math.sqrt(variance);
      
      if (standardDeviation < avgInterval * 0.1) { // Very regular timing
        return { isSuspicious: true, pattern: 'regular_intervals' };
      }
    }

    return { isSuspicious: false, pattern: 'normal' };
  }

  private async checkQueryFrequency(event: AIQueryEvent): Promise<{ isExcessive: boolean; count: number }> {
    const ipHistory = this.ipQueryHistory.get(event.ipAddress) || [];
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentQueries = ipHistory.filter(q => q.timestamp > oneHourAgo);
    
    return {
      isExcessive: recentQueries.length >= this.MAX_QUERIES_PER_HOUR,
      count: recentQueries.length
    };
  }

  private async checkAIModelDiversity(ipAddress: string): Promise<{ isDiverse: boolean; uniqueModels: number }> {
    const ipHistory = this.ipQueryHistory.get(ipAddress) || [];
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentQueries = ipHistory.filter(q => q.timestamp > last24Hours);
    
    const uniqueModels = new Set(recentQueries.map(q => q.aiModel)).size;
    
    return {
      isDiverse: uniqueModels >= 2,
      uniqueModels
    };
  }

  private async storeQueryFingerprint(event: AIQueryEvent): Promise<void> {
    // Store in memory cache
    let ipHistory = this.ipQueryHistory.get(event.ipAddress) || [];
    ipHistory.push(event);
    
    // Keep only last 100 queries per IP
    if (ipHistory.length > 100) {
      ipHistory = ipHistory.slice(-100);
    }
    
    this.ipQueryHistory.set(event.ipAddress, ipHistory);
    
    // Store fingerprint for similarity checking
    const fingerprint = this.generateQueryFingerprint(event.query);
    let fingerprints = this.queryCache.get(event.ipAddress) || [];
    fingerprints.push(fingerprint);
    
    if (fingerprints.length > 50) {
      fingerprints = fingerprints.slice(-50);
    }
    
    this.queryCache.set(event.ipAddress, fingerprints);
  }

  private calculateSimilarity(hash1: string, hash2: string): number {
    if (hash1 === hash2) return 1.0;
    
    const len = Math.min(hash1.length, hash2.length);
    let matches = 0;
    
    for (let i = 0; i < len; i++) {
      if (hash1[i] === hash2[i]) matches++;
    }
    
    return matches / Math.max(hash1.length, hash2.length);
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  // Public methods for API endpoints
  async getQueryStats(): Promise<any> {
    const totalIPs = this.ipQueryHistory.size;
    const totalQueries = Array.from(this.ipQueryHistory.values())
      .reduce((total, history) => total + history.length, 0);
    
    const recentQueries = Array.from(this.ipQueryHistory.values())
      .flat()
      .filter(q => q.timestamp > new Date(Date.now() - 60 * 60 * 1000));

    return {
      totalActiveIPs: totalIPs,
      totalQueries,
      queriesLastHour: recentQueries.length,
      averageQueriesPerIP: totalIPs > 0 ? Math.round(totalQueries / totalIPs) : 0,
      cacheSize: this.queryCache.size
    };
  }

  async testQuery(query: string, ipAddress: string = '127.0.0.1'): Promise<QueryAnalysis> {
    const testEvent: AIQueryEvent = {
      query,
      aiModel: 'test-model',
      ipAddress,
      userAgent: 'test-agent',
      timestamp: new Date(),
      responseTime: 200
    };

    return this.analyzeAIQuery(testEvent);
  }
}

export const aiQueryProtection = new AIQueryProtectionService();