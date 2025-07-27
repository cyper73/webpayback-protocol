#!/usr/bin/env node

/**
 * Force refresh and get AUTHENTIC pool data directly from blockchain
 */

import fetch from 'node-fetch';

async function testAuthenticPool() {
  console.log("🔍 Testing AUTHENTIC pool data...");
  
  try {
    // Force refresh by calling the API
    console.log("1️⃣ Forcing cache refresh...");
    const response = await fetch("http://localhost:5000/api/web3/pool-info");
    const data = await response.json();
    
    console.log("📊 Current API Response:");
    console.log(`   TVL: ${data.totalValueLocked}`);
    console.log(`   Last Updated: ${new Date(data.lastUpdated).toLocaleString()}`);
    console.log(`   Data Source: ${data.dataSource}`);
    
    // Test direct blockchain call for WMATIC balance
    console.log("\n2️⃣ Testing direct blockchain call...");
    const alchemyUrl = `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;
    const poolAddress = "0x572a5E8cbfCe8026550f1e2B369c2Bdbcf6634c3";
    const wmaticAddress = "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270";
    
    const balanceCall = {
      jsonrpc: "2.0",
      method: "eth_call",
      params: [{
        to: wmaticAddress,
        data: `0x70a08231000000000000000000000000${poolAddress.slice(2)}` // balanceOf(pool)
      }, "latest"],
      id: 1
    };
    
    const balanceResponse = await fetch(alchemyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(balanceCall)
    });
    
    const balanceData = await balanceResponse.json();
    
    if (balanceData.result && balanceData.result !== "0x") {
      const wmaticBalance = parseInt(balanceData.result, 16) / Math.pow(10, 18);
      console.log(`   WMATIC in pool (blockchain): ${wmaticBalance.toFixed(6)}`);
      
      // Calculate value
      const wmaticPrice = 0.97; // Approximate price
      const valueUSD = wmaticBalance * wmaticPrice;
      const valueEUR = valueUSD * 0.852;
      
      console.log(`   Calculated value: $${valueUSD.toFixed(2)} USD / €${valueEUR.toFixed(2)} EUR`);
      
      if (wmaticBalance === 0) {
        console.log("⚠️ Pool is empty or all liquidity removed");
      }
    } else {
      console.log("❌ Could not get blockchain balance");
      console.log(`   Response: ${JSON.stringify(balanceData)}`);
    }
    
    console.log("\n🎯 Comparison with user screenshot:");
    console.log("   User screenshot shows: $63.11 USD");
    console.log("   This suggests the user position value, not total pool TVL");
    console.log("   The pool might have very low liquidity currently");
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testAuthenticPool();