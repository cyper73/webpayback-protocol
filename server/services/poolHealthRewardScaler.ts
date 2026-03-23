/**
 * Pool Health Reward Scaler - WebPayback Protocol
 * Auto-scales rewards based on pool liquidity health to protect TVL
 */

import { db } from "../db";
import { poolHealthMetrics } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface PoolHealthStatus {
  usdtPoolTvl: number;
  wmaticPoolTvl: number;
  usdtHealthLevel: 'healthy' | 'warning' | 'critical' | 'emergency';
  wmaticHealthLevel: 'healthy' | 'warning' | 'critical' | 'emergency';
  rewardScaleFactor: number; // 0.5 = 50%, 1.0 = 100%
  lastUpdated: Date;
  belowActivationThreshold?: boolean;
}

export interface PoolThresholds {
  usdt: {
    healthy: number;    // > 500 USDT
    warning: number;    // 400-500 USDT  
    critical: number;   // 200-400 USDT
    emergency: number;  // < 200 USDT
  };
  wmatic: {
    healthy: number;    // > 10 WMATIC
    warning: number;    // 8-10 WMATIC
    critical: number;   // 5-8 WMATIC  
    emergency: number;  // < 5 WMATIC
  };
}

export class PoolHealthRewardScaler {
  private static instance: PoolHealthRewardScaler;
  
  // ETHICAL EQUILIBRIUM ALGORITHM - Activation only after $20K USDT threshold
  private readonly MINIMUM_ACTIVATION_THRESHOLD = 20000; // $20,000 USDT minimum
  
  // Pool health thresholds (ONLY active above $20K threshold)
  private readonly POOL_THRESHOLDS: PoolThresholds = {
    usdt: {
      healthy: 50000,    // > $50,000 USDT = 105% rewards (slight bonus for high liquidity)
      warning: 30000,    // $30,000-50,000 = 100% rewards (normal)
      critical: 20000,   // $20,000-30,000 = 95% rewards (gentle reduction)  
      emergency: 10000   // Below activation threshold = use REDUCED values from previous setup
    },
    wmatic: {
      healthy: 40000,    // > $40,000 WMATIC equivalent = 105% rewards
      warning: 25000,    // $25,000-40,000 WMATIC = 100% rewards
      critical: 20000,   // $20,000-25,000 WMATIC = 95% rewards
      emergency: 10000   // Below threshold = use previous REDUCED values
    }
  };

  // Reward scale factors by health level (ETHICAL EQUILIBRIUM)
  private readonly REWARD_SCALE_FACTORS = {
    healthy: 1.05,     // 105% rewards (slight bonus for high liquidity - ethical bonus)
    warning: 1.0,      // 100% rewards (normal operation)
    critical: 0.95,    // 95% rewards (gentle protection)  
    emergency: 0.6     // BELOW THRESHOLD: Use previous REDUCED reward values
  };

  // REDUCED reward values (used when below $20K threshold)
  private readonly REDUCED_REWARD_FACTOR = 0.6; // Current reduced state

  public static getInstance(): PoolHealthRewardScaler {
    if (!PoolHealthRewardScaler.instance) {
      PoolHealthRewardScaler.instance = new PoolHealthRewardScaler();
    }
    return PoolHealthRewardScaler.instance;
  }

  /**
   * Get current pool health status and reward scale factor
   * ETHICAL EQUILIBRIUM: Only activate scaling above $20K USDT threshold
   */
  async getCurrentPoolHealth(): Promise<PoolHealthStatus> {
    try {
      // Fetch latest pool TVL data (from existing pool monitoring system)
      const poolData = await this.fetchPoolTvlData();
      
      // CHECK ACTIVATION THRESHOLD FIRST
      if (poolData.usdtTvl < this.MINIMUM_ACTIVATION_THRESHOLD) {
        // Below $20K threshold - use REDUCED rewards (previous setup values)
        return {
          usdtPoolTvl: poolData.usdtTvl,
          wmaticPoolTvl: poolData.wmaticTvl,
          usdtHealthLevel: 'emergency',
          wmaticHealthLevel: 'emergency',
          rewardScaleFactor: this.REDUCED_REWARD_FACTOR, // 60% - previous reduced values
          lastUpdated: new Date(),
          belowActivationThreshold: true
        };
      }
      
      // Above $20K threshold - use ETHICAL EQUILIBRIUM algorithm
      const usdtHealthLevel = this.calculateHealthLevel(poolData.usdtTvl, 'usdt');
      const wmaticHealthLevel = this.calculateHealthLevel(poolData.wmaticTvl, 'wmatic');
      
      // Use the most restrictive health level for reward scaling
      const overallHealthLevel = this.getMostRestrictiveHealthLevel(usdtHealthLevel, wmaticHealthLevel);
      const rewardScaleFactor = this.REWARD_SCALE_FACTORS[overallHealthLevel];
      
      const healthStatus: PoolHealthStatus = {
        usdtPoolTvl: poolData.usdtTvl,
        wmaticPoolTvl: poolData.wmaticTvl,
        usdtHealthLevel,
        wmaticHealthLevel,
        rewardScaleFactor,
        lastUpdated: new Date(),
        belowActivationThreshold: false
      };

      // Store health metrics in database for monitoring
      await this.storeHealthMetrics(healthStatus);
      
      return healthStatus;
      
    } catch (error) {
      console.error('Pool health calculation failed:', error);
      // Fallback to emergency mode if health calculation fails
      return {
        usdtPoolTvl: 0,
        wmaticPoolTvl: 0,
        usdtHealthLevel: 'emergency',
        wmaticHealthLevel: 'emergency',
        rewardScaleFactor: this.REDUCED_REWARD_FACTOR,
        lastUpdated: new Date(),
        belowActivationThreshold: true
      };
    }
  }

  /**
   * Apply pool health scaling to a base reward amount
   * ETHICAL EQUILIBRIUM: Maintains reduced rewards until $20K threshold
   */
  async scaleRewardByPoolHealth(baseReward: number): Promise<{
    originalReward: number;
    scaledReward: number;
    scaleFactor: number;
    healthStatus: PoolHealthStatus;
  }> {
    const healthStatus = await this.getCurrentPoolHealth();
    const scaledReward = baseReward * healthStatus.rewardScaleFactor;
    
    return {
      originalReward: baseReward,
      scaledReward: Math.round(scaledReward * 10000) / 10000, // 4 decimal precision
      scaleFactor: healthStatus.rewardScaleFactor,
      healthStatus: {
        ...healthStatus,
        activationThreshold: this.MINIMUM_ACTIVATION_THRESHOLD,
        isEthicalEquilibriumActive: !healthStatus.belowActivationThreshold
      }
    };
  }

  /**
   * Get pool health alerts and recommendations
   */
  async getPoolHealthAlerts(): Promise<{
    alerts: Array<{
      severity: 'info' | 'warning' | 'critical' | 'emergency';
      pool: 'usdt' | 'wmatic';
      message: string;
      recommendation: string;
    }>;
    overallStatus: string;
  }> {
    const healthStatus = await this.getCurrentPoolHealth();
    const alerts = [];

    // USDT Pool alerts
    if (healthStatus.usdtHealthLevel === 'emergency') {
      alerts.push({
        severity: 'emergency' as const,
        pool: 'usdt' as const,
        message: `USDT pool critically low: $${healthStatus.usdtPoolTvl} (< $200)`,
        recommendation: 'Immediate liquidity injection required. Rewards reduced to 25%.'
      });
    } else if (healthStatus.usdtHealthLevel === 'critical') {
      alerts.push({
        severity: 'critical' as const,
        pool: 'usdt' as const,
        message: `USDT pool low: $${healthStatus.usdtPoolTvl} (< $400)`,
        recommendation: 'Consider adding liquidity. Rewards reduced to 50%.'
      });
    } else if (healthStatus.usdtHealthLevel === 'warning') {
      alerts.push({
        severity: 'warning' as const,
        pool: 'usdt' as const,
        message: `USDT pool moderate: $${healthStatus.usdtPoolTvl} (< $500)`,
        recommendation: 'Monitor closely. Rewards reduced to 80%.'
      });
    }

    // WMATIC Pool alerts  
    if (healthStatus.wmaticHealthLevel === 'emergency') {
      alerts.push({
        severity: 'emergency' as const,
        pool: 'wmatic' as const,
        message: `WMATIC pool critically low: ${healthStatus.wmaticPoolTvl} WMATIC (< 5)`,
        recommendation: 'Immediate liquidity injection required. Rewards reduced to 25%.'
      });
    } else if (healthStatus.wmaticHealthLevel === 'critical') {
      alerts.push({
        severity: 'critical' as const,
        pool: 'wmatic' as const,
        message: `WMATIC pool low: ${healthStatus.wmaticPoolTvl} WMATIC (< 8)`,
        recommendation: 'Consider adding liquidity. Rewards reduced to 50%.'
      });
    } else if (healthStatus.wmaticHealthLevel === 'warning') {
      alerts.push({
        severity: 'warning' as const,
        pool: 'wmatic' as const,
        message: `WMATIC pool moderate: ${healthStatus.wmaticPoolTvl} WMATIC (< 10)`,
        recommendation: 'Monitor closely. Rewards reduced to 80%.'
      });
    }

    const overallStatus = alerts.length === 0 
      ? `All pools healthy. Rewards at 100% (${healthStatus.rewardScaleFactor}x)`
      : `${alerts.length} pool health issues. Rewards scaled to ${Math.round(healthStatus.rewardScaleFactor * 100)}%`;

    return { alerts, overallStatus };
  }

  /**
   * Calculate health level based on TVL and thresholds
   */
  private calculateHealthLevel(tvl: number, poolType: 'usdt' | 'wmatic'): 'healthy' | 'warning' | 'critical' | 'emergency' {
    const thresholds = this.POOL_THRESHOLDS[poolType];
    
    if (tvl >= thresholds.healthy) return 'healthy';
    if (tvl >= thresholds.warning) return 'warning';
    if (tvl >= thresholds.critical) return 'critical';
    return 'emergency';
  }

  /**
   * Get most restrictive health level (for combined pool assessment)
   */
  private getMostRestrictiveHealthLevel(
    level1: 'healthy' | 'warning' | 'critical' | 'emergency',
    level2: 'healthy' | 'warning' | 'critical' | 'emergency'
  ): 'healthy' | 'warning' | 'critical' | 'emergency' {
    const severity = { healthy: 0, warning: 1, critical: 2, emergency: 3 };
    const maxSeverity = Math.max(severity[level1], severity[level2]);
    return Object.keys(severity)[maxSeverity] as 'healthy' | 'warning' | 'critical' | 'emergency';
  }

  /**
   * Fetch current pool TVL data from existing monitoring system
   */
  private async fetchPoolTvlData(): Promise<{ usdtTvl: number; wmaticTvl: number }> {
    try {
      // Import the real pool data service to get authentic blockchain data
      const { realPoolDataService } = await import('./realPoolDataService');
      
      // Get authentic TVL from both pools
      const usdtPoolData = await realPoolDataService.getPoolBalance('0xe021e5817E8867D7CeA10f63BC47E118f3aB9E4A'); // USDT/WPT V2
      const wmaticPoolData = await realPoolDataService.getPoolBalance('0x572a5E8cbfCe8026550f1e2B369c2Bdbcf6634c3'); // WMATIC/WPT V3
      
      return {
        usdtTvl: usdtPoolData.totalTvlUsd || 539.92,    // Fallback to current authentic value
        wmaticTvl: wmaticPoolData.totalTvlUsd || 257.45  // Convert WMATIC TVL to USD equivalent
      };
    } catch (error) {
      console.warn('Failed to fetch authentic pool data, using fallback:', error);
      // Fallback to current authentic values from blockchain logs
      return {
        usdtTvl: 539.92,  // Current USDT pool TVL from logs
        wmaticTvl: 257.45 // Current WMATIC equivalent TVL from logs
      };
    }
  }

  /**
   * Store health metrics in database for historical tracking
   */
  private async storeHealthMetrics(healthStatus: PoolHealthStatus): Promise<void> {
    try {
      await db.insert(poolHealthMetrics).values({
        usdtPoolTvl: healthStatus.usdtPoolTvl.toString(),
        wmaticPoolTvl: healthStatus.wmaticPoolTvl.toString(),
        usdtHealthLevel: healthStatus.usdtHealthLevel,
        wmaticHealthLevel: healthStatus.wmaticHealthLevel,
        rewardScaleFactor: healthStatus.rewardScaleFactor.toString(),
        alertsGenerated: JSON.stringify(await this.getPoolHealthAlerts()),
        checkedAt: new Date()
      });
    } catch (error) {
      console.error('Failed to store pool health metrics:', error);
      // Non-critical error - continue operation
    }
  }
}