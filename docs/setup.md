# WebPayback Protocol Setup Guide

---

## Overview

This guide provides step-by-step instructions for setting up the WebPayback Protocol development environment, including all dependencies, configuration, and deployment options.

---

## 🔧 Prerequisites

### System Requirements

- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 8.0.0 or higher (comes with Node.js)
- **PostgreSQL**: Version 13.0 or higher
- **Git**: Latest version
- **Operating System**: Linux, macOS, or Windows

### Hardware Requirements

- **CPU**: 2+ cores recommended
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 10GB free space minimum
- **Network**: Stable internet connection

---

## 📦 Installation

### 1. Clone Repository

```bash
# Clone the repository
git clone https://github.com/cyper73/webpayback.git
cd webpayback

# Verify you're in the correct directory
ls -la
```

### 2. Install Dependencies

```bash
# Install all dependencies
npm install

# Verify installation
npm list --depth=0
```

### 3. Environment Configuration

Create environment configuration file:

```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env  # or your preferred editor
```

#### Required Environment Variables

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/webpayback

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here
SESSION_SECRET=your-session-secret-here

# Gas Pool Configuration
MIN_POOL_BALANCE=1.0
CRITICAL_POOL_BALANCE=0.1
EMERGENCY_POOL_BALANCE=0.01

# AI Monitoring
AI_CONFIDENCE_THRESHOLD=0.3
KNOWLEDGE_TRACKING_ENABLED=true

# Blockchain Configuration
POLYGON_RPC_URL=https://polygon-rpc.com
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR-PROJECT-ID
BSC_RPC_URL=https://bsc-dataseed.binance.org/

# Chainlink Configuration
CHAINLINK_VRF_COORDINATOR=0x8C7382F9D8f56b33781fE506E897a4F1e2d17255
CHAINLINK_KEY_HASH=0x6e75b569a01ef56d18cab6a8e71e6600d6ce853834d4a5748b720d06f878b3a4
CHAINLINK_SUBSCRIPTION_ID=your-subscription-id

# External Services
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
```

---

## 🗄️ Database Setup

### 1. PostgreSQL Installation

#### Ubuntu/Debian

```bash
# Update package list
sudo apt update

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### macOS

```bash
# Install via Homebrew
brew install postgresql

# Start PostgreSQL service
brew services start postgresql
```

#### Windows

Download and install PostgreSQL from [official website](https://www.postgresql.org/download/windows/).

### 2. Database Creation

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE webpayback;
CREATE USER webpayback_user WITH PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE webpayback TO webpayback_user;

# Exit PostgreSQL
\q
```

### 3. Database Migration

```bash
# Generate database schema
npm run db:generate

# Push schema to database
npm run db:push

# Verify tables created
npm run db:studio
```

---

## 🚀 Development Setup

### 1. Start Development Server

```bash
# Start the development server
npm run dev

# Expected output:
# ✓ Server running on http://localhost:5000
# ✓ Frontend running on http://localhost:3000
# ✓ Database connected
# ✓ All AI agents initialized
```

### 2. Verify Installation

Open your browser and navigate to:
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **API**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

### 3. Test API Endpoints

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Expected response:
# {
#   "status": "healthy",
#   "timestamp": "2025-01-17T16:00:00Z",
#   "version": "1.0.0"
# }
```

---

## 🌐 Production Setup

### 1. Environment Configuration

```env
# Production environment
NODE_ENV=production
PORT=5000

# Security
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=900000

# Database (use connection pooling)
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
DATABASE_POOL_SIZE=20

# Monitoring
SENTRY_DSN=https://your-sentry-dsn
LOG_LEVEL=info
```

### 2. Build for Production

```bash
# Build the application
npm run build

# Test production build
npm run preview

# Start production server
npm start
```

### 3. Process Management

#### Using PM2

```bash
# Install PM2 globally
npm install -g pm2

# Start application with PM2
pm2 start ecosystem.config.js

# Monitor processes
pm2 monit

# View logs
pm2 logs webpayback
```

#### PM2 Configuration (ecosystem.config.js)

```javascript
module.exports = {
  apps: [{
    name: 'webpayback',
    script: './dist/server/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

---

## 🐳 Docker Setup

### 1. Docker Configuration

#### Dockerfile

```dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 5000

# Start application
CMD ["npm", "start"]
```

#### docker-compose.yml

```yaml
version: '3.8'

services:
  webpayback:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/webpayback
    depends_on:
      - db
    volumes:
      - ./logs:/app/logs

  db:
    image: postgres:13
    environment:
      - POSTGRES_DB=webpayback
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### 2. Docker Commands

```bash
# Build and start services
docker-compose up --build

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f webpayback

# Stop services
docker-compose down
```

---

## 🔐 Security Setup

### 1. SSL/TLS Configuration

#### Using Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Generate SSL certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 2. Firewall Configuration

```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow ssh

# Allow HTTP/HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Allow application port
sudo ufw allow 5000

# Check status
sudo ufw status
```

### 3. Security Headers

Add security headers to your reverse proxy configuration:

```nginx
# Nginx configuration
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;
```

---

## 📊 Monitoring Setup

### 1. Application Monitoring

#### Health Check Endpoint

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Expected response:
{
  "status": "healthy",
  "database": "connected",
  "agents": "operational",
  "gasPool": "healthy",
  "uptime": "72h 15m"
}
```

### 2. Database Monitoring

```bash
# Monitor database connections
npm run db:monitor

# View slow queries
npm run db:slow-queries

# Database statistics
npm run db:stats
```

### 3. Log Management

#### Log Configuration

```javascript
// logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

module.exports = logger;
```

---

## 🧪 Testing Setup

### 1. Testing Framework

```bash
# Install testing dependencies
npm install --save-dev jest supertest @types/jest

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### 2. Test Configuration

#### jest.config.js

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/types/**/*'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html']
};
```

### 3. Test Database

```bash
# Create test database
createdb webpayback_test

# Set test environment
export NODE_ENV=test
export DATABASE_URL=postgresql://user:pass@localhost:5432/webpayback_test

# Run test migrations
npm run db:test:migrate
```

---

## 📈 Performance Optimization

### 1. Node.js Optimization

```javascript
// server/index.js
const cluster = require('cluster');
const os = require('os');

if (cluster.isMaster) {
  // Fork workers
  for (let i = 0; i < os.cpus().length; i++) {
    cluster.fork();
  }
  
  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  // Worker process
  require('./app');
}
```

### 2. Database Optimization

```sql
-- Create indexes for better performance
CREATE INDEX idx_creators_website_url ON creators(website_url);
CREATE INDEX idx_content_access_creator_id ON content_access(creator_id);
CREATE INDEX idx_content_access_accessed_at ON content_access(accessed_at);
CREATE INDEX idx_reward_distributions_creator_id ON reward_distributions(creator_id);
```

### 3. Caching Setup

```javascript
// server/cache.js
const Redis = require('redis');
const client = Redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379
});

module.exports = {
  get: async (key) => {
    return await client.get(key);
  },
  set: async (key, value, ttl = 3600) => {
    return await client.setex(key, ttl, JSON.stringify(value));
  },
  del: async (key) => {
    return await client.del(key);
  }
};
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Database Connection Issues

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check database connections
psql -U webpayback_user -d webpayback -c "SELECT version();"

# Reset database
npm run db:reset
```

#### 2. Port Already in Use

```bash
# Find process using port
lsof -i :5000

# Kill process
kill -9 <PID>

# Or use different port
PORT=5001 npm run dev
```

#### 3. Permission Issues

```bash
# Fix file permissions
chmod -R 755 /path/to/webpayback

# Fix node_modules permissions
sudo chown -R $(whoami) node_modules
```

### Debug Mode

```bash
# Enable debug logging
DEBUG=webpayback:* npm run dev

# Or set environment variable
export DEBUG=webpayback:*
npm run dev
```

---

## 📝 Development Workflow

### 1. Git Workflow

```bash
# Clone and setup
git clone https://github.com/cyper73/webpayback.git
cd webpayback

# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Add new feature"

# Push branch
git push origin feature/new-feature

# Create pull request
```

### 2. Code Quality

```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Type check
npm run type-check
```

### 3. Pre-commit Hooks

```bash
# Install husky
npm install --save-dev husky

# Setup pre-commit hook
npx husky add .husky/pre-commit "npm run lint && npm run test"
```

---

## 📚 Additional Resources

### Documentation

- [API Documentation](./api/README.md)
- [Database Schema](./database/README.md)
- [AI Agents Guide](./ai-agents.md)
- [Deployment Guide](./deployment.md)

### Community

- **Discord**: [Join our community](https://discord.gg/webpayback)
- **GitHub**: [Repository](https://github.com/cyper73/webpayback)
- **Twitter**: [@webpayback](https://twitter.com/webpayback)

### Support

- **Email**: support@webpayback.com
- **Issues**: [GitHub Issues](https://github.com/cyper73/webpayback/issues)
- **Wiki**: [Project Wiki](https://github.com/cyper73/webpayback/wiki)

---

**WebPayback Protocol Setup** - Your development environment is ready!

🚀 **Status**: Ready for development  
📊 **Next Steps**: Check out the [API Documentation](./api/README.md)  
💬 **Need Help**: [Join our Discord](https://discord.gg/webpayback)
