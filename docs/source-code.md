# Source Code Documentation

---

## Overview

This document provides comprehensive documentation for the WebPayback Protocol source code, including the four specialized AI agents, backend services, and core system components.

---

## 📁 Directory Structure

```
webpayback/
├── server/
│   ├── services/              # Core business logic
│   │   ├── agents.ts         # AI Agent orchestration
│   │   ├── gasManager.ts     # Gas pool management
│   │   ├── contentMonitoring.ts  # Content tracking
│   │   ├── fraudDetection.ts # Anti-fraud system
│   │   └── ...               # Other services
│   ├── routes/               # API endpoints
│   │   ├── routes.ts         # Main API routes
│   │   └── chainlink.ts      # Chainlink integrations
│   ├── db.ts                 # Database configuration
│   └── index.ts              # Application entry point
├── client/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom hooks
│   │   └── lib/             # Utilities
│   └── index.html           # Main HTML file
├── shared/
│   └── schema.ts            # Database schema & types
└── docs/                    # Documentation
```

---

## 🤖 AI Agent System

### Core Agent Architecture

The WebPayback Protocol employs four specialized Level 280 AI agents, each with distinct responsibilities and capabilities:

#### 1. WebPayback Main Agent

**File**: `server/services/agents.ts`

```typescript
interface WebPaybackAgent {
  id: 1;
  name: "WebPayback";
  type: "content_monitoring";
  accuracy: 98.5;
  uptime: 99.9;
  expertise: "AI Detection & Reward Distribution";
}
```

**Core Responsibilities**:
- **AI Content Detection**: Identifies when AI systems access creator content
- **Reward Calculation**: Determines appropriate WPT token rewards
- **Content Fingerprinting**: Creates unique signatures for content tracking
- **Multi-Platform Monitoring**: Supports 20+ AI models and platforms

**Key Methods**:
```typescript
// AI access detection
async detectAIAccess(request: HTTPRequest): Promise<AIDetectionResult>

// Reward calculation
async calculateReward(usage: ContentUsage): Promise<RewardAmount>

// Content fingerprinting
async createContentFingerprint(content: string): Promise<string>
```

#### 2. Autoregolator Agent

**File**: `server/services/agents.ts`

```typescript
interface AutoregolatorAgent {
  id: 2;
  name: "Autoregolator";
  type: "compliance";
  accuracy: 97.8;
  uptime: 99.8;
  expertise: "Legal Compliance & Audit Trails";
}
```

**Core Responsibilities**:
- **Compliance Monitoring**: Ensures adherence to legal requirements
- **Audit Trail Generation**: Creates comprehensive activity logs
- **Transparency Reporting**: Generates transparency scores and reports
- **Regulatory Compliance**: Maintains compliance with evolving regulations

**Key Methods**:
```typescript
// Compliance checking
async checkCompliance(activity: SystemActivity): Promise<ComplianceResult>

// Audit trail creation
async createAuditTrail(event: SystemEvent): Promise<AuditEntry>

// Transparency scoring
async calculateTransparencyScore(data: SystemData): Promise<number>
```

#### 3. PoolAgent

**File**: `server/services/gasManager.ts`

```typescript
interface PoolAgent {
  id: 3;
  name: "PoolAgent";
  type: "gas_management";
  accuracy: 99.2;
  uptime: 99.9;
  expertise: "Gas Pool Protection & Optimization";
}
```

**Core Responsibilities**:
- **Gas Pool Monitoring**: Continuous balance and health monitoring
- **Emergency Protection**: Prevents complete fund depletion
- **Batch Processing**: Optimizes transactions for 95% cost reduction
- **Predictive Analytics**: Forecasts gas usage patterns

**Key Methods**:
```typescript
// Gas pool monitoring
async monitorGasPool(): Promise<GasPoolStatus>

// Emergency protection
async triggerEmergencyProtection(): Promise<void>

// Batch optimization
async optimizeBatchProcessing(transactions: Transaction[]): Promise<BatchResult>
```

#### 4. Transparent Agent

**File**: `server/services/agents.ts`

```typescript
interface TransparentAgent {
  id: 4;
  name: "Transparent Agent";
  type: "transparency";
  accuracy: 98.9;
  uptime: 99.7;
  expertise: "System Transparency & Governance";
}
```

**Core Responsibilities**:
- **Transparency Monitoring**: Ensures system transparency and openness
- **Governance Oversight**: Monitors and reports on governance activities
- **Public Reporting**: Generates public-facing transparency reports
- **Stakeholder Communication**: Maintains communication with all stakeholders

**Key Methods**:
```typescript
// Transparency monitoring
async monitorTransparency(): Promise<TransparencyMetrics>

// Governance reporting
async generateGovernanceReport(): Promise<GovernanceReport>

// Public reporting
async createPublicReport(): Promise<PublicReport>
```

---

## 🏗️ Core Services

### 1. Gas Pool Management

**File**: `server/services/gasManager.ts`

The gas pool management system ensures sustainable transaction processing while protecting against fund depletion.

#### Key Components:

```typescript
export class GasManager {
  private readonly MIN_POOL_BALANCE = 1.0;
  private readonly CRITICAL_POOL_BALANCE = 0.1;
  private readonly EMERGENCY_POOL_BALANCE = 0.01;
  
  // Pool status monitoring
  async getGasPoolStats(): Promise<GasPoolStats>
  
  // Emergency protection
  async emergencyRecharge(amount: number): Promise<RechargeResult>
  
  // Batch processing
  async processBatch(rewards: RewardDistribution[]): Promise<BatchResult>
}
```

#### Gas Pool States:
- **HEALTHY** (≥1.0 MATIC): Normal operation
- **WARNING** (≥0.1 MATIC): Low but functional
- **CRITICAL** (≥0.01 MATIC): Critical but processing
- **EMERGENCY** (<0.01 MATIC): Rewards blocked

### 2. Content Monitoring

**File**: `server/services/contentMonitoring.ts`

Comprehensive content monitoring system that tracks AI access across multiple platforms.

#### Key Features:

```typescript
export class ContentMonitoringService {
  // AI access processing
  async processAIAccess(access: AIAccessEvent): Promise<ProcessingResult>
  
  // Content fingerprinting
  async createContentFingerprint(content: string): Promise<string>
  
  // Reward distribution
  async distributeReward(reward: RewardDistribution): Promise<void>
}
```

#### Supported AI Models:
- **ChatGPT**: GPT-3.5, GPT-4, GPT-4 Turbo
- **Claude**: Claude 3 Opus, Sonnet, Haiku
- **Gemini**: Gemini Pro, Gemini Ultra
- **Other Models**: DeepSeek, Grok, Mistral, Perplexity, Llama

### 3. Channel Monitoring

**File**: `server/services/channelMonitoring.ts`

Advanced channel-level monitoring that allows creators to register once and monitor entire channels.

#### Key Features:

```typescript
export class ChannelMonitoringService {
  // Channel detection
  async detectChannel(url: string): Promise<ChannelInfo>
  
  // Content mapping
  async mapChannelContent(channelId: string): Promise<ContentMapping[]>
  
  // Monitoring activation
  async activateChannelMonitoring(channelId: string): Promise<void>
}
```

#### Supported Platforms:
- **YouTube**: Channel and video monitoring
- **Instagram**: Profile and content tracking
- **TikTok**: Profile and video monitoring
- **Twitter/X**: Profile and tweet tracking

### 4. Fraud Detection

**File**: `server/services/fraudDetection.ts`

Comprehensive anti-fraud system with real-time pattern analysis and risk scoring.

#### Key Components:

```typescript
export class FraudDetectionService {
  // Pattern analysis
  async analyzeAccessPattern(pattern: AccessPattern): Promise<FraudAnalysis>
  
  // Risk scoring
  async calculateRiskScore(activity: SystemActivity): Promise<number>
  
  // Reputation management
  async updateReputationScore(creatorId: number, score: number): Promise<void>
}
```

#### Fraud Prevention:
- **Sybil Attack Detection**: Identifies coordinated fake accounts
- **Auto-farming Prevention**: Prevents automated reward farming
- **IP/Domain Concentration**: Detects suspicious concentration patterns
- **Bot Collusion Detection**: Identifies coordinated bot activities

---

## 🔗 API Endpoints

### Core API Routes

**File**: `server/routes/routes.ts`

#### Authentication & Users
```typescript
POST   /api/auth/login          # User login
POST   /api/auth/register       # User registration
GET    /api/auth/profile        # Get user profile
POST   /api/auth/logout         # User logout
```

#### Creator Management
```typescript
GET    /api/creators            # Get all creators
POST   /api/creators            # Create new creator
GET    /api/creators/:id        # Get creator by ID
PUT    /api/creators/:id        # Update creator
DELETE /api/creators/:id        # Delete creator
```

#### Rewards & Distribution
```typescript
GET    /api/rewards             # Get reward history
POST   /api/rewards/distribute  # Distribute rewards
GET    /api/rewards/stats       # Get reward statistics
```

#### Content Monitoring
```typescript
POST   /api/content/ai-access   # Report AI access
GET    /api/content/stats       # Get monitoring stats
POST   /api/content/ai-knowledge-usage  # AI knowledge tracking
```

#### Gas Pool Management
```typescript
GET    /api/gas/status          # Get gas pool status
POST   /api/gas/emergency-recharge  # Emergency recharge
POST   /api/gas/test-batch      # Test batch processing
```

### Chainlink Integration

**File**: `server/routes/chainlink.ts`

#### Data Feeds
```typescript
GET    /api/chainlink/prices    # Get price feeds
GET    /api/chainlink/health    # Health check
```

#### VRF (Verifiable Random Function)
```typescript
GET    /api/chainlink/vrf/stats # VRF statistics
POST   /api/chainlink/vrf/request  # Request randomness
```

#### Functions
```typescript
GET    /api/chainlink/functions/stats  # Functions stats
POST   /api/chainlink/functions/request  # Execute function
```

---

## 🗄️ Database Schema

**File**: `shared/schema.ts`

### Core Tables

#### Users
```typescript
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).unique().notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
```

#### Creators
```typescript
export const creators = pgTable("creators", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  websiteUrl: varchar("website_url", { length: 500 }).notNull(),
  contentCategory: varchar("content_category", { length: 100 }).notNull(),
  walletAddress: varchar("wallet_address", { length: 255 }).notNull(),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});
```

#### Agents
```typescript
export const agents = pgTable("agents", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  accuracy: decimal("accuracy", { precision: 5, scale: 2 }).notNull(),
  uptime: decimal("uptime", { precision: 5, scale: 2 }).notNull(),
  expertise: varchar("expertise", { length: 500 }).notNull(),
  isActive: boolean("is_active").default(true),
});
```

#### Reward Distributions
```typescript
export const rewardDistributions = pgTable("reward_distributions", {
  id: serial("id").primaryKey(),
  creatorId: integer("creator_id").references(() => creators.id).notNull(),
  amount: decimal("amount", { precision: 18, scale: 8 }).notNull(),
  tokenAddress: varchar("token_address", { length: 255 }).notNull(),
  transactionHash: varchar("transaction_hash", { length: 255 }),
  distributedAt: timestamp("distributed_at").defaultNow(),
});
```

#### Content Monitoring
```typescript
export const contentAccess = pgTable("content_access", {
  id: serial("id").primaryKey(),
  creatorId: integer("creator_id").references(() => creators.id).notNull(),
  url: varchar("url", { length: 500 }).notNull(),
  userAgent: varchar("user_agent", { length: 500 }).notNull(),
  aiModel: varchar("ai_model", { length: 100 }),
  confidence: decimal("confidence", { precision: 5, scale: 2 }),
  ipAddress: varchar("ip_address", { length: 45 }),
  accessedAt: timestamp("accessed_at").defaultNow(),
});
```

---

## 🔧 Development Setup

### Prerequisites

1. **Node.js 18+**
2. **PostgreSQL 13+**
3. **npm or yarn**

### Environment Setup

```bash
# Clone repository
git clone https://github.com/cyper73/webpayback.git
cd webpayback

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

### Database Configuration

```env
DATABASE_URL=postgresql://username:password@localhost:5432/webpayback
```

### Running the Application

```bash
# Development mode
npm run dev

# Production build
npm run build
npm run start

# Database operations
npm run db:push      # Push schema changes
npm run db:studio    # Open database studio
```

---

## 🧪 Testing

### Unit Tests

```bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Integration Tests

```bash
# Test API endpoints
npm run test:api

# Test database operations
npm run test:db

# Test AI agents
npm run test:agents
```

### Performance Tests

```bash
# Load testing
npm run test:load

# Gas optimization tests
npm run test:gas

# Monitoring tests
npm run test:monitoring
```

---

## 📊 Monitoring & Metrics

### System Metrics

- **Agent Performance**: Real-time accuracy and uptime tracking
- **Gas Pool Health**: Continuous balance and transaction monitoring
- **Content Tracking**: AI access patterns and reward distribution
- **Fraud Detection**: Risk scores and pattern analysis

### Dashboard Components

1. **Agent Status**: Live monitoring of all four AI agents
2. **Gas Pool Dashboard**: Real-time gas pool status and optimization
3. **Creator Analytics**: Creator performance and reward statistics
4. **System Health**: Overall system status and alerts

---

## 🔐 Security

### Authentication

- **JWT Tokens**: Secure API authentication
- **Session Management**: PostgreSQL-based session storage
- **Password Hashing**: bcrypt for secure password storage

### Data Protection

- **Input Validation**: Comprehensive request validation using Zod
- **SQL Injection Prevention**: Parameterized queries with Drizzle ORM
- **XSS Protection**: Content sanitization and CSP headers

### Blockchain Security

- **Smart Contract Security**: Audited smart contracts
- **Private Key Management**: Secure key storage and rotation
- **Transaction Monitoring**: Real-time transaction analysis

---

## 📈 Performance Optimization

### Frontend Optimization

- **Code Splitting**: Dynamic imports for reduced bundle size
- **Lazy Loading**: Component and route-based lazy loading
- **Caching**: Efficient state management with TanStack Query

### Backend Optimization

- **Database Indexing**: Optimized database queries and indexes
- **Connection Pooling**: Efficient database connection management
- **Batch Processing**: 95% gas cost reduction through batching

### Blockchain Optimization

- **Gas Optimization**: Advanced gas management and prediction
- **Transaction Batching**: Efficient transaction processing
- **Network Selection**: Optimal blockchain network routing

---

## 🚀 Deployment

### Development Deployment

```bash
# Local development
npm run dev

# Development build
npm run build:dev
```

### Production Deployment

```bash
# Production build
npm run build

# Start production server
npm run start

# PM2 process management
pm2 start ecosystem.config.js
```

### Docker Deployment

```bash
# Build Docker image
docker build -t webpayback .

# Run container
docker run -p 3000:3000 webpayback
```

---

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Make changes**: Follow coding standards and guidelines
4. **Write tests**: Ensure comprehensive test coverage
5. **Run tests**: `npm run test`
6. **Commit changes**: `git commit -m 'Add amazing feature'`
7. **Push to branch**: `git push origin feature/amazing-feature`
8. **Create Pull Request**: Submit PR with detailed description

### Code Standards

- **TypeScript**: Strict type checking enabled
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **Testing**: Minimum 80% code coverage

### Documentation

- **Code Comments**: Comprehensive inline documentation
- **API Documentation**: OpenAPI/Swagger specifications
- **Architecture Documentation**: System design and architecture docs

---

**WebPayback Protocol** - Built with precision, security, and scalability in mind.

🌐 **Live Demo**: [webpayback.replit.app](https://webpayback.replit.app)  
📖 **GitHub**: [github.com/cyper73/webpayback](https://github.com/cyper73/webpayback)