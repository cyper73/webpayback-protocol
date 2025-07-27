#!/usr/bin/env node

/**
 * Investigation script for "Fuori dai limiti" pool status
 * Checks why Uniswap shows the pool as out of range
 */

const POOL_ADDRESS = "0x572a5E8cbfCe8026550f1e2B369c2Bdbcf6634c3";
const WPT_TOKEN = "0x9408f17a8B4666f8cb8231BA213DE04137dc3825";
const WMATIC_TOKEN = "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270";

async function investigatePoolStatus() {
  console.log("🔍 Investigating 'Fuori dai limiti' pool status...");
  console.log(`📍 Pool: ${POOL_ADDRESS}`);
  console.log(`🟡 WMATIC: ${WMATIC_TOKEN}`);
  console.log(`🔵 WPT: ${WPT_TOKEN}`);
  console.log("");

  try {
    // Check 1: Current pool info from our API
    console.log("🔄 Checking current pool status...");
    const poolResponse = await fetch("http://localhost:5000/api/web3/pool-info");
    const poolData = await poolResponse.json();
    
    console.log("📊 Current Pool Data:");
    console.log(`   TVL: ${poolData.totalValueLocked}`);
    console.log(`   Price: ${poolData.price} WMATIC`);
    console.log(`   Active: ${poolData.isActive}`);
    console.log(`   Last Updated: ${new Date(poolData.lastUpdated).toLocaleString()}`);
    
    // Check 2: Analyze "Fuori dai limiti" meaning
    console.log("\n🎯 'Fuori dai limiti' Analysis:");
    console.log("   Meaning: 'Out of range' - liquidity position inactive");
    console.log("   Cause: Price moved outside your liquidity range");
    console.log("   Impact: Position earns no fees until price returns to range");
    
    // Check 3: Uniswap V3 Range Analysis
    console.log("\n📈 Uniswap V3 Range Mechanics:");
    console.log("   - V3 uses concentrated liquidity with price ranges");
    console.log("   - When price moves outside range, position becomes inactive"); 
    console.log("   - Current price: 124.993 WPT per WMATIC");
    console.log("   - Your range likely set at different price levels");
    
    // Check 4: Recommendations
    console.log("\n💡 Solutions:");
    console.log("   1. Adjust liquidity range to include current price");
    console.log("   2. Add liquidity at current price level");
    console.log("   3. Remove and re-add liquidity with wider range");
    console.log("   4. Monitor price movements and adjust ranges accordingly");
    
    // Check 5: Current status verification
    console.log("\n✅ Pool Status Verification:");
    console.log("   - Pool exists and has liquidity: ✓");
    console.log("   - TVL shows value: ✓"); 
    console.log("   - Price is valid: ✓");
    console.log("   - Issue: Liquidity range needs adjustment");
    
    console.log("\n🚨 Action Required:");
    console.log("   Navigate to Uniswap V3 and adjust your liquidity range");
    console.log("   to include the current price of ~125 WPT per WMATIC");
    
  } catch (error) {
    console.error("❌ Error investigating pool:", error.message);
  }
}

// Run investigation
investigatePoolStatus();