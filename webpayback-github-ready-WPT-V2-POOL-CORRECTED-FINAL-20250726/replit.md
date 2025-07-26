# WebPayback Protocol

## Overview

WebPayback Protocol is a sophisticated multi-agent blockchain application that automatically rewards content creators when AI systems use their work. The platform combines React frontend with Node.js backend, PostgreSQL database, and extensive blockchain integration across multiple networks (Ethereum, Polygon, BSC, Arbitrum). It features advanced AI agent orchestration, comprehensive fraud detection, and real-time pool monitoring with authentic data sources.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with custom WebPayback dark theme and CSS variables
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Management**: React Hook Form with Zod validation and Hookform resolvers

### Backend Architecture
- **Runtime**: Node.js with Express.js framework using ES modules
- **Language**: Full TypeScript with shared schemas between client and server
- **Database**: PostgreSQL with Drizzle ORM and Neon Database serverless driver
- **Session Management**: PostgreSQL-based sessions using connect-pg-simple
- **Security**: Comprehensive CSRF protection, rate limiting, IDOR protection, and input validation

### Development Environment
- **Monorepo Structure**: Shared TypeScript schemas in `/shared` directory
- **Path Aliases**: TypeScript path mapping for clean imports (@/, @shared/)
- **Build System**: Vite for frontend, esbuild for backend bundling
- **Database Migrations**: Drizzle Kit for schema management and PostgreSQL dialect

## Key Components

### AI Agent System
- **Four Specialized Agents**: WebPayback (protocol orchestration), Autoregolator (AI tracking), PoolAgent (liquidity management), and TransparentAgent (transparency monitoring)
- **Performance Tracking**: Real-time metrics including accuracy (98.9-99.8%), uptime (99.5-99.9%), and task completion counts
- **Inter-Agent Communication**: Database-backed messaging system for agent coordination
- **Level 280 Expertise**: High-level AI agents with specialized capabilities for each domain

### Blockchain Infrastructure
- **Multi-Chain Support**: Deployed across Ethereum, BSC, Polygon, and Arbitrum networks
- **WPT Token Management**: ERC-20 token with configurable fee structures and creator rewards
- **Smart Contract Deployment**: Automated deployment system with gas optimization and transaction monitoring
- **Real-time Network Monitoring**: Live tracking of deployment status and blockchain interactions

### Content Creator Economy
- **Creator Registration**: Website verification, wallet integration, and content category classification
- **Channel Monitoring**: Support for YouTube channels, Instagram profiles, TikTok accounts, and Twitter/X profiles
- **Referral System**: Multi-level referral tracking with bonus calculations
- **Reputation Scoring**: Dynamic creator reputation based on authenticity and engagement

### Security & Fraud Detection
- **Multi-Layer Protection**: CSRF tokens, rate limiting, input validation, and IDOR protection
- **Fraud Detection Engine**: Real-time analysis of suspicious patterns, IP tracking, and reputation scoring
- **Pool Drain Protection**: Advanced monitoring to prevent malicious liquidity withdrawals
- **Reentrancy Protection**: Smart contract security measures against callback attacks

## Data Flow

### Content Monitoring Flow
1. **AI Detection**: Monitor for AI agent access to creator content via user-agent analysis
2. **Content Fingerprinting**: Generate unique hashes for content identification
3. **Reward Calculation**: Determine WPT token rewards based on usage patterns and creator reputation
4. **Distribution**: Automated token distribution through smart contracts
5. **Tracking**: Comprehensive logging of all interactions for transparency

### Verification Pipeline
1. **Domain Verification**: Multiple methods including DNS TXT records, HTML meta tags, and file uploads
2. **Social Proof**: Integration with major platforms for identity verification
3. **Channel Mapping**: Automatic detection and mapping of content URLs to creator channels
4. **Reputation Building**: Continuous scoring based on authentic content and community engagement

### Security Event Processing
1. **Real-time Monitoring**: Continuous analysis of access patterns and behavior
2. **Risk Scoring**: Multi-factor risk assessment using machine learning patterns
3. **Alert Generation**: Automated alerts for suspicious activities with severity levels
4. **Response Actions**: Automated blocking, flagging, or manual review triggers

## External Dependencies

### Blockchain Services
- **Neon Database**: Serverless PostgreSQL hosting with WebSocket support
- **Alchemy SDK**: Ethereum and Polygon blockchain data and real-time monitoring
- **Chainlink Integration**: Price feeds, VRF randomness, and external data oracles
- **Web3 Providers**: Multiple RPC endpoints for blockchain network connectivity

### AI & Content Analysis
- **Multiple AI Model Detection**: Support for Claude, GPT, Gemini, DeepSeek, Grok, and 25+ other AI models
- **Content Fingerprinting**: Advanced hashing algorithms for content uniqueness
- **Natural Language Processing**: Text analysis for content categorization and quality assessment

### External APIs
- **Domain Verification**: DNS lookup services and domain reputation checking
- **IP Geolocation**: VPN detection and geographic analysis
- **Social Media APIs**: Integration with YouTube, Instagram, Twitter for verification
- **Price Data**: Real-time cryptocurrency price feeds for WPT valuation

## Deployment Strategy

### Production Architecture
- **Frontend**: Static assets served via Vite build with optimized bundles
- **Backend**: Node.js server with Express middleware and TypeScript compilation
- **Database**: PostgreSQL with Drizzle schema migrations and connection pooling
- **Environment**: Replit hosting with custom domain support and SSL certificates

### Scalability Considerations
- **Database**: Connection pooling with Neon serverless for automatic scaling
- **Caching**: Intelligent caching for blockchain data and expensive API calls
- **Rate Limiting**: Tiered rate limiting to handle traffic spikes
- **Load Balancing**: Ready for horizontal scaling with stateless backend design

### Monitoring & Analytics
- **Real-time Dashboards**: Live monitoring of all system components
- **Performance Metrics**: Agent performance, API response times, and error rates
- **Security Monitoring**: Continuous fraud detection and security event tracking
- **Business Intelligence**: Creator analytics, reward distribution, and platform growth metrics