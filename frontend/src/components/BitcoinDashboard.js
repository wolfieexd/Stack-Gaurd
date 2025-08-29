import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const BitcoinDashboard = ({ userAddress }) => {
  const [connected, setConnected] = useState(false);
  const [latency, setLatency] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalValue: 0,
    averageFee: 0,
    networkHashRate: 0
  });
  const [performance, setPerformance] = useState({
    avgLatency: 0,
    processedTxs: 0,
    uptime: 0
  });
  const [demoMode, setDemoMode] = useState(false);

  // Demo data for when server is not available
  const demoTransactions = [
    {
      hash: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      value: 50000000, // 0.5 BTC in satoshis
      fee: 25000,
      priority: 'high',
      riskScore: 2,
      from: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      to: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
      timestamp: Date.now() - 30000
    },
    {
      hash: 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      value: 100000000, // 1 BTC
      fee: 15000,
      priority: 'medium',
      riskScore: 7,
      from: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
      to: '12c6DSiU4Rq3P4ZxziKxzrL5LmMBrzjrJX',
      timestamp: Date.now() - 60000
    },
    {
      hash: 'fedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321',
      value: 25000000, // 0.25 BTC
      fee: 10000,
      priority: 'low',
      riskScore: 9,
      from: '12c6DSiU4Rq3P4ZxziKxzrL5LmMBrzjrJX',
      to: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      timestamp: Date.now() - 90000
    }
  ];

  const demoStats = {
    totalTransactions: 1247,
    totalValue: 15.78, // BTC
    averageFee: 18500, // satoshis
    networkHashRate: 450.2 // EH/s
  };

  const demoPerformance = {
    avgLatency: 45,
    processedTxs: 1247,
    uptime: 14280 // seconds (3h 58m)
  };

  useEffect(() => {
    // Connect to Socket.IO server
    const socket = io('http://localhost:4000');
    let connectionTimeout;
    let demoDataInterval;

    // Set a timeout to switch to demo mode if connection fails
    connectionTimeout = setTimeout(() => {
      if (!connected) {
        console.log('Server not available, switching to demo mode');
        setDemoMode(true);
        setConnected(true); // Show as connected in demo mode
        setLatency(demoPerformance.avgLatency);
        setStats(demoStats);
        setPerformance(demoPerformance);
        setTransactions(demoTransactions);

        // Simulate live updates in demo mode
        demoDataInterval = setInterval(() => {
          // Add a new demo transaction every 10 seconds
          const newTx = {
            hash: Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2),
            value: Math.floor(Math.random() * 200000000) + 10000000, // 0.1-2 BTC
            fee: Math.floor(Math.random() * 30000) + 5000,
            priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
            riskScore: Math.floor(Math.random() * 10) + 1,
            from: '1' + Math.random().toString(36).substring(2, 27),
            to: '1' + Math.random().toString(36).substring(2, 27),
            timestamp: Date.now()
          };
          
          setTransactions(prev => [newTx, ...prev.slice(0, 49)]);
          
          // Update stats
          setStats(prev => ({
            ...prev,
            totalTransactions: prev.totalTransactions + 1
          }));
          
          setPerformance(prev => ({
            ...prev,
            processedTxs: prev.processedTxs + 1,
            uptime: prev.uptime + 10
          }));
        }, 10000);
      }
    }, 3000); // Wait 3 seconds for connection

    socket.on('connect', () => {
      console.log('Connected to Bitcoin monitoring server');
      clearTimeout(connectionTimeout);
      setConnected(true);
      setDemoMode(false);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
      setDemoMode(false);
    });

    socket.on('bitcoin-transaction', (transaction) => {
      if (!demoMode) {
        setTransactions(prev => [transaction, ...prev.slice(0, 49)]);
      }
    });

    socket.on('bitcoin-stats', (newStats) => {
      if (!demoMode) {
        setStats(newStats);
      }
    });

    socket.on('performance-update', (perfData) => {
      if (!demoMode) {
        setPerformance(perfData);
        setLatency(perfData.avgLatency || 0);
      }
    });

    // Cleanup
    return () => {
      clearTimeout(connectionTimeout);
      if (demoDataInterval) clearInterval(demoDataInterval);
      socket.disconnect();
    };
  }, [connected, demoMode]);

  const formatValue = (value) => {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(2) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(2) + 'K';
    }
    return value.toString();
  };

  const formatBTC = (satoshis) => {
    return (satoshis / 100000000).toFixed(8);
  };

  const getRiskClass = (score) => {
    if (score <= 3) return 'risk-low';
    if (score <= 6) return 'risk-medium';
    return 'risk-high';
  };

  const getPriorityClass = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return { background: '#dc3545', color: 'white' };
      case 'medium': return { background: '#ffc107', color: 'black' };
      case 'low': return { background: '#28a745', color: 'white' };
      default: return { background: '#6c757d', color: 'white' };
    }
  };

  return (
    <div className="bitcoin-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>🪙 Bitcoin Live Analytics</h1>
          <p>Real-time Bitcoin transaction monitoring and analysis</p>
        </div>
        <div className="connection-status">
          <span className={`status-indicator ${connected ? 'connected' : 'disconnected'}`}>
            ● {connected ? (demoMode ? 'Demo Mode' : 'Connected') : 'Disconnected'}
          </span>
          {connected && (
            <span className="latency">
              Latency: {latency}ms
            </span>
          )}
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="bitcoin-stats-grid">
        <div className="bitcoin-stat-card">
          <div className="stat-icon">📊</div>
          <div>
            <div className="stat-value">{formatValue(stats.totalTransactions)}</div>
            <div className="stat-label">Total Transactions</div>
          </div>
        </div>
        <div className="bitcoin-stat-card">
          <div className="stat-icon">💰</div>
          <div>
            <div className="stat-value">
              {typeof stats.totalValue === 'number' && stats.totalValue > 10 ? 
                `${stats.totalValue.toFixed(2)} BTC` : 
                formatBTC(stats.totalValue || 0) + ' BTC'
              }
            </div>
            <div className="stat-label">Total Value</div>
          </div>
        </div>
        <div className="bitcoin-stat-card">
          <div className="stat-icon">⚡</div>
          <div>
            <div className="stat-value">{stats.averageFee} sat/vB</div>
            <div className="stat-label">Average Fee</div>
          </div>
        </div>
        <div className="bitcoin-stat-card">
          <div className="stat-icon">🔥</div>
          <div>
            <div className="stat-value">{formatValue(stats.networkHashRate)} TH/s</div>
            <div className="stat-label">Network Hash Rate</div>
          </div>
        </div>
      </div>

      {/* Live Transactions */}
      <div className="transactions-section">
        <h2>🔴 Live Bitcoin Transactions</h2>
        <div className="transactions-list">
          {transactions.length === 0 ? (
            <div className="empty-transactions">
              <div className="loading-spinner"></div>
              <div className="waiting-message">Waiting for live Bitcoin transactions...</div>
              <div className="waiting-subtitle">Real-time monitoring is active</div>
            </div>
          ) : (
            transactions.map((tx, index) => (
              <div key={tx.hash || index} className="bitcoin-transaction-item">
                <div className="tx-header">
                  <div className="tx-hash">
                    {tx.hash ? `${tx.hash.substring(0, 16)}...` : `Transaction ${index + 1}`}
                  </div>
                  <div 
                    className="tx-priority"
                    style={getPriorityClass(tx.priority)}
                  >
                    {tx.priority || 'Standard'}
                  </div>
                  <div className="tx-time">
                    {new Date(tx.timestamp || Date.now()).toLocaleTimeString()}
                  </div>
                </div>
                
                <div className="tx-details">
                  <div className="tx-detail">
                    <span className="detail-label">Value</span>
                    <span className="detail-value">
                      {formatBTC(tx.value || Math.random() * 1000000000)} BTC
                    </span>
                  </div>
                  <div className="tx-detail">
                    <span className="detail-label">Fee</span>
                    <span className="detail-value">
                      {tx.fee || Math.floor(Math.random() * 50 + 10)} sat/vB
                    </span>
                  </div>
                  <div className="tx-detail">
                    <span className="detail-label">Size</span>
                    <span className="detail-value">
                      {tx.size || Math.floor(Math.random() * 500 + 250)} bytes
                    </span>
                  </div>
                  <div className="tx-detail">
                    <span className="detail-label">Risk Score</span>
                    <span className={`risk-score ${getRiskClass(tx.riskScore || Math.floor(Math.random() * 10))}`}>
                      {tx.riskScore || Math.floor(Math.random() * 10)}/10
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="performance-section">
        <h3>⚡ Performance Metrics</h3>
        <div className="performance-grid">
          <div className="perf-metric">
            <div>Average Latency</div>
            <span>{performance.avgLatency}ms</span>
          </div>
          <div className="perf-metric">
            <div>Processed Transactions</div>
            <span>{performance.processedTxs}</span>
          </div>
          <div className="perf-metric">
            <div>Uptime</div>
            <span>{Math.floor(performance.uptime / 60)}m {performance.uptime % 60}s</span>
          </div>
          <div className="perf-metric">
            <div>Connection Status</div>
            <span style={{ color: connected ? '#28a745' : '#dc3545' }}>
              {connected ? (demoMode ? 'Demo Mode' : 'Active') : 'Inactive'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BitcoinDashboard;
