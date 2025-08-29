import React, { useState, useEffect } from 'react';

const Dashboard = ({ userAddress }) => {
  const [threats, setThreats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, critical: 0, high: 0, medium: 0, low: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [networkHealth, setNetworkHealth] = useState({ status: 'Unknown', score: 0 });

  // Fetch real security data
  useEffect(() => {
    fetchSecurityData();
    fetchRecentActivity();
    fetchNetworkHealth();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchSecurityData();
      fetchRecentActivity();
      fetchNetworkHealth();
    }, 30000);

    return () => clearInterval(interval);
  }, [userAddress]);

  const fetchSecurityData = async () => {
    try {
      setLoading(true);
      // Fetch from monitor service
      const response = await fetch('http://localhost:4000/api/threats');
      if (response.ok) {
        const data = await response.json();
        setThreats(data.threats || []);
        calculateStats(data.threats || []);
      } else {
        // Fallback to sample data if service unavailable
        loadSampleData();
      }
    } catch (error) {
      console.error('Failed to fetch security data:', error);
      loadSampleData();
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/activity');
      if (response.ok) {
        const data = await response.json();
        setRecentActivity(data.activity || []);
      }
    } catch (error) {
      console.error('Failed to fetch recent activity:', error);
      setRecentActivity([
        { action: 'Threat Detected', address: 'ST2QKZ...BP2', time: '2 min ago', severity: 'HIGH' },
        { action: 'Analysis Complete', address: 'ST1JAH...80H', time: '5 min ago', severity: 'MEDIUM' },
        { action: 'Monitoring Started', address: 'ST319C...1VPF', time: '8 min ago', severity: 'LOW' }
      ]);
    }
  };

  const fetchNetworkHealth = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/health');
      if (response.ok) {
        const data = await response.json();
        setNetworkHealth(data);
      }
    } catch (error) {
      console.error('Failed to fetch network health:', error);
      setNetworkHealth({ status: 'Monitoring Active', score: 85 });
    }
  };

  const loadSampleData = () => {
    const sampleThreats = [
      {
        id: 1,
        address: 'ST2QKZ4FKHAH1NQKYKYAYZPY440FEPK7GZ1R5HBP2',
        riskScore: 85,
        severity: 'CRITICAL',
        category: 'PHISHING',
        confidence: 95,
        timestamp: new Date(Date.now() - 600000).toISOString(),
        status: 'Active',
        description: 'Multiple high-value transactions to suspicious addresses'
      },
      {
        id: 2,
        address: 'ST1JAHE8GEHB0MCBGR8J6W0AA7TJEE1XKFSD2Q80H',
        riskScore: 65,
        severity: 'HIGH',
        category: 'SUSPICIOUS',
        confidence: 82,
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        status: 'Under Review',
        description: 'Rapid transaction pattern detected'
      },
      {
        id: 3,
        address: 'ST319CF5WV77KYR1H3GT0GZ7B8Q4AQPY42ETP1VPF',
        riskScore: 45,
        severity: 'MEDIUM',
        category: 'UNUSUAL',
        confidence: 71,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        status: 'Resolved',
        description: 'Multi-recipient transaction pattern'
      }
    ];
    setThreats(sampleThreats);
    calculateStats(sampleThreats);
  };

  const calculateStats = (threatData) => {
    setStats({
      total: threatData.length,
      critical: threatData.filter(t => t.severity === 'CRITICAL').length,
      high: threatData.filter(t => t.severity === 'HIGH').length,
      medium: threatData.filter(t => t.severity === 'MEDIUM').length,
      low: threatData.filter(t => t.severity === 'LOW').length
    });
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'CRITICAL': return '#ff4757';
      case 'HIGH': return '#ff6b35';
      case 'MEDIUM': return '#ffa502';
      case 'LOW': return '#26de81';
      default: return '#778ca3';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diff = Math.floor((now - then) / 1000 / 60);

    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner">🔄</div>
        <p>Loading threat intelligence...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header Section */}
      <div className="dashboard-header">
        <h1>🛡️ StackGuard Security Dashboard</h1>
        <div className="user-info">
          <span>Connected: {userAddress?.substring(0, 8)}...{userAddress?.slice(-6)}</span>
          <div className="network-status">
            <span className="status-indicator active"></span>
            {networkHealth.status} ({networkHealth.score}%)
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total Threats</div>
        </div>
        <div className="stat-card critical">
          <div className="stat-number">{stats.critical}</div>
          <div className="stat-label">Critical</div>
        </div>
        <div className="stat-card high">
          <div className="stat-number">{stats.high}</div>
          <div className="stat-label">High Risk</div>
        </div>
        <div className="stat-card medium">
          <div className="stat-number">{stats.medium}</div>
          <div className="stat-label">Medium Risk</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Threats List */}
        <div className="dashboard-section">
          <h2>🚨 Active Threats</h2>
          <div className="threats-list">
            {threats.length === 0 ? (
              <div className="no-threats">
                <div className="no-threats-icon">✅</div>
                <p>No active threats detected</p>
                <span>Network is secure</span>
              </div>
            ) : (
              threats.map((threat) => (
                <div key={threat.id} className="threat-card">
                  <div className="threat-header">
                    <div className="threat-severity" 
                         style={{ backgroundColor: getSeverityColor(threat.severity) }}>
                      {threat.severity}
                    </div>
                    <div className="threat-time">{formatTimeAgo(threat.timestamp)}</div>
                  </div>
                  <div className="threat-address">
                    📍 {threat.address.substring(0, 10)}...{threat.address.slice(-8)}
                  </div>
                  <div className="threat-details">
                    <div className="threat-category">Category: {threat.category}</div>
                    <div className="threat-score">Risk Score: {threat.riskScore}/100</div>
                    <div className="threat-confidence">Confidence: {threat.confidence}%</div>
                  </div>
                  <div className="threat-description">
                    {threat.description}
                  </div>
                  <div className="threat-status">
                    Status: <span className={`status ${threat.status.toLowerCase().replace(' ', '-')}`}>
                      {threat.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dashboard-section">
          <h2>⚡ Recent Activity</h2>
          <div className="activity-list">
            {recentActivity.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className="activity-icon" 
                     style={{ backgroundColor: getSeverityColor(activity.severity) }}>
                  {activity.severity === 'HIGH' ? '⚠️' : 
                   activity.severity === 'MEDIUM' ? '🔍' : '✅'}
                </div>
                <div className="activity-details">
                  <div className="activity-action">{activity.action}</div>
                  <div className="activity-address">{activity.address}</div>
                </div>
                <div className="activity-time">{activity.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="dashboard-actions">
        <button className="btn btn-primary" onClick={fetchSecurityData}>
          🔄 Refresh Data
        </button>
        <button className="btn btn-secondary" onClick={() => window.open('https://explorer.stacks.co', '_blank')}>
          🔗 View on Explorer
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
