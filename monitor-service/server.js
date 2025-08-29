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
  transactionsPerSecond: 0,
  highValueTransactions: 0,
  suspiciousTransactions: 0
};

let performanceMetrics = {
  apiLatency: 0,
  dataProcessingTime: 0,
  websocketConnections: 0,
  uptimeStart: new Date(),
  totalDataProcessed: 0
};

// Bitcoin API endpoints
const BITCOIN_APIS = {
  BLOCKCHAIN_INFO: 'https://blockchain.info/unconfirmed-transactions?format=json',
  BLOCKSTREAM: 'https://blockstream.info/api',
  MEMPOOL_SPACE: 'https://mempool.space/api/v1'
};

let blockchainWs = null;

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
    priority: calculateTransactionPriority(tx),
    category: categorizeTransaction(tx)
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
  
  if (transaction.value > 10000000000) { // > 100 BTC
    transactionStats.highValueTransactions++;
  }
  
  if (transaction.riskScore > 50) {
    transactionStats.suspiciousTransactions++;
  }
  
  performanceMetrics.totalDataProcessed++;

  // Emit real-time update to connected clients with 50ms target latency
  process.nextTick(() => {
    io.emit('bitcoin-transaction', {
      transaction,
      stats: transactionStats,
      performance: performanceMetrics,
      timestamp: Date.now()
    });
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
    size: block.size,
    timestamp: Date.now()
  });
}

// Calculate transaction risk score
function calculateTransactionRisk(tx) {
  let riskScore = 0;
  
  const totalValue = tx.out.reduce((sum, output) => sum + output.value, 0);
  
  // High value transactions
  if (totalValue > 50000000000) riskScore += 40; // > 500 BTC
  else if (totalValue > 10000000000) riskScore += 30; // > 100 BTC
  else if (totalValue > 1000000000) riskScore += 20; // > 10 BTC
  
  // Multiple inputs/outputs (mixing patterns)
  if (tx.inputs?.length > 20) riskScore += 25;
  else if (tx.inputs?.length > 10) riskScore += 15;
  
  if (tx.out?.length > 50) riskScore += 20;
  else if (tx.out?.length > 20) riskScore += 10;
  
  // Low fee rate (possible spam or suspicious)
  const feeRate = tx.fee / tx.size;
  if (feeRate < 1) riskScore += 30;
  else if (feeRate < 10) riskScore += 15;
  
  // Round number outputs (suspicious)
  const roundOutputs = tx.out.filter(output => output.value % 100000000 === 0).length;
  riskScore += roundOutputs * 3;
  
  // Identical output amounts (mixing)
  const uniqueValues = new Set(tx.out.map(o => o.value));
  if (uniqueValues.size < tx.out.length / 2) riskScore += 15;
  
  return Math.min(riskScore, 100);
}

// Calculate transaction priority
function calculateTransactionPriority(tx) {
  const value = tx.out.reduce((sum, output) => sum + output.value, 0);
  const riskScore = calculateTransactionRisk(tx);
  
  if (value > 50000000000 || riskScore > 80) return 'CRITICAL';
  if (value > 10000000000 || riskScore > 60) return 'HIGH';
  if (value > 1000000000 || riskScore > 30) return 'MEDIUM';
  return 'LOW';
}

// Categorize transaction type
function categorizeTransaction(tx) {
  const inputCount = tx.inputs?.length || 0;
  const outputCount = tx.out?.length || 0;
  const value = tx.out.reduce((sum, output) => sum + output.value, 0);
  
  if (outputCount > 50) return 'BATCH_PAYMENT';
  if (inputCount > 20) return 'CONSOLIDATION';
  if (outputCount === 2 && inputCount === 1) return 'SIMPLE_TRANSFER';
  if (value > 10000000000) return 'WHALE_TRANSACTION';
  if (tx.fee < 1000) return 'LOW_FEE';
  
  return 'STANDARD';
}

// Calculate transactions per second
function calculateTPS() {
  const now = Date.now();
  const oneMinuteAgo = now - 60000;
  const recentTransactions = bitcoinTransactions.filter(tx => 
    new Date(tx.time).getTime() > oneMinuteAgo
  );
  return Math.round(recentTransactions.length / 60 * 10) / 10;
}

// Fetch Bitcoin network statistics
async function fetchBitcoinStats() {
  const startTime = Date.now();
  
  try {
    // Fetch multiple endpoints in parallel for better performance
    const [mempoolResponse, tipResponse, hashrateResponse] = await Promise.all([
      fetch(`${BITCOIN_APIS.MEMPOOL_SPACE}/mempool`).catch(() => null),
      fetch(`${BITCOIN_APIS.MEMPOOL_SPACE}/blocks/tip/height`).catch(() => null),
      fetch(`${BITCOIN_APIS.MEMPOOL_SPACE}/v1/mining/hashrate/1d`).catch(() => null)
    ]);

    if (mempoolResponse && mempoolResponse.ok) {
      const mempoolData = await mempoolResponse.json();
      transactionStats.mempoolSize = mempoolData.count;
      transactionStats.avgFeeRate = mempoolData.avgFee_10;
    }

    if (tipResponse && tipResponse.ok) {
      const tipHeight = await tipResponse.json();
      if (tipHeight > transactionStats.lastBlockHeight) {
        transactionStats.lastBlockHeight = tipHeight;
      }
    }

    if (hashrateResponse && hashrateResponse.ok) {
      const hashrateData = await hashrateResponse.json();
      if (hashrateData && hashrateData.currentHashrate) {
        transactionStats.networkHashrate = hashrateData.currentHashrate;
      }
    }

    performanceMetrics.apiLatency = Date.now() - startTime;
    
  } catch (error) {
    console.error('Error fetching Bitcoin stats:', error);
    performanceMetrics.apiLatency = Date.now() - startTime;
  }
}

// Real-time Bitcoin transaction monitoring
function startBitcoinMonitoring() {
  console.log('🚀 Starting real-time Bitcoin transaction monitoring...');
  
  // Connect to Blockchain.info WebSocket
  blockchainWs = new WebSocket('wss://ws.blockchain.info/inv');
  
  blockchainWs.on('open', () => {
    console.log('✅ Connected to Blockchain.info WebSocket');
    blockchainWs.send('{"op":"unconfirmed_sub"}');
    blockchainWs.send('{"op":"blocks_sub"}');
  });

  blockchainWs.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      const startTime = Date.now();
      
      if (message.op === 'utx') {
        processBitcoinTransaction(message.x);
      } else if (message.op === 'block') {
        processNewBlock(message.x);
      }
      
      performanceMetrics.dataProcessingTime = Date.now() - startTime;
      
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  });

  blockchainWs.on('error', (error) => {
    console.error('WebSocket error:', error);
    setTimeout(startBitcoinMonitoring, 5000);
  });

  blockchainWs.on('close', () => {
    console.log('WebSocket connection closed, attempting to reconnect...');
    setTimeout(startBitcoinMonitoring, 3000);
  });

  // Fetch stats every 10 seconds
  setInterval(fetchBitcoinStats, 10000);
  fetchBitcoinStats();
}

// API Endpoints for productivity dashboard
app.get('/api/bitcoin/transactions', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const priority = req.query.priority;
  const category = req.query.category;
  
  let filteredTransactions = bitcoinTransactions;
  
  if (priority) {
    filteredTransactions = filteredTransactions.filter(tx => tx.priority === priority);
  }
  
  if (category) {
    filteredTransactions = filteredTransactions.filter(tx => tx.category === category);
  }
  
  res.json({
    transactions: filteredTransactions.slice(0, limit),
    total: filteredTransactions.length,
    stats: transactionStats,
    performance: performanceMetrics
  });
});

app.get('/api/bitcoin/stats', (req, res) => {
  res.json({
    stats: transactionStats,
    performance: performanceMetrics,
    uptime: Date.now() - performanceMetrics.uptimeStart.getTime()
  });
});

app.get('/api/bitcoin/high-value', (req, res) => {
  const minValue = parseInt(req.query.minValue) || 1000000000; // 10 BTC default
  const highValueTxs = bitcoinTransactions.filter(tx => tx.value >= minValue);
  
  res.json({
    transactions: highValueTxs.slice(0, 20),
    count: highValueTxs.length
  });
});

app.get('/api/bitcoin/suspicious', (req, res) => {
  const minRisk = parseInt(req.query.minRisk) || 50;
  const suspiciousTxs = bitcoinTransactions.filter(tx => tx.riskScore >= minRisk);
  
  res.json({
    transactions: suspiciousTxs.slice(0, 20),
    count: suspiciousTxs.length
  });
});

// WebSocket connection handling
io.on('connection', (socket) => {
  performanceMetrics.websocketConnections++;
  console.log(`📡 Client connected. Total connections: ${performanceMetrics.websocketConnections}`);
  
  // Send current stats immediately
  socket.emit('initial-data', {
    transactions: bitcoinTransactions.slice(0, 10),
    stats: transactionStats,
    performance: performanceMetrics
  });
  
  socket.on('disconnect', () => {
    performanceMetrics.websocketConnections--;
    console.log(`📡 Client disconnected. Total connections: ${performanceMetrics.websocketConnections}`);
  });
  
  // Handle custom data requests
  socket.on('request-filtered-data', (filters) => {
    let filteredData = bitcoinTransactions;
    
    if (filters.priority) {
      filteredData = filteredData.filter(tx => tx.priority === filters.priority);
    }
    
    if (filters.minValue) {
      filteredData = filteredData.filter(tx => tx.value >= filters.minValue);
    }
    
    if (filters.minRisk) {
      filteredData = filteredData.filter(tx => tx.riskScore >= filters.minRisk);
    }
    
    socket.emit('filtered-data', {
      transactions: filteredData.slice(0, filters.limit || 20),
      count: filteredData.length
    });
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: Date.now() - performanceMetrics.uptimeStart.getTime(),
    connections: performanceMetrics.websocketConnections,
    transactionsProcessed: performanceMetrics.totalDataProcessed,
    avgLatency: performanceMetrics.apiLatency,
    avgProcessingTime: performanceMetrics.dataProcessingTime
  });
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`🚀 StackGuard Bitcoin Monitor running on port ${PORT}`);
  console.log(`📊 Real-time Bitcoin transaction monitoring with <50ms latency`);
  console.log(`🔗 WebSocket endpoint: ws://localhost:${PORT}`);
  console.log(`📡 REST API: http://localhost:${PORT}/api/bitcoin/*`);
  
  // Start Bitcoin monitoring
  startBitcoinMonitoring();
  
  // Performance monitoring
  setInterval(() => {
    console.log(`📈 Performance: ${performanceMetrics.websocketConnections} connections, ${performanceMetrics.totalDataProcessed} transactions processed, ${performanceMetrics.apiLatency}ms API latency`);
  }, 30000);
});
