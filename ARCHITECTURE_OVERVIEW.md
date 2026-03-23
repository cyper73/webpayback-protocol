# WebPayback Protocol V2: Architecture and User Flow

This document outlines the technical architecture and the User Journey within the WebPayback Protocol V2. The infrastructure has been designed around the principle of "Wallet Abstraction" to ensure a frictionless, Web2-like user experience while maintaining the security and decentralization of Web3.

The ecosystem is built entirely on the **Humanity Protocol Testnet/Mainnet** and leverages cutting-edge Account Abstraction (ERC-4337) technologies.

---

## 🏗️ Technology Stack

1.  **Blockchain Network:** Humanity Protocol (L2 zkEVM).
2.  **Smart Contract:** `WPTHumanRewards.sol` (Native ERC20 token with anti-bot logic and biometric multipliers).
3.  **Wallet Abstraction:** Privy (Embedded Wallets).
4.  **Gas Sponsoring (ERC-4337):** Pimlico (Paymaster).
5.  **Biometric Verification:** Humanity Protocol Connect SDK (OAuth 2.1).
6.  **Backend:** Node.js (Express) + PostgreSQL (Drizzle ORM).

---

## 🔄 Creator Lifecycle (User Journey)

### Phase 1: Frictionless Onboarding (Privy)
The primary goal is to eliminate the cognitive barriers associated with browser extensions (e.g., MetaMask) and seed phrases.

1.  The Creator lands on the WebPayback Dashboard.
2.  Clicks on **"Login / Register"**.
3.  The **Privy** authentication module opens. The user logs in via Email, Google, or Apple.
4.  **Web3 Integration:** In the background, Privy instantly generates a "Smart Wallet" (Account Abstraction) on the Humanity Protocol network linked to that social account. The user owns a real, non-custodial wallet but does not need to manage private keys.

### Phase 2: Identity Verification (Humanity Protocol)
To unlock the full potential of platform rewards (up to a 2x multiplier), the creator must prove their unique human identity.

1.  In the "Humanity Protocol" tab, the creator clicks **"Verify Humanity"**.
2.  The WebPayback backend generates an OAuth URL via the `@humanity-org/connect-sdk` and redirects the user to the official Humanity Protocol portal.
3.  **The Humanity Gateway:**
    *   *If already registered:* The user authorizes WebPayback to read their *Humanity Score*.
    *   *If new user:* The Humanity portal displays a QR Code. The user downloads the official mobile app, scans their palm (generating a biometric *zk-proof*), and creates their Human ID.
4.  Once completed, Humanity Protocol **automatically redirects** the user back to the WebPayback Dashboard with an authorization code.
5.  The WebPayback backend exchanges the code for data access, retrieves the *Humanity Score*, and updates the database. The reward multiplier (e.g., 1.75x) is now active.

### Phase 3: Earning and Distribution (Smart Contract)
The creator begins receiving citations and interactions from the AI systems monitored by the protocol.

1.  The WebPayback AI Knowledge Indexer detects that the creator's content has been used as training data or cited.
2.  The **Citation Reward Engine** (Backend) calculates the base reward.
3.  The engine queries the database to verify the creator's Humanity status.
4.  If the creator is verified, the base reward is **multiplied** according to their score (e.g., Base: 10 WPT -> With Score 95+: 20 WPT-HUMAN).
5.  The backend instructs the `WPTHumanRewards` Smart Contract to mint and transfer the tokens directly into the user's Privy embedded wallet.

### Phase 4: "Gasless" Withdrawals (Pimlico)
The creator has accumulated WPT-HUMAN and wishes to utilize them. Since the user onboarded via Email, they do not hold the network's native currency ($tHP) required to pay transaction fees (Gas).

1.  The user navigates to the "Wallet & Earnings" tab and enters the withdrawal amount.
2.  The system utilizes the **ERC-4337** infrastructure.
3.  The frontend submits a request (*UserOperation*) to **Pimlico** (the Paymaster).
4.  Pimlico sponsors the transaction, broadcasting to the blockchain: *"We will cover the gas fees in $tHP for this user"*.
5.  To cover this operational cost, the system deducts a nominal percentage of WPT-HUMAN directly from the withdrawn amount (Token Paymaster model).
6.  The transaction succeeds. The user has transferred tokens without ever purchasing or managing network gas.

### Phase 5: Cash-Out (Decentralized Financial Education)
WebPayback Protocol adopts a streamlined approach to Fiat conversion (Off-Ramp). Instead of managing complex corporate banking systems and KYC procedures, the protocol empowers and educates the user to navigate Web3 independently.

The Dashboard provides a clear, guided interface with three options:
1.  **Immediate Spending:** The user is directed to *Bitrefill*, where they can use their Privy wallet to instantly purchase Gift Cards (Amazon, Netflix, etc.) paying with tokens, requiring no registration.
2.  **Crypto Cards:** The user is guided on how to transfer tokens to services like *Binance Card* for everyday spending.
3.  **Bank Transfers:** The user is instructed on how to send tokens to centralized exchanges (*Coinbase/Kraken*) to convert them into fiat currency and execute a SEPA transfer to their bank account.

---

## 🪙 Tokenomics & Smart Contract Architecture (`WPTHumanRewards.sol`)

The economic engine of the WebPayback Protocol V2 is governed by the `WPTHumanRewards.sol` smart contract, deployed on the Humanity Protocol L2. It is designed with strict anti-inflationary measures, anti-bot protections, and a fair launch philosophy.

### 1. Supply and Genesis
*   **Initial Supply:** **0 WPT-HUMAN**. There is no pre-mine or initial allocation. Tokens are minted exclusively as a byproduct of verified human interaction and content creation.
*   **Maximum Supply:** Capped at **100,000,000 WPT-HUMAN**. This hard cap ensures long-term scarcity and protects the ecosystem from infinite inflation.

### 2. Governance and Security Roles
The contract abandons the traditional, centralized `Ownable` pattern in favor of a granular `AccessControl` system:
*   `DEFAULT_ADMIN_ROLE`: The supreme creator, capable of assigning roles.
*   `FOUNDER_ROLE`: Authorized to update system limits and execute emergency token recoveries.
*   `ADMIN_ROLE`: Manages whitelists, blacklists, and controls the global trading switch.
*   `MINTER_ROLE`: Exclusively assigned to the WebPayback secure backend. Only the protocol's authorized servers can mint tokens based on real user activity.
*   `PAUSER_ROLE`: An emergency switch to freeze all contract interactions in case of a critical vulnerability.

### 3. Minting Mechanics and System Fees
When the backend (acting as the Minter) triggers a reward distribution, the contract enforces strict rules:
*   **Daily Minting Limit:** A hard cap of **10,000 WPT-HUMAN** per day prevents hyperinflation even in the event of a backend compromise.
*   **The Humanity Multiplier:** The minted amount is dynamically multiplied based on the user's biometric *Humanity Score*:
    *   Base Multiplier: 1.25x
    *   Score > 75: 1.50x
    *   Score > 85: 1.75x
    *   Score > 95: **2.00x (Maximum Potential)**
*   **Ecosystem Fees:** Every time a user is rewarded, the contract simultaneously mints a small percentage to sustain the protocol (without deducting from the user's reward):
    *   **1.0%** to the Founder Wallet (Long-term sustainability).
    *   **1.0%** to the Platform Wallet (Server and infrastructure costs).
    *   **0.5%** to the Liquidity Pool (Strengthening token market value).

### 4. Market Protections (Anti-Bot & Anti-Whale)
To ensure a stable and organic market evolution, the contract embeds several defensive mechanisms at the protocol level:
*   **Trading Lock (Accumulation Phase):** Upon deployment, global trading is disabled (`tradingEnabled = false`). Users can earn and hold tokens, but DEX trading is blocked until the ecosystem reaches maturity and the Admin unlocks it.
*   **Anti-Whale Shield:** A single transaction cannot exceed **5%** of the sender's total balance, preventing massive market dumps by large holders.
*   **High-Frequency Trading (HFT) Cooldown:** A mandatory **60-second cooldown** between transfers for any given address neutralizes automated trading bots.
*   **Biometric Transfer Barrier:** Any transfer exceeding **1,000 WPT-HUMAN** strictly requires the sender to have a valid, recent (less than 30 days old) zkTLS Humanity Proof. This ensures that large amounts of capital can only be moved by verified humans, neutralizing the impact of stolen keys or automated drainers.

---

## 🎯 Conclusion

This architecture establishes a highly optimized funnel:
*   **Entry (Web2):** Seamless login via email. Zero technical barriers.
*   **Core Engine (Web3):** Cryptographically secure biometric verification, immutable Smart Contracts, and sponsored Gasless transactions.
*   **Exit (Decentralized):** Complete user sovereignty over funds and total freedom of real-world spending.
