# Token Allowance Management System

## Overview
Automated allowance management system for WPT tokens in the WebPayback Protocol, designed to ensure automatic token reserve refills without manual intervention.

## Current Configuration

### Base Parameters (Updated July 28, 2025)
- **Max Allowance**: 2,000,000 WPT
- **Current Usage**: 0% (0 WPT used)
- **Refill Threshold**: 50,000 WPT
- **Refill Amount**: 500,000 WPT per operation
- **Alert Threshold**: 100,000 WPT
- **Pool Reserve Status**: $539 USDT/WPT V2 pool (authentic TVL verified)

### Configured Addresses
- **Wallet Address**: 0x742d35Cc6634C0532925a3b8D7a6d88b86e5f9a8
- **Contract Address**: 0x9408f17a8B4666f8cb8231BA213DE04137dc3825
- **Token Address**: 0x9408f17a8B4666f8cb8231BA213DE04137dc3825

## Features

### 1. Automatic Reserve Management
- Continuous monitoring of token reserve balance
- Automatic refill when balance drops below threshold
- Protection against reserve drain attacks

### 2. Multi-Layer Security
- **Device Fingerprinting**: Only Windows + Chrome/Firefox authorized
- **Wallet Validation**: Access limited to founder wallet
- **Session-Based Auth**: Session-level protection
- **IDOR Protection**: Prevention of unauthorized access

### 3. Security Monitoring
- Security event tracking
- Automatic alerts for anomalous behavior
- Complete transaction logging

## Database Schema

### allowance_management
- Main allowance configuration
- Operational thresholds and parameters
- Status and operation timestamps

### allowance_transactions
- Complete transaction history
- Hash, gas used, block number
- Confirmation status and error handling

### reserve_pool_status
- Current reserve status
- Daily/weekly/monthly distribution
- Projections and alert levels

### allowance_security
- Detected security events
- Risk levels and actions taken
- Evidence and resolution tracking

## API Endpoints

### Configuration
- `GET /api/allowance/config/:walletAddress` - Retrieve configuration
- `POST /api/allowance/setup` - Initialize allowance system
- `PUT /api/allowance/update/:walletAddress` - Update parameters

### Monitoring
- `GET /api/allowance/dashboard/:walletAddress` - Complete dashboard
- `GET /api/allowance/transactions/:walletAddress` - Transaction history
- `GET /api/allowance/security/:walletAddress` - Security events

### Operations
- `POST /api/allowance/approve` - Approve allowance
- `POST /api/allowance/revoke` - Revoke allowance
- `POST /api/allowance/security-event` - Create security event

## Security and Access

### Founder-Only Access
The system is designed exclusively for protocol founder access:
- Wallet: 0x742d35Cc6634C0532925a3b8D7a6d88b86e5f9a8
- Device: Windows + Chrome/Firefox
- All other access attempts are blocked

### Implemented Protections
- Authentication middleware on all endpoints
- Wallet address validation on every request
- Device fingerprinting to prevent unauthorized device access
- Rate limiting and anomaly monitoring

## Implementation Status

### ✅ Completed (July 28, 2025)
- Complete and synchronized database schema
- Complete backend API with 8+ endpoints
- Functional frontend dashboard
- Active multi-layer security system
- Initial configuration saved and tested
- Founder confirmed correct functionality
- **AUTHENTIC POOL DATA INTEGRATION**: Fixed TVL calculation from $1 to authentic $539 TVL
- **BLOCKCHAIN ACCURACY**: Direct Uniswap V2 contract integration with verified token reserves

### 🔄 In Progress
- Automatic pool monitoring every 12 hours
- Alchemy API integration (60/1000 calls used)
- Pool TVL tracking: 
  * USDT/WPT V2 Pool: $539 USD (authentic blockchain data: 538.02 USDT + 283,013 WPT)
  * WMATIC/WPT V3 Pool: €219 EUR (authentic blockchain data: 265.4 WMATIC + 0 WPT)

## Contatti
- Email: info@webpayback.com
- GitHub: https://github.com/cyper73/webpayback-protocol/tree/webpayback
- Domain: webpayback.com

---
*Document updated: July 28, 2025 - Pool TVL Authentication Fix*
*System tested and confirmed working by founder Claudio*
*Authentic blockchain integration verified: USDT/WPT pool showing exact $539 TVL*