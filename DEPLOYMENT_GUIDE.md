# StackGuard Smart Contract Deployment Guide

## Overview
The security-monitor.clar smart contract needs to be deployed to the Stacks blockchain for full functionality. Currently, the application runs in demo mode with sample data.

## Prerequisites
1. Install Clarinet: `npm install -g @hirosystems/clarinet-cli`
2. Create a Stacks wallet with STX for deployment fees
3. Get testnet STX from the faucet: https://explorer.stacks.co/sandbox/faucet

## Deployment Steps

### 1. Initialize Clarinet (if not already done)
```bash
cd smart-contract
clarinet integrate
```

### 2. Test the Contract Locally
```bash
clarinet test
```

### 3. Deploy to Testnet
```bash
# Set your private key as environment variable
export STACKS_PRIVATE_KEY="your-private-key-here"

# Deploy to testnet
clarinet deploy --testnet
```

### 4. Update Frontend Configuration
After deployment, update the CONTRACT_ADDRESS in:
- `frontend/src/utils/smartContract.js`
- `monitor-service/services/monitorLoop.js`

Set DEMO_MODE to false in `frontend/src/utils/smartContract.js`

## Manual Deployment (Alternative)

### Using Stacks Explorer
1. Go to https://explorer.stacks.co/sandbox/deploy
2. Connect your wallet
3. Copy the contract code from `contracts/security-monitor.clar`
4. Deploy with a contract name like "security-monitor"

### Using Stacks CLI
```bash
npm install -g @stacks/cli

stx deploy_contract \
  --contract-name security-monitor \
  --contract-file contracts/security-monitor.clar \
  --testnet
```

## Configuration After Deployment

### Frontend
```javascript
// In frontend/src/utils/smartContract.js
const CONTRACT_ADDRESS = 'YOUR_DEPLOYED_ADDRESS_HERE';
const DEMO_MODE = false; // Set to false for live data
```

### Monitor Service
```javascript
// In monitor-service/services/monitorLoop.js
const CONTRACT_ADDRESS = 'YOUR_DEPLOYED_ADDRESS_HERE';
```

## Testnet vs Mainnet
- **Testnet**: Use STACKS_TESTNET, get free STX from faucet
- **Mainnet**: Use STACKS_MAINNET, requires real STX for deployment

## Demo Mode Features
The current demo mode includes:
- ✅ Address lookup with sample threat data
- ✅ Recent reports display
- ✅ Risk level visualization
- ✅ Security status checking
- ✅ Fully functional UI

## Live Contract Features (After Deployment)
- 🔗 Real on-chain threat reports
- 🔗 Persistent threat intelligence
- 🔗 Decentralized security data
- 🔗 AI service integration
- 🔗 Community-driven threat detection

## Support
For deployment assistance, check:
- Stacks Documentation: https://docs.stacks.co
- Clarinet Documentation: https://github.com/hirosystems/clarinet
- Stacks Discord: https://discord.gg/stacks
