import { ethers } from "ethers";

interface PoolPosition {
  poolAddress: string;
  tokenA: string;
  tokenB: string;
  currentPrice: number;
  rangeMin: number;
  rangeMax: number;
  liquidity: string;
  tvl: number;
  isInRange: boolean;
  version: 'V2' | 'V3';
}

interface AutomationConfig {
  enabled: boolean;
  rebalanceThreshold: number; // Percentage (15% = 0.15)
  maxDailySpend: number; // USD
  maxTransactionSize: number; // USD
  emergencyStop: boolean;
  notifications: boolean;
}

interface AutomationAction {
  id: string;
  timestamp: number;
  action: 'rebalance' | 'expand_range' | 'migrate' | 'emergency_stop';
  poolAddress: string;
  reason: string;
  gasUsed: string;
  status: 'pending' | 'completed' | 'failed';
  txHash?: string;
}

class AutomatedPoolManager {
  private provider: ethers.providers.Provider;
  private signer: ethers.Wallet;
  private automationConfig: AutomationConfig;
  private actionHistory: AutomationAction[] = [];
  private dailySpendUsed: number = 0;
  private lastResetDate: string = new Date().toDateString();
  
  constructor() {
    this.provider = new ethers.providers.AlchemyProvider('matic', process.env.ALCHEMY_API_KEY);
    this.signer = new ethers.Wallet(process.env.PRIVATE_KEY!, this.provider);
    
    this.automationConfig = {
      enabled: true,
      rebalanceThreshold: 0.15, // 15%
      maxDailySpend: 50, // $50 per day
      maxTransactionSize: 20, // $20 per transaction
      emergencyStop: false,
      notifications: true
    };
    
    this.startAutomation();
  }

  private async startAutomation() {
    console.log("🤖 Automated Pool Manager ACTIVATED");
    console.log(`📊 Daily Budget: $${this.automationConfig.maxDailySpend}`);
    console.log(`⚡ Rebalance Threshold: ${this.automationConfig.rebalanceThreshold * 100}%`);
    
    // Check every 2 minutes
    setInterval(async () => {
      if (this.automationConfig.enabled && !this.automationConfig.emergencyStop) {
        await this.runAutomationCycle();
      }
    }, 120000); // 2 minutes
  }

  private async runAutomationCycle() {
    try {
      // Reset daily spend counter if new day
      const currentDate = new Date().toDateString();
      if (currentDate !== this.lastResetDate) {
        this.dailySpendUsed = 0;
        this.lastResetDate = currentDate;
        console.log("🔄 Daily spend counter reset");
      }

      // Check if daily budget exceeded
      if (this.dailySpendUsed >= this.automationConfig.maxDailySpend) {
        console.log(`⛔ Daily budget exceeded: $${this.dailySpendUsed}/$${this.automationConfig.maxDailySpend}`);
        return;
      }

      // Get current pool positions
      const positions = await this.getCurrentPositions();
      
      for (const position of positions) {
        await this.analyzeAndAct(position);
      }
      
    } catch (error) {
      console.error("❌ Automation cycle error:", error);
    }
  }

  private async getCurrentPositions(): Promise<PoolPosition[]> {
    const positions: PoolPosition[] = [];
    
    try {
      // USDT/WPT V2 Pool
      const usdtResponse = await fetch('http://localhost:5000/api/web3/pool-info?type=usdt');
      const usdtData = await usdtResponse.json();
      
      if (usdtData.poolAddress) {
        positions.push({
          poolAddress: usdtData.poolAddress,
          tokenA: 'USDT',
          tokenB: 'WPT',
          currentPrice: parseFloat(usdtData.price || '0'),
          rangeMin: 0, // V2 has no range limits
          rangeMax: Infinity,
          liquidity: usdtData.liquidity || '0',
          tvl: this.parseValue(usdtData.totalValueLocked),
          isInRange: true, // V2 is always in range
          version: 'V2'
        });
      }

      // WMATIC/WPT V3 Pool
      const wmaticResponse = await fetch('http://localhost:5000/api/web3/pool-info?type=wmatic');
      const wmaticData = await wmaticResponse.json();
      
      if (wmaticData.poolAddress) {
        positions.push({
          poolAddress: wmaticData.poolAddress,
          tokenA: 'WMATIC',
          tokenB: 'WPT',
          currentPrice: parseFloat(wmaticData.price || '0'),
          rangeMin: parseFloat(wmaticData.price || '0') * 0.85, // Assume 15% range
          rangeMax: parseFloat(wmaticData.price || '0') * 1.15,
          liquidity: wmaticData.liquidity || '0',
          tvl: this.parseValue(wmaticData.totalValueLocked),
          isInRange: this.checkIfInRange(parseFloat(wmaticData.price || '0')),
          version: 'V3'
        });
      }
      
    } catch (error) {
      console.error("❌ Error fetching positions:", error);
    }
    
    return positions;
  }

  private parseValue(value: string): number {
    if (!value) return 0;
    // Remove currency symbols and parse
    const cleanValue = value.replace(/[$€,]/g, '');
    return parseFloat(cleanValue) || 0;
  }

  private checkIfInRange(currentPrice: number): boolean {
    // Simple heuristic - could be enhanced with actual V3 position data
    return currentPrice > 0; // For now, assume in range if price exists
  }

  private async analyzeAndAct(position: PoolPosition) {
    console.log(`🔍 Analyzing ${position.tokenA}/${position.tokenB} pool...`);
    
    // V3 Pool Analysis
    if (position.version === 'V3') {
      // Check if approaching range limits
      const priceMovement = this.calculatePriceMovement(position);
      
      if (Math.abs(priceMovement) >= this.automationConfig.rebalanceThreshold) {
        console.log(`⚠️ Price movement detected: ${(priceMovement * 100).toFixed(2)}%`);
        
        if (!position.isInRange) {
          // Migrate to V2 for stability
          await this.executeAction({
            id: `migrate_${Date.now()}`,
            timestamp: Date.now(),
            action: 'migrate',
            poolAddress: position.poolAddress,
            reason: `Out of range - migrating to V2 for stability`,
            gasUsed: '0',
            status: 'pending'
          });
        } else {
          // Expand range preemptively
          await this.executeAction({
            id: `expand_${Date.now()}`,
            timestamp: Date.now(),
            action: 'expand_range',
            poolAddress: position.poolAddress,
            reason: `Price movement ${(priceMovement * 100).toFixed(2)}% - expanding range`,
            gasUsed: '0',
            status: 'pending'
          });
        }
      }
    }

    // Check TVL health
    if (position.tvl < 50) { // If TVL drops below $50
      console.log(`📉 Low TVL detected: $${position.tvl}`);
      // Could trigger consolidation or migration
    }
  }

  private calculatePriceMovement(position: PoolPosition): number {
    // Calculate price movement relative to range center
    const rangeCenter = (position.rangeMin + position.rangeMax) / 2;
    return (position.currentPrice - rangeCenter) / rangeCenter;
  }

  private async executeAction(action: AutomationAction) {
    console.log(`🚀 Executing action: ${action.action} - ${action.reason}`);
    
    // Check budget constraints
    const estimatedCost = await this.estimateActionCost(action);
    
    if (estimatedCost > this.automationConfig.maxTransactionSize) {
      console.log(`⛔ Transaction too large: $${estimatedCost} > $${this.automationConfig.maxTransactionSize}`);
      return;
    }
    
    if (this.dailySpendUsed + estimatedCost > this.automationConfig.maxDailySpend) {
      console.log(`⛔ Would exceed daily budget: $${this.dailySpendUsed + estimatedCost} > $${this.automationConfig.maxDailySpend}`);
      return;
    }

    try {
      this.actionHistory.push(action);
      
      // Simulate execution for now - would implement actual blockchain calls
      console.log(`✅ Action ${action.action} simulated successfully`);
      console.log(`💰 Estimated cost: $${estimatedCost}`);
      
      action.status = 'completed';
      this.dailySpendUsed += estimatedCost;
      
    } catch (error) {
      console.error(`❌ Action execution failed:`, error);
      action.status = 'failed';
    }
  }

  private async estimateActionCost(action: AutomationAction): Promise<number> {
    // Estimate gas costs for different actions
    const gasPrices = {
      rebalance: 0.15, // $0.15
      expand_range: 0.25, // $0.25
      migrate: 0.50, // $0.50
      emergency_stop: 0.10 // $0.10
    };
    
    return gasPrices[action.action] || 0.20;
  }

  // Public API Methods
  public getConfig(): AutomationConfig {
    return { ...this.automationConfig };
  }

  public updateConfig(config: Partial<AutomationConfig>): void {
    this.automationConfig = { ...this.automationConfig, ...config };
    console.log("⚙️ Automation config updated:", config);
  }

  public getActionHistory(): AutomationAction[] {
    return [...this.actionHistory];
  }

  public getDailySpendStatus() {
    return {
      used: this.dailySpendUsed,
      limit: this.automationConfig.maxDailySpend,
      remaining: this.automationConfig.maxDailySpend - this.dailySpendUsed,
      resetDate: this.lastResetDate
    };
  }

  public emergencyStop(): void {
    this.automationConfig.emergencyStop = true;
    console.log("🛑 EMERGENCY STOP ACTIVATED - All automation halted");
  }

  public resume(): void {
    this.automationConfig.emergencyStop = false;
    console.log("▶️ Automation resumed");
  }

  public getStatus() {
    return {
      enabled: this.automationConfig.enabled,
      emergencyStop: this.automationConfig.emergencyStop,
      dailySpend: this.getDailySpendStatus(),
      lastAction: this.actionHistory[this.actionHistory.length - 1],
      totalActions: this.actionHistory.length
    };
  }
}

// Export singleton instance
export const automatedPoolManager = new AutomatedPoolManager();
export default automatedPoolManager;