import express from 'express';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import WebSocket from 'ws';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new SocketServer(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Real-time Bitcoin transaction data
let bitcoinTransactions = [];
let transactionStats = {
  totalTransactions: 0,
  totalVolume: 0,
  avgFeeRate: 0,
  mempoolSize: 0,
  networkHashrate: 0,
  lastBlockHeight: 0,
  lastBlockTime: new Date(),
  transactionsPerSecond: 0
};

let performanceMetrics = {
  apiLatency: 0,
  dataProcessingTime: 0,
  websocketConnections: 0,
  uptimeStart: new Date()
};

// Bitcoin API endpoints (using multiple free APIs for redundancy)
const BITCOIN_APIS = {
  BLOCKCHAIN_INFO: 'https://blockchain.info/unconfirmed-transactions?format=json',
  BLOCKSTREAM: 'https://blockstream.info/api',
  MEMPOOL_SPACE: 'https://mempool.space/api/v1'
};

// WebSocket connection to Blockchain.info for real-time transactions
let blockchainWs = null;

// Real-time Bitcoin transaction monitoring
function startBitcoinMonitoring() {
  console.log('🚀 Starting real-time Bitcoin transaction monitoring...');
  
  // Connect to Blockchain.info WebSocket for real-time transactions
  blockchainWs = new WebSocket('wss://ws.blockchain.info/inv');
  
  blockchainWs.on('open', () => {
    console.log('✅ Connected to Blockchain.info WebSocket');
    // Subscribe to unconfirmed transactions
    blockchainWs.send('{"op":"unconfirmed_sub"}');
    // Subscribe to new blocks
    blockchainWs.send('{"op":"blocks_sub"}');
  });

  blockchainWs.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      const startTime = Date.now();
      
      if (message.op === 'utx') {
        // New unconfirmed transaction
        processBitcoinTransaction(message.x);
      } else if (message.op === 'block') {
        // New block
        processNewBlock(message.x);
      }
      
      // Update performance metrics
      performanceMetrics.dataProcessingTime = Date.now() - startTime;
      
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  });

  blockchainWs.on('error', (error) => {
    console.error('WebSocket error:', error);
    // Reconnect after 5 seconds
    setTimeout(startBitcoinMonitoring, 5000);
  });

  blockchainWs.on('close', () => {
    console.log('WebSocket connection closed, attempting to reconnect...');
    setTimeout(startBitcoinMonitoring, 5000);
  });

  // Fetch additional data every 10 seconds
  setInterval(fetchBitcoinStats, 10000);
  
  // Initial fetch
  fetchBitcoinStats();
}

// Process incoming Bitcoin transactions
function processBitcoinTransaction(tx) {
  const transaction = {
    id: tx.hash,
    hash: tx.hash,
    value: tx.out.reduce((sum, output) => sum + output.value, 0),
    fee: tx.fee || 0,
    size: tx.size,
    time: new Date(tx.time * 1000),
    inputs: tx.inputs?.length || 0,
    outputs: tx.out?.length || 0,
    addresses: {
      from: tx.inputs?.map(input => input.prev_out?.addr).filter(Boolean) || [],
      to: tx.out?.map(output => output.addr).filter(Boolean) || []
    },
    riskScore: calculateTransactionRisk(tx),
    priority: calculateTransactionPriority(tx)
  };

  // Add to transaction queue (keep last 1000 transactions)
  bitcoinTransactions.unshift(transaction);
  if (bitcoinTransactions.length > 1000) {
    bitcoinTransactions.pop();
  }

  // Update stats
  transactionStats.totalTransactions++;
  transactionStats.totalVolume += transaction.value;
  transactionStats.transactionsPerSecond = calculateTPS();

  // Emit real-time update to connected clients
  io.emit('bitcoin-transaction', {
    transaction,
    stats: transactionStats,
    performance: performanceMetrics
  });
}

// Process new Bitcoin blocks
function processNewBlock(block) {
  transactionStats.lastBlockHeight = block.height;
  transactionStats.lastBlockTime = new Date(block.time * 1000);
  
  io.emit('bitcoin-block', {
    height: block.height,
    hash: block.hash,
    time: new Date(block.time * 1000),
    txCount: block.n_tx,
    size: block.size
  });
}

// Calculate transaction risk score
function calculateTransactionRisk(tx) {
  let riskScore = 0;
  
  // High value transactions
  const totalValue = tx.out.reduce((sum, output) => sum + output.value, 0);
  if (totalValue > 10000000000) riskScore += 30; // > 100 BTC
  else if (totalValue > 1000000000) riskScore += 20; // > 10 BTC
  
  // Multiple inputs/outputs (mixing patterns)
  if (tx.inputs?.length > 10) riskScore += 15;
  if (tx.out?.length > 20) riskScore += 10;
  
  // Low fee (possible spam)
  if (tx.fee < 10000) riskScore += 25;
  
  // Round number outputs (suspicious)
  const roundOutputs = tx.out.filter(output => output.value % 100000000 === 0).length;
  riskScore += roundOutputs * 5;
  
  return Math.min(riskScore, 100);
}

// Calculate transaction priority for display
function calculateTransactionPriority(tx) {
  const value = tx.out.reduce((sum, output) => sum + output.value, 0);
  if (value > 50000000000) return 'CRITICAL'; // > 500 BTC
  if (value > 10000000000) return 'HIGH'; // > 100 BTC
  if (value > 1000000000) return 'MEDIUM'; // > 10 BTC
  return 'LOW';
}

// Calculate transactions per second
function calculateTPS() {
  const now = Date.now();
  const oneMinuteAgo = now - 60000;
  const recentTransactions = bitcoinTransactions.filter(tx => 
    new Date(tx.time).getTime() > oneMinuteAgo
  );
  return Math.round(recentTransactions.length / 60 * 10) / 10; // TPS with 1 decimal
}

// Fetch Bitcoin network statistics
async function fetchBitcoinStats() {
  const startTime = Date.now();
  
  try {
    // Fetch mempool info
    const mempoolResponse = await fetch(`${BITCOIN_APIS.MEMPOOL_SPACE}/mempool`);
    const mempoolData = await mempoolResponse.json();
    
    transactionStats.mempoolSize = mempoolData.count;
    transactionStats.avgFeeRate = mempoolData.avgFee_10;

    // Fetch latest block info
    const tipResponse = await fetch(`${BITCOIN_APIS.MEMPOOL_SPACE}/blocks/tip/height`);
    const tipHeight = await tipResponse.json();
    
    if (tipHeight > transactionStats.lastBlockHeight) {
      transactionStats.lastBlockHeight = tipHeight;
    }

    // Fetch network hashrate
    const hashrateResponse = await fetch(`${BITCOIN_APIS.MEMPOOL_SPACE}/v1/mining/hashrate/1d`);
    const hashrateData = await hashrateResponse.json();
    
    if (hashrateData && hashrateData.currentHashrate) {
      transactionStats.networkHashrate = hashrateData.currentHashrate;
    }

    performanceMetrics.apiLatency = Date.now() - startTime;
    
  } catch (error) {
    console.error('Error fetching Bitcoin stats:', error);
    performanceMetrics.apiLatency = Date.now() - startTime;
  }
}
  const threats = [];
  if (lastCycleResults && lastCycleResults.threatsDetected) {
    lastCycleResults.threatsDetected.forEach((threat, index) => {
      threats.push({
        id: index + 1,
        address: threat.address,
        riskScore: threat.riskScore || Math.floor(Math.random() * 100),
        severity: threat.severity || 'MEDIUM',
        category: threat.category || 'SUSPICIOUS',
        confidence: threat.confidence || Math.floor(Math.random() * 100),
        timestamp: threat.timestamp || new Date().toISOString(),
        status: threat.status || 'Active',
        description: threat.description || 'Suspicious activity detected'
      });
    });
  }
  
  // Add sample data if no real threats
  if (threats.length === 0) {
    threats.push({
      id: 1,
      address: 'ST2QKZ4FKHAH1NQKYKYAYZPY440FEPK7GZ1R5HBP2',
      riskScore: 85,
      severity: 'CRITICAL',
      category: 'PHISHING',
      confidence: 95,
      timestamp: new Date(Date.now() - 600000).toISOString(),
      status: 'Active',
      description: 'Multiple high-value transactions to suspicious addresses'
    });
  }
  
  res.json({ threats });
});

// Check address security
app.get('/api/check-address/:address', (req, res) => {
  const address = req.params.address;
  
  // Simulate address checking logic
  const isKnownThreat = address.includes('ST2QKZ') || address.includes('SCAMMER');
  const riskScore = isKnownThreat ? Math.floor(Math.random() * 40) : Math.floor(Math.random() * 30) + 70;
  
  res.json({
    address,
    safe: !isKnownThreat,
    score: riskScore,
    reports: isKnownThreat ? Math.floor(Math.random() * 10) + 1 : 0,
    threats: isKnownThreat ? ['PHISHING', 'FRAUD'] : [],
    lastChecked: new Date().toISOString()
  });
});

// Report threat
app.post('/api/report-threat', (req, res) => {
  const { address, reason, description, reporterAddress } = req.body;
  
  if (!address || !reason || !reporterAddress) {
    return res.status(400).json({ 
      error: 'Missing required fields: address, reason, reporterAddress' 
    });
  }
  
  // Store report (in real app, this would go to database)
  const report = {
    id: Date.now(),
    address,
    reason,
    description,
    reporterAddress,
    timestamp: new Date().toISOString(),
    status: 'Under Review'
  };
  
  console.log('🚨 New threat report received:', report);
  
  res.json({ 
    message: 'Threat report submitted successfully',
    reportId: report.id,
    status: 'Under Review'
  });
});

app.get('/api/activity', (req, res) => {
  const activity = [
    { action: 'Threat Analysis', address: 'ST2QKZ...BP2', time: '2 min ago', severity: 'HIGH' },
    { action: 'Cycle Complete', address: 'Multiple', time: '5 min ago', severity: 'LOW' },
    { action: 'Monitoring Active', address: 'Network', time: '8 min ago', severity: 'LOW' }
  ];
  
  if (lastCycleResults) {
    activity.unshift({
      action: `Analyzed ${lastCycleResults.processedAddresses || 0} addresses`,
      address: 'Network',
      time: 'Just now',
      severity: lastCycleResults.threatsDetected?.length > 0 ? 'HIGH' : 'LOW'
    });
  }
  
  res.json({ activity });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: isRunning ? 'Monitoring Active' : 'Standby',
    score: lastCycleResults ? 85 : 75,
    lastUpdate: lastCycleResults?.timestamp || new Date().toISOString()
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    service: 'StackGuard Monitor Service',
    time: new Date().toISOString(),
    lastCycle: lastCycleResults,
    isMonitoring: isRunning
  });
});

// Manual trigger
app.post('/run', async (req, res) => {
  if (isRunning) {
    return res.status(429).json({ 
      error: 'Monitoring cycle already in progress',
      message: 'Please wait for current cycle to complete'
    });
  }

  try {
    isRunning = true;
    const results = await monitorCycle();
    lastCycleResults = { ...results, timestamp: new Date().toISOString() };
    cycleHistory.unshift(lastCycleResults);

    // Keep only last 10 cycles
    if (cycleHistory.length > 10) {
      cycleHistory = cycleHistory.slice(0, 10);
    }

    res.json({ 
      result: 'Cycle completed successfully',
      data: lastCycleResults
    });
  } catch (error) {
    console.error('❌ Manual cycle failed:', error);
    res.status(500).json({ 
      error: 'Cycle failed',
      message: error.message
    });
  } finally {
    isRunning = false;
  }
});

// Get cycle history
app.get('/history', (req, res) => {
  res.json({
    history: cycleHistory,
    totalCycles: cycleHistory.length
  });
});

// Get current status
app.get('/status', (req, res) => {
  res.json({
    isRunning,
    lastCycle: lastCycleResults,
    totalCycles: cycleHistory.length,
    uptime: process.uptime(),
    environment: {
      hasPrivateKey: !!process.env.AI_SERVICE_PRIVATE_KEY,
      hasContractAddress: !!process.env.CONTRACT_ADDRESS,
      hasAIEndpoint: !!process.env.AI_API_ENDPOINT
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🛡️ StackGuard Autonomous Monitor Service',
    version: '1.0.0',
    description: 'AI-powered blockchain threat detection and on-chain reporting',
    endpoints: {
      health: 'GET /health',
      status: 'GET /status', 
      runCycle: 'POST /run',
      history: 'GET /history'
    }
  });
});

// Start service and automatic cycles
const PORT = process.env.PORT || 4000;
const CYCLE_INTERVAL = parseInt(process.env.CYCLE_INTERVAL) || 120000; // 2 minutes

app.listen(PORT, async () => {
  console.log(`🛡️  StackGuard Monitor Service starting...`);
  console.log(`🌐 Server listening on http://localhost:${PORT}`);
  console.log(`⚡ Cycle interval: ${CYCLE_INTERVAL / 1000} seconds`);

  // Validate environment
  if (!process.env.AI_SERVICE_PRIVATE_KEY || !process.env.CONTRACT_ADDRESS || !process.env.AI_API_ENDPOINT) {
    console.log('⚠️  Warning: Missing required environment variables');
    console.log('💡 Please check your .env file');
  } else {
    console.log('✅ Environment variables configured');

    // Run first cycle after 5 seconds
    setTimeout(async () => {
      try {
        isRunning = true;
        console.log('🚀 Starting initial monitoring cycle...');
        const results = await monitorCycle();
        lastCycleResults = { ...results, timestamp: new Date().toISOString() };
        cycleHistory.unshift(lastCycleResults);

        // Schedule recurring cycles
        setInterval(async () => {
          if (!isRunning) {
            try {
              isRunning = true;
              const results = await monitorCycle();
              lastCycleResults = { ...results, timestamp: new Date().toISOString() };
              cycleHistory.unshift(lastCycleResults);

              if (cycleHistory.length > 10) {
                cycleHistory = cycleHistory.slice(0, 10);
              }
            } catch (error) {
              console.error('❌ Scheduled cycle failed:', error);
            } finally {
              isRunning = false;
            }
          }
        }, CYCLE_INTERVAL);

      } catch (error) {
        console.error('❌ Initial cycle failed:', error);
      } finally {
        isRunning = false;
      }
    }, 5000);
  }
});
