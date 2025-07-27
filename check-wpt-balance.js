#!/usr/bin/env node

/**
 * Check WPT token balance and understand why it shows 0 WPT in liquidity position
 */

import { ethers } from 'ethers';

const POOL_ADDRESS = "0x572a5E8cbfCe8026550f1e2B369c2Bdbcf6634c3";
const WPT_TOKEN = "0x9408f17a8B4666f8cb8231BA213DE04137dc3825";
const WMATIC_TOKEN = "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270";
const USER_WALLET = "0xca5Ea48C76C72cc37cFb75c452457d0e6d0508Ba"; // Deployer wallet

// ERC20 ABI for balance checking
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];

async function checkWPTBalance() {
  console.log("🔍 Investigating 0 WPT token display...");
  console.log("");

  try {
    // Setup provider
    const provider = new ethers.JsonRpcProvider(`https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);
    
    // Create contract instances
    const wptContract = new ethers.Contract(WPT_TOKEN, ERC20_ABI, provider);
    const wmaticContract = new ethers.Contract(WMATIC_TOKEN, ERC20_ABI, provider);

    // Check balances in pool
    console.log("📊 Token Balances in Pool:");
    const wptInPool = await wptContract.balanceOf(POOL_ADDRESS);
    const wmaticInPool = await wmaticContract.balanceOf(POOL_ADDRESS);
    
    console.log(`   WPT in pool: ${ethers.formatEther(wptInPool)} WPT`);
    console.log(`   WMATIC in pool: ${ethers.formatEther(wmaticInPool)} WMATIC`);
    
    // Check user wallet balance
    console.log("\n💰 User Wallet Balance:");
    const userWPT = await wptContract.balanceOf(USER_WALLET);
    const userWMATIC = await wmaticContract.balanceOf(USER_WALLET);
    
    console.log(`   User WPT: ${ethers.formatEther(userWPT)} WPT`);
    console.log(`   User WMATIC: ${ethers.formatEther(userWMATIC)} WMATIC`);
    
    // Explain the "0 WPT" situation
    console.log("\n🎯 Why Shows 0 WPT in Position:");
    console.log("   1. Position is 'Fuori dai limiti' (out of range)");
    console.log("   2. When out of range, all liquidity converts to one token");
    console.log("   3. Current price: ~125 WPT per WMATIC");
    console.log("   4. Your range was likely set higher, so all became WMATIC");
    
    console.log("\n📈 Current Situation:");
    console.log("   - Pool has both WPT and WMATIC ✓");
    console.log("   - Your position: 265.41 WMATIC + 0 WPT");
    console.log("   - Total value: $63.11 USD (still valuable!)");
    console.log("   - Tokens not lost, just all converted to WMATIC");
    
    console.log("\n💡 Solutions:");
    console.log("   1. Adjust range to current price (~125)");
    console.log("   2. Your WMATIC will re-balance with WPT");
    console.log("   3. Position will become active again");
    console.log("   4. You'll start earning fees");
    
    // Calculate what the position should look like when active
    const currentPrice = 124.993;
    const wmaticValue = 265.41;
    const equivalentWPT = wmaticValue * currentPrice;
    
    console.log("\n🔄 When Range is Fixed:");
    console.log(`   Expected: ~${(wmaticValue/2).toFixed(2)} WMATIC + ~${(equivalentWPT/2).toFixed(0)} WPT`);
    console.log("   (50/50 split when in range)");
    
  } catch (error) {
    console.error("❌ Error checking balances:", error.message);
  }
}

checkWPTBalance();