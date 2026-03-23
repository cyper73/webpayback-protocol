#!/usr/bin/env node
/**
 * 🚨 EMERGENCY TOKEN RECOVERY
 * Find and recover the 1M WPT tokens sent to wrong address
 */

const { ethers } = require('ethers');

async function recoverTokens() {
  try {
    console.log('🚨 EMERGENCY TOKEN RECOVERY INITIATED...');
    
    // Configuration
    const WPT_CONTRACT = '0x9408f17a8B4666f8cb8231BA213DE04137dc3825';
    const WRONG_ADDRESS = '0xe021e5817e8867d7cea10f63bc47e118f3ab9e4a'; // Where tokens went
    const WALLET_ADDRESS = process.env.FOUNDER_WALLET || '0x***********************************************[FOUNDER]'; // Our wallet
    
    console.log(`📋 WPT Contract: ${WPT_CONTRACT}`);
    console.log(`📋 Wrong Address: ${WRONG_ADDRESS}`);
    console.log(`📋 Our Wallet: ${WALLET_ADDRESS}`);
    console.log('');
    
    // Setup provider and wallet
    const provider = new ethers.providers.JsonRpcProvider(`https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    // Check what's at the wrong address
    const code = await provider.getCode(WRONG_ADDRESS);
    console.log(`🔍 Contract code at wrong address: ${code.length} bytes`);
    
    // WPT contract setup
    const wptABI = [
      'function balanceOf(address owner) view returns (uint256)',
      'function transfer(address to, uint256 amount) returns (bool)',
      'function decimals() view returns (uint8)'
    ];
    
    const wptContract = new ethers.Contract(WPT_CONTRACT, wptABI, wallet);
    
    // Check balances
    console.log('💰 CURRENT BALANCES:');
    
    const wrongAddressBalance = await wptContract.balanceOf(WRONG_ADDRESS);
    const wrongBalanceFormatted = ethers.utils.formatUnits(wrongAddressBalance, 18);
    console.log(`   Wrong address: ${wrongBalanceFormatted} WPT`);
    
    const walletBalance = await wptContract.balanceOf(WALLET_ADDRESS);
    const walletBalanceFormatted = ethers.utils.formatUnits(walletBalance, 18);
    console.log(`   Our wallet: ${walletBalanceFormatted} WPT`);
    
    // Expected amounts
    const expectedWallet = ethers.utils.parseUnits('8718984.82747', 18); // Current wallet
    const missingAmount = ethers.utils.parseUnits('1000000', 18); // Missing 1M
    const totalExpected = expectedWallet.add(missingAmount);
    const totalExpectedFormatted = ethers.utils.formatUnits(totalExpected, 18);
    
    console.log('');
    console.log('📊 ANALYSIS:');
    console.log(`   Expected total: ${totalExpectedFormatted} WPT`);
    console.log(`   Current total: ${walletBalanceFormatted} WPT`);
    console.log(`   Missing: ${ethers.utils.formatUnits(missingAmount, 18)} WPT`);
    
    // Check transaction details to understand what happened
    const txHash = '0x37a0d98f9245461d5ac0782cc66487b1d8c5cefc55121026914e1ea9391a08cf';
    const receipt = await provider.getTransactionReceipt(txHash);
    
    console.log('');
    console.log('🔍 TRANSACTION ANALYSIS:');
    console.log(`   Block: ${receipt.blockNumber}`);
    console.log(`   Gas used: ${receipt.gasUsed.toString()}`);
    console.log(`   Status: ${receipt.status === 1 ? 'SUCCESS' : 'FAILED'}`);
    console.log(`   Logs count: ${receipt.logs.length}`);
    
    // If tokens are in the wrong address, try to understand if we can recover them
    if (wrongAddressBalance.gt(ethers.utils.parseUnits('284012', 18))) {
      const excess = wrongAddressBalance.sub(ethers.utils.parseUnits('284012.17353', 18));
      const excessFormatted = ethers.utils.formatUnits(excess, 18);
      console.log('');
      console.log('💡 RECOVERY ANALYSIS:');
      console.log(`   Excess tokens in wrong address: ${excessFormatted} WPT`);
      
      if (excess.gte(missingAmount.sub(ethers.utils.parseUnits('1', 18)))) {
        console.log('✅ Our 1M tokens are likely in the wrong address!');
        console.log('❌ But we cannot recover them directly');
        console.log('   The address is a contract, not controlled by us');
      }
    }
    
    console.log('');
    console.log('🎯 CONCLUSION:');
    console.log('   Tokens were successfully sent but to wrong address');
    console.log('   Address appears to be a contract (not our pool)');
    console.log('   Recovery requires understanding the contract functionality');
    console.log('   Current loss: ~1M WPT tokens');
    
  } catch (error) {
    console.error('❌ Recovery analysis failed:', error.message);
  }
}

// Run recovery analysis
recoverTokens();