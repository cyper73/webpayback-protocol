#!/usr/bin/env node
/**
 * 🔍 ANALISI SICURA: Identifica i contratti WPT nel wallet
 * SOLO LETTURA - NESSUNA MODIFICA
 */

// Use built-in node fetch (Node 18+) or curl for analysis

async function analyzeWPTTokens() {
  const walletAddress = process.env.FOUNDER_WALLET || "0x***********************************************[FOUNDER]";
  const alchemyUrl = `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;
  
  console.log('🔍 ANALISI SICURA DEI TOKEN WPT');
  console.log('⚠️  MODALITÀ SOLA LETTURA - NESSUNA MODIFICA');
  console.log('');
  console.log(`📍 Wallet analizzato: ${walletAddress}`);
  console.log('');
  
  try {
    // Get all token balances for the wallet
    const response = await fetch(alchemyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "alchemy_getTokenBalances",
        params: [walletAddress],
        id: 1
      })
    });
    
    const data = await response.json();
    
    if (data.result && data.result.tokenBalances) {
      console.log('📊 TOKEN TROVATI NEL WALLET:');
      console.log('');
      
      const wptTokens = [];
      
      for (const token of data.result.tokenBalances) {
        if (token.tokenBalance && token.tokenBalance !== "0x0") {
          // Get token metadata
          const metadataResponse = await fetch(alchemyUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: "2.0",
              method: "alchemy_getTokenMetadata",
              params: [token.contractAddress],
              id: 1
            })
          });
          
          const metadata = await metadataResponse.json();
          
          if (metadata.result && metadata.result.symbol === 'WPT') {
            const balance = parseInt(token.tokenBalance, 16) / Math.pow(10, metadata.result.decimals || 18);
            
            wptTokens.push({
              address: token.contractAddress,
              balance: balance,
              name: metadata.result.name,
              symbol: metadata.result.symbol,
              decimals: metadata.result.decimals
            });
            
            console.log(`🎯 WPT TROVATO:`);
            console.log(`   Contratto: ${token.contractAddress}`);
            console.log(`   Nome: ${metadata.result.name}`);
            console.log(`   Balance: ${balance.toLocaleString()} WPT`);
            console.log(`   Decimali: ${metadata.result.decimals}`);
            console.log('');
          }
        }
      }
      
      console.log('📋 RIEPILOGO ANALISI:');
      console.log(`   Token WPT trovati: ${wptTokens.length}`);
      console.log('');
      
      if (wptTokens.length > 0) {
        console.log('🔍 IDENTIFICAZIONE CONTRATTI:');
        
        const knownWPT = "0x9408f17a8b4666f8cb8231ba213de04137dc3825";
        const oldWPT = "0x9077051d318b614f915e8a07861090856fdec91e";
        
        wptTokens.forEach((token, index) => {
          const isKnown = token.address.toLowerCase() === knownWPT.toLowerCase();
          const isOld = token.address.toLowerCase() === oldWPT.toLowerCase();
          
          console.log(`   ${index + 1}. ${token.balance.toLocaleString()} WPT`);
          
          if (isKnown) {
            console.log(`      ✅ CONTRATTO ATTUALE (corretto)`);
          } else if (isOld) {
            console.log(`      ⚠️  CONTRATTO VECCHIO (deprecato)`);
          } else {
            console.log(`      ❓ CONTRATTO SCONOSCIUTO (da verificare)`);
          }
          
          console.log(`      📍 ${token.address}`);
          console.log('');
        });
        
        const totalWPT = wptTokens.reduce((sum, token) => sum + token.balance, 0);
        console.log(`💰 TOTALE WPT: ${totalWPT.toLocaleString()} token`);
        console.log('');
        
        console.log('⚠️  PROSSIMI PASSI SUGGERITI:');
        console.log('   1. Verificare quale contratto è quello corretto');
        console.log('   2. NON fare operazioni finché non sei sicuro');
        console.log('   3. Controllare la transazione che ha creato il milione separato');
        console.log('   4. Solo dopo, valutare se consolidare i token');
      }
      
    } else {
      console.log('❌ Errore nel recupero dei token');
    }
    
  } catch (error) {
    console.error('❌ Errore durante l\'analisi:', error.message);
  }
}

analyzeWPTTokens();