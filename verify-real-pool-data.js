#!/usr/bin/env node

/**
 * Verify ACTUAL pool data from multiple authentic sources
 * Check where the €535 figure is coming from
 */

const POOL_ADDRESS = "0x572a5E8cbfCe8026550f1e2B369c2Bdbcf6634c3";

async function verifyRealPoolData() {
  console.log("🔍 Verificando dati AUTENTICI della pool...");
  console.log(`📍 Pool: ${POOL_ADDRESS}`);
  console.log("");

  try {
    // Check 1: Our API response
    console.log("1️⃣ Checking our API response:");
    const ourResponse = await fetch("http://localhost:5000/api/web3/pool-info");
    const ourData = await ourResponse.json();
    console.log(`   Our API says: ${ourData.totalValueLocked}`);
    console.log(`   Last updated: ${new Date(ourData.lastUpdated).toLocaleString()}`);
    console.log(`   Data source: ${ourData.dataSource}`);
    
    // Check 2: Direct Uniswap subgraph query
    console.log("\n2️⃣ Checking Uniswap V3 subgraph directly:");
    const subgraphQuery = {
      query: `{
        pool(id: "${POOL_ADDRESS.toLowerCase()}") {
          id
          totalValueLockedUSD
          totalValueLockedToken0
          totalValueLockedToken1
          token0 {
            symbol
            decimals
          }
          token1 {
            symbol  
            decimals
          }
          volumeUSD
          liquidity
        }
      }`
    };
    
    const subgraphResponse = await fetch("https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3-polygon", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subgraphQuery)
    });
    
    const subgraphData = await subgraphResponse.json();
    
    if (subgraphData.data?.pool) {
      const pool = subgraphData.data.pool;
      console.log(`   Subgraph TVL: $${parseFloat(pool.totalValueLockedUSD).toFixed(2)} USD`);
      console.log(`   Token0 (${pool.token0.symbol}): ${pool.totalValueLockedToken0}`);
      console.log(`   Token1 (${pool.token1.symbol}): ${pool.totalValueLockedToken1}`);
      console.log(`   Liquidity: ${pool.liquidity}`);
    } else {
      console.log("   ❌ Pool not found in subgraph or error occurred");
      console.log(`   Response: ${JSON.stringify(subgraphData)}`);
    }
    
    // Check 3: Check if pool exists on blockchain
    console.log("\n3️⃣ Verifying pool exists on blockchain:");
    const alchemyUrl = `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;
    
    // Get pool slot0 (basic info)
    const slot0Call = {
      jsonrpc: "2.0",
      method: "eth_call", 
      params: [{
        to: POOL_ADDRESS,
        data: "0x3850c7bd" // slot0() function selector
      }, "latest"],
      id: 1
    };
    
    const slot0Response = await fetch(alchemyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slot0Call)
    });
    
    const slot0Data = await slot0Response.json();
    
    if (slot0Data.result && slot0Data.result !== "0x") {
      console.log("   ✅ Pool contract exists and is callable");
      // Decode basic slot0 data
      const result = slot0Data.result;
      console.log(`   Raw slot0: ${result.substring(0, 50)}...`);
    } else {
      console.log("   ❌ Pool contract not found or not callable");
      console.log(`   Error: ${JSON.stringify(slot0Data)}`);
    }
    
    // Check 4: Exchange rate verification
    console.log("\n4️⃣ Checking USD to EUR conversion:");
    const exchangeResponse = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
    const exchangeData = await exchangeResponse.json();
    const eurRate = exchangeData.rates.EUR;
    console.log(`   Current rate: 1 USD = ${eurRate} EUR`);
    
    console.log("\n🎯 ANALYSIS:");
    console.log("   - Check if subgraph TVL matches your screenshot value");
    console.log("   - Our €535 might be cached/outdated data");  
    console.log("   - Your screenshot shows the REAL current value");
    console.log("   - We need to use the ACTUAL current value, not cached");
    
  } catch (error) {
    console.error("❌ Error verifying pool data:", error.message);
  }
}

verifyRealPoolData();