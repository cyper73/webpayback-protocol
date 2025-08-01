#!/usr/bin/env node

/**
 * USDT/WPT Pool Creation Script
 * Creates optimal Uniswap V3 pool with stable range to avoid "out of range" issues
 */

import { ethers } from 'ethers';

// Token addresses on Polygon
const USDT_POLYGON = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";
const WPT_TOKEN = "0x9408f17a8B4666f8cb8231BA213DE04137dc3825";

// Uniswap V3 addresses on Polygon
const UNISWAP_V3_FACTORY = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
const UNISWAP_V3_POSITION_MANAGER = "0xC36442b4a4522E871399CD717aBDD847Ab11FE88";

// Pool parameters
const FEE_TIER = 3000; // 0.30%
const PRICE_RANGE = {
  lower: 0.008, // $0.008 per WPT
  upper: 0.03   // $0.03 per WPT
};

// ABI snippets
const FACTORY_ABI = [
  "function createPool(address tokenA, address tokenB, uint24 fee) external returns (address pool)",
  "function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address pool)"
];

const POSITION_MANAGER_ABI = [
  "function createAndInitializePoolIfNecessary(address token0, address token1, uint24 fee, uint160 sqrtPriceX96) external payable returns (address pool)",
  "function mint((address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, uint256 amount0Desired, uint256 amount1Desired, uint256 amount0Min, uint256 amount1Min, address recipient, uint256 deadline)) external payable returns (uint256 tokenId, uint128 liquidity, uint256 amount0, uint256 amount1)"
];

const ERC20_ABI = [
  "function decimals() view returns (uint8)",
  "function balanceOf(address owner) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)"
];

class USDTWPTPoolCreator {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(`https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`); // [REDACTED_FOR_GITHUB_SECURITY]
    this.factory = new ethers.Contract(UNISWAP_V3_FACTORY, FACTORY_ABI, this.provider);
    this.positionManager = new ethers.Contract(UNISWAP_V3_POSITION_MANAGER, POSITION_MANAGER_ABI, this.provider);
  }

  // Convert price to tick (Uniswap V3 math)
  priceToTick(price) {
    return Math.floor(Math.log(price) / Math.log(1.0001));
  }

  // Convert tick to price
  tickToPrice(tick) {
    return Math.pow(1.0001, tick);
  }

  // Calculate sqrtPriceX96 for initial pool price
  priceToSqrtPriceX96(price) {
    const sqrtPrice = Math.sqrt(price);
    return BigInt(Math.floor(sqrtPrice * (2 ** 96)));
  }

  async checkPoolExists() {
    console.log("🔍 Checking if USDT/WPT pool exists...");
    
    try {
      const poolAddress = await this.factory.getPool(USDT_POLYGON, WPT_TOKEN, FEE_TIER);
      
      if (poolAddress === ethers.ZeroAddress) {
        console.log("❌ Pool does not exist");
        return null;
      } else {
        console.log(`✅ Pool exists at: ${poolAddress}`);
        return poolAddress;
      }
    } catch (error) {
      console.error("Error checking pool:", error.message);
      return null;
    }
  }

  async calculateOptimalRange() {
    console.log("\n📊 Calculating optimal range...");
    
    const lowerTick = this.priceToTick(PRICE_RANGE.lower);
    const upperTick = this.priceToTick(PRICE_RANGE.upper);
    
    // Round to nearest valid tick spacing (60 for 0.30% fee)
    const tickSpacing = 60;
    const lowerTickRounded = Math.floor(lowerTick / tickSpacing) * tickSpacing;
    const upperTickRounded = Math.ceil(upperTick / tickSpacing) * tickSpacing;
    
    console.log(`   Lower price: $${PRICE_RANGE.lower} → tick ${lowerTickRounded}`);
    console.log(`   Upper price: $${PRICE_RANGE.upper} → tick ${upperTickRounded}`);
    console.log(`   Range width: ${upperTickRounded - lowerTickRounded} ticks`);
    
    return {
      lowerTick: lowerTickRounded,
      upperTick: upperTickRounded
    };
  }

  async simulateLiquidityProvision(usdtAmount, wptAmount) {
    console.log("\n💰 Simulating liquidity provision...");
    console.log(`   USDT amount: ${usdtAmount}`);
    console.log(`   WPT amount: ${wptAmount}`);
    
    const currentPrice = 0.015; // Assume current WPT price
    const { lowerTick, upperTick } = await this.calculateOptimalRange();
    
    // Simplified calculation - actual requires complex V3 math
    console.log("\n📈 Expected outcomes:");
    console.log(`   Position will be active if WPT price stays between $${PRICE_RANGE.lower} - $${PRICE_RANGE.upper}`);
    console.log(`   Current price $${currentPrice} is ${currentPrice >= PRICE_RANGE.lower && currentPrice <= PRICE_RANGE.upper ? 'IN RANGE ✅' : 'OUT OF RANGE ❌'}`);
    
    // Estimate fees (simplified)
    const dailyVolume = 1000; // Assume $1000 daily volume
    const feeRate = FEE_TIER / 1000000; // 0.30%
    const dailyFees = dailyVolume * feeRate;
    const yourShare = (usdtAmount + wptAmount * currentPrice) / 10000; // Assume you're 1/100 of pool
    const estimatedDailyEarnings = dailyFees * yourShare;
    
    console.log(`   Estimated daily earnings: $${estimatedDailyEarnings.toFixed(4)}`);
    console.log(`   Monthly earnings: $${(estimatedDailyEarnings * 30).toFixed(2)}`);
    
    return {
      lowerTick,
      upperTick,
      estimatedDailyEarnings
    };
  }

  async generatePoolCreationInstructions() {
    console.log("\n🚀 Pool Creation Instructions:");
    console.log("\n1. **Prepare Tokens:**");
    console.log(`   - Buy USDT on Polygon: ${USDT_POLYGON}`);
    console.log(`   - Have WPT ready: ${WPT_TOKEN}`);
    console.log(`   - Recommended ratio: 50% USDT, 50% WPT value`);
    
    console.log("\n2. **Go to Uniswap V3:**");
    console.log("   - Visit app.uniswap.org");
    console.log("   - Connect to Polygon network");
    console.log("   - Go to 'Pool' section");
    
    console.log("\n3. **Create Pool (if doesn't exist):**");
    console.log("   - Click 'Create a pool'");
    console.log(`   - Token A: USDT (${USDT_POLYGON})`);
    console.log(`   - Token B: WPT (${WPT_TOKEN})`);
    console.log(`   - Fee tier: 0.30%`);
    console.log("   - Starting price: Current WPT price in USDT");
    
    console.log("\n4. **Set Range:**");
    console.log(`   - Min price: $${PRICE_RANGE.lower} WPT per USDT`);
    console.log(`   - Max price: $${PRICE_RANGE.upper} WPT per USDT`);
    console.log("   - This range covers 3.75x price movement");
    
    console.log("\n5. **Add Liquidity:**");
    console.log("   - Enter your USDT amount");
    console.log("   - UI will calculate required WPT");
    console.log("   - Approve tokens and confirm transaction");
    
    console.log("\n✅ **Benefits of this setup:**");
    console.log("   - Much less likely to go out of range");
    console.log("   - USDT provides stability");
    console.log("   - Higher trading volume potential");
    console.log("   - Easier range management");
  }
}

async function main() {
  console.log("🔧 USDT/WPT Pool Creation Analysis");
  console.log("=====================================");
  
  const creator = new USDTWPTPoolCreator();
  
  // Check if pool exists
  const existingPool = await creator.checkPoolExists();
  
  // Calculate optimal range
  await creator.calculateOptimalRange();
  
  // Simulate liquidity provision
  await creator.simulateLiquidityProvision(100, 5000); // $100 USDT + 5000 WPT
  
  // Generate instructions
  await creator.generatePoolCreationInstructions();
  
  console.log("\n🎯 Next Steps:");
  console.log("1. Review the analysis above");
  console.log("2. Decide on your investment amount");
  console.log("3. Follow the creation instructions");
  console.log("4. Monitor the position periodically");
}

// Run analysis
main().catch(console.error);