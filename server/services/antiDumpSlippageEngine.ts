import { db } from "../db";
import { 
  slippageFeeEvents, 
  walletCashoutVelocity, 
  antiDumpConfig,
  type SlippageFeeEvent,
  type WalletCashoutVelocity,
  type AntiDumpConfig
} from "../../shared/slippageSchema";
import { eq, desc, and, gte, sql } from "drizzle-orm";

export interface CashoutRequest {
  walletAddress: string;
  amount: string;
  transactionHash: string;
  blockNumber: number;
  gasUsed?: number;
  networkId?: number;
}

export interface SlippageFeeCalculation {
  baseSlippageFee: number;
  antiDumpPenalty: number;
  totalSlippageFee: number;
  feeAmountWpt: number;
  penaltyReason: string;
  velocityScore: number;
  isHighRisk: boolean;
  exemptFromFees: boolean;
}

export class AntiDumpSlippageEngine {
  private static instance: AntiDumpSlippageEngine;
  private config: AntiDumpConfig | null = null;

  public static getInstance(): AntiDumpSlippageEngine {
    if (!AntiDumpSlippageEngine.instance) {
      AntiDumpSlippageEngine.instance = new AntiDumpSlippageEngine();
    }
    return AntiDumpSlippageEngine.instance;
  }

  /**
   * Load anti-dump configuration from database
   */
  private async loadConfig(): Promise<AntiDumpConfig> {
    if (this.config) {
      return this.config;
    }

    const [config] = await db
      .select()
      .from(antiDumpConfig)
      .where(and(
        eq(antiDumpConfig.configName, "default"),
        eq(antiDumpConfig.isActive, true)
      ))
      .limit(1);

    if (!config) {
      // Create default config if none exists
      const [newConfig] = await db
        .insert(antiDumpConfig)
        .values({
          configName: "default",
          baseSlippageFee: "0.5",
          velocityThresholdLow: "2.0", 
          velocityThresholdHigh: "5.0",
          penaltyFeeLight: "1.0",
          penaltyFeeMedium: "2.5", 
          penaltyFeeHeavy: "5.0",
          frequencyPenaltyThreshold: 3,
          minimumRewardAge: 24,
          whitelistMinimumStake: "10000",
          isActive: true
        })
        .returning();
      
      this.config = newConfig;
      return newConfig;
    }

    this.config = config;
    return config;
  }

  /**
   * Calculate total rewards accumulated by wallet in last 30 days
   */
  private async calculateAccumulatedRewards(walletAddress: string): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // This would integrate with your existing rewards system
    // For now, using a placeholder - you'll need to adapt this to your rewards table
    const result = await db.execute(sql`
      SELECT COALESCE(SUM(CAST(amount AS DECIMAL)), 0) as total_rewards
      FROM rewards 
      WHERE wallet_address = ${walletAddress} 
      AND created_at >= ${thirtyDaysAgo.toISOString()}
    `);

    return Number((result[0] as any)?.total_rewards || 0);
  }

  /**
   * Calculate cashout velocity and update wallet tracking
   */
  private async updateWalletVelocity(
    walletAddress: string, 
    cashoutAmount: number
  ): Promise<WalletCashoutVelocity> {
    const [existingWallet] = await db
      .select()
      .from(walletCashoutVelocity)
      .where(eq(walletCashoutVelocity.walletAddress, walletAddress))
      .limit(1);

    const totalRewards = await this.calculateAccumulatedRewards(walletAddress);
    const currentTime = new Date();

    if (!existingWallet) {
      // Create new wallet tracking
      const [newWallet] = await db
        .insert(walletCashoutVelocity)
        .values({
          walletAddress,
          totalRewardsAccumulated: totalRewards.toString(),
          totalCashoutAmount: cashoutAmount.toString(),
          lastCashoutAt: currentTime,
          cashoutFrequency: 1,
          velocityScore: totalRewards > 0 ? ((cashoutAmount / totalRewards) * 100).toFixed(4) : "0",
          isHighRiskDumper: false
        })
        .returning();

      return newWallet;
    }

    // Update existing wallet
    const newTotalCashout = Number(existingWallet.totalCashoutAmount) + cashoutAmount;
    const velocityScore = totalRewards > 0 ? (newTotalCashout / totalRewards) * 100 : 0;
    
    // Calculate frequency (cashouts per week)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const recentCashouts = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(slippageFeeEvents)
      .where(and(
        eq(slippageFeeEvents.walletAddress, walletAddress),
        eq(slippageFeeEvents.transactionType, "cashout"),
        gte(slippageFeeEvents.createdAt, weekAgo)
      ));

    const weeklyFrequency = Number(recentCashouts[0]?.count || 0) + 1;

    const [updatedWallet] = await db
      .update(walletCashoutVelocity)
      .set({
        totalRewardsAccumulated: totalRewards.toString(),
        totalCashoutAmount: newTotalCashout.toString(),
        lastCashoutAt: currentTime,
        cashoutFrequency: weeklyFrequency,
        velocityScore: velocityScore.toFixed(4),
        isHighRiskDumper: velocityScore > 500 || weeklyFrequency > 5,
        lastUpdated: currentTime
      })
      .where(eq(walletCashoutVelocity.walletAddress, walletAddress))
      .returning();

    return updatedWallet;
  }

  /**
   * Check if wallet is exempt from anti-dump fees
   */
  private async isWalletExempt(walletAddress: string): Promise<boolean> {
    const config = await this.loadConfig();
    
    // Check whitelist status or minimum stake
    const [wallet] = await db
      .select()
      .from(walletCashoutVelocity)
      .where(eq(walletCashoutVelocity.walletAddress, walletAddress))
      .limit(1);

    if (wallet?.whitelistStatus) {
      return true;
    }

    // Check if wallet has minimum stake (implement your stake checking logic)
    // For now, returning false - you'll need to integrate with your staking system
    return false;
  }

  /**
   * Calculate anti-dump slippage fee
   */
  async calculateSlippageFee(cashoutRequest: CashoutRequest): Promise<SlippageFeeCalculation> {
    const config = await this.loadConfig();
    const { walletAddress, amount } = cashoutRequest;
    const cashoutAmount = Number(amount);

    // Check if wallet is exempt
    const isExempt = await this.isWalletExempt(walletAddress);
    if (isExempt) {
      return {
        baseSlippageFee: 0,
        antiDumpPenalty: 0,
        totalSlippageFee: 0,
        feeAmountWpt: 0,
        penaltyReason: "Wallet whitelisted - exempt from anti-dump fees",
        velocityScore: 0,
        isHighRisk: false,
        exemptFromFees: true
      };
    }

    // Update wallet velocity tracking
    const walletVelocity = await this.updateWalletVelocity(walletAddress, cashoutAmount);
    
    const velocityScore = Number(walletVelocity.velocityScore);
    const baseSlippageFee = Number(config.baseSlippageFee);
    
    let antiDumpPenalty = 0;
    let penaltyReason = "Normal cashout velocity";

    // Apply velocity-based penalties
    if (velocityScore > Number(config.velocityThresholdHigh)) {
      antiDumpPenalty = Number(config.penaltyFeeHeavy);
      penaltyReason = `High velocity dumping detected (${velocityScore.toFixed(1)}% cashout vs rewards)`;
    } else if (velocityScore > Number(config.velocityThresholdLow)) {
      antiDumpPenalty = Number(config.penaltyFeeMedium);
      penaltyReason = `Moderate velocity detected (${velocityScore.toFixed(1)}% cashout vs rewards)`;
    } else if (walletVelocity.cashoutFrequency > config.frequencyPenaltyThreshold) {
      antiDumpPenalty = Number(config.penaltyFeeLight);
      penaltyReason = `High frequency cashouts (${walletVelocity.cashoutFrequency} times this week)`;
    }

    // Apply penalty multiplier for repeat offenders
    if (walletVelocity.isHighRiskDumper) {
      antiDumpPenalty *= Number(walletVelocity.penaltyMultiplier);
      penaltyReason += " + High-risk dumper multiplier applied";
    }

    const totalSlippageFee = baseSlippageFee + antiDumpPenalty;
    const feeAmountWpt = (cashoutAmount * totalSlippageFee) / 100;

    return {
      baseSlippageFee,
      antiDumpPenalty,
      totalSlippageFee,
      feeAmountWpt,
      penaltyReason,
      velocityScore,
      isHighRisk: walletVelocity.isHighRiskDumper,
      exemptFromFees: false
    };
  }

  /**
   * Record slippage fee event
   */
  async recordSlippageFeeEvent(
    cashoutRequest: CashoutRequest,
    feeCalculation: SlippageFeeCalculation,
    rewardAccumulated: number
  ): Promise<SlippageFeeEvent> {
    const [event] = await db
      .insert(slippageFeeEvents)
      .values({
        walletAddress: cashoutRequest.walletAddress,
        transactionHash: cashoutRequest.transactionHash,
        transactionType: "cashout",
        amount: cashoutRequest.amount,
        rewardAccumulatedAmount: rewardAccumulated.toString(),
        cashoutSpeedRatio: rewardAccumulated > 0 ? 
          (Number(cashoutRequest.amount) / rewardAccumulated).toFixed(4) : "0",
        slippageFeeApplied: feeCalculation.totalSlippageFee.toString(),
        feeAmountWpt: feeCalculation.feeAmountWpt.toString(),
        baseSlippageFee: feeCalculation.baseSlippageFee.toString(),
        antiDumpPenalty: feeCalculation.antiDumpPenalty.toString(),
        penaltyReason: feeCalculation.penaltyReason,
        blockNumber: cashoutRequest.blockNumber,
        gasUsed: cashoutRequest.gasUsed,
        networkId: cashoutRequest.networkId || 137,
        metadata: {
          velocityScore: feeCalculation.velocityScore,
          isHighRisk: feeCalculation.isHighRisk,
          exemptFromFees: feeCalculation.exemptFromFees
        }
      })
      .returning();

    return event;
  }

  /**
   * Get wallet anti-dump statistics
   */
  async getWalletStats(walletAddress: string): Promise<{
    velocity: WalletCashoutVelocity | null;
    recentEvents: SlippageFeeEvent[];
    totalFeePaid: number;
  }> {
    const [velocity] = await db
      .select()
      .from(walletCashoutVelocity)
      .where(eq(walletCashoutVelocity.walletAddress, walletAddress))
      .limit(1);

    const recentEvents = await db
      .select()
      .from(slippageFeeEvents)
      .where(eq(slippageFeeEvents.walletAddress, walletAddress))
      .orderBy(desc(slippageFeeEvents.createdAt))
      .limit(10);

    const totalFeesResult = await db
      .select({ total: sql<number>`SUM(CAST(fee_amount_wpt AS DECIMAL))` })
      .from(slippageFeeEvents)
      .where(eq(slippageFeeEvents.walletAddress, walletAddress));

    const totalFeePaid = Number(totalFeesResult[0]?.total || 0);

    return {
      velocity: velocity || null,
      recentEvents,
      totalFeePaid
    };
  }

  /**
   * Update anti-dump configuration
   */
  async updateConfig(configUpdates: Partial<AntiDumpConfig>): Promise<AntiDumpConfig> {
    const [updatedConfig] = await db
      .update(antiDumpConfig)
      .set({
        ...configUpdates,
        lastUpdated: new Date()
      })
      .where(eq(antiDumpConfig.configName, "default"))
      .returning();

    this.config = updatedConfig;
    return updatedConfig;
  }

  /**
   * Get system-wide anti-dump statistics
   */
  async getSystemStats(): Promise<{
    totalFeesCollected: number;
    highRiskWallets: number;
    totalEvents: number;
    averagePenalty: number;
  }> {
    const [feesResult] = await db
      .select({ total: sql<number>`SUM(CAST(fee_amount_wpt AS DECIMAL))` })
      .from(slippageFeeEvents);

    const [highRiskResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(walletCashoutVelocity)
      .where(eq(walletCashoutVelocity.isHighRiskDumper, true));

    const [eventsResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(slippageFeeEvents);

    const [avgPenaltyResult] = await db
      .select({ avg: sql<number>`AVG(CAST(anti_dump_penalty AS DECIMAL))` })
      .from(slippageFeeEvents);

    return {
      totalFeesCollected: Number(feesResult.total || 0),
      highRiskWallets: Number(highRiskResult.count || 0),
      totalEvents: Number(eventsResult.count || 0),
      averagePenalty: Number(avgPenaltyResult.avg || 0)
    };
  }
}

export const antiDumpEngine = AntiDumpSlippageEngine.getInstance();