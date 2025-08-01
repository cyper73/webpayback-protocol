#!/usr/bin/env node
/**
 * 🔍 VERIFICA POOL: Identifica quale pool usa quale contratto WPT
 * ANALISI SICURA - SOLO LETTURA
 */

async function checkPoolContracts() {
  const alchemyUrl = `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;
  
  console.log('🔍 VERIFICA CONTRATTI WPT NELLE POOL');
  console.log('=====================================');
  console.log('');
  
  // Contratti WPT noti
  const contracts = {
    current: "0x9408f17a8b4666f8cb8231ba213de04137dc3825",
    old: "0x9077051d318b614f915e8a07861090856fdec91e"
  };
  
  // Pool da verificare
  const pools = {
    "USDT/WPT V2": "0xe021e5817E8867D7CeA10f63BC47E118f3aB9E4A",
    "WMATIC/WPT V3": "0x572a5E8cbfCe8026550f1e2B369c2Bdbcf6634c3"
  };
  
  try {
    for (const [poolName, poolAddress] of Object.entries(pools)) {
      console.log(`🎯 ANALIZZANDO ${poolName}`);
      console.log(`📍 Pool: ${poolAddress}`);
      
      // Per pool V2 (coppia USDT/WPT)
      if (poolName.includes("V2")) {
        // Chiamata token0()
        const token0Response = await fetch(alchemyUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "eth_call",
            params: [{
              to: poolAddress,
              data: "0x0dfe1681" // token0()
            }, "latest"],
            id: 1
          })
        });
        
        const token0Data = await token0Response.json();
        const token0 = "0x" + token0Data.result.slice(-40);
        
        // Chiamata token1()
        const token1Response = await fetch(alchemyUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "eth_call",
            params: [{
              to: poolAddress,
              data: "0xd21220a7" // token1()
            }, "latest"],
            id: 1
          })
        });
        
        const token1Data = await token1Response.json();
        const token1 = "0x" + token1Data.result.slice(-40);
        
        console.log(`   Token0: ${token0}`);
        console.log(`   Token1: ${token1}`);
        
        // Identifica quale è WPT
        if (token0.toLowerCase() === contracts.current.toLowerCase()) {
          console.log(`   ✅ WPT CORRENTE trovato come Token0`);
        } else if (token0.toLowerCase() === contracts.old.toLowerCase()) {
          console.log(`   ⚠️  WPT VECCHIO trovato come Token0`);
        }
        
        if (token1.toLowerCase() === contracts.current.toLowerCase()) {
          console.log(`   ✅ WPT CORRENTE trovato come Token1`);
        } else if (token1.toLowerCase() === contracts.old.toLowerCase()) {
          console.log(`   ⚠️  WPT VECCHIO trovato come Token1`);
        }
        
      } else {
        // Per pool V3 (usa interfaccia diversa)
        console.log(`   ⚡ Pool V3 - interfaccia Uniswap V3`);
        
        // Ottieni informazioni pool V3
        const factoryResponse = await fetch(alchemyUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "eth_call",
            params: [{
              to: poolAddress,
              data: "0x0dfe1681" // token0()
            }, "latest"],
            id: 1
          })
        });
        
        const factoryData = await factoryResponse.json();
        if (factoryData.result && factoryData.result !== "0x") {
          const token0 = "0x" + factoryData.result.slice(-40);
          console.log(`   Token0: ${token0}`);
          
          if (token0.toLowerCase() === contracts.current.toLowerCase()) {
            console.log(`   ✅ WPT CORRENTE trovato come Token0`);
          } else if (token0.toLowerCase() === contracts.old.toLowerCase()) {
            console.log(`   ⚠️  WPT VECCHIO trovato come Token0`);
          }
        }
      }
      
      console.log('');
    }
    
    console.log('📋 RIEPILOGO CONTRATTI:');
    console.log(`   🟢 WPT CORRENTE: ${contracts.current}`);
    console.log(`   🟡 WPT VECCHIO:  ${contracts.old}`);
    console.log('');
    console.log('💡 INFORMAZIONI:');
    console.log('   - WPT CORRENTE: Contratto attivo e sicuro');
    console.log('   - WPT VECCHIO: Contratto deprecato (evitare)');
    console.log('   - Pool V2: Più stabile, nessun "out of range"');
    console.log('   - Pool V3: Più efficiente ma richiede gestione range');
    
  } catch (error) {
    console.error('❌ Errore durante la verifica:', error.message);
  }
}

// Per Node.js 18+ con fetch built-in
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

checkPoolContracts();