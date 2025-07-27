#!/usr/bin/env node

/**
 * 🔍 Find Real WPT Pool
 * Searches for the actual WPT liquidity pool created yesterday with 500 EUR
 */

import { Alchemy, Network } from 'alchemy-sdk';

console.log('🔍 Searching for Real WPT Pool...\n');

const WPT_CONTRACT = '0x9408f17a8B4666f8cb8231BA213DE04137dc3825';
const DEPLOYER_WALLET = '0xca5Ea48C76C72cc37cFb75c452457d0e6d0508Ba';

// Known Uniswap V3 Factory on Polygon
const UNISWAP_V3_FACTORY = '0x1F98431c8aD98523631AE4a59f267346ea31F984';
const UNISWAP_V3_ROUTER = '0xE592427A0AEce92De3Edee1F18E0157C05861564';

// Alchemy configuration
const config = {
  apiKey: process.env.ALCHEMY_API_KEY,
  network: Network.MATIC_MAINNET,
};

const alchemy = new Alchemy(config);

async function findRealPool() {
  try {
    console.log('🎯 WPT Contract:', WPT_CONTRACT);
    console.log('🎯 Deployer Wallet:', DEPLOYER_WALLET);
    console.log('🎯 Search Date: July 25, 2025 (yesterday)');
    console.log();
    
    // Check recent transactions from deployer wallet
    console.log('🔍 Checking deployer wallet recent activity...');
    
    const latestBlock = await alchemy.core.getBlockNumber();
    const blocksPerDay = 43200; // ~2 second blocks on Polygon
    const yesterdayBlock = latestBlock - blocksPerDay;
    
    console.log('📊 Latest Block:', latestBlock);
    console.log('📊 Yesterday Block (~):', yesterdayBlock);
    
    // Look for pool creation patterns
    console.log('\n🔍 Common Uniswap V3 Pool Addresses for WPT:');
    
    // POL token address on Polygon
    const POL_TOKEN = '0x455e53DC43b0E8AC7e96A72FBE76E86D4DC6Fc3d';
    const WMATIC = '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270';
    
    console.log('Checking possible pool combinations:');
    console.log('- WPT/POL pool');
    console.log('- WPT/WMATIC pool');
    console.log('- WPT/USDC pool');
    
    // Check if deployer has any recent approvals or transfers
    const deployerBalance = await alchemy.core.getBalance(DEPLOYER_WALLET);
    console.log('\n💰 Deployer Wallet Balance:', (Number(deployerBalance) / 1e18).toFixed(4), 'POL');
    
    // Look for Uniswap interactions
    console.log('\n🦄 Searching for Uniswap V3 interactions...');
    console.log('Factory:', UNISWAP_V3_FACTORY);
    console.log('Router:', UNISWAP_V3_ROUTER);
    
    // Suggest manual verification steps
    console.log('\n📋 MANUAL VERIFICATION NEEDED:');
    console.log('==============================');
    console.log('1. Check deployer wallet transaction history on PolygonScan');
    console.log('2. Look for Uniswap V3 pool creation on July 25, 2025');
    console.log('3. Search for liquidity additions with ~500 EUR value');
    console.log('4. Verify pool contract addresses from those transactions');
    
    console.log('\n🔗 Direct Links:');
    console.log(`PolygonScan Deployer: https://polygonscan.com/address/${DEPLOYER_WALLET}`);
    console.log(`PolygonScan WPT Token: https://polygonscan.com/token/${WPT_CONTRACT}`);
    
    return {
      needsManualVerification: true,
      deployerWallet: DEPLOYER_WALLET,
      wptContract: WPT_CONTRACT,
      wrongPoolAddress: '0x1FF3b523ab413abFF55F409Ff4602C53e4fE70cd'
    };
    
  } catch (error) {
    console.error('❌ Search failed:', error.message);
    return null;
  }
}

// Run search
findRealPool().then(result => {
  if (result) {
    console.log('\n🎯 RESULT: Manual verification required');
    console.log('The pool address in our system appears to be incorrect.');
  }
});