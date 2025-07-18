import { storage } from "../storage";
import { 
  InsertFraudDetectionRule, 
  InsertFraudDetectionAlert, 
  InsertAccessPattern, 
  InsertCreatorReputationScore, 
  FraudDetectionRule, 
  FraudDetectionAlert, 
  AccessPattern, 
  CreatorReputationScore 
} from "@shared/schema";

interface FraudAnalysis {
  isFraudulent: boolean;
  riskScore: number;
  reasons: string[];
  recommendedAction: string;
  confidence: number;
}

interface AccessEvent {
  url: string;
  ipAddress: string;
  aiType: string;
  userAgent: string;
  timestamp: Date;
}

export class FraudDetectionService {
  private readonly MIN_REPUTATION_SCORE = 20;
  private readonly MAX_DAILY_ACCESSES_PER_DOMAIN = 500;
  private readonly MAX_DAILY_ACCESSES_PER_IP = 200;
  private readonly MAX_DOMAIN_CONCENTRATION = 90; // %
  private readonly MAX_IP_CONCENTRATION = 85; // %
  private readonly MIN_AI_DIVERSITY = 2;
  private readonly MIN_ENTROPY_SCORE = 0.3;
  private readonly MAX_BURST_REQUESTS = 50;
  private readonly BURST_TIME_WINDOW = 600; // seconds

  constructor() {
    this.initializeFraudRules();
  }

  private async initializeFraudRules(): Promise<void> {
    try {
      const rules = [
        {
          ruleName: "Domain IP Limits",
          ruleType: "domain_limit",
          description: "Prevents single domain/IP from dominating traffic",
          severity: "high" as const,
          parameters: {
            maxDailyAccessesPerDomain: this.MAX_DAILY_ACCESSES_PER_DOMAIN,
            maxDailyAccessesPerIP: this.MAX_DAILY_ACCESSES_PER_IP,
            maxDomainConcentration: this.MAX_DOMAIN_CONCENTRATION,
            maxIPConcentration: this.MAX_IP_CONCENTRATION
          }
        },
        {
          ruleName: "AI Diversity Check",
          ruleType: "pattern_analysis",
          description: "Ensures minimum AI model diversity",
          severity: "medium" as const,
          parameters: {
            minAIModelDiversity: this.MIN_AI_DIVERSITY,
            minEntropyScore: this.MIN_ENTROPY_SCORE
          }
        },
        {
          ruleName: "Burst Detection",
          ruleType: "pattern_analysis",
          description: "Detects suspicious burst patterns",
          severity: "high" as const,
          parameters: {
            maxBurstRequests: this.MAX_BURST_REQUESTS,
            burstTimeWindow: this.BURST_TIME_WINDOW
          }
        },
        {
          ruleName: "Reputation Check",
          ruleType: "reputation_check",
          description: "Monitors creator reputation scores",
          severity: "critical" as const,
          parameters: {
            minReputationScore: this.MIN_REPUTATION_SCORE
          }
        }
      ];

      for (const rule of rules) {
        const existingRule = await storage.getFraudDetectionRuleByType(rule.ruleType);
        if (!existingRule) {
          await storage.createFraudDetectionRule({
            ...rule,
            isActive: true
          });
        }
      }
    } catch (error) {
      console.error('Error initializing fraud rules:', error);
    }
  }

  async analyzeCreatorAccess(creatorId: number, accessEvent: AccessEvent): Promise<FraudAnalysis> {
    try {
      const reasons: string[] = [];
      let riskScore = 0;
      let confidence = 0.8;

      // Check reputation score
      const reputationScore = await storage.getCreatorReputationScore(creatorId);
      if (reputationScore && reputationScore.overallScore < this.MIN_REPUTATION_SCORE) {
        reasons.push(`Low reputation score: ${reputationScore.overallScore}`);
        riskScore += 30;
      }

      // Check access patterns
      const accessPatterns = await storage.getAccessPatterns(creatorId);
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const recentPatterns = accessPatterns.filter(p => new Date(p.createdAt) >= todayStart);

      // Domain concentration check
      const domainHash = this.simpleHash(this.extractDomain(accessEvent.url));
      const domainCount = recentPatterns.filter(p => p.domainHash === domainHash).length;
      if (domainCount > this.MAX_DAILY_ACCESSES_PER_DOMAIN) {
        reasons.push(`Exceeded daily domain limit: ${domainCount}/${this.MAX_DAILY_ACCESSES_PER_DOMAIN}`);
        riskScore += 25;
      }

      // IP concentration check
      const ipHash = this.simpleHash(accessEvent.ipAddress);
      const ipCount = recentPatterns.filter(p => p.ipHash === ipHash).length;
      if (ipCount > this.MAX_DAILY_ACCESSES_PER_IP) {
        reasons.push(`Exceeded daily IP limit: ${ipCount}/${this.MAX_DAILY_ACCESSES_PER_IP}`);
        riskScore += 25;
      }

      // AI diversity check
      const uniqueAITypes = new Set(recentPatterns.map(p => p.aiType));
      if (uniqueAITypes.size < this.MIN_AI_DIVERSITY && recentPatterns.length > 10) {
        reasons.push(`Low AI diversity: ${uniqueAITypes.size}/${this.MIN_AI_DIVERSITY}`);
        riskScore += 15;
      }

      // Burst detection
      const recentBurst = recentPatterns.filter(p => 
        new Date(p.createdAt).getTime() > (accessEvent.timestamp.getTime() - this.BURST_TIME_WINDOW * 1000)
      );
      if (recentBurst.length > this.MAX_BURST_REQUESTS) {
        reasons.push(`Burst detected: ${recentBurst.length} requests in ${this.BURST_TIME_WINDOW}s`);
        riskScore += 35;
      }

      // Store access pattern
      await this.storeAccessPattern(creatorId, accessEvent, domainHash, ipHash);

      // Update reputation score
      await this.updateCreatorReputation(creatorId, riskScore, reasons);

      const isFraudulent = riskScore >= 70;
      const recommendedAction = this.getRecommendedAction(riskScore);

      // Generate alert if fraudulent
      if (isFraudulent) {
        await this.generateFraudAlert(creatorId, riskScore, reasons, recommendedAction);
      }

      return {
        isFraudulent,
        riskScore,
        reasons,
        recommendedAction,
        confidence
      };

    } catch (error) {
      console.error('Error analyzing creator access:', error);
      return {
        isFraudulent: false,
        riskScore: 0,
        reasons: ['Analysis failed'],
        recommendedAction: 'Manual review required',
        confidence: 0.1
      };
    }
  }

  private async storeAccessPattern(
    creatorId: number, 
    accessEvent: AccessEvent, 
    domainHash: string, 
    ipHash: string
  ): Promise<void> {
    try {
      const existing = await storage.getAccessPatternByHashes(creatorId, domainHash, ipHash, accessEvent.aiType);
      
      if (existing) {
        await storage.updateAccessPattern(existing.id, {
          accessCount: existing.accessCount + 1,
          lastAccess: accessEvent.timestamp
        });
      } else {
        await storage.createAccessPattern({
          creatorId,
          domainHash,
          ipHash,
          aiType: accessEvent.aiType,
          accessCount: 1,
          lastAccess: accessEvent.timestamp,
          userAgent: accessEvent.userAgent
        });
      }
    } catch (error) {
      console.error('Error storing access pattern:', error);
    }
  }

  private async updateCreatorReputation(creatorId: number, riskScore: number, reasons: string[]): Promise<void> {
    try {
      const existing = await storage.getCreatorReputationScore(creatorId);
      
      if (existing) {
        const newScore = Math.max(0, existing.overallScore - (riskScore * 0.3));
        const newFraudCount = riskScore >= 80 ? existing.fraudCount + 1 : existing.fraudCount;
        const newTrustLevel = this.calculateTrustLevel(newScore, newFraudCount);
        
        await storage.updateCreatorReputationScore(creatorId, {
          overallScore: newScore,
          fraudCount: newFraudCount,
          trustLevel: newTrustLevel,
          lastUpdated: new Date()
        });
      } else {
        const initialScore = Math.max(0, 100 - (riskScore * 0.3));
        const fraudCount = riskScore >= 80 ? 1 : 0;
        const trustLevel = this.calculateTrustLevel(initialScore, fraudCount);
        
        await storage.createCreatorReputationScore({
          creatorId,
          overallScore: initialScore,
          fraudCount,
          trustLevel,
          riskFactors: reasons,
          lastUpdated: new Date()
        });
      }
    } catch (error) {
      console.error('Error updating creator reputation:', error);
    }
  }

  private calculateTrustLevel(score: number, fraudCount: number): string {
    if (fraudCount >= 5 || score < 10) return 'banned';
    if (score < 30) return 'low';
    if (score < 60) return 'medium';
    return 'high';
  }

  private async generateFraudAlert(
    creatorId: number, 
    riskScore: number, 
    reasons: string[], 
    recommendedAction: string
  ): Promise<void> {
    try {
      const alertType = this.determineAlertType(reasons);
      const severity = this.determineSeverity(riskScore);
      
      await storage.createFraudDetectionAlert({
        creatorId,
        alertType,
        severity,
        riskScore,
        reasons,
        recommendedAction,
        status: 'active'
      });
    } catch (error) {
      console.error('Error generating fraud alert:', error);
    }
  }

  private determineAlertType(reasons: string[]): string {
    const reasonText = reasons.join(' ').toLowerCase();
    
    if (reasonText.includes('domain')) return 'domain_concentration';
    if (reasonText.includes('ip')) return 'ip_concentration';
    if (reasonText.includes('diversity')) return 'low_ai_diversity';
    if (reasonText.includes('burst')) return 'suspicious_pattern';
    if (reasonText.includes('reputation')) return 'low_reputation';
    
    return 'suspicious_pattern';
  }

  private determineSeverity(riskScore: number): string {
    if (riskScore >= 90) return 'critical';
    if (riskScore >= 70) return 'high';
    if (riskScore >= 50) return 'medium';
    return 'low';
  }

  private getRecommendedAction(riskScore: number): string {
    if (riskScore >= 90) return 'Immediate account suspension';
    if (riskScore >= 70) return 'Block rewards and intensive monitoring';
    if (riskScore >= 50) return 'Apply reputation penalty';
    return 'Continue monitoring';
  }

  private extractDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return url;
    }
  }

  private simpleHash(str: string): string {
    let hash = 0;
    if (str.length === 0) return hash.toString();
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }
}

export const fraudDetectionService = new FraudDetectionService();