#!/usr/bin/env node
/**
 * 🚀 DIRECT WPT TOKEN INJECTION
 * Inject 1 million WPT tokens directly into USDT/WPT pool
 */

const { ethers } = require('ethers');

async function injectTokens() {
  try {
    console.log('🚀 DIRECT TOKEN INJECTION STARTING...');
    
    // Configuration
    const WPT_CONTRACT = '0x9408f17a8B4666f8cb8231BA213DE04137dc3825';
    const TARGET_CONTRACT = '0xe021e5817E8867D7CeA10f63BC47E118f3aB9E4A'; // USDT/WPT Pool
    const AMOUNT = '1000000'; // 1 million WPT
    const FOUNDER_WALLET = process.env.FOUNDER_WALLET || '0x***********************************************[FOUNDER]';
    
    console.log(`📋 Configuration:`);
    console.log(`   WPT Contract: ${WPT_CONTRACT}`);
    console.log(`   Target Pool: ${TARGET_CONTRACT}`);
    console.log(`   Amount: ${AMOUNT} WPT`);
    console.log(`   From: ${FOUNDER_WALLET}`);
    console.log('');
    
    // Setup provider and wallet (ethers v5 API)
    const provider = new ethers.providers.JsonRpcProvider(`https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    console.log('✅ Provider and wallet initialized');
    
    // WPT contract ABI
    const wptABI = [
      'function transfer(address to, uint256 amount) returns (bool)',
      'function balanceOf(address owner) view returns (uint256)',
      'function decimals() view returns (uint8)'
    ];
    
    const wptContract = new ethers.Contract(WPT_CONTRACT, wptABI, wallet);
    console.log('✅ WPT contract initialized');
    
    // Check current balance
    const actualWalletAddress = wallet.address;
    console.log(`🔍 Using wallet address: ${actualWalletAddress}`);
    const currentBalance = await wptContract.balanceOf(actualWalletAddress);
    const currentBalanceFormatted = ethers.utils.formatUnits(currentBalance, 18);
    console.log(`💰 Current WPT balance: ${currentBalanceFormatted} WPT`);
    
    // Convert amount to wei (ethers v5 API)
    const amountWei = ethers.utils.parseUnits(AMOUNT, 18);
    console.log(`🔢 Amount in wei: ${amountWei.toString()}`);
    
    // Check if sufficient balance
    if (currentBalance < amountWei) {
      console.error(`❌ Insufficient balance. Need: ${AMOUNT} WPT, Have: ${currentBalanceFormatted} WPT`);
      return;
    }
    
    // Execute transfer
    console.log(`🔄 Transferring ${AMOUNT} WPT to ${TARGET_CONTRACT}...`);
    const tx = await wptContract.transfer(TARGET_CONTRACT, amountWei, {
      gasLimit: 100000,
    });
    
    console.log(`✅ Transaction submitted: ${tx.hash}`);
    console.log(`⏳ Waiting for confirmation...`);
    
    // Wait for confirmation
    const receipt = await tx.wait();
    
    console.log('');
    console.log('🎯 INJECTION COMPLETED SUCCESSFULLY!');
    console.log(`   Transaction Hash: ${tx.hash}`);
    console.log(`   Block Number: ${receipt.blockNumber}`);
    console.log(`   Gas Used: ${receipt.gasUsed.toString()}`);
    console.log(`   Amount Injected: ${AMOUNT} WPT`);
    console.log(`   Target Contract: ${TARGET_CONTRACT}`);
    console.log('');
    console.log('✅ 1 million WPT tokens successfully injected into USDT/WPT pool!');
    
  } catch (error) {
    console.error('❌ Token injection failed:', error.message);
    process.exit(1);
  }
}

// Run injection
injectTokens();