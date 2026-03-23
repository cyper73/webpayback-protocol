#!/usr/bin/env node
/**
 * 🚀 WPT TOKEN INJECTION - FINAL ATTEMPT
 * Clear pending transactions and inject with correct nonce
 */

const { ethers } = require('ethers');

async function injectTokensFinal() {
  try {
    console.log('🚀 FINAL TOKEN INJECTION ATTEMPT...');
    
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
    
    // Get correct nonce
    const currentNonce = await provider.getTransactionCount(wallet.address, 'latest');
    const pendingNonce = await provider.getTransactionCount(wallet.address, 'pending');
    
    console.log(`🔍 Nonce Analysis:`);
    console.log(`   Latest nonce: ${currentNonce}`);
    console.log(`   Pending nonce: ${pendingNonce}`);
    
    // Get current gas prices from network
    const feeData = await provider.getFeeData();
    console.log(`🔍 Current network fees:`);
    console.log(`   Gas Price: ${ethers.utils.formatUnits(feeData.gasPrice, 'gwei')} Gwei`);
    
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
    
    // Step 1: Cancel pending transactions if any
    if (pendingNonce > currentNonce) {
      console.log(`⚠️  Found ${pendingNonce - currentNonce} pending transactions. Canceling them...`);
      
      // Send zero-value transactions to same address to cancel pending ones
      for (let nonce = currentNonce; nonce < pendingNonce; nonce++) {
        try {
          const cancelTx = await wallet.sendTransaction({
            to: wallet.address,
            value: 0,
            gasLimit: 21000,
            gasPrice: feeData.gasPrice.mul(150).div(100), // 50% higher gas price
            nonce: nonce
          });
          console.log(`   🔄 Canceling nonce ${nonce}: ${cancelTx.hash}`);
          
          // Don't wait for confirmation, just submit
        } catch (error) {
          console.log(`   ⚠️  Failed to cancel nonce ${nonce}: ${error.message}`);
        }
      }
      
      // Wait a moment for cancellations to propagate
      console.log(`⏳ Waiting 30 seconds for cancellations to propagate...`);
      await new Promise(resolve => setTimeout(resolve, 30000));
    }
    
    // Step 2: Get fresh nonce and execute transfer
    const freshNonce = await provider.getTransactionCount(wallet.address, 'latest');
    console.log(`🔄 Using fresh nonce: ${freshNonce}`);
    console.log(`💫 Transferring ${AMOUNT} WPT to ${TARGET_CONTRACT}...`);
    
    // Use higher gas price to ensure faster processing
    const gasPrice = feeData.gasPrice.mul(200).div(100); // Double gas price
    
    console.log(`⛽ Using gas configuration:`);
    console.log(`   Gas Limit: 150,000`);
    console.log(`   Gas Price: ${ethers.utils.formatUnits(gasPrice, 'gwei')} Gwei (2x network rate)`);
    console.log(`   Nonce: ${freshNonce}`);
    
    const tx = await wptContract.transfer(TARGET_CONTRACT, amountWei, {
      gasLimit: 150000,
      gasPrice: gasPrice,
      nonce: freshNonce
    });
    
    console.log(`✅ Transaction submitted: ${tx.hash}`);
    console.log(`⏳ Waiting for confirmation...`);
    
    // Wait for confirmation with shorter timeout
    const receipt = await Promise.race([
      tx.wait(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Transaction timeout after 90 seconds')), 90000)
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
    
    // Verify pool received tokens
    const poolBalance = await wptContract.balanceOf(TARGET_CONTRACT);
    const poolBalanceFormatted = ethers.utils.formatUnits(poolBalance, 18);
    console.log(`🏦 Pool WPT balance: ${poolBalanceFormatted} WPT`);
    
  } catch (error) {
    console.error('❌ Token injection failed:', error.message);
    if (error.message.includes('timeout')) {
      console.log('⚠️  Transaction may still be pending. Check PolygonScan for status.');
    }
    process.exit(1);
  }
}

// Run final injection
injectTokensFinal();