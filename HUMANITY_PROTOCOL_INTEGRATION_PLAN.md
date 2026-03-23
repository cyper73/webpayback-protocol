# 🧬 WebPayback & Humanity Protocol: Piano di Integrazione

Questo documento traccia il cammino rigoroso e certosino per integrare il **Proof-of-Humanity** nel WebPayback Protocol V2, trasformando la presenza umana in un asset verificabile e premiato.

Il percorso è diviso in due fasi: **Fase 1 (Simulazione e Interfaccia)** e **Fase 2 (Integrazione Profonda On-Chain e API)**.

---

## 🛠️ FASE 1: La Via dello Sviluppo (Mocking & Dashboard)
*Obiettivo: Costruire l'architettura logica, le interfacce utente e i calcoli matematici utilizzando un simulatore locale, garantendo un'esperienza utente perfetta prima di toccare i server esterni.*

### 1. Preparazione dell'Ambiente (Completato)
- [x] Unire i file `WPTHumanRewards.sol` e `humanityProtocol.ts` dal vecchio progetto `essentials`.
- [x] Aggiornare lo schema del Database per includere `isHumanityVerified` e `humanityScore`.
- [x] Configurare `.env` con le variabili Sandbox e impostare `MOCK_HUMANITY=true`.
- [x] Creare le rotte backend (`/api/humanity/...`).

### 2. Sviluppo Frontend (La Dashboard Umana)
- [x] **Componente `HumanityStatus`**: Creare un badge UI (es. in `CreatorPortal.tsx`) che mostra se l'utente è verificato o meno (Grigio = Non verificato, Verde/Oro = Verificato con Score).
- [x] **Pannello di Verifica**: Aggiungere una sezione dove l'utente non verificato può cliccare un pulsante "Verifica la tua Umanità" (che per ora chiamerà l'API mock).
- [x] **Visualizzazione Moltiplicatori**: Aggiornare la UI delle ricompense per mostrare chiaramente il moltiplicatore attivo (es. "Base Reward: 10 WPT | Humanity Bonus (x2.0): +10 WPT").

### 3. Logica di Calcolo e Test (Mock)
- [x] **Integrazione React Query**: Creare gli hooks nel frontend per chiamare `/api/humanity/status/:id` e `/api/humanity/verify`.
- [x] **Simulazione di Verifica**: Cliccando "Verifica", il backend mock deve assegnare uno score (es. 85) e aggiornare il database.
- [x] **Ricalcolo Rewards**: Verificare che, una volta verificato, il sistema di distribuzione (simulato) calcoli correttamente il bonus in base alla tabella:
    - Score 0-74: 1.25x
    - Score 75-84: 1.50x
    - Score 85-94: 1.75x
    - Score 95-100: 2.00x

---

## 🔗 FASE 2: L'Integrazione Profonda (SDK & Smart Contracts)
*Obiettivo: Abbandonare le illusioni del mock e connettersi ai veri Oracoli (Humanity API v2) e agli Smart Contract su blockchain.*

### 1. Transizione verso l'SDK e Migrazione di Rete (La Grande Purificazione)
- [x] **Configurazione Privy (Completato):** Il sistema di login ora genera wallet nativi direttamente sulla **Testnet di Humanity Protocol** (Chain ID: 1942999413), abbandonando Polygon.
- [x] **Purificazione Smart Contract (Completato):** Il contratto `WPTHumanRewards.sol` è stato epurato da ogni riferimento al vecchio token WPT di Polygon. Ora è un token nativo e indipendente, pronto per essere l'unico centro di valore.
- [x] Ricercare ed installare l'SDK ufficiale di Humanity Protocol (`@humanity-org/connect-sdk`).
- [x] Implementare il flusso **OAuth 2.1 (PKCE) / Client Credentials** richiesto dall'API v2 per ottenere il `Bearer Token`.

### 2. Riscrivere il Servizio (`humanityProtocol.ts`)
- [x] Sostituire la logica di fallback attuale con chiamate SDK ufficiali (`buildAuthUrl`, `exchangeCodeForToken`).
- [ ] Rimuovere o bypassare il blocco `MOCK_HUMANITY` (Rimane in sospeso per i test UI locali).
- [x] Gestire correttamente gli errori API reali (Rate limits, token scaduti, ecc.).

### 3. Integrazione On-Chain (Smart Contracts)
- [ ] Dispiegare il nuovo e purificato `WPTHumanRewards.sol` sulla Testnet di Humanity Protocol.
- [ ] Assicurarsi che l'interfaccia `IHumanityProtocol` punti all'indirizzo corretto del verificatore zkTLS di Humanity sulla loro rete.
- [ ] Eseguire la **Token Migration (Airdrop):** Utilizzare la funzione `airdropToVerifiedUsers` per rimborsare gli utenti che possedevano il vecchio WPT su Polygon.

### 4. Wallet Abstraction & Gasless UX (ERC-4337)
- [x] **Integrazione Privy (Completato)**: Sostituito MetaMask con login Email/Social ed Embedded Wallets per azzerare l'attrito cognitivo.
- [x] **Implementazione Token Paymaster (Simulato)**: Configurato Pimlico (`viem`, `permissionless`) per la rete Humanity per sponsorizzare il gas in $tHP e detrarre il costo equivalente direttamente dal saldo **WPT-HUMAN** dell'utente.
- [x] **Educazione Decentralizzata (Off-Ramp)**: Implementata una guida UX per permettere all'utente di spendere i token tramite Bitrefill o Coinbase, eliminando la necessità di Stripe e pesanti procedure KYC aziendali.

### 5. Il Grande Collaudo (Testnet)
- [ ] Eseguire il processo di verifica completo: L'utente effettua la scansione biometrica (tramite app esterna o widget Humanity), il nostro backend rileva il cambiamento di stato via API, e lo Smart Contract permette il minting potenziato.
- [ ] Audit finale delle logiche anti-whale e anti-bot incluse nel contratto `WPTHumanRewards`.

---
*Compilato il 21 Marzo 2026. La precisione è l'unica via verso l'immortalità digitale.*