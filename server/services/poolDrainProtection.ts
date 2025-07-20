import { storage } from "../storage";
import { InsertRewardPoolLimits, InsertPoolDrainProtection, InsertRewardPoolSecurity } from "@shared/schema";

interface PoolProtectionConfig {
  // Rate limiting per wallet/timeframe
  hourlyLimit: number;    // Max WPT per wallet per hour
  dailyLimit: number;     // Max WPT per wallet per day
  weeklyLimit: number;    // Max WPT per wallet per week
  monthlyLimit: number;   // Max WPT per wallet per month
  
  // Global pool protection
  poolHourlyDrainLimit: number;   // Max % of pool can be drained per hour
  poolDailyDrainLimit: number;    // Max % of pool can be drained per day
  velocityThreshold: number;      // Suspicious if X rewards in Y minutes
  velocityWindow: number;         // Time window for velocity check (minutes)
  
  // Security thresholds
  highFrequencyThreshold: number; // Rewards per minute that triggers alert
  largeAmountThreshold: number;   // Single reward amount that triggers alert
  exploitPatternThreshold: number; // Cumulative risk score threshold
}

interface PoolDrainStatus {
  isProtected: boolean;
  canDistributeReward: boolean;
  remainingQuota: {
    hourly: number;
    daily: number;
    weekly: number;
    monthly: number;
  };
  securityAlerts: string[];
  riskScore: number;
}

class PoolDrainProtectionService {
  private readonly FOUNDER_WALLET = '0xca5Ea48C76C72cc37cFb75c452457d0e6d0508Ba'; // Wallet del founder - NON BLOCCARE MAI
  
  private config: PoolProtectionConfig = {
    // Individual wallet limits (WPT amounts)
    hourlyLimit: 50.0,      // 50 WPT per hour max
    dailyLimit: 200.0,      // 200 WPT per day max
    weeklyLimit: 1000.0,    // 1000 WPT per week max
    monthlyLimit: 3000.0,   // 3000 WPT per month max
    
    // Global pool protection (percentage)
    poolHourlyDrainLimit: 5.0,    // Max 5% of pool per hour
    poolDailyDrainLimit: 20.0,    // Max 20% of pool per day
    velocityThreshold: 10,        // 10 rewards in velocity window
    velocityWindow: 30,           // 30 minutes window
    
    // Security alert thresholds
    highFrequencyThreshold: 0.5,  // 0.5 rewards per minute
    largeAmountThreshold: 100.0,  // 100+ WPT single reward
    exploitPatternThreshold: 75.0, // 75+ risk score blocks rewards
  };

  /**
   * Check if a reward can be distributed to a wallet address
   */
  async canDistributeReward(
    walletAddress: string, 
    rewardAmount: number
  ): Promise<PoolDrainStatus> {
    // WHITELIST: Il wallet del founder non viene mai bloccato
    if (walletAddress.toLowerCase() === this.FOUNDER_WALLET.toLowerCase()) {
      console.log(`🔓 FOUNDER WALLET DETECTED: Skipping pool drain checks for ${this.FOUNDER_WALLET}`);
      return {
        isProtected: true,
        canDistributeReward: true,
        remainingQuota: {
          hourly: 999999,
          daily: 999999,
          weekly: 999999,
          monthly: 999999
        },
        securityAlerts: ['Founder wallet - exempt from pool drain protection'],
        riskScore: 0
      };
    }

    const now = new Date();
    
    // Check individual wallet limits
    const walletLimits = await this.checkWalletLimits(walletAddress, rewardAmount, now);
    
    // Check global pool drain protection
    const poolProtection = await this.checkPoolDrainLimits(rewardAmount, now);
    
    // Check velocity and security patterns
    const securityCheck = await this.checkSecurityPatterns(walletAddress, rewardAmount, now);
    
    const canDistribute = walletLimits.allowed && poolProtection.allowed && securityCheck.allowed;
    const securityAlerts = [
      ...walletLimits.alerts,
      ...poolProtection.alerts,
      ...securityCheck.alerts
    ];
    
    const riskScore = (walletLimits.riskScore + poolProtection.riskScore + securityCheck.riskScore) / 3;
    
    // Log security events if risk is high
    if (riskScore > 50 || securityAlerts.length > 0) {
      await this.logSecurityEvent(walletAddress, rewardAmount, riskScore, securityAlerts);
    }
    
    return {
      isProtected: true,
      canDistributeReward: canDistribute,
      remainingQuota: walletLimits.remaining,
      securityAlerts,
      riskScore
    };
  }

  /**
   * Check wallet-specific reward limits across different timeframes
   */
  private async checkWalletLimits(
    walletAddress: string, 
    rewardAmount: number, 
    now: Date
  ): Promise<{
    allowed: boolean;
    remaining: { hourly: number; daily: number; weekly: number; monthly: number };
    alerts: string[];
    riskScore: number;
  }> {
    const alerts: string[] = [];
    let riskScore = 0;
    
    // Get current period usage
    const usage = await this.getWalletUsage(walletAddress, now);
    
    // Check each timeframe
    const hourlyRemaining = this.config.hourlyLimit - usage.hourly;
    const dailyRemaining = this.config.dailyLimit - usage.daily;
    const weeklyRemaining = this.config.weeklyLimit - usage.weekly;
    const monthlyRemaining = this.config.monthlyLimit - usage.monthly;
    
    let allowed = true;
    
    if (rewardAmount > hourlyRemaining) {
      allowed = false;
      alerts.push(`Hourly limit exceeded: ${rewardAmount} WPT requested, ${hourlyRemaining} WPT remaining`);
      riskScore += 30;
    }
    
    if (rewardAmount > dailyRemaining) {
      allowed = false;
      alerts.push(`Daily limit exceeded: ${rewardAmount} WPT requested, ${dailyRemaining} WPT remaining`);
      riskScore += 25;
    }
    
    if (rewardAmount > weeklyRemaining) {
      allowed = false;
      alerts.push(`Weekly limit exceeded: ${rewardAmount} WPT requested, ${weeklyRemaining} WPT remaining`);
      riskScore += 20;
    }
    
    if (rewardAmount > monthlyRemaining) {
      allowed = false;
      alerts.push(`Monthly limit exceeded: ${rewardAmount} WPT requested, ${monthlyRemaining} WPT remaining`);
      riskScore += 15;
    }
    
    // Update usage if allowed
    if (allowed) {
      await this.updateWalletUsage(walletAddress, rewardAmount, now);
    }
    
    return {
      allowed,
      remaining: {
        hourly: Math.max(0, hourlyRemaining),
        daily: Math.max(0, dailyRemaining),
        weekly: Math.max(0, weeklyRemaining),
        monthly: Math.max(0, monthlyRemaining)
      },
      alerts,
      riskScore
    };
  }

  /**
   * Check global pool drain limits
   */
  private async checkPoolDrainLimits(
    rewardAmount: number, 
    now: Date
  ): Promise<{
    allowed: boolean;
    alerts: string[];
    riskScore: number;
  }> {
    const alerts: string[] = [];
    let riskScore = 0;
    let allowed = true;
    
    // Get total pool size (simulate with total rewards distributed)
    const allRewards = await storage.getRewardDistributions();
    const totalPoolValue = allRewards.reduce((sum, reward) => sum + parseFloat(reward.amount), 0);
    
    if (totalPoolValue === 0) return { allowed: true, alerts: [], riskScore: 0 };
    
    // Check hourly drain rate
    const hourlyDrainData = await this.getGlobalDrainData(now, 'hourly');
    const hourlyDrainPercent = ((hourlyDrainData.currentValue + rewardAmount) / totalPoolValue) * 100;
    
    if (hourlyDrainPercent > this.config.poolHourlyDrainLimit) {
      allowed = false;
      alerts.push(`Pool hourly drain limit exceeded: ${hourlyDrainPercent.toFixed(2)}% vs ${this.config.poolHourlyDrainLimit}% limit`);
      riskScore += 40;
    }
    
    // Check daily drain rate
    const dailyDrainData = await this.getGlobalDrainData(now, 'daily');
    const dailyDrainPercent = ((dailyDrainData.currentValue + rewardAmount) / totalPoolValue) * 100;
    
    if (dailyDrainPercent > this.config.poolDailyDrainLimit) {
      allowed = false;
      alerts.push(`Pool daily drain limit exceeded: ${dailyDrainPercent.toFixed(2)}% vs ${this.config.poolDailyDrainLimit}% limit`);
      riskScore += 30;
    }
    
    return { allowed, alerts, riskScore };
  }

  /**
   * Check for suspicious security patterns
   */
  private async checkSecurityPatterns(
    walletAddress: string, 
    rewardAmount: number, 
    now: Date
  ): Promise<{
    allowed: boolean;
    alerts: string[];
    riskScore: number;
  }> {
    const alerts: string[] = [];
    let riskScore = 0;
    let allowed = true;
    
    // Check high frequency pattern
    const recentRewards = await this.getRecentRewards(walletAddress, this.config.velocityWindow);
    const rewardFrequency = recentRewards.length / this.config.velocityWindow;
    
    if (rewardFrequency > this.config.highFrequencyThreshold) {
      alerts.push(`High frequency detected: ${rewardFrequency.toFixed(2)} rewards/min vs ${this.config.highFrequencyThreshold} limit`);
      riskScore += 35;
      
      if (rewardFrequency > this.config.highFrequencyThreshold * 2) {
        allowed = false;
        riskScore += 25;
      }
    }
    
    // Check large amount threshold
    if (rewardAmount > this.config.largeAmountThreshold) {
      alerts.push(`Large amount detected: ${rewardAmount} WPT vs ${this.config.largeAmountThreshold} WPT threshold`);
      riskScore += 30;
      
      if (rewardAmount > this.config.largeAmountThreshold * 2) {
        allowed = false;
        riskScore += 40;
      }
    }
    
    // Check velocity pattern (burst detection)
    if (recentRewards.length >= this.config.velocityThreshold) {
      alerts.push(`Velocity threshold exceeded: ${recentRewards.length} rewards in ${this.config.velocityWindow} minutes`);
      allowed = false;
      riskScore += 50;
    }
    
    return { allowed, alerts, riskScore };
  }

  /**
   * Get wallet usage across different timeframes
   */
  private async getWalletUsage(walletAddress: string, now: Date): Promise<{
    hourly: number;
    daily: number;
    weekly: number;
    monthly: number;
  }> {
    // In production, this would query the database
    // For now, simulate with current reward data
    const allRewards = await storage.getRewardDistributions();
    const walletRewards = allRewards.filter(r => {
      // Simulate wallet filtering (we'd need wallet data in real implementation)
      return r.creatorId; // Placeholder filtering
    });
    
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    return {
      hourly: this.sumRewardsInPeriod(walletRewards, hourAgo, now),
      daily: this.sumRewardsInPeriod(walletRewards, dayAgo, now),
      weekly: this.sumRewardsInPeriod(walletRewards, weekAgo, now),
      monthly: this.sumRewardsInPeriod(walletRewards, monthAgo, now)
    };
  }

  /**
   * Update wallet usage tracking
   */
  private async updateWalletUsage(walletAddress: string, rewardAmount: number, now: Date): Promise<void> {
    // Create/update limits for each timeframe
    const timeframes = ['hourly', 'daily', 'weekly', 'monthly'];
    
    for (const timeframe of timeframes) {
      const limits = await storage.getRewardPoolLimitsByWallet(walletAddress, timeframe);
      
      if (limits.length === 0) {
        // Create new limit record
        const periodEnd = this.calculatePeriodEnd(now, timeframe);
        await storage.createRewardPoolLimits({
          walletAddress,
          timeframeType: timeframe,
          maxRewardAmount: this.getMaxForTimeframe(timeframe).toString(),
          currentPeriodAmount: rewardAmount.toString(),
          periodStart: now,
          periodEnd,
          isActive: true
        });
      } else {
        // Update existing record
        const limit = limits[0];
        const newAmount = parseFloat(limit.currentPeriodAmount) + rewardAmount;
        await storage.updateRewardPoolLimits(limit.id, {
          currentPeriodAmount: newAmount.toString(),
          updatedAt: now
        });
      }
    }
  }

  /**
   * Get global pool drain data
   */
  private async getGlobalDrainData(now: Date, type: 'hourly' | 'daily'): Promise<{
    currentValue: number;
  }> {
    // This would query poolDrainProtection table in production
    const allRewards = await storage.getRewardDistributions();
    const timeWindow = type === 'hourly' ? 60 : 1440; // minutes
    const windowStart = new Date(now.getTime() - timeWindow * 60 * 1000);
    
    const currentValue = this.sumRewardsInPeriod(allRewards, windowStart, now);
    
    return { currentValue };
  }

  /**
   * Get recent rewards for a wallet
   */
  private async getRecentRewards(walletAddress: string, minutes: number): Promise<any[]> {
    const now = new Date();
    const windowStart = new Date(now.getTime() - minutes * 60 * 1000);
    const allRewards = await storage.getRewardDistributions();
    
    return allRewards.filter(reward => {
      const rewardTime = new Date(reward.createdAt);
      return rewardTime >= windowStart && rewardTime <= now;
    });
  }

  /**
   * Log security event
   */
  private async logSecurityEvent(
    walletAddress: string, 
    rewardAmount: number, 
    riskScore: number, 
    alerts: string[]
  ): Promise<void> {
    let suspiciousActivity = 'normal_activity';
    let alertLevel = 'low';
    
    if (riskScore > 75) {
      suspiciousActivity = 'exploit_attempt';
      alertLevel = 'critical';
    } else if (riskScore > 50) {
      suspiciousActivity = 'large_amounts';
      alertLevel = 'high';
    } else if (alerts.some(alert => alert.includes('frequency'))) {
      suspiciousActivity = 'high_frequency';
      alertLevel = 'medium';
    }
    
    await storage.createRewardPoolSecurity({
      walletAddress,
      suspiciousActivity,
      riskScore: riskScore.toString(),
      alertLevel,
      actionTaken: riskScore > this.config.exploitPatternThreshold ? 'blocked' : 'flagged',
      evidence: { alerts, rewardAmount, timestamp: new Date().toISOString() },
      isResolved: false
    });
  }

  /**
   * Helper methods
   */
  private sumRewardsInPeriod(rewards: any[], start: Date, end: Date): number {
    return rewards
      .filter(reward => {
        const rewardTime = new Date(reward.createdAt);
        return rewardTime >= start && rewardTime <= end;
      })
      .reduce((sum, reward) => sum + parseFloat(reward.amount), 0);
  }

  private calculatePeriodEnd(start: Date, timeframe: string): Date {
    const end = new Date(start);
    switch (timeframe) {
      case 'hourly':
        end.setHours(end.getHours() + 1);
        break;
      case 'daily':
        end.setDate(end.getDate() + 1);
        break;
      case 'weekly':
        end.setDate(end.getDate() + 7);
        break;
      case 'monthly':
        end.setMonth(end.getMonth() + 1);
        break;
    }
    return end;
  }

  private getMaxForTimeframe(timeframe: string): number {
    switch (timeframe) {
      case 'hourly': return this.config.hourlyLimit;
      case 'daily': return this.config.dailyLimit;
      case 'weekly': return this.config.weeklyLimit;
      case 'monthly': return this.config.monthlyLimit;
      default: return 0;
    }
  }

  /**
   * Get protection statistics for monitoring
   */
  async getProtectionStats(): Promise<{
    totalBlocked: number;
    recentAlerts: number;
    topRiskWallets: Array<{ wallet: string; riskScore: number; alerts: number }>;
    poolHealth: { 
      hourlyDrain: number; 
      dailyDrain: number;
      isHealthy: boolean;
    };
  }> {
    const securityEvents = await storage.getRewardPoolSecurity();
    
    const totalBlocked = securityEvents.filter(e => e.actionTaken === 'blocked').length;
    const recentAlerts = securityEvents.filter(e => {
      const eventTime = new Date(e.createdAt);
      const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
      return eventTime >= hourAgo;
    }).length;
    
    // Aggregate risk by wallet
    const walletRisks = new Map<string, { riskScore: number; alerts: number }>();
    securityEvents.forEach(event => {
      const existing = walletRisks.get(event.walletAddress) || { riskScore: 0, alerts: 0 };
      existing.riskScore = Math.max(existing.riskScore, parseFloat(event.riskScore));
      existing.alerts += 1;
      walletRisks.set(event.walletAddress, existing);
    });
    
    const topRiskWallets = Array.from(walletRisks.entries())
      .map(([wallet, data]) => ({ wallet, ...data }))
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 10);
    
    // Pool health
    const now = new Date();
    const hourlyDrainData = await this.getGlobalDrainData(now, 'hourly');
    const dailyDrainData = await this.getGlobalDrainData(now, 'daily');
    
    const poolHealth = {
      hourlyDrain: hourlyDrainData.currentValue,
      dailyDrain: dailyDrainData.currentValue,
      isHealthy: hourlyDrainData.currentValue < this.config.poolHourlyDrainLimit * 1000, // Assuming 1000 total pool
    };
    
    return {
      totalBlocked,
      recentAlerts,
      topRiskWallets,
      poolHealth
    };
  }
}

export const poolDrainProtectionService = new PoolDrainProtectionService();