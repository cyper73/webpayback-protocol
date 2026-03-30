# 🌐 Humanity Protocol Deployment Guide (Deferred)

This document contains the verified RPC endpoints and configuration details needed to deploy the `WPTHumanRewards.sol` contract to the real Humanity Protocol networks when the infrastructure is mature or funds are available.

## 🟢 Humanity Testnet (Alchemy)
*Use this network to test the contract live without spending real funds. You need to claim free Testnet `$H` from the Alchemy Faucet first.*

- **RPC URL:** `https://humanity-testnet.g.alchemy.com/public` (Alternative: `https://rpc.testnet.humanity.org`)
- **Chain ID:** `1942999413`
- **Currency Symbol:** `tHP`
- **Block Explorer:** `https://humanity-testnet.explorer.alchemy.com`
- **Faucet:** [Alchemy Humanity Testnet Faucet](https://dashboard.alchemy.com/faucets)

## 🔴 Humanity Mainnet (Alchemy)
*Use this network for the final production deployment. Requires real `$H` tokens bridged from Ethereum or acquired on a CEX.*

- **RPC URL:** `https://humanity-mainnet.g.alchemy.com/public`
- **Chain ID:** `6985385`
- **Currency Symbol:** `H`
- **Ethereum (L1) Token Contract:** `0xa1b22269C04071f98dE5E0F451996256c7017409` (18 Decimals)
- **Official Bridge:** [bridge.humanity.org](https://bridge.humanity.org)

---

### How to Deploy (When Ready)

1. Ensure your `.env` contains the `PRIVATE_KEY` of a wallet holding `$H` or `$tHP`.
2. Update `hardhat.config.cjs` with the Alchemy RPC URL if not already set.
3. Run the deployment script:
   
   **For Testnet:**
   ```bash
   npx hardhat run scripts/deploy-humanity-testnet.cjs --network humanityTestnet
   ```

   **For Mainnet:**
   ```bash
   npx hardhat run scripts/deploy-humanity-testnet.cjs --network humanityMainnet
   ```
