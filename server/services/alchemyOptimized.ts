import { Alchemy, Network } from 'alchemy-sdk';

export class OptimizedAlchemyMonitor {
  private alchemy: Alchemy;
  private isMonitoring = false;
  private batchInterval: NodeJS.Timeout | null = null;
  private callCount = 0;
  private lastReset = Date.now();
  
  // Rate limiting for free tier sustainability
  private readonly MAX_CALLS_PER_HOUR = 1000; // Conservative limit for free tier
  private readonly BATCH_INTERVAL_MS = 30000; // Check every 30 seconds instead of real-time

  constructor() {
    const apiKey = process.env.ALCHEMY_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ ALCHEMY_API_KEY not found. Monitoring will be simulated.');
      return;
    }

    this.alchemy = new Alchemy({
      apiKey: apiKey,
      network: Network.MATIC_MAINNET,
    });
    console.log('✅ Optimized Alchemy integration initialized');
  }

  async startOptimizedMonitoring() {
    if (this.isMonitoring) {
      console.log('🔍 Optimized monitoring already active');
      return;
    }

    console.log('🚀 Starting OPTIMIZED Alchemy monitoring (FREE TIER FRIENDLY)');
    
    // Use batch checking instead of real-time WebSocket to save CUs
    this.batchInterval = setInterval(async () => {
      await this.batchAnalyzeRecent();
    }, this.BATCH_INTERVAL_MS);

    this.isMonitoring = true;
    console.log(`✅ Optimized monitoring started - checking every ${this.BATCH_INTERVAL_MS/1000}s`);
  }

  private async batchAnalyzeRecent() {
    if (!this.alchemy || !this.canMakeCall()) {
      return;
    }

    try {
      // Get latest block number (10 CUs)
      const latestBlock = await this.alchemy.core.getBlockNumber();
      this.incrementCallCount();

      // Only analyze the most recent block to save CUs
      const block = await this.alchemy.core.getBlock(latestBlock);
      this.incrementCallCount();

      if (block && block.transactions) {
        // Only check first 10 transactions to stay within limits
        const transactionsToCheck = block.transactions.slice(0, 10);
        
        for (const txHash of transactionsToCheck) {
          if (!this.canMakeCall()) break;
          
          try {
            // Get transaction details (26 CUs)
            const tx = await this.alchemy.core.getTransaction(txHash);
            this.incrementCallCount();
            
            if (tx) {
              const analysis = this.quickReentrancyCheck(tx);
              if (analysis.riskScore > 70) {
                console.log('🚨 SUSPICIOUS TRANSACTION DETECTED:', {
                  hash: txHash,
                  riskScore: analysis.riskScore,
                  patterns: analysis.suspiciousPatterns
                });
              }
            }
          } catch (error) {
            console.error('Error analyzing transaction:', error);
          }
        }
      }

      console.log(`📊 Batch analysis complete. API calls used: ${this.callCount}/${this.MAX_CALLS_PER_HOUR}`);

    } catch (error) {
      console.error('Error in batch analysis:', error);
    }
  }

  private canMakeCall(): boolean {
    // Reset counter every hour
    const now = Date.now();
    if (now - this.lastReset > 3600000) { // 1 hour
      this.callCount = 0;
      this.lastReset = now;
      console.log('🔄 API call counter reset');
    }

    return this.callCount < this.MAX_CALLS_PER_HOUR;
  }

  private incrementCallCount() {
    this.callCount++;
  }

  private quickReentrancyCheck(tx: any): {
    riskScore: number;
    suspiciousPatterns: string[];
  } {
    const patterns: string[] = [];
    let riskScore = 0;

    // Quick checks without additional API calls
    if (tx.data) {
      const selector = tx.data.substring(0, 10);
      const highRiskSelectors = [
        '0xa9059cbb', // transfer
        '0x23b872dd', // transferFrom
        '0x2e1a7d4d', // withdraw
        '0x3ccfd60b', // emergencyWithdraw
      ];

      if (highRiskSelectors.includes(selector)) {
        patterns.push(`High-risk function: ${selector}`);
        riskScore += 40;
      }
    }

    // Check gas limit
    if (tx.gasLimit && parseInt(tx.gasLimit, 16) > 500000) {
      patterns.push('High gas limit');
      riskScore += 30;
    }

    // Check for zero value with data (common in exploits)
    if (tx.value === '0x0' && tx.data && tx.data.length > 100) {
      patterns.push('Zero value with complex data');
      riskScore += 30;
    }

    return { riskScore, suspiciousPatterns: patterns };
  }

  async stopMonitoring() {
    if (this.batchInterval) {
      clearInterval(this.batchInterval);
      this.batchInterval = null;
    }
    this.isMonitoring = false;
    console.log('🛑 Optimized monitoring stopped');
  }

  getUsageStats() {
    return {
      callsUsed: this.callCount,
      maxCallsPerHour: this.MAX_CALLS_PER_HOUR,
      remainingCalls: this.MAX_CALLS_PER_HOUR - this.callCount,
      utilizationPercent: (this.callCount / this.MAX_CALLS_PER_HOUR * 100).toFixed(1),
      nextResetTime: new Date(this.lastReset + 3600000).toISOString(),
      monitoringInterval: `${this.BATCH_INTERVAL_MS/1000} seconds`,
      mode: 'FREE_TIER_OPTIMIZED'
    };
  }

  async getOptimizedStatus() {
    return {
      isActive: this.isMonitoring,
      network: 'Polygon Mainnet',
      mode: 'Batch Analysis (Free Tier)',
      ...this.getUsageStats()
    };
  }
}

export const optimizedAlchemyMonitor = new OptimizedAlchemyMonitor();