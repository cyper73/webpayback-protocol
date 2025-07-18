# Creators API Documentation

---

## Overview

The Creators API provides comprehensive functionality for managing content creators, their verification status, and reward distributions within the WebPayback Protocol.

---

## Authentication

All API endpoints require authentication via JWT token in the Authorization header:

```bash
Authorization: Bearer <your-jwt-token>
```

---

## Endpoints

### 1. Get All Creators

Retrieve a list of all registered creators with their verification status and statistics.

```bash
GET /api/creators
```

#### Response

```json
{
  "creators": [
    {
      "id": 1,
      "userId": 1,
      "websiteUrl": "https://youtube.com/watch?v=example",
      "contentCategory": "Technology",
      "walletAddress": "0x742d35Cc6634C0532925a3b8D2A6e3A3e9c6f8e3",
      "isVerified": true,
      "verificationToken": "WPT-VERIFY-abc123",
      "totalRewards": "125.50",
      "lastAccess": "2025-01-17T10:30:00Z",
      "createdAt": "2025-01-10T14:20:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

### 2. Create New Creator

Register a new content creator in the system.

```bash
POST /api/creators
Content-Type: application/json

{
  "websiteUrl": "https://youtube.com/watch?v=example",
  "contentCategory": "Technology",
  "walletAddress": "0x742d35Cc6634C0532925a3b8D2A6e3A3e9c6f8e3"
}
```

#### Response

```json
{
  "success": true,
  "creator": {
    "id": 2,
    "userId": 1,
    "websiteUrl": "https://youtube.com/watch?v=example",
    "contentCategory": "Technology",
    "walletAddress": "0x742d35Cc6634C0532925a3b8D2A6e3A3e9c6f8e3",
    "isVerified": false,
    "verificationToken": "WPT-VERIFY-xyz789",
    "createdAt": "2025-01-17T15:45:00Z"
  },
  "message": "Creator registered successfully"
}
```

### 3. Get Creator by ID

Retrieve detailed information about a specific creator.

```bash
GET /api/creators/:id
```

#### Response

```json
{
  "creator": {
    "id": 1,
    "userId": 1,
    "websiteUrl": "https://youtube.com/watch?v=example",
    "contentCategory": "Technology",
    "walletAddress": "0x742d35Cc6634C0532925a3b8D2A6e3A3e9c6f8e3",
    "isVerified": true,
    "verificationToken": "WPT-VERIFY-abc123",
    "totalRewards": "125.50",
    "rewardHistory": [
      {
        "id": 1,
        "amount": "2.50",
        "aiModel": "ChatGPT",
        "distributedAt": "2025-01-17T10:30:00Z"
      }
    ],
    "accessHistory": [
      {
        "id": 1,
        "aiModel": "ChatGPT",
        "confidence": 0.95,
        "accessedAt": "2025-01-17T10:30:00Z"
      }
    ],
    "createdAt": "2025-01-10T14:20:00Z"
  }
}
```

### 4. Update Creator

Update creator information and settings.

```bash
PUT /api/creators/:id
Content-Type: application/json

{
  "contentCategory": "Education",
  "walletAddress": "0x742d35Cc6634C0532925a3b8D2A6e3A3e9c6f8e3"
}
```

#### Response

```json
{
  "success": true,
  "creator": {
    "id": 1,
    "userId": 1,
    "websiteUrl": "https://youtube.com/watch?v=example",
    "contentCategory": "Education",
    "walletAddress": "0x742d35Cc6634C0532925a3b8D2A6e3A3e9c6f8e3",
    "isVerified": true,
    "updatedAt": "2025-01-17T16:00:00Z"
  },
  "message": "Creator updated successfully"
}
```

### 5. Delete Creator

Remove a creator from the system.

```bash
DELETE /api/creators/:id
```

#### Response

```json
{
  "success": true,
  "message": "Creator deleted successfully"
}
```

---

## Verification Endpoints

### 1. Verify Creator Domain

Initiate domain verification process for a creator.

```bash
POST /api/creators/:id/verify
Content-Type: application/json

{
  "url": "https://youtube.com/watch?v=example"
}
```

#### Response

```json
{
  "success": true,
  "verificationToken": "WPT-VERIFY-abc123",
  "instructions": {
    "platform": "youtube",
    "method": "video_description",
    "steps": [
      "Go to your YouTube video",
      "Edit the video description",
      "Add: 🎯 WebPayback Protocol Verification: WPT-VERIFY-abc123",
      "Save the changes",
      "Wait for automatic verification"
    ]
  },
  "message": "Verification initiated"
}
```

### 2. Check Verification Status

Check the verification status of a creator.

```bash
GET /api/creators/:id/verification-status
```

#### Response

```json
{
  "verified": true,
  "verificationDate": "2025-01-17T11:00:00Z",
  "verificationMethod": "meta_tag",
  "chainlinkData": {
    "requestId": "0x123abc...",
    "gasUsed": "0.001",
    "responseTime": "1.2s"
  }
}
```

---

## Statistics Endpoints

### 1. Creator Statistics

Get comprehensive statistics for a creator.

```bash
GET /api/creators/:id/stats
```

#### Response

```json
{
  "creator": {
    "id": 1,
    "totalRewards": "125.50",
    "totalAccesses": 50,
    "aiModels": {
      "ChatGPT": 25,
      "Claude": 15,
      "Gemini": 10
    },
    "rewardsByMonth": [
      {
        "month": "2025-01",
        "amount": "45.50",
        "accesses": 18
      }
    ],
    "averageRewardPerAccess": "2.51",
    "topPerformingContent": [
      {
        "url": "https://youtube.com/watch?v=example",
        "accesses": 30,
        "rewards": "75.00"
      }
    ]
  }
}
```

### 2. Global Creator Statistics

Get system-wide creator statistics.

```bash
GET /api/creators/stats/global
```

#### Response

```json
{
  "totalCreators": 1200,
  "verifiedCreators": 950,
  "totalRewards": "125000.00",
  "averageRewardPerCreator": "104.17",
  "topCategories": [
    {
      "category": "Technology",
      "creators": 350,
      "rewards": "45000.00"
    },
    {
      "category": "Education",
      "creators": 280,
      "rewards": "32000.00"
    }
  ],
  "rewardDistribution": {
    "thisMonth": "8500.00",
    "lastMonth": "7800.00",
    "growth": "8.97%"
  }
}
```

---

## Channel Management Endpoints

### 1. Get Creator Channels

Retrieve all channels associated with a creator.

```bash
GET /api/creators/:id/channels
```

#### Response

```json
{
  "channels": [
    {
      "id": 1,
      "creatorId": 1,
      "platform": "youtube",
      "channelId": "UC123456789",
      "channelName": "Tech Creator",
      "isActive": true,
      "monitoringScope": "full_channel",
      "contentCount": 150,
      "totalRewards": "89.50",
      "createdAt": "2025-01-10T14:20:00Z"
    }
  ],
  "total": 1
}
```

### 2. Add Channel Mapping

Add a new channel mapping for a creator.

```bash
POST /api/creators/:id/channels
Content-Type: application/json

{
  "platform": "youtube",
  "channelId": "UC123456789",
  "channelName": "Tech Creator",
  "monitoringScope": "full_channel"
}
```

#### Response

```json
{
  "success": true,
  "channel": {
    "id": 2,
    "creatorId": 1,
    "platform": "youtube",
    "channelId": "UC123456789",
    "channelName": "Tech Creator",
    "isActive": true,
    "monitoringScope": "full_channel",
    "createdAt": "2025-01-17T16:30:00Z"
  },
  "message": "Channel mapping added successfully"
}
```

---

## Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "CREATOR_NOT_FOUND",
    "message": "Creator with ID 123 not found",
    "details": {
      "requestId": "req_123456789",
      "timestamp": "2025-01-17T16:00:00Z"
    }
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `CREATOR_NOT_FOUND` | 404 | Creator not found |
| `INVALID_WALLET_ADDRESS` | 400 | Invalid wallet address format |
| `VERIFICATION_FAILED` | 422 | Domain verification failed |
| `DUPLICATE_URL` | 409 | URL already registered |
| `INSUFFICIENT_PERMISSIONS` | 403 | User lacks required permissions |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Standard endpoints**: 100 requests per minute per user
- **Verification endpoints**: 10 requests per minute per user
- **Statistics endpoints**: 50 requests per minute per user

### Rate Limit Headers

```bash
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 85
X-RateLimit-Reset: 1642454400
```

---

## Pagination

List endpoints support pagination:

```bash
GET /api/creators?page=2&limit=20&sort=createdAt&order=desc
```

### Pagination Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 10 | Items per page |
| `sort` | string | `createdAt` | Sort field |
| `order` | string | `desc` | Sort order (asc/desc) |

---

## Filtering

Creators can be filtered by various criteria:

```bash
GET /api/creators?category=Technology&verified=true&minRewards=50
```

### Filter Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `category` | string | Content category filter |
| `verified` | boolean | Verification status filter |
| `minRewards` | number | Minimum rewards threshold |
| `maxRewards` | number | Maximum rewards threshold |
| `platform` | string | Platform filter (youtube, instagram, etc.) |
| `walletAddress` | string | Exact wallet address match |

---

## Webhooks

Register webhooks to receive real-time notifications about creator events:

```bash
POST /api/creators/webhooks
Content-Type: application/json

{
  "url": "https://yourapp.com/webhook",
  "events": ["creator.verified", "creator.reward.distributed"],
  "secret": "your-webhook-secret"
}
```

### Webhook Events

| Event | Description |
|-------|-------------|
| `creator.created` | New creator registered |
| `creator.verified` | Creator verification completed |
| `creator.updated` | Creator information updated |
| `creator.reward.distributed` | Reward distributed to creator |
| `creator.access.detected` | AI access detected |

---

## SDK Examples

### JavaScript/Node.js

```javascript
const webpayback = require('@webpayback/sdk');

// Initialize client
const client = new webpayback.Client({
  apiKey: 'your-api-key',
  baseUrl: 'https://webpayback.replit.app/api'
});

// Create creator
const creator = await client.creators.create({
  websiteUrl: 'https://youtube.com/watch?v=example',
  contentCategory: 'Technology',
  walletAddress: '0x742d35Cc6634C0532925a3b8D2A6e3A3e9c6f8e3'
});

// Get creator statistics
const stats = await client.creators.getStats(creator.id);
console.log(`Total rewards: ${stats.totalRewards} WPT`);
```

### Python

```python
import webpayback

# Initialize client
client = webpayback.Client(
    api_key='your-api-key',
    base_url='https://webpayback.replit.app/api'
)

# Create creator
creator = client.creators.create(
    website_url='https://youtube.com/watch?v=example',
    content_category='Technology',
    wallet_address='0x742d35Cc6634C0532925a3b8D2A6e3A3e9c6f8e3'
)

# Get creator statistics
stats = client.creators.get_stats(creator.id)
print(f"Total rewards: {stats.total_rewards} WPT")
```

---

## Testing

### Test Endpoints

Development and testing endpoints are available:

```bash
# Test creator creation
POST /api/test/creators/create

# Test verification process
POST /api/test/creators/verify

# Test reward distribution
POST /api/test/creators/reward
```

### Mock Data

Use mock data for testing:

```bash
GET /api/test/creators/mock-data
```

---

**Creators API** - Complete creator management for the WebPayback Protocol.

📚 **Documentation**: [Full API Docs](https://docs.webpayback.com)  
🔧 **SDK**: [GitHub Repository](https://github.com/webpayback/sdk)  
💬 **Support**: [Discord Community](https://discord.gg/webpayback)
