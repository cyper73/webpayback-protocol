import { storage } from "../storage";
import { InsertRewardDistribution, RewardDistribution } from "@shared/schema";

interface GasPoolStats {
  totalFeesCollected: number;
  totalGasSpent: number;
  currentBalance: number;
  isHealthy: boolean;
}

interface BatchProcessingResult {
  success: boolean;
  processedCount: number;
  totalGasUsed: string;
  batchTransactionHash: string;
  fallbackUsed: boolean;
}

export class GasManager {
  private readonly PROTOCOL_FEE_PERCENTAGE = 0.001; // 0.1%
  private readonly BATCH_SIZE = 50;
  private readonly BATCH_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private readonly MIN_POOL_BALANCE = 1.0; // 1 MATIC minimum
  private readonly CRITICAL_POOL_BALANCE = 0.1; // 0.1 MATIC critical threshold
  private readonly EMERGENCY_POOL_BALANCE = 0.01; // 0.01 MATIC emergency threshold
  
  private pendingRewards: InsertRewardDistribution[] = [];
  private batchTimer: NodeJS.Timeout | null = null;
  private emergencyMode = false;
  private lastEmergencyAlert = 0;
  private emergencyRechargeBalance = 0; // Track emergency recharges

  constructor() {
    this.startBatchProcessor();
  }

  /**
   * Calculate protocol fee from reward amount
   */
  private calculateProtocolFee(rewardAmount: number): number {
    return rewardAmount * this.PROTOCOL_FEE_PERCENTAGE;
  }

  /**
   * Get current gas pool statistics with enhanced monitoring
   */
  async getGasPoolStats(): Promise<GasPoolStats & { 
    status: 'healthy' | 'warning' | 'critical' | 'emergency';
    canProcessRewards: boolean;
    emergencyMode: boolean;
    estimatedTransactionsRemaining: number;
  }> {
    // In production, this would read from a dedicated gas pool wallet
    // For now, we simulate based on reward distributions
    const rewards = await storage.getRewardDistributions();
    
    const totalFeesCollected = rewards.reduce((sum, reward) => {
      return sum + (parseFloat(reward.amount) * this.PROTOCOL_FEE_PERCENTAGE);
    }, 0);

    // Simulate gas costs (in MATIC)
    const avgGasCostPerTx = 0.001; // ~$0.0008 on Polygon
    const totalGasSpent = rewards.length * avgGasCostPerTx;
    
    const currentBalance = totalFeesCollected - totalGasSpent + this.emergencyRechargeBalance;
    const isHealthy = currentBalance >= this.MIN_POOL_BALANCE;

    // Enhanced status monitoring
    let status: 'healthy' | 'warning' | 'critical' | 'emergency';
    let canProcessRewards = true;

    if (currentBalance >= this.MIN_POOL_BALANCE) {
      status = 'healthy';
    } else if (currentBalance >= this.CRITICAL_POOL_BALANCE) {
      status = 'warning';
    } else if (currentBalance >= this.EMERGENCY_POOL_BALANCE) {
      status = 'critical';
    } else {
      status = 'emergency';
      canProcessRewards = false;
      this.emergencyMode = true;
    }

    const estimatedTransactionsRemaining = Math.floor(currentBalance / avgGasCostPerTx);

    return {
      totalFeesCollected,
      totalGasSpent,
      currentBalance,
      isHealthy,
      status,
      canProcessRewards,
      emergencyMode: this.emergencyMode,
      estimatedTransactionsRemaining
    };
  }

  /**
   * Add reward to pending batch processing queue with gas pool protection
   */
  async queueReward(reward: InsertRewardDistribution): Promise<{ success: boolean; message: string; }> {
    const gasStats = await this.getGasPoolStats();
    
    // Emergency mode - block all new rewards
    if (!gasStats.canProcessRewards) {
      this.sendEmergencyAlert();
      return {
        success: false,
        message: `⚠️ EMERGENZA GAS POOL: Balance troppo basso (${gasStats.currentBalance.toFixed(6)} MATIC). Reward bloccate fino a ricarica.`
      };
    }

    // Critical mode - warn but still process
    if (gasStats.status === 'critical') {
      console.warn(`🚨 GAS POOL CRITICO: Solo ${gasStats.estimatedTransactionsRemaining} transazioni rimanenti!`);
    }
    
    // Reset emergency mode if balance is restored
    if (gasStats.canProcessRewards && this.emergencyMode) {
      this.emergencyMode = false;
      console.log('✅ Gas pool restored - Emergency mode disabled');
    }

    this.pendingRewards.push(reward);
    
    // Process immediately if batch is full
    if (this.pendingRewards.length >= this.BATCH_SIZE) {
      await this.processBatch();
    }

    return {
      success: true,
      message: `Reward aggiunta alla coda. Gas pool: ${gasStats.status} (${gasStats.estimatedTransactionsRemaining} tx rimanenti)`
    };
  }

  /**
   * Send emergency alert for gas pool depletion
   */
  private sendEmergencyAlert(): void {
    const now = Date.now();
    // Throttle alerts to once per hour
    if (now - this.lastEmergencyAlert > 60 * 60 * 1000) {
      this.lastEmergencyAlert = now;
      console.error(`
🚨🚨🚨 EMERGENZA GAS POOL 🚨🚨🚨
- Balance attuale: troppo basso per processare transazioni
- Tutte le reward sono state sospese
- AZIONE RICHIESTA: Ricaricare il gas pool immediatamente
- Contattare amministratore di sistema
      `);
    }
  }

  /**
   * Emergency recharge of gas pool
   */
  async emergencyRecharge(amount: number): Promise<{ success: boolean; newBalance: number; status: string; }> {
    const previousStats = await this.getGasPoolStats();
    
    console.log(`🚨 RICARICA EMERGENZA GAS POOL: Aggiungendo ${amount} MATIC`);
    
    // Add to emergency recharge balance
    this.emergencyRechargeBalance += amount;
    
    // Get updated stats
    const newStats = await this.getGasPoolStats();
    
    // Reset emergency mode if balance is sufficient
    if (newStats.canProcessRewards && this.emergencyMode) {
      this.emergencyMode = false;
      console.log('✅ Gas pool restored - Emergency mode disabled');
    }
    
    return {
      success: true,
      newBalance: newStats.currentBalance,
      status: newStats.status
    };
  }

  /**
   * Process batch of rewards
   */
  private async processBatch(): Promise<BatchProcessingResult> {
    if (this.pendingRewards.length === 0) {
      return {
        success: true,
        processedCount: 0,
        totalGasUsed: "0",
        batchTransactionHash: "",
        fallbackUsed: false
      };
    }

    const gasPool = await this.getGasPoolStats();
    const batchToProcess = this.pendingRewards.splice(0, this.BATCH_SIZE);
    
    try {
      if (gasPool.isHealthy) {
        // Normal mode: Protocol pays gas fees
        return await this.processBatchNormal(batchToProcess);
      } else {
        // Fallback mode: Deduct gas from rewards
        return await this.processBatchFallback(batchToProcess);
      }
    } catch (error) {
      // Return rewards to queue if processing fails
      this.pendingRewards.unshift(...batchToProcess);
      throw error;
    }
  }

  /**
   * Process batch with protocol paying gas fees
   */
  private async processBatchNormal(batch: InsertRewardDistribution[]): Promise<BatchProcessingResult> {
    const batchTransactionHash = this.generateMockHash();
    const estimatedGasUsed = "0.05"; // 0.05 MATIC for 50 transactions
    
    // Process each reward in the batch
    for (const reward of batch) {
      await storage.createRewardDistribution({
        ...reward,
        transactionHash: batchTransactionHash,
        status: "completed",
        completedAt: new Date()
      });
    }

    return {
      success: true,
      processedCount: batch.length,
      totalGasUsed: estimatedGasUsed,
      batchTransactionHash,
      fallbackUsed: false
    };
  }

  /**
   * Process batch with gas fees deducted from rewards (fallback mode)
   */
  private async processBatchFallback(batch: InsertRewardDistribution[]): Promise<BatchProcessingResult> {
    const batchTransactionHash = this.generateMockHash();
    const estimatedGasUsed = "0.05";
    const gasPerReward = 0.001; // 0.001 MATIC per reward
    
    // Process each reward with gas deduction
    for (const reward of batch) {
      const originalAmount = parseFloat(reward.amount);
      const adjustedAmount = Math.max(0, originalAmount - gasPerReward);
      
      await storage.createRewardDistribution({
        ...reward,
        amount: adjustedAmount.toFixed(8),
        transactionHash: batchTransactionHash,
        status: "completed",
        completedAt: new Date()
      });
    }

    return {
      success: true,
      processedCount: batch.length,
      totalGasUsed: estimatedGasUsed,
      batchTransactionHash,
      fallbackUsed: true
    };
  }

  /**
   * Start the batch processing timer
   */
  private startBatchProcessor(): void {
    this.batchTimer = setInterval(async () => {
      try {
        await this.processBatch();
      } catch (error) {
        console.error("Batch processing error:", error);
      }
    }, this.BATCH_INTERVAL);
  }

  /**
   * Stop the batch processor
   */
  stopBatchProcessor(): void {
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
      this.batchTimer = null;
    }
  }

  /**
   * Force process all pending rewards immediately
   */
  async flushPendingRewards(): Promise<BatchProcessingResult[]> {
    const results: BatchProcessingResult[] = [];
    
    while (this.pendingRewards.length > 0) {
      const result = await this.processBatch();
      results.push(result);
    }
    
    return results;
  }

  /**
   * Get current status of gas management system
   */
  async getSystemStatus() {
    const gasPool = await this.getGasPoolStats();
    const rewards = await storage.getRewardDistributions();
    
    // Calculate additional metrics
    const recentRewards = rewards.filter(r => {
      const completedAt = new Date(r.completedAt || r.createdAt);
      const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
      return completedAt > hourAgo;
    });
    
    const batchProcessedCount = rewards.filter(r => 
      r.metadata && typeof r.metadata === 'object' && 'batchProcessed' in r.metadata
    ).length;
    
    const totalValue = rewards.reduce((sum, r) => sum + parseFloat(r.amount), 0);
    const avgRewardValue = rewards.length > 0 ? totalValue / rewards.length : 0;
    
    return {
      gasPool,
      pendingRewards: this.pendingRewards.length,
      batchSize: this.BATCH_SIZE,
      batchInterval: this.BATCH_INTERVAL,
      protocolFeePercentage: this.PROTOCOL_FEE_PERCENTAGE * 100, // Convert to percentage
      isProcessorActive: this.batchTimer !== null,
      metrics: {
        totalRewards: rewards.length,
        recentRewards: recentRewards.length,
        batchProcessedCount,
        batchEfficiency: rewards.length > 0 ? (batchProcessedCount / rewards.length) * 100 : 0,
        totalValue,
        avgRewardValue,
        gasEfficiency: {
          saved: batchProcessedCount * 0.001, // MATIC saved through batching
          individualCost: rewards.length * 0.001,
          batchCost: Math.ceil(batchProcessedCount / this.BATCH_SIZE) * 0.05
        }
      }
    };
  }

  private generateMockHash(): string {
    return "0x" + Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join("");
  }
}

export const gasManager = new GasManager();