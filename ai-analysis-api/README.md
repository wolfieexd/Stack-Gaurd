# StackGuard AI Analysis API

Express.js API service that analyzes blockchain transactions for security threats using statistical anomaly detection.

## Features

- Real-time transaction analysis
- Risk scoring (0-10 scale)
- Threat categorization
- Confidence levels
- RESTful API interface

## API Endpoints

### POST /api/analyze
Analyze a transaction for threats.

**Request Body:**
```json
{
  "amount": 1500,
  "frequency": 8,
  "recipients": 3,
  "memo": "payment",
  "sender": "ST1ABC..."
}
```

**Response:**
```json
{
  "risk_score": 7,
  "severity": "HIGH",
  "threat_category": "HIGH-VALUE",
  "confidence_level": 85,
  "threat_detected": true,
  "recommendations": "Monitor closely",
  "timestamp": "2025-08-28T12:00:00Z"
}
```

### GET /api/health
Service health check.

## Running

```bash
npm install
npm start
```

Default port: 3000
