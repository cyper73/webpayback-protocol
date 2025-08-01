#!/usr/bin/env node
/**
 * 🔍 TROVA POOL REALE WPT
 * Cerca dove sono finiti i token WPT
 */

const { ethers } = require('ethers');

async function findRealPool() {
  try {
    console.log('🔍 RICERCA POOL REALE WPT...');
    
    // Setup provider
    const alchemyKey = process.env.ALCHEMY_API_KEY;
    const provider = new ethers.providers.JsonRpcProvider(`https://polygon-mainnet.g.alchemy.com/v2/${alchemyKey}`);
    
    const WPT_CONTRACT = '0x9408f17a8B4666f8cb8231BA213DE04137dc3825';
    const WALLET_ADDRESS = process.env.FOUNDER_WALLET || '0x***********************************************[FOUNDER]';
    
    // Check transaction hash from database
    const TX_HASH = '0x846cc33656ae78eb5e8764f9dd74bab5e0509441fd2448f418ee434715316324';
    
    console.log(`🔍 Analizzando transazione: ${TX_HASH}`);
    
    const tx = await provider.getTransaction(TX_HASH);
    const receipt = await provider.getTransactionReceipt(TX_HASH);
    
    console.log('📋 DETTAGLI TRANSAZIONE:');
    console.log(`   From: ${tx.from}`);
    console.log(`   To: ${tx.to}`);
    console.log(`   Value: ${tx.value} wei`);
    console.log(`   Gas Used: ${receipt.gasUsed}`);
    console.log(`   Status: ${receipt.status}`);
    
    console.log('');
    console.log('📋 LOGS TRANSAZIONE:');
    for (let i = 0; i < receipt.logs.length; i++) {
      const log = receipt.logs[i];
      console.log(`   Log ${i}:`);
      console.log(`     Address: ${log.address}`);
      console.log(`     Topics: ${log.topics.join(', ')}`);
      
      // Decode Transfer event if it's from WPT contract
      if (log.address.toLowerCase() === WPT_CONTRACT.toLowerCase() && 
          log.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef') {
        
        const from = '0x' + log.topics[1].slice(26);
        const to = '0x' + log.topics[2].slice(26);
        const amount = ethers.BigNumber.from(log.data);
        const amountFormatted = ethers.utils.formatUnits(amount, 18);
        
        console.log(`     🔄 TRANSFER WPT:`);
        console.log(`       From: ${from}`);
        console.log(`       To: ${to}`);
        console.log(`       Amount: ${amountFormatted} WPT`);
      }
    }
    
    return { tx, receipt };
    
  } catch (error) {
    console.error('❌ Errore ricerca pool:', error.message);
    return null;
  }
}

// Execute
findRealPool().then(result => {
  if (result) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});