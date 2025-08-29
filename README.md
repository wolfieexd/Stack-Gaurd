# 🛡️ StackGuard: Blockchain Security Monitor

[![Stacks](https://img.shields.io/badge/Stacks-Powered-blue.svg)](https://www.stacks.co/)
[![React](https://img.shields.io/badge/React-Frontend-61dafb.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Services-339933.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-lightgrey.svg)](#license)
[![Platform](https://img.shields.io/badge/Platform-Web-brightgreen.svg)]()

A **decentralized blockchain security monitoring system** that leverages AI to detect and report potential threats in real-time on the Stacks blockchain. Built for enhanced cryptocurrency transaction security and threat intelligence sharing.

---

## 🎯 Key Features

- 🤖 AI-powered transaction analysis
- 🔗 On-chain threat reporting via smart contracts
- 📊 Real-time security dashboard
- 🔄 24/7 autonomous monitoring
- 🌐 Community-driven threat detection
- 📈 Risk level visualization
- ⚡ Sub-minute threat detection

---

## 🏗️ Architecture

StackGuard consists of four main components:

1. **Smart Contract** (`smart-contract/`) - Clarity smart contract for storing threat reports on-chain
2. **AI Analysis API** (`ai-analysis-api/`) - Express API that analyzes transaction patterns for threats
3. **Monitor Service** (`monitor-service/`) - Automated service that monitors blockchain and reports threats
4. **Frontend Dashboard** (`frontend/`) - React dashboard for viewing threats and connecting wallets

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Clarinet (for smart contract deployment)

### 1. Deploy Smart Contract

```bash
cd smart-contract/
clarinet console
(contract-deploy 'security-monitor)
```

### 2. Start AI Analysis API

```bash
cd ai-analysis-api/
npm install
npm start
# Runs on http://localhost:3000
```

### 3. Configure and Start Monitor Service

```bash
cd monitor-service/
npm install
cp .env.example .env
# Edit .env with your contract address and private key
npm start
# Runs on http://localhost:4000
```

### 4. Start Frontend Dashboard

```bash
cd frontend/
npm install
npm start
# Runs on http://localhost:3001
```

## 🔧 Configuration

### Environment Variables (.env for monitor-service)

```env
AI_SERVICE_PRIVATE_KEY=your_private_key_here
CONTRACT_ADDRESS=your_deployed_contract_address
AI_API_ENDPOINT=http://localhost:3000/api/analyze
PORT=4000
CYCLE_INTERVAL=120000
```

## 📊 API Endpoints

### AI Analysis API
- `POST /api/analyze` - Analyze transaction for threats
- `GET /api/health` - Service health check

### Monitor Service  
- `GET /health` - Service status and last cycle results
- `POST /run` - Manually trigger monitoring cycle
- `GET /status` - Detailed service status
- `GET /history` - Last 10 monitoring cycles

## 🛡️ How It Works

1. **Real-time Monitoring**: The monitor service fetches recent transactions from Stacks testnet every 2 minutes
2. **AI Analysis**: Each transaction is analyzed by the AI API using statistical anomaly detection
3. **Threat Detection**: Transactions with risk scores ≥7 are flagged as threats
4. **On-chain Reporting**: Detected threats are automatically reported to the smart contract
5. **Dashboard Visualization**: Users can view threat intelligence through the React dashboard

## 🔑 Key Features

- **Autonomous Operation**: Runs 24/7 without human intervention
- **On-chain Transparency**: All threat data stored immutably on blockchain
- **Real-time Analysis**: Sub-minute threat detection and reporting
- **Community Driven**: Public smart contract allows community validation
- **Scalable Architecture**: Modular design for easy extension and deployment

## 🧪 Testing

The system includes mock data and simulated transactions for demonstration:
- AI API returns realistic threat analysis based on transaction patterns
- Frontend displays sample threat reports with different severity levels
- Monitor service processes real Stacks testnet transactions

## 🚀 Deployment

### Local Development
Follow the Quick Start guide above for local development setup.

### Production Deployment
1. Deploy smart contract to Stacks mainnet
2. Deploy AI API to cloud service (Vercel, Heroku, etc.)
3. Deploy monitor service to always-on server
4. Deploy frontend to static hosting (Netlify, Vercel, etc.)

## 📖 Documentation

- **Smart Contract**: See `smart-contract/contracts/security-monitor.clar` for contract functions
- **API Reference**: Check individual service README files for detailed API documentation
- **Architecture**: Review component READMEs for technical implementation details

## 🤝 Contributing

StackGuard is open source. Contributions welcome for:
- Enhanced AI/ML algorithms
- Additional threat detection patterns  
- Frontend improvements
- Smart contract optimizations

## 📄 License

MIT License - see LICENSE file for details.

## ⚡ Support

For questions or support:
- Review component documentation
- Check API health endpoints
- Monitor service logs for debugging

---

## 🆘 Support

Need help? Check out:
- Component documentation
- API health endpoints
- Service logs
- [Stacks Discord](https://discord.gg/stacks)

---

Built with ❤️ for the Stacks ecosystem

> ⚠️ Note: This project is under active development. Some features may be in demo mode.
