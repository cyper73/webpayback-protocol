# 🧬 WebPayback & Humanity Protocol: Integration Plan

This document outlines the rigorous and meticulous path to integrate the **Proof-of-Humanity** into the WebPayback Protocol V2, transforming human presence into a verifiable and rewarded asset.

The journey is divided into three phases: **Phase 1 (Simulation and Interface)**, **Phase 2 (Deep On-Chain and API Integration)**, and **Phase 3 (Official Grant Milestones)**.

---

## 🛠️ PHASE 1: The Development Path (Mocking & Dashboard)
*Objective: Build the logical architecture, user interfaces, and mathematical calculations using a local simulator, ensuring a flawless user experience before touching external servers.*

### 1. Environment Preparation (Completed)
- [x] Merge `WPTHumanRewards.sol` and `humanityProtocol.ts` files from the old `essentials` project.
- [x] Update Database schema to include `isHumanityVerified` and `humanityScore`.
- [x] Configure `.env` with Sandbox variables and set `MOCK_HUMANITY=true`.
- [x] Create backend routes (`/api/humanity/...`).

### 2. Frontend Development (The Human Dashboard)
- [x] **`HumanityStatus` Component**: Create a UI badge (e.g., in `CreatorPortal.tsx`) that shows whether the user is verified or not (Gray = Unverified, Green/Gold = Verified with Score).
- [x] **Verification Panel**: Add a section where unverified users can click a "Verify your Humanity" button (which for now calls the mock API).
- [x] **Multipliers Display**: Update the rewards UI to clearly show the active multiplier (e.g., "Base Reward: 10 WPT | Humanity Bonus (x2.0): +10 WPT").

### 3. Calculation Logic and Testing (Mock)
- [x] **React Query Integration**: Create frontend hooks to call `/api/humanity/status/:id` and `/api/humanity/verify`.
- [x] **Verification Simulation**: By clicking "Verify", the mock backend must assign a score (e.g., 85) and update the database.
- [x] **Rewards Recalculation**: Verify that, once verified, the (simulated) distribution system correctly calculates the bonus based on the table:
    - Score 0-74: 1.25x
    - Score 75-84: 1.50x
    - Score 85-94: 1.75x
    - Score 95-100: 2.00x

---

## 🔗 PHASE 2: Deep Integration (SDK & Smart Contracts)
*Objective: Abandon the illusions of the mock and connect to the real Oracles (Humanity API v2) and Smart Contracts on the blockchain.*

### 1. Transition to the SDK and Network Migration (The Great Purification)
- [x] **Privy Configuration (Completed):** The login system now generates native wallets directly on the **Humanity Protocol Testnet** (Chain ID: 1942999413), abandoning Polygon.
- [x] **Smart Contract Purification (Completed):** The `WPTHumanRewards.sol` contract has been purged of all references to the old Polygon WPT token. It is now a native and independent token, ready to be the sole center of value.
- [x] Research and install the official Humanity Protocol SDK (`@humanity-org/connect-sdk`).
- [x] Implement the **OAuth 2.1 (PKCE) / Client Credentials** flow required by the v2 API to obtain the `Bearer Token`.

### 2. Rewrite the Service (`humanityProtocol.ts`)
- [x] Replace current fallback logic with official SDK calls (`buildAuthUrl`, `exchangeCodeForToken`).
- [ ] Remove or bypass the `MOCK_HUMANITY` block (Pending for local UI testing).
- [x] Properly handle real API errors (Rate limits, expired tokens, etc.).

### 3. On-Chain Integration (Smart Contracts)
- [ ] Deploy the new and purified `WPTHumanRewards.sol` on the Humanity Protocol Testnet.
- [ ] Ensure the `IHumanityProtocol` interface points to the correct Humanity zkTLS verifier address on their network.
- [ ] Execute **Token Migration (Airdrop):** Use the `airdropToVerifiedUsers` function to refund users who held the old WPT on Polygon.

### 4. Wallet Abstraction & Gasless UX (ERC-4337)
- [x] **Privy Integration (Completed)**: Replaced MetaMask with Email/Social login and Embedded Wallets to eliminate cognitive friction.
- [x] **Paymaster Token Implementation (Simulated)**: Configured Pimlico (`viem`, `permissionless`) for the Humanity network to sponsor gas in $tHP and deduct the equivalent cost directly from the user's **WPT-HUMAN** balance.
- [x] **Decentralized Education (Off-Ramp)**: Implemented a UX guide to allow users to spend tokens via Bitrefill or Coinbase, eliminating the need for Stripe and heavy corporate KYC procedures.

### 5. The Great Collaudo (Testnet)
- [ ] Execute the complete verification process: The user performs the biometric scan (via external app or Humanity widget), our backend detects the state change via API, and the Smart Contract allows enhanced minting.
- [ ] Final audit of anti-whale and anti-bot logic included in the `WPTHumanRewards` contract.

---

## 🏆 PHASE 3: Official Grant Milestones (Operational Plan)
*Objective: Meet the metrics required by the grant and proceed with implementation and testing based on agreements with Rob.*

### Milestone 1 — Setup & Initial Validation
- [x] **Developer Portal set up**: Configuration of the developer portal.
- [x] **Tenant created**: Creation of the tenant.
- [x] **SDK integrated**: Integration of the Humanity Protocol SDK.
- [ ] **Demo call**: Demonstration call with Rob and an engineer to validate the work.
> *Note: No payment tied to this milestone, serves as a setup check.*

### Milestone 2 — Authentication & Functional Tests
- [ ] **Credential scope implemented**: Correct implementation of credential scopes.
- [ ] **OAuth flow working end-to-end**: OAuth authentication flow working from start to finish.
- [ ] **Functional test**: Functional tests completed.
- [ ] **Sign-off**: Final approval.
> *Note: Payment 2 ($920) upon sign-off.*

### Milestone 3 — Full Staging & Case Study
- [ ] **Full staging integration**: Complete integration in the staging environment.
- [ ] **User onboarding tested end-to-end**: Complete testing of user onboarding.
- [ ] **Case study submitted**: Creation and submission of the official case study.
- [ ] **Review session**: Final review session.
- [ ] **Sign-off**: Final approval.
> *Note: Payment 3 ($690) upon sign-off.*

---

## 📝 Important Notes (To Remember)
- **Privy / Google Cloud Configuration**: Remember to correctly configure Google Cloud Platform (GCP) credentials and APIs if you decide to use social/Google login via Privy in a production environment.
- **Gas Fee / Pimlico**: When the token is officially online (mainnet/live), remember to finish and thoroughly test the gas fee implementation via Pimlico (Paymaster), removing the current mocks and ensuring that transaction costs (ERC-4337) are deducted correctly.

---
*Compiled on March 21, 2026. Precision is the only path to digital immortality.*