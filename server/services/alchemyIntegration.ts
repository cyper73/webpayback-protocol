import { Alchemy, Network, AlchemySubscription } from 'alchemy-sdk';
import WebSocket from 'ws';

export class AlchemyReentrancyMonitor {
  private alchemy: Alchemy;
  private ws: WebSocket | null = null;
  private isMonitoring = false;
  private alchemyWs: AlchemySubscription | null = null;

  constructor() {
    const apiKey = process.env.ALCHEMY_API_KEY; // [REDACTED_FOR_GITHUB_SECURITY]
    if (!apiKey) {
      console.warn('⚠️ API_KEY not found. Real-time monitoring will be simulated.');
      this.alchemy = null as any; // Will be handled gracefully
      return;
    }

    try {
      this.alchemy = new Alchemy({
        apiKey: apiKey,
        network: Network.MATIC_MAINNET, // Polygon mainnet
      });
      console.log('✅ Alchemy integration initialized with API key');
    } catch (error) {
      console.error('❌ Failed to initialize Alchemy:', error);
      this.alchemy = null as any;
    }
  }

  async startRealtimeMonitoring() {
    if (!this.alchemy) {
      console.log('🔍 Alchemy monitoring simulated (no API key)');
      this.isMonitoring = true;
      return;
    }

    if (this.isMonitoring) {
      console.log('🔍 Alchemy monitoring already active');
      return;
    }

    try {
      console.log('🚀 Starting Alchemy real-time reentrancy monitoring...');
      
      // Monitor pending transactions for reentrancy patterns
      this.alchemyWs = (this.alchemy as any).ws.on("alchemy_pendingTransactions", 
        {
          toAddress: process.env.V2_ROUTER_ADDRESS || "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
        },
        (tx: any) => this.analyzePendingTransaction(tx)
      );

      // Monitor mined transactions for post-analysis
      (this.alchemy as any).ws.on(
        {
          method: "alchemy_minedTransactions",
          addresses: [{ to: process.env.V2_ROUTER_ADDRESS || "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D" }],
        },
        (tx: any) => this.analyzeMinedTransaction(tx)
      );

      this.isMonitoring = true;
      console.log('✅ Alchemy real-time monitoring started successfully');
      
    } catch (error) {
      console.error('❌ Error starting Alchemy monitoring:', error);
      this.isMonitoring = false;
    }
  }

  async stopMonitoring() {
    if (this.alchemyWs) {
      (this.alchemyWs as any).unsubscribe();
    }
    this.alchemyWs = null;
    this.isMonitoring = false;
    console.log('🛑 Alchemy monitoring stopped');
  }

  private async analyzePendingTransaction(tx: any) {
    try {
      if (!tx || !tx.hash) return;

      console.log('🔍 Analyzing pending transaction:', tx.hash);

      // Check for reentrancy patterns in pending transactions
      const analysis = await this.detectReentrancyPatterns(tx);
      
      if (analysis.isReentrancyDetected && analysis.riskScore > 70) {
        console.log('🚨 HIGH RISK REENTRANCY DETECTED IN MEMPOOL:', {
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          riskScore: analysis.riskScore,
          patterns: analysis.suspiciousPatterns
        });

        // Import and use our reentrancy protection service
        const { reentrancyProtection } = await import('./reentrancyProtection');
        
        // Log the real blockchain transaction
        const transactionData = {
          contractAddress: tx.to || '0x0000000000000000000000000000000000000000',
          functionSelector: tx.data ? tx.data.substring(0, 10) : '0x00000000',
          callDepth: analysis.estimatedCallDepth,
          gasUsed: parseInt(tx.gasLimit || '0', 16),
          timestamp: new Date(),
          blockNumber: tx.blockNumber || 0,
          transactionHash: tx.hash
        };

        await reentrancyProtection.analyzeTransaction(transactionData);
      }

    } catch (error) {
      console.error('Error analyzing pending transaction:', error);
    }
  }

  private async analyzeMinedTransaction(tx: any) {
    try {
      if (!tx || !tx.hash) return;

      console.log('📦 Analyzing mined transaction:', tx.hash);

      // Get transaction receipt for more details
      const receipt = await this.alchemy.core.getTransactionReceipt(tx.hash);
      
      if (receipt && receipt.logs && receipt.logs.length > 10) {
        // High number of logs might indicate complex interactions (potential reentrancy)
        console.log('⚠️ Transaction with high log count detected:', {
          hash: tx.hash,
          logCount: receipt.logs.length,
          gasUsed: receipt.gasUsed.toString()
        });
      }

    } catch (error) {
      console.error('Error analyzing mined transaction:', error);
    }
  }

  private async detectReentrancyPatterns(tx: any): Promise<{
    isReentrancyDetected: boolean;
    riskScore: number;
    estimatedCallDepth: number;
    suspiciousPatterns: string[];
  }> {
    const patterns: string[] = [];
    let riskScore = 0;
    let estimatedCallDepth = 1;

    // Check function selector for high-risk functions
    if (tx.data) {
      const selector = tx.data.substring(0, 10);
      const highRiskSelectors = [
        '0xa9059cbb', // transfer
        '0x23b872dd', // transferFrom
        '0x2e1a7d4d', // withdraw
        '0x3ccfd60b', // emergencyWithdraw
        '0x095ea7b3', // approve
        '0xd0e30db0', // deposit
      ];

      if (highRiskSelectors.includes(selector)) {
        patterns.push(`High-risk function: ${selector}`);
        riskScore += 30;
      }
    }

    // Check gas limit (very high gas might indicate complex operations)
    if (tx.gasLimit) {
      const gasLimit = parseInt(tx.gasLimit, 16);
      if (gasLimit > 500000) {
        patterns.push(`High gas limit: ${gasLimit}`);
        riskScore += 20;
        estimatedCallDepth += Math.floor(gasLimit / 100000);
      }
    }

    // Check value (zero value transactions are often used in exploits)
    if (tx.value === '0x0' && tx.data && tx.data.length > 10) {
      patterns.push('Zero value with complex data');
      riskScore += 15;
    }

    // Check transaction data size (very large data might indicate complex operations)
    if (tx.data && tx.data.length > 1000) {
      patterns.push(`Large transaction data: ${tx.data.length} bytes`);
      riskScore += 25;
      estimatedCallDepth += Math.floor(tx.data.length / 500);
    }

    return {
      isReentrancyDetected: riskScore > 50,
      riskScore,
      estimatedCallDepth: Math.min(estimatedCallDepth, 20),
      suspiciousPatterns: patterns
    };
  }

  async getMonitoringStatus() {
    return {
      isActive: this.isMonitoring,
      network: 'Polygon Mainnet',
      apiKey: process.env.ALCHEMY_API_KEY ? 'Set' : 'Missing', // [REDACTED_FOR_GITHUB_SECURITY]
      lastCheck: new Date().toISOString(),
      mode: this.alchemy ? 'Live' : 'Simulated'
    };
  }

  async getRecentBlockchainActivity() {
    if (!this.alchemy) {
      // Return simulated data when no API key
      return {
        latestBlock: Math.floor(Math.random() * 1000000) + 53000000,
        transactionCount: Math.floor(Math.random() * 200) + 50,
        timestamp: new Date(),
        gasUsed: (Math.floor(Math.random() * 10000000) + 5000000).toString(),
        difficulty: (Math.floor(Math.random() * 1000000) + 100000).toString(),
        mode: 'simulated'
      };
    }

    try {
      const latestBlock = await this.alchemy.core.getBlockNumber();
      const block = await this.alchemy.core.getBlockWithTransactions(latestBlock);
      
      return {
        latestBlock: latestBlock,
        transactionCount: block.transactions.length,
        timestamp: new Date(block.timestamp * 1000),
        gasUsed: block.gasUsed.toString(),
        difficulty: block.difficulty.toString(),
        mode: 'live'
      };
    } catch (error) {
      console.error('Error getting blockchain activity:', error);
      return null;
    }
  }
}

export const alchemyMonitor = new AlchemyReentrancyMonitor();