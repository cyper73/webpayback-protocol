# WebPayback Protocol

## Overview
WebPayback Protocol is a multi-agent blockchain application that rewards content creators when AI systems utilize their work. The platform aims to establish a self-sustaining creator economy, combining a React frontend with a Node.js backend, PostgreSQL database, and extensive blockchain integration. Key capabilities include AI agent orchestration, fraud detection, real-time pool monitoring, and a comprehensive NFT content certificate system for intellectual property protection. The project envisions significant market potential by empowering creators and ensuring fair compensation in the age of AI.

## User Preferences
Preferred communication style: Simple, everyday language.
Interface language: English-only for better international understanding and system stability.
Admin Authentication: Successfully implemented secure admin system with Sirio/Flender73 credentials, localStorage token management, and protected module access (July 31, 2025).
MetaMask Wallet Verification: Fully implemented cryptographic signature verification with automatic MetaMask integration and manual fallback options. Uses ethereumjs-util for proper signature validation with Ethereum message prefix. Content Certificate NFTs now use wallet-based authentication bypassing IDOR session issues for streamlined access (August 1, 2025).
Wallet Security Audit: Completed comprehensive security audit of all 22 registered wallet entries. Removed 1 malicious XSS attempt entry, confirmed 8 unique legitimate wallets with no suspicious exchange connections. Database schema corrected with missing verification fields for automatic wallet verification system (August 1, 2025).

## System Architecture

### UI/UX Decisions
The frontend uses React 18 with TypeScript and Vite, styled with Tailwind CSS, Radix UI, and shadcn/ui. A custom WebPayback dark theme and CSS variables are applied. Text readability is prioritized with optimal contrast styling (e.g., `text-gray-700 dark:text-gray-300`). The platform features a responsive design, including a reorganized navigation header and a "Quick Actions Bar" for improved mobile and desktop experience. A custom favicon and comprehensive SEO meta tags enhance branding and discoverability.

### Technical Implementations
The backend is built with Node.js and Express.js, entirely in TypeScript, sharing schemas with the client. PostgreSQL is used with Drizzle ORM and Neon Database serverless driver for data persistence and session management. Key security features include comprehensive CSRF protection, rate limiting, and input validation. Development uses a monorepo structure with TypeScript path aliases and Vite for frontend bundling, esbuild for backend.

### Feature Specifications
**AI Agent System**: Four specialized agents (WebPayback, Autoregolator, PoolAgent, TransparentAgent) coordinate through a database-backed messaging system, ensuring protocol orchestration, AI usage tracking, liquidity management, and transparency.
**Blockchain Infrastructure**: Supports multi-chain deployment (Ethereum, BSC, Polygon, Arbitrum) with ERC-20 WPT token management, automated smart contract deployment, and real-time network monitoring.
**Content Creator Economy**: Includes creator registration, website verification, wallet integration, and channel monitoring for various platforms (YouTube, Instagram, TikTok, Twitter/X). A tiered system (Bronze, Silver, Gold) encourages investor-creators, and a sustainable community-driven ecosystem model is emphasized.
**Security & Fraud Detection**: Multi-layer protection (CSRF tokens, rate limiting, IDOR protection, input validation) and a real-time fraud detection engine analyze suspicious patterns. An allowance management system provides founder-only access with multi-layer security for token distribution. Cryptographic wallet verification prevents address spoofing using MetaMask signature verification with proper Ethereum message prefix handling.
**Content Certificate System**: An NFT-based system uses SHA-256 fingerprinting to detect unauthorized AI usage of creator content, minting NFT certificates and enabling WPT rewards for content theft. Features wallet-based authentication system mirroring Citation Rewards module for direct access without session complexities. Includes /api/content-certificate/verify-wallet endpoint for Creator Portal verification and cryptographic validation. Full XSS protection through URL sanitization and input validation ensures enterprise-grade security.
**Automated Pool Manager**: A zero-touch system for automated pool management, including server-side automation, intelligent range management, spending caps, real-time monitoring, and emergency stop controls.

### System Design Choices
The architecture emphasizes performance, scalability, and security. Frontend state is managed with TanStack Query and client-side routing with Wouter. Form management uses React Hook Form with Zod validation. PostgreSQL-based sessions ensure robust user management. The system prioritizes authentic blockchain data integration, eliminating cached or simulated data for accurate pool and token information. Cost optimization is a key consideration, with API call frequencies reduced and monitoring for compute overage.

## External Dependencies

### Blockchain Services
- **Neon Database**: Serverless PostgreSQL hosting.
- **Alchemy SDK**: Blockchain data and real-time monitoring for Ethereum and Polygon.
- **Chainlink**: Price feeds, VRF randomness, and external data oracles.
- **Web3 Providers**: Multiple RPC endpoints for blockchain network connectivity.

### AI & Content Analysis
- **Multiple AI Model Detection**: Supports detection of Claude, GPT, Gemini, DeepSeek, Grok, and over 25 other AI models.
- **Content Fingerprinting**: Advanced hashing algorithms for content uniqueness.
- **Natural Language Processing**: Used for content categorization and quality assessment.

### External APIs
- **Domain Verification Services**: For DNS lookup and domain reputation checks.
- **IP Geolocation Services**: For VPN detection and geographic analysis.
- **Social Media APIs**: Integrations with YouTube, Instagram, and Twitter for creator verification.
- **Real-time Cryptocurrency Price Feeds**: For WPT token valuation.