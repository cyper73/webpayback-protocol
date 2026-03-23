#!/usr/bin/env node
/**
 * 🔍 VERIFICA BALANCE REALE BLOCKCHAIN
 * Controlla il vero balance WPT su blockchain
 */

const { ethers } = require('ethers');

async function checkRealBalance() {
  try {
    console.log('🔍 VERIFICA BALANCE BLOCKCHAIN AUTENTICO...');
    
    // Setup provider
    const alchemyKey = process.env.ALCHEMY_API_KEY;
    const provider = new ethers.providers.JsonRpcProvider(`https://polygon-mainnet.g.alchemy.com/v2/${alchemyKey}`);
    
    // WPT contract 
    const WPT_CONTRACT = '0x9408f17a8B4666f8cb8231BA213DE04137dc3825';
    const WALLET_ADDRESS = process.env.FOUNDER_WALLET || '0x***********************************************[FOUNDER]';
    
    const wptABI = [
      'function balanceOf(address owner) view returns (uint256)',
      'function decimals() view returns (uint8)',
      'function symbol() view returns (string)'
    ];
    
    const wptContract = new ethers.Contract(WPT_CONTRACT, wptABI, provider);
    
    console.log(`📋 Controllo wallet: ${WALLET_ADDRESS}`);
    console.log(`📋 Contratto WPT: ${WPT_CONTRACT}`);
    console.log('');
    
    // Get balance
    const balance = await wptContract.balanceOf(WALLET_ADDRESS);
    const decimals = await wptContract.decimals();
    const symbol = await wptContract.symbol();
    
    // Format balance
    const balanceFormatted = ethers.utils.formatUnits(balance, decimals);
    
    console.log('💰 RISULTATO AUTENTICO BLOCKCHAIN:');
    console.log(`   Balance: ${balanceFormatted} ${symbol}`);
    console.log(`   Balance Raw: ${balance.toString()} wei`);
    console.log(`   Decimals: ${decimals}`);
    
    // Convert to number for analysis
    const balanceNumber = parseFloat(balanceFormatted);
    
    console.log('');
    console.log('📊 ANALISI:');
    if (balanceNumber > 15000000) {
      console.log('🚨 PROBLEMA GRAVE: Balance superiore a 15M WPT');
    } else if (balanceNumber > 10000000) {
      console.log('⚠️ ATTENZIONE: Balance superiore a 10M WPT');  
    } else if (balanceNumber > 5000000) {
      console.log('🔸 Balance elevato: oltre 5M WPT');
    } else {
      console.log('✅ Balance nella norma');
    }
    
    return balanceFormatted;
    
  } catch (error) {
    console.error('❌ Errore controllo balance:', error.message);
    return null;
  }
}

// Execute
checkRealBalance().then(balance => {
  if (balance) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});