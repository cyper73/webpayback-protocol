# WebPayback Protocol 🚀

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13+-blue.svg)](https://www.postgresql.org/)

A cutting-edge blockchain protocol that automatically rewards content creators when AI systems use their work. Built with a dual-token economy ($H and WPT) to ensure fair compensation, secure identity verification, and a sustainable creator economy for the digital age.

## 🌟 Key Features

### 🛡️ Identity & Security
- **Humanity Protocol Integration**: Proof of Humanity verification ensures rewards only go to verified, unique human creators, mitigating bot and sybil attacks.
- **Embedded Wallets via Privy**: Frictionless onboarding allowing creators to connect via email or social logins without needing prior Web3 knowledge.
- **Alchemy Infrastructure**: Real-time mempool monitoring and transaction processing to prevent MEV attacks and ensure secure reward distributions.

### 💰 Dual-Token Economy
- **Humanity Token ($H)**: The core reward token distributed to verified creators. Proof of Humanity multiplies earning potential.
- **WebPayback Utility Token (WPT)**: The internal ecosystem token used by AI companies to purchase data licenses and access the protocol's protected content.
- **Cultural Staking (StakeCraft & Qloo)**: Advanced AI evaluation of a creator's cultural impact and audience affinity to equitably distribute rewards from the protocol's treasury.

### 🤖 Advanced Monitoring & Analytics
- **AI Access Detection**: Intelligent tracking systems that detect when AI models (like ChatGPT, Claude, etc.) crawl or utilize registered content.
- **Channel & Domain Verification**: Chainlink-powered Any API verification for secure domain ownership and automated content tracking.
- **Fraud Prevention**: Multi-layered security including IDOR protection, CSRF shielding, and rate-limiting against malicious nodes.

## 🏗️ Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS + Radix UI + shadcn/ui components
- **State Management**: TanStack Query for server state
- **Build Tool**: Vite with ESBuild

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Security**: Advanced middleware for anti-bot, rate limiting, and request validation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 13+
- npm

### Installation

```bash
# Clone repository
git clone https://github.com/cyper73/webpayback-protocol.git
cd webpayback-protocol

# Install dependencies
npm install

# Initialize database
npm run db:push

# Start development server
npm run dev
```

## 🛡️ Security Features

### Gas Pool Protection
- **Emergency Blocking**: Prevents complete fund depletion via circuit breakers.
- **Automatic Alerts**: Real-time notifications to administrators.

### Anti-Fraud System
- **Pattern Detection**: Advanced fraud pattern recognition for unnatural traffic spikes.
- **Real-time Monitoring**: Continuous AI query tracking.
- **Reputation Scoring**: Humanity Protocol scoring directly impacts reward eligibility.

## 🤝 Contributing
We welcome contributions! Please see our contributing guidelines for details.

## 📄 License
This project is licensed under the MIT License.
