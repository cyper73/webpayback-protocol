#!/usr/bin/env node
/**
 * 🔄 WPT TOKEN WITHDRAWAL
 * Withdraw the 1M WPT tokens from USDT/WPT pool to restore balance
 */

const { ethers } = require('ethers');

async function withdrawTokens() {
  try {
    console.log('🔄 WITHDRAWING WPT TOKENS FROM POOL...');
    
    // Configuration
    const WPT_CONTRACT = '0x9408f17a8B4666f8cb8231BA213DE04137dc3825';
    const POOL_CONTRACT = '0xe021e5817E8867D7CeA10f63BC47E118f3aB9E4A'; // USDT/WPT Pool
    
    console.log(`📋 Configuration:`);
    console.log(`   WPT Contract: ${WPT_CONTRACT}`);
    console.log(`   Pool Address: ${POOL_CONTRACT}`);
    console.log('');
    
    // Setup provider and wallet
    const provider = new ethers.providers.JsonRpcProvider(`https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    console.log('✅ Provider and wallet initialized');
    
    // WPT contract ABI
    const wptABI = [
      'function balanceOf(address owner) view returns (uint256)',
      'function decimals() view returns (uint8)'
    ];
    
    const wptContract = new ethers.Contract(WPT_CONTRACT, wptABI, provider);
    console.log('✅ WPT contract initialized');
    
    // Check current pool balance
    const poolBalance = await wptContract.balanceOf(POOL_CONTRACT);
    const poolBalanceFormatted = ethers.utils.formatUnits(poolBalance, 18);
    console.log(`🏦 Current pool WPT balance: ${poolBalanceFormatted} WPT`);
    
    // Check wallet balance
    const walletBalance = await wptContract.balanceOf(wallet.address);
    const walletBalanceFormatted = ethers.utils.formatUnits(walletBalance, 18);
    console.log(`💰 Current wallet balance: ${walletBalanceFormatted} WPT`);
    
    // Calculate how much to withdraw (everything above original ~284K)
    const originalPoolBalance = ethers.utils.parseUnits('284012.17353', 18);
    const excessBalance = poolBalance.sub(originalPoolBalance);
    
    if (excessBalance.lte(0)) {
      console.log('ℹ️  No excess tokens to withdraw from pool');
      return;
    }
    
    const withdrawAmount = ethers.utils.formatUnits(excessBalance, 18);
    console.log(`🎯 Amount to withdraw: ${withdrawAmount} WPT`);
    console.log('');
    
    console.log('❌ CRITICAL ISSUE IDENTIFIED:');
    console.log('   Pool liquidity withdrawal requires LP token burning');
    console.log('   Cannot directly withdraw WPT tokens from Uniswap V2 pool');
    console.log('   This would require removing liquidity position entirely');
    console.log('');
    console.log('🔍 ANALYSIS:');
    console.log(`   - Pool has ${poolBalanceFormatted} WPT total`);
    console.log(`   - Original balance was ~284K WPT`);
    console.log(`   - Excess: ~${withdrawAmount} WPT`);
    console.log(`   - USDT in pool: 539 USDT`);
    console.log('');
    console.log('💡 RECOMMENDED SOLUTIONS:');
    console.log('   1. Create new balanced pool with proper USDT/WPT ratio');
    console.log('   2. Add proportional USDT to current pool (~$1,600)');
    console.log('   3. Accept the current state as "reserve liquidity"');
    console.log('');
    console.log('⚠️  Cannot proceed with direct token withdrawal');
    console.log('   This is by design - Uniswap pools protect against arbitrary withdrawals');
    
  } catch (error) {
    console.error('❌ Withdrawal analysis failed:', error.message);
    process.exit(1);
  }
}

// Run withdrawal analysis
withdrawTokens();