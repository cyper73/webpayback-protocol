# WebPayback Protocol - Meta Tag Verification System

---

## Verification Meta Tag

The WebPayback Protocol uses a meta tag system to verify domain and content ownership. Creators must add a specific meta tag to their pages to confirm ownership and enable AI monitoring.

---

## Meta Tag Standard

### Basic Format

```html
<meta name="webpayback-verification" content="WPT-VERIFY-{TOKEN}" />
```

### Complete Example

```html
<!DOCTYPE html>
<html>
<head>
  <meta name="webpayback-verification" content="WPT-VERIFY-abc123def456" />
  <title>My Website</title>
</head>
<body>
  <!-- Page content -->
</body>
</html>
```

---

## Platform Instructions

### YouTube

For YouTube videos, add the token in the description:

```
🎯 WebPayback Protocol Verification: WPT-VERIFY-abc123def456
```

### Instagram

In your Instagram profile, add the token in the bio:

```
🎯 WPT-VERIFY-abc123def456
```

### TikTok

In your TikTok profile, add the token in the bio:

```
🎯 WPT-VERIFY-abc123def456
```

### Discord

In your Discord channel, add the token in the channel description:

```
🎯 WebPayback Protocol: WPT-VERIFY-abc123def456
```

### X/Twitter

In your X/Twitter profile, add the token in the bio:

```
🎯 WPT-VERIFY-abc123def456
```

### Medium/Substack

In your article or profile, add the token:

```
🎯 WebPayback Protocol Verification: WPT-VERIFY-abc123def456
```

### GitHub

In your repository README, add:

```markdown
<!-- WebPayback Protocol Verification -->
🎯 WPT-VERIFY-abc123def456
```

### Personal Websites

Add the meta tag in the `<head>` of the page:

```html
<meta name="webpayback-verification" content="WPT-VERIFY-abc123def456" />
```

---

## Verification Process

### 1. Creator Registration

- Go to [webpayback.replit.app](https://webpayback.replit.app)
- Register your URL/channel
- Receive unique verification token

### 2. Token Insertion

- Copy the provided token
- Add the token according to your platform instructions
- Save the changes

### 3. Automatic Verification

- The Chainlink system automatically verifies the token
- Receive confirmation within 60 seconds
- AI monitoring activated immediately

---

## Security and Validation

### Unique Tokens

- Each creator receives a unique token
- Tokens are linked to specific URL/channel
- Unlimited validity once verified

### Chainlink Verification

- Using Chainlink Functions for validation
- Secure cross-chain verification
- Fraud prevention and duplicate detection

### Continuous Monitoring

- Periodic verification of token presence
- Automatic alerts if token is removed
- Automatic reactivation upon restoration

---

## Practical Examples

### Example 1: YouTube Channel

```
URL: https://www.youtube.com/watch?v=dQw4w9WgXcQ
Token: WPT-VERIFY-yt789xyz123
Location: Video description
Format: "🎯 WebPayback Protocol Verification: WPT-VERIFY-yt789xyz123"
```

### Example 2: Instagram Profile

```
URL: https://instagram.com/mycreator
Token: WPT-VERIFY-ig456abc789
Location: Profile bio
Format: "🎯 WPT-VERIFY-ig456abc789"
```

### Example 3: GitHub Repository

```
URL: https://github.com/user/repo
Token: WPT-VERIFY-gh123xyz456
Location: README.md
Format: "🎯 WPT-VERIFY-gh123xyz456"
```

### Example 4: Personal Website

```html
<!DOCTYPE html>
<html>
<head>
  <meta name="webpayback-verification" content="WPT-VERIFY-web789abc123" />
  <meta charset="UTF-8">
  <title>My Portfolio</title>
</head>
<body>
  <h1>Welcome to my website</h1>
  <!-- Content... -->
</body>
</html>
```

---

## Troubleshooting

### Token Not Detected

- Verify that the token is exactly as provided
- Check the correct location for your platform
- Ensure the content is public
- Wait up to 60 seconds for verification

### Verification Failed

- Check that the URL is correct
- Verify that the token is publicly visible
- Retry verification from the dashboard
- Contact support if the problem persists

### Accidental Removal

- Re-insert the token in the correct position
- Verification reactivates automatically
- No loss of data or accumulated rewards

---

## API for Developers

### Verification Endpoint

```bash
POST /api/domain/chainlink/verify-meta-tag
Content-Type: application/json

{
  "url": "https://example.com",
  "token": "WPT-VERIFY-abc123def456"
}
```

### Success Response

```json
{
  "success": true,
  "verified": true,
  "domain": "example.com",
  "token": "WPT-VERIFY-abc123def456",
  "verificationTimestamp": "2025-01-17T22:30:00Z",
  "chainlinkData": {
    "requestId": "0x123...",
    "gasUsed": "0.001",
    "responseTime": "1.2s"
  }
}
```

### Status Check

```bash
GET /api/domain/chainlink/status?url=https://example.com
```

---

## Support

For assistance with meta tag verification:

- **Dashboard**: [webpayback.replit.app](https://webpayback.replit.app)
- **GitHub**: [github.com/cyper73/webpayback](https://github.com/cyper73/webpayback)
- **Discord**: [Community Discord](https://discord.gg/webpayback)

---

**WebPayback Protocol** - Verify ownership of your content and start earning WPT tokens when AI uses your work.
