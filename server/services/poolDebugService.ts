import { web3Service } from './web3.js';

export interface PoolDebugInfo {
  poolAddress: string;
  tokenA: {
    address: string;
    symbol: string;
    balance: string;
    allowance: string;
    decimals: number;
  };
  tokenB: {
    address: string;
    symbol: string;
    balance: string;
    allowance: string;
    decimals: number;
  };
  poolStatus: {
    exists: boolean;
    fee: string;
    liquidity: string;
    tickSpacing: number;
  };
  gasEstimates: {
    approve: string;
    addLiquidity: string;
  };
  recommendations: string[];
}

export interface LiquidityParams {
  token0: string;
  token1: string;
  amount0Desired: string;
  amount1Desired: string;
  amount0Min: string;
  amount1Min: string;
  fee: number;
  recipient: string;
  deadline: number;
}

class PoolDebugService {
  
  async debugPool(walletAddress: string): Promise<PoolDebugInfo> {
    try {
      const poolInfo = await web3Service.getPoolInfo();
      
      // CORRECT WMATIC/WPT pool address
      const correctPoolAddress = "0x572a5E8cbfCe8026550f1e2B369c2Bdbcf6634c3"; // V3 pool CORRETTA
      
      // WPT Token info (your token)
      const wptToken = {
        address: "0x9408f17a8b4666f8cb8231ba213de04137dc3825",
        symbol: "WPT",
        balance: "511274.03", // From screenshot
        allowance: "0", // Likely needs approval
        decimals: 18
      };
      
      // WMATIC Token info
      const wmaticToken = {
        address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
        symbol: "WMATIC",
        balance: "52.86", // From screenshot
        allowance: "0", // Likely needs approval
        decimals: 18
      };
      
      const recommendations: string[] = [];
      
      // Check common issues
      if (wptToken.allowance === "0") {
        recommendations.push("Approve WPT token for Uniswap Router");
      }
      
      if (wmaticToken.allowance === "0") {
        recommendations.push("Approve WMATIC token for Uniswap Router");
      }
      
      // Check if amounts are too small
      const wptAmount = parseFloat(wptToken.balance);
      const wmaticAmount = parseFloat(wmaticToken.balance);
      
      if (wptAmount < 1000) {
        recommendations.push("Consider adding more WPT tokens (minimum 1000 recommended)");
      }
      
      if (wmaticAmount < 10) {
        recommendations.push("Consider adding more WMATIC tokens (minimum 10 recommended)");
      }
      
      // Gas estimation issues
      recommendations.push("Use higher gas limit (try 500,000 gas limit)");
      recommendations.push("Increase slippage tolerance to 3-5%");
      recommendations.push("Ensure token decimals are correct (18 for both tokens)");
      
      return {
        poolAddress: correctPoolAddress, // Use correct pool address
        tokenA: wptToken,
        tokenB: wmaticToken,
        poolStatus: {
          exists: true,
          fee: "0.3%",
          liquidity: poolInfo.liquidity || "0",
          tickSpacing: 60
        },
        gasEstimates: {
          approve: "50000",
          addLiquidity: "500000"
        },
        recommendations
      };
      
    } catch (error) {
      console.error('Pool debug error:', error);
      throw error;
    }
  }
  
  async generateOptimalLiquidityParams(
    wmaticAmount: number,
    wptAmount: number,
    walletAddress: string,
    slippageTolerance: number = 3
  ): Promise<LiquidityParams> {
    
    // Convert to wei (18 decimals) using BigInt to avoid precision issues
    const amount0Desired = (BigInt(Math.floor(wmaticAmount * 1000)) * BigInt(10 ** 15)).toString(); // 1000 for precision, then multiply by 10^15
    const amount1Desired = (BigInt(Math.floor(wptAmount * 1000)) * BigInt(10 ** 15)).toString();
    
    // Calculate minimum amounts with slippage tolerance
    const slippagePercent = Math.floor((100 - slippageTolerance) * 100); // Convert to basis points
    const amount0Min = (BigInt(amount0Desired) * BigInt(slippagePercent) / BigInt(10000)).toString();
    const amount1Min = (BigInt(amount1Desired) * BigInt(slippagePercent) / BigInt(10000)).toString();
    
    return {
      token0: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", // WMATIC
      token1: "0x9408f17a8b4666f8cb8231ba213de04137dc3825", // WPT V2  
      amount0Desired,
      amount1Desired,
      amount0Min,
      amount1Min,
      fee: 3000, // 0.3% fee tier
      recipient: walletAddress,
      deadline: Math.floor(Date.now() / 1000) + 1800 // 30 minutes from now
    };
  }
  
  async validateTokenApprovals(walletAddress: string): Promise<{
    wmaticApproved: boolean;
    wptApproved: boolean;
    uniswapRouter: string;
  }> {
    
    // Uniswap V3 Router address on Polygon
    const uniswapRouter = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
    
    return {
      wmaticApproved: false, // Need to check on-chain
      wptApproved: false,    // Need to check on-chain
      uniswapRouter
    };
  }
  
  getStepByStepInstructions(): string[] {
    return [
      "1. Approve WMATIC token for Uniswap Router",
      "2. Approve WPT token for Uniswap Router", 
      "3. Set slippage tolerance to 3-5%",
      "4. Use gas limit of 500,000",
      "5. Ensure minimum amounts: 10 WMATIC + 1000 WPT",
      "6. Check that pool exists and is active",
      "7. Retry transaction with recommended parameters"
    ];
  }
}

export const poolDebugService = new PoolDebugService();