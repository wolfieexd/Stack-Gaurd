# StackGuard Monitor Service

Autonomous monitoring service that watches the Stacks blockchain for threats and reports them on-chain.

## Features

- Automated blockchain monitoring
- Real-time threat detection
- On-chain reporting via smart contract
- REST API for manual control
- Detailed logging and statistics

## Configuration

Copy `.env.example` to `.env` and configure:

```env
AI_SERVICE_PRIVATE_KEY=your_private_key
CONTRACT_ADDRESS=deployed_contract_address
AI_API_ENDPOINT=http://localhost:3000/api/analyze
PORT=4000
CYCLE_INTERVAL=120000
```

## API Endpoints

### GET /health
Service health and status check.

### POST /run
Manually trigger a monitoring cycle.

### GET /status
Detailed service status and environment.

### GET /history
Last 10 monitoring cycle results.

## Running

```bash
npm install
cp .env.example .env
# Edit .env file
npm start
```

The service will automatically:
1. Start monitoring cycles every 2 minutes
2. Fetch recent transactions from Stacks
3. Analyze them with the AI API
4. Report threats to the smart contract
