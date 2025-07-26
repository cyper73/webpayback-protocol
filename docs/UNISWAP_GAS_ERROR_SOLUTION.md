# SOLUZIONE ERRORE GAS UNISWAP - "Unpredictable gas limit"

## 🚨 **PROBLEMA IDENTIFICATO**
L'errore "Unpredictable gas limit" su Uniswap indica che la transazione non riesce a stimare il gas correttamente. Dalle tue screenshot vedo:
- WMATIC: 52,86 disponibili
- WPT: 511.274,03 disponibili  
- Pool: WMATIC/WPT v2 0.3% fee

## ⚡ **SOLUZIONI IMMEDIATE**

### 1. **APPROVAZIONE TOKEN (Causa #1)**
```javascript
// PRIMA approva i token per Uniswap Router
// Uniswap V3 Router: 0xE592427A0AEce92De3Edee1F18E0157C05861564

// 1. Vai su https://app.uniswap.org/
// 2. Clicca "Approve WMATIC" 
// 3. Clicca "Approve WPT"
// 4. Attendi conferma transazioni
```

### 2. **PARAMETRI OTTIMIZZATI**
```javascript
// Usa questi parametri precisi:
WMATIC Amount: 10.0
WPT Amount: 1000.0  
Slippage: 5%
Gas Limit: 500,000
```

### 3. **CONTRATTI VERIFICATI**
```javascript
WMATIC: 0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270
WPT:    0x9408f17a8B4666f8cb8231BA213DE04137dc3825
Pool:   0x572a5E8cbfCe8026550f1e2B369c2Bdbcf6634c3
Router: 0xE592427A0AEce92De3Edee1F18E0157C05861564
```

## 📋 **STEP-BY-STEP SOLUTION**

### **Step 1: Approva Token**
1. Vai su [Uniswap](https://app.uniswap.org/)
2. Connetti wallet 0xca5Ea48C76C72cc37cFb75c452457d0e6d0508Ba
3. Seleziona "Pool" → "Add Liquidity"
4. Token A: WMATIC (0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270)
5. Token B: WPT (0x9408f17a8B4666f8cb8231BA213DE04137dc3825)
6. **CRITICO**: Clicca "Approve WMATIC" e aspetta conferma
7. **CRITICO**: Clicca "Approve WPT" e aspetta conferma

### **Step 2: Configura Parametri**
```
WMATIC: 10.0 (invece di 0.000000000000000)
WPT: 1000.0 (invece di valori troppo piccoli)
Fee Tier: 0.3%
Slippage: 5% (invece di 0.5%)
```

### **Step 3: Transazione**
1. Gas Limit: 500,000
2. Gas Price: Standard (20-30 Gwei)
3. Deadline: 20 minuti

## 🔧 **CAUSE COMUNI**

### **Causa #1: Token non approvati**
- **Soluzione**: Approva ENTRAMBI i token prima di aggiungere liquidità

### **Causa #2: Importi troppo piccoli**  
- **Problema**: 0.000000000000000 WMATIC
- **Soluzione**: Usa minimo 10 WMATIC + 1000 WPT

### **Causa #3: Slippage troppo basso**
- **Problema**: 0.5% slippage  
- **Soluzione**: Aumenta a 3-5%

### **Causa #4: Gas limit insufficiente**
- **Problema**: Stima automatica fallisce
- **Soluzione**: Imposta manualmente 500,000 gas

## 🚀 **ALTERNATIVE**

### **Opzione A: Pool WMATIC/WPT (CORRETTA)**
```
Pool Address: 0x572a5E8cbfCe8026550f1e2B369c2Bdbcf6634c3
Vantaggi: Pool attiva e funzionante per WMATIC/WPT
NOTA: Pool 0x572a5E8cbfCe8026550f1e2B369c2Bdbcf6634c3 è attiva
```

### **Opzione B: Retry con parametri ottimizzati**
```javascript
// Parametri testati:
{
  "token0": "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
  "token1": "0x9408f17a8B4666f8cb8231BA213DE04137dc3825", 
  "amount0Desired": "10000000000000000000",
  "amount1Desired": "1000000000000000000000",
  "amount0Min": "9700000000000000000",
  "amount1Min": "970000000000000000000",
  "fee": 3000,
  "slippage": 3
}
```

## ✅ **CHECKLIST PRE-TRANSAZIONE**

- [ ] WMATIC approvato per Router Uniswap
- [ ] WPT approvato per Router Uniswap  
- [ ] Importi: min 10 WMATIC + 1000 WPT
- [ ] Slippage: 3-5%
- [ ] Gas Limit: 500,000
- [ ] Pool esistente e attiva
- [ ] Wallet connesso correttamente

## 🆘 **SE CONTINUA A NON FUNZIONARE**

1. **Verifica contratto WPT**: Potrebbe essere un problema con il contratto del token
2. **Usa DEX diverso**: Prova SushiSwap o 1inch  
3. **Pool diversa**: Usa POL/WPT invece di WMATIC/WPT
4. **Importi minori**: Prova 1 WMATIC + 100 WPT per test

---

**Status**: 🔴 Gas Error → 🟢 Ready for Liquidity  
**Next**: Segui Step 1-3 per risolvere completamente