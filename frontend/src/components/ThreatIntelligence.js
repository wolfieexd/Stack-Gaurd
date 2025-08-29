import React, { useState, useEffect } from 'react';
import { 
  getThreatReport, 
  getTotalReports, 
  getRecentReports,
  checkAddressSecurity,
  getRiskLevel,
  formatAddress,
  formatTimestamp,
  isValidStacksAddress
} from '../utils/smartContract';

const ThreatIntelligence = ({ connected, userAddress }) => {
  const [searchAddress, setSearchAddress] = useState('');
  const [threatReport, setThreatReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [totalReports, setTotalReports] = useState(0);
  const [recentReports, setRecentReports] = useState([]);
  const [searchError, setSearchError] = useState('');

  // Load initial data
  useEffect(() => {
    if (connected) {
      loadTotalReports();
      loadRecentReports();
    }
  }, [connected]);

  const loadTotalReports = async () => {
    try {
      const total = await getTotalReports(userAddress);
      setTotalReports(total);
    } catch (error) {
      console.error('Error loading total reports:', error);
    }
  };

  const loadRecentReports = async () => {
    try {
      const reports = await getRecentReports(5, userAddress);
      setRecentReports(reports);
    } catch (error) {
      console.error('Error loading recent reports:', error);
    }
  };

  const searchThreatReport = async (address) => {
    if (!address) {
      setSearchError('Please enter a valid Stacks address');
      return;
    }

    setLoading(true);
    setSearchError('');
    setThreatReport(null);

    try {
      // Validate address format
      if (!isValidStacksAddress(address)) {
        throw new Error('Invalid Stacks address format. Address must start with SP or ST.');
      }

      const securityStatus = await checkAddressSecurity(address, userAddress);
      
      if (securityStatus.error) {
        throw new Error(securityStatus.message);
      }

      setThreatReport({
        address,
        ...securityStatus
      });
    } catch (error) {
      console.error('Error searching threat report:', error);
      setSearchError(`Error searching address: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchThreatReport(searchAddress);
  };

  // Remove the local getRiskLevel, formatAddress, formatTimestamp functions since they're imported from utils

  if (!connected) {
    return (
      <div className="threat-intelligence-disconnected">
        <h2>🛡️ Threat Intelligence Dashboard</h2>
        <p>Connect your wallet to access the threat intelligence dashboard and search for malicious addresses.</p>
      </div>
    );
  }

  return (
    <div className="threat-intelligence-dashboard">
      <h2>🛡️ Threat Intelligence Dashboard</h2>
      
      {/* Demo Mode Banner */}
      <div className="demo-banner">
        ℹ️ <strong>Demo Mode:</strong> Showing sample threat intelligence data. 
        Deploy the smart contract to mainnet/testnet for live data.
      </div>
      
      {/* Address Search Section */}
      <div className="address-search-section">
        <h3>🔍 Address Lookup</h3>
        <p>Search for threat intelligence on any Stacks address</p>
        
        {/* Sample Addresses for Demo */}
        <div className="sample-addresses">
          <p><strong>Try these sample addresses:</strong></p>
          <div className="sample-address-buttons">
            <button 
              className="sample-button malicious"
              onClick={() => setSearchAddress('ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5')}
            >
              🚨 Malicious (Critical)
            </button>
            <button 
              className="sample-button high-risk"
              onClick={() => setSearchAddress('ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG')}
            >
              ⚠️ High Risk (Phishing)
            </button>
            <button 
              className="sample-button medium-risk"
              onClick={() => setSearchAddress('ST3PF13W7Z0RRM42A8VZRVFQ75SV1K26RXEP8YKTY')}
            >
              🔶 Medium Risk
            </button>
            <button 
              className="sample-button clean"
              onClick={() => setSearchAddress('ST1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE')}
            >
              ✅ Clean Address
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-group">
            <input
              type="text"
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              placeholder="Enter Stacks address (SP... or ST...)"
              className="search-input"
              disabled={loading}
            />
            <button 
              type="submit" 
              className="search-button"
              disabled={loading || !searchAddress}
            >
              {loading ? '🔄' : '🔍'} Search
            </button>
          </div>
        </form>

        {searchError && (
          <div className="search-error">
            ⚠️ {searchError}
          </div>
        )}

        {/* Search Results */}
        {threatReport && (
          <div className="threat-report-result">
            <h4>Security Report for {formatAddress(threatReport.address)}</h4>
            
            {threatReport.clean ? (
              <div className="clean-address">
                <div className="status-badge clean">
                  ✅ CLEAN
                </div>
                <p>{threatReport.message}</p>
              </div>
            ) : (
              <div className="threat-detected">
                <div 
                  className="status-badge threat"
                  style={{ 
                    backgroundColor: getRiskLevel(threatReport['risk-score']).bg,
                    color: getRiskLevel(threatReport['risk-score']).color,
                    border: `2px solid ${getRiskLevel(threatReport['risk-score']).color}`
                  }}
                >
                  ⚠️ {getRiskLevel(threatReport['risk-score']).level} RISK
                </div>
                
                <div className="threat-details">
                  <div className="detail-item">
                    <strong>Risk Score:</strong> {threatReport['risk-score']}/10
                  </div>
                  <div className="detail-item">
                    <strong>Severity:</strong> {threatReport.severity}
                  </div>
                  <div className="detail-item">
                    <strong>Threat Category:</strong> {threatReport['threat-category']}
                  </div>
                  <div className="detail-item">
                    <strong>Confidence:</strong> {threatReport['confidence-level']}%
                  </div>
                  <div className="detail-item">
                    <strong>Reported:</strong> Block #{threatReport['reported-at']} ({formatTimestamp(threatReport['reported-at'])})
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dashboard Stats */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-number">{totalReports}</div>
          <div className="stat-label">Total Threats Reported</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{recentReports.length}</div>
          <div className="stat-label">Recent Reports</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">🟢</div>
          <div className="stat-label">System Active</div>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="recent-reports-section">
        <h3>📊 Recent Threat Reports</h3>
        
        {recentReports.length === 0 ? (
          <div className="no-reports">
            <p>No recent threat reports available.</p>
          </div>
        ) : (
          <div className="reports-list">
            {recentReports.map((report) => (
              <div key={report.id} className="report-item">
                <div className="report-header">
                  <span className="report-id">#{report.id}</span>
                  <span 
                    className="risk-badge"
                    style={{ 
                      backgroundColor: getRiskLevel(report['risk-score']).bg,
                      color: getRiskLevel(report['risk-score']).color
                    }}
                  >
                    Risk: {report['risk-score']}/10
                  </span>
                </div>
                
                <div className="report-content">
                  <div className="report-address">
                    <strong>Address:</strong> {formatAddress(report['target-address'])}
                  </div>
                  <div className="report-details">
                    <span><strong>Category:</strong> {report['threat-category']}</span>
                    <span><strong>Severity:</strong> {report.severity}</span>
                    <span><strong>Confidence:</strong> {report['confidence-level']}%</span>
                  </div>
                  <div className="report-timestamp">
                    Block #{report['reported-at']} • {formatTimestamp(report['reported-at'])}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Refresh Button */}
      <div className="dashboard-actions">
        <button 
          onClick={() => { loadTotalReports(); loadRecentReports(); }}
          className="refresh-button"
        >
          🔄 Refresh Data
        </button>
      </div>
    </div>
  );
};

export default ThreatIntelligence;
