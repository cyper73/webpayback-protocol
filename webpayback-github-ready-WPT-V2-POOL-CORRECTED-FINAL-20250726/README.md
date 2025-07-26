# WebPayback Protocol

A sophisticated decentralized application (dApp) that automatically rewards content creators when AI systems use their work through advanced blockchain integration on Polygon network.

## 🎯 Core Features

- **AI-Powered Content Attribution**: Automatically detects and rewards creators when AI systems access their content
- **Multi-Chain Token Deployment**: WPT V2 deployed on Polygon with optimized tokenomics
- **Liquidity Pool Management**: WMATIC/WPT pool on Uniswap V3 with concentrated liquidity
- **Real-Time Monitoring**: Advanced security and fraud detection systems
- **Creator Economy**: Direct wallet-based rewards distribution

## ⚠️ Contract Status

**CURRENT (V2)**: 
- **WPT V2 Contract**: `0x9408f17a8B4666f8cb8231BA213DE04137dc3825` ✅ **ACTIVE**
- **Liquidity Pool**: `0x572a5E8cbfCe8026550f1e2B369c2Bdbcf6634c3` ✅ **ACTIVE V3**

**DEPRECATED (V1)**:
- **WPT V1 Contract**: `0x9077051D318b614F915E8A07861090856FDEC91e` ❌ **DISCONTINUED**

## 🚀 Live Deployment

- **Network**: Polygon (Chain ID: 137)
- **Total Supply**: 10,000,000 WPT
- **Current Price**: 124.993 WPT = 1 WMATIC

## 🛠 Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Blockchain**: Polygon Network
- **UI Components**: Radix UI + shadcn/ui + Tailwind CSS
- **Security**: Multi-layer fraud detection and protection

## 📁 Project Structure

```
├── client/          # React frontend application
├── server/          # Express backend API
├── shared/          # Shared TypeScript schemas
├── contracts/       # Smart contracts (WPT V2)
├── deployments/     # Deployment configurations
├── docs/           # Project documentation
└── attached_assets/ # UI assets and images
```

## 🔧 Development

```bash
# Start development server
npm run dev

# Database operations
npm run db:push
npm run db:studio

# Smart contract deployment
npx hardhat run scripts/deploy.js --network polygon
```

## 📋 Documentation

All detailed documentation is available in the `docs/` folder:

- [Deployment Parameters](docs/DEPLOYMENT_PARAMETERS.md)
- [Fee Analysis](docs/FEE_REVENUE_ANALYSIS.md)
- [Pool Management](docs/UNISWAP_V3_POOL_STRATEGY.md)
- [Security Features](docs/POOL_DRAIN_PROTECTION_UPDATE.md)

## 🎉 Status

✅ **Fully Operational**: WPT V2 deployed with authentic liquidity and trading capability
✅ **Security Active**: Complete fraud detection and pool protection systems
✅ **AI Integration**: Real-time content monitoring and reward distribution

---

*WebPayback Protocol - Rewarding creators in the AI economy*