#!/usr/bin/env node

/**
 * 🌊 Pool Verification Script
 * Verifies if the POL/WPT pool matches the 500 EUR pool created yesterday
 */

import { Alchemy, Network } from 'alchemy-sdk';

console.log('🔍 Verifying POL/WPT Pool...\n');

const POOL_ADDRESS = '0x1FF3b523ab413abFF55F409Ff4602C53e4fE70cd';
const WPT_CONTRACT = '0x9408f17a8B4666f8cb8231BA213DE04137dc3825';

// Alchemy configuration
const config = {
  apiKey: process.env.ALCHEMY_API_KEY,
  network: Network.MATIC_MAINNET,
};

const alchemy = new Alchemy(config);

async function verifyPool() {
  try {
    console.log('🎯 Pool Address:', POOL_ADDRESS);
    console.log('🎯 WPT Contract:', WPT_CONTRACT);
    
    // Check pool existence
    const poolCode = await alchemy.core.getCode(POOL_ADDRESS);
    console.log('📋 Pool Contract Exists:', poolCode !== '0x' ? 'YES' : 'NO');
    
    if (poolCode === '0x') {
      console.log('❌ WARNING: Pool address has no contract code');
      console.log('   This might not be a valid Uniswap V3 pool');
      return;
    }
    
    // Get pool balance
    const poolBalance = await alchemy.core.getBalance(POOL_ADDRESS);
    console.log('💰 Pool POL Balance:', poolBalance.toString(), 'wei');
    console.log('💰 Pool POL Balance:', (Number(poolBalance) / 1e18).toFixed(6), 'POL');
    
    // Estimate USD value (POL ~$0.24)
    const polPrice = 0.24;
    const polAmount = Number(poolBalance) / 1e18;
    const usdValue = polAmount * polPrice;
    console.log('💵 Estimated USD Value:', usdValue.toFixed(2), 'USD');
    
    // Check if this matches ~500 EUR
    const eurToUsd = 1.1; // Approximate EUR to USD rate
    const expectedUsd = 500 * eurToUsd;
    console.log('🎯 Expected USD (500 EUR):', expectedUsd.toFixed(2), 'USD');
    
    const difference = Math.abs(usdValue - expectedUsd);
    const percentDiff = (difference / expectedUsd) * 100;
    
    console.log('\n📊 POOL VERIFICATION RESULTS:');
    console.log('============================');
    
    if (percentDiff < 50) { // Within 50% tolerance
      console.log('✅ MATCH: Pool value matches expected 500 EUR investment');
      console.log(`   Difference: ${difference.toFixed(2)} USD (${percentDiff.toFixed(1)}%)`);
    } else {
      console.log('⚠️  MISMATCH: Pool value differs significantly from 500 EUR');
      console.log(`   Difference: ${difference.toFixed(2)} USD (${percentDiff.toFixed(1)}%)`);
      console.log('   This might be a different pool or needs verification');
    }
    
    // Additional verification - check recent transactions
    console.log('\n🔍 Recent Activity Check:');
    console.log('========================');
    
    // Get transaction count
    const txCount = await alchemy.core.getTransactionCount(POOL_ADDRESS);
    console.log('📈 Transaction Count:', txCount);
    
    if (txCount > 0) {
      console.log('✅ Pool has transaction activity');
    } else {
      console.log('⚠️  Pool has no transactions yet');
    }
    
  } catch (error) {
    console.error('❌ Pool verification failed:', error.message);
  }
}

// Run verification
verifyPool();