#!/usr/bin/env node
/**
 * 🚀 WPT TOKEN INJECTION - RETRY WITH PROPER GAS
 * Fixed version with proper gas configuration
 */

const { ethers } = require('ethers');

async function injectTokensRetry() {
  try {
    console.log('🚀 RETRY TOKEN INJECTION WITH PROPER GAS...');
    
    // Configuration
    const WPT_CONTRACT = '0x9408f17a8B4666f8cb8231BA213DE04137dc3825';
    const TARGET_CONTRACT = '0xe021e5817E8867D7CeA10f63BC47E118f3aB9E4A'; // USDT/WPT Pool
    const AMOUNT = '1000000'; // 1 million WPT
    
    console.log(`📋 Configuration:`);
    console.log(`   WPT Contract: ${WPT_CONTRACT}`);
    console.log(`   Target Pool: ${TARGET_CONTRACT}`);
    console.log(`   Amount: ${AMOUNT} WPT`);
    console.log('');
    
    // Setup provider and wallet
    const provider = new ethers.providers.JsonRpcProvider(`https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    console.log('✅ Provider and wallet initialized');
    
    // Get current gas prices from network
    const feeData = await provider.getFeeData();
    console.log(`🔍 Current network fees:`);
    console.log(`   Gas Price: ${ethers.utils.formatUnits(feeData.gasPrice, 'gwei')} Gwei`);
    console.log(`   Max Fee: ${ethers.utils.formatUnits(feeData.maxFeePerGas, 'gwei')} Gwei`);
    console.log(`   Priority Fee: ${ethers.utils.formatUnits(feeData.maxPriorityFeePerGas, 'gwei')} Gwei`);
    
    // WPT contract ABI
    const wptABI = [
      'function transfer(address to, uint256 amount) returns (bool)',
      'function balanceOf(address owner) view returns (uint256)',
      'function decimals() view returns (uint8)'
    ];
    
    const wptContract = new ethers.Contract(WPT_CONTRACT, wptABI, wallet);
    console.log('✅ WPT contract initialized');
    
    // Check current balance
    const currentBalance = await wptContract.balanceOf(wallet.address);
    const currentBalanceFormatted = ethers.utils.formatUnits(currentBalance, 18);
    console.log(`💰 Current WPT balance: ${currentBalanceFormatted} WPT`);
    
    // Convert amount to wei
    const amountWei = ethers.utils.parseUnits(AMOUNT, 18);
    console.log(`🔢 Amount in wei: ${amountWei.toString()}`);
    
    // Check if sufficient balance
    if (currentBalance.lt(amountWei)) {
      console.error(`❌ Insufficient balance. Need: ${AMOUNT} WPT, Have: ${currentBalanceFormatted} WPT`);
      return;
    }
    
    // Execute transfer with proper gas configuration
    console.log(`🔄 Transferring ${AMOUNT} WPT to ${TARGET_CONTRACT}...`);
    
    // Calculate proper gas fees (20% buffer over current network rates)
    const maxFeePerGas = feeData.maxFeePerGas.mul(120).div(100);
    const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas.mul(120).div(100);
    
    console.log(`⛽ Using gas configuration:`);
    console.log(`   Gas Limit: 200,000`);
    console.log(`   Max Fee: ${ethers.utils.formatUnits(maxFeePerGas, 'gwei')} Gwei`);
    console.log(`   Priority Fee: ${ethers.utils.formatUnits(maxPriorityFeePerGas, 'gwei')} Gwei`);
    
    const tx = await wptContract.transfer(TARGET_CONTRACT, amountWei, {
      gasLimit: 200000, // Increased gas limit
      maxFeePerGas: maxFeePerGas,
      maxPriorityFeePerGas: maxPriorityFeePerGas,
    });
    
    console.log(`✅ Transaction submitted: ${tx.hash}`);
    console.log(`⏳ Waiting for confirmation (max 2 minutes)...`);
    
    // Wait for confirmation with timeout
    const receipt = await Promise.race([
      tx.wait(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Transaction timeout after 2 minutes')), 120000)
      )
    ]);
    
    console.log('');
    console.log('🎯 INJECTION COMPLETED SUCCESSFULLY!');
    console.log(`   Transaction Hash: ${tx.hash}`);
    console.log(`   Block Number: ${receipt.blockNumber}`);
    console.log(`   Gas Used: ${receipt.gasUsed.toString()}`);
    console.log(`   Effective Gas Price: ${ethers.utils.formatUnits(receipt.effectiveGasPrice, 'gwei')} Gwei`);
    console.log(`   Amount Injected: ${AMOUNT} WPT`);
    console.log(`   Target Contract: ${TARGET_CONTRACT}`);
    console.log('');
    console.log('✅ 1 million WPT tokens successfully injected into USDT/WPT pool!');
    
    // Verify final balance
    const finalBalance = await wptContract.balanceOf(wallet.address);
    const finalBalanceFormatted = ethers.utils.formatUnits(finalBalance, 18);
    console.log(`💰 Final wallet balance: ${finalBalanceFormatted} WPT`);
    
  } catch (error) {
    console.error('❌ Token injection failed:', error.message);
    if (error.message.includes('timeout')) {
      console.log('⚠️  Transaction may still be pending. Check transaction hash manually.');
    }
    process.exit(1);
  }
}

// Run injection retry
injectTokensRetry();