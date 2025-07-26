import { ethers } from 'ethers';
import { storage } from '../storage';
import { chainlinkService } from './chainlink';

interface AutomationConfig {
  batchSize: number;
  gasLimit: number;
  checkInterval: number;
  enabled: boolean;
}

class ChainlinkAutomationService {
  private config: AutomationConfig;
  private provider: ethers.providers.JsonRpcProvider;
  
  constructor() {
    this.config = {
      batchSize: 50,
      gasLimit: 500000,
      checkInterval: 300000, // 5 minutes
      enabled: true
    };
    
    this.provider = new ethers.providers.JsonRpcProvider(
      process.env.POLYGON_RPC || "https://polygon-rpc.com/"
    );
  }

  // Chainlink Automation compatible check function
  async checkUpkeep(checkData: string): Promise<{
    upkeepNeeded: boolean;
    performData: string;
    reason?: string;
  }> {
    try {
      if (!this.config.enabled) {
        return {
          upkeepNeeded: false,
          performData: "0x",
          reason: "Automation disabled"
        };
      }

      // Check if there are pending rewards to process
      const pendingRewards = await this.getPendingRewards();
      
      if (pendingRewards.length === 0) {
        return {
          upkeepNeeded: false,
          performData: "0x",
          reason: "No pending rewards"
        };
      }

      // Check if enough time has passed since last batch
      const lastBatchTime = await this.getLastBatchTime();
      const timeSinceLastBatch = Date.now() - lastBatchTime;
      
      if (timeSinceLastBatch < this.config.checkInterval) {
        return {
          upkeepNeeded: false,
          performData: "0x",
          reason: "Too early for next batch"
        };
      }

      // Check gas pool health
      const gasPoolStatus = await this.checkGasPoolHealth();
      if (!gasPoolStatus.healthy) {
        return {
          upkeepNeeded: false,
          performData: "0x",
          reason: "Gas pool unhealthy"
        };
      }

      // Prepare batch data
      const batchData = await this.prepareBatchData(pendingRewards);
      
      return {
        upkeepNeeded: true,
        performData: ethers.utils.hexlify(ethers.utils.toUtf8Bytes(JSON.stringify(batchData)))
      };
      
    } catch (error) {
      console.error('Error in checkUpkeep:', error);
      return {
        upkeepNeeded: false,
        performData: "0x",
        reason: `Error: ${error.message}`
      };
    }
  }

  // Chainlink Automation compatible perform function
  async performUpkeep(performData: string): Promise<{
    success: boolean;
    gasUsed: number;
    batchId: string;
    processedCount: number;
  }> {
    try {
      console.log('🔄 Chainlink Automation: Starting batch processing...');
      
      // Decode perform data
      const decodedData = JSON.parse(ethers.utils.toUtf8String(performData));
      
      // Execute batch processing
      const result = await this.executeBatch(decodedData);
      
      // Update last batch time
      await this.updateLastBatchTime();
      
      console.log(`✅ Chainlink Automation: Batch completed - ${result.processedCount} rewards processed`);
      
      return result;
      
    } catch (error) {
      console.error('Error in performUpkeep:', error);
      return {
        success: false,
        gasUsed: 0,
        batchId: '',
        processedCount: 0
      };
    }
  }

  // Get pending rewards from database
  private async getPendingRewards(): Promise<any[]> {
    // This would integrate with your existing reward system
    // For now, we'll simulate some pending rewards
    return [
      { id: 1, creatorId: 1, amount: "1.5", status: "pending" },
      { id: 2, creatorId: 2, amount: "2.0", status: "pending" },
      { id: 3, creatorId: 3, amount: "0.8", status: "pending" }
    ];
  }

  // Check gas pool health
  private async checkGasPoolHealth(): Promise<{ healthy: boolean; balance: number }> {
    // Integration with your gas pool system
    const gasPoolBalance = 0.1; // Example balance in MATIC
    const minimumBalance = 0.01; // Minimum required balance
    
    return {
      healthy: gasPoolBalance > minimumBalance,
      balance: gasPoolBalance
    };
  }

  // Prepare batch data for processing
  private async prepareBatchData(rewards: any[]): Promise<any> {
    const batch = rewards.slice(0, this.config.batchSize);
    
    // Calculate total amount and gas requirements
    const totalAmount = batch.reduce((sum, reward) => sum + parseFloat(reward.amount), 0);
    const estimatedGas = batch.length * 21000; // Estimate 21k gas per transfer
    
    return {
      batchId: `batch_${Date.now()}`,
      rewards: batch,
      totalAmount,
      estimatedGas,
      timestamp: Date.now()
    };
  }

  // Execute batch processing
  private async executeBatch(batchData: any): Promise<{
    success: boolean;
    gasUsed: number;
    batchId: string;
    processedCount: number;
  }> {
    const startTime = Date.now();
    let gasUsed = 0;
    let processedCount = 0;

    try {
      // Process each reward in the batch
      for (const reward of batchData.rewards) {
        // Get accurate pricing from Chainlink
        const rewardValue = await chainlinkService.calculateRewardValue(parseFloat(reward.amount));
        
        console.log(`💰 Processing reward: ${reward.amount} WPT ($${rewardValue.usdValue.toFixed(4)}) for creator ${reward.creatorId}`);
        
        // Simulate blockchain transaction
        // In production, this would be actual token transfer
        const txGas = 21000; // Standard transfer gas
        gasUsed += txGas;
        processedCount++;
        
        // Update reward status in database
        // await storage.updateRewardStatus(reward.id, 'completed');
      }

      const processingTime = Date.now() - startTime;
      console.log(`⏱️ Batch processing completed in ${processingTime}ms`);

      return {
        success: true,
        gasUsed,
        batchId: batchData.batchId,
        processedCount
      };
      
    } catch (error) {
      console.error('Error executing batch:', error);
      return {
        success: false,
        gasUsed,
        batchId: batchData.batchId,
        processedCount
      };
    }
  }

  // Get last batch processing time
  private async getLastBatchTime(): Promise<number> {
    // This would be stored in your database
    return Date.now() - 600000; // 10 minutes ago for demo
  }

  // Update last batch processing time
  private async updateLastBatchTime(): Promise<void> {
    // Update in database
    console.log('📝 Updated last batch time');
  }

  // Manual trigger for testing
  async triggerManualUpkeep(): Promise<any> {
    console.log('🔧 Manual upkeep triggered');
    
    const checkResult = await this.checkUpkeep("0x");
    
    if (checkResult.upkeepNeeded) {
      return await this.performUpkeep(checkResult.performData);
    }
    
    return { message: 'No upkeep needed', reason: checkResult.reason };
  }

  // Get automation status
  async getAutomationStatus(): Promise<{
    enabled: boolean;
    lastBatch: Date;
    nextBatch: Date;
    pendingRewards: number;
    gasPoolHealth: boolean;
  }> {
    const lastBatchTime = await this.getLastBatchTime();
    const pendingRewards = await this.getPendingRewards();
    const gasPoolStatus = await this.checkGasPoolHealth();
    
    return {
      enabled: this.config.enabled,
      lastBatch: new Date(lastBatchTime),
      nextBatch: new Date(lastBatchTime + this.config.checkInterval),
      pendingRewards: pendingRewards.length,
      gasPoolHealth: gasPoolStatus.healthy
    };
  }
}

export const chainlinkAutomationService = new ChainlinkAutomationService();