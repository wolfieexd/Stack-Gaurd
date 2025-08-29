import React, { useState } from 'react';
import ConnectWallet from './components/ConnectWallet';
import BitcoinDashboard from './components/BitcoinDashboard';
import ThreatIntelligence from './components/ThreatIntelligence';
import CommunityReporting from './components/CommunityReporting';
import AddressSecurityChecker from './components/AddressSecurityChecker';
import EnhancedSecurityDashboard from './components/EnhancedSecurityDashboard';
import './App.css';
import './components/ThreatIntelligence.css';

function App() {
  const [connected, setConnected] = useState(false);
  const [userAddress, setUserAddress] = useState('');
  const [currentView, setCurrentView] = useState('landing'); // 'landing', 'dashboard', 'threat-intel', 'community', 'enhanced-security'

  console.log('App render - connected:', connected, 'userAddress:', userAddress);

  const handleConnect = (address) => {
    console.log('App handleConnect called with:', address);
    setConnected(!!address);
    setUserAddress(address || '');
    if (address && currentView === 'landing') {
      setCurrentView('dashboard');
    } else if (!address) {
      // If disconnected, return to landing page
      setCurrentView('landing');
    }
  };

  const NavigationBar = () => {
    if (!connected) return null;
    
    return (
      <nav className="main-navigation">
        <div className="nav-buttons">
          <button 
            className={`nav-button ${currentView === 'enhanced-security' ? 'active' : ''}`}
            onClick={() => setCurrentView('enhanced-security')}
          >
            ⚡ Enhanced Security
          </button>
          <button 
            className={`nav-button ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentView('dashboard')}
          >
            📊 Analytics Dashboard
          </button>
          <button 
            className={`nav-button ${currentView === 'threat-intel' ? 'active' : ''}`}
            onClick={() => setCurrentView('threat-intel')}
          >
            🛡️ Threat Intelligence
          </button>
          <button 
            className={`nav-button ${currentView === 'community' ? 'active' : ''}`}
            onClick={() => setCurrentView('community')}
          >
            👥 Community Reports
          </button>
        </div>
      </nav>
    );
  };

  const renderMainContent = () => {
    if (!connected) {
      return <LandingPage />;
    }

    switch (currentView) {
      case 'enhanced-security':
        return <EnhancedSecurityDashboard userAddress={userAddress} />;
      case 'threat-intel':
        return <ThreatIntelligence connected={connected} userAddress={userAddress} />;
      case 'community':
        return <CommunityReporting connected={connected} userAddress={userAddress} />;
      case 'dashboard':
      default:
        return (
          <div className="dashboard-container">
            <BitcoinDashboard userAddress={userAddress} />
            {userAddress && (
              <div className="user-address-security">
                <h3>Your Address Security Status</h3>
                <AddressSecurityChecker 
                  address={userAddress}
                  onSecurityCheck={(status) => {
                    console.log('User address security status:', status);
                  }}
                />
              </div>
            )}
          </div>
        );
    }
  };

  const LandingPage = () => (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              🛡️ StackGuard
              <div className="tagline">Advanced Blockchain Security</div>
            </h1>
            
            <p className="hero-description">
              The most comprehensive blockchain security platform powered by Stacks. 
              Protect your transactions, analyze threats, and secure your DeFi interactions 
              with advanced on-chain intelligence.
            </p>

            {/* Hero Features Grid */}
            <div className="hero-features">
              <div className="feature-item">
                <span className="feature-icon">🔍</span>
                <span className="feature-text">Real-time Threat Detection</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🏆</span>
                <span className="feature-text">Community-Verified Reports</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">⚡</span>
                <span className="feature-text">Instant Address Analysis</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🌐</span>
                <span className="feature-text">Cross-Chain Protection</span>
              </div>
            </div>

            {/* Security Dashboard Preview */}
            <div className="security-dashboard-preview">
              <div className="preview-header">
                <div className="preview-title">🛡️ Security Status</div>
                <div className="preview-status">All Systems Operational</div>
              </div>
              
              <div className="security-metrics">
                <div className="metric-item">
                  <div className="metric-label">Threats Detected</div>
                  <div className="metric-value">1,247</div>
                </div>
                <div className="metric-item">
                  <div className="metric-label">Addresses Verified</div>
                  <div className="metric-value">8,932</div>
                </div>
                <div className="metric-item">
                  <div className="metric-label">Active Monitors</div>
                  <div className="metric-value">156</div>
                </div>
              </div>
              
              <div className="threat-feed">
                <div className="threat-item critical">
                  <div className="threat-severity">CRITICAL</div>
                  <div className="threat-address">SP2...A3F7 (Phishing)</div>
                  <div className="threat-action">Blocked</div>
                </div>
                <div className="threat-item high">
                  <div className="threat-severity">HIGH</div>
                  <div className="threat-address">SP1...B2C8 (Rug Pull)</div>
                  <div className="threat-action">Flagged</div>
                </div>
                <div className="threat-item medium">
                  <div className="threat-severity">MEDIUM</div>
                  <div className="threat-address">SP3...D4E9 (Suspicious)</div>
                  <div className="threat-action">Monitoring</div>
                </div>
              </div>
            </div>
            
            {/* Enhanced CTA Features */}
            <div className="cta-features">
              <div className="cta-feature">🔐 Smart Contract Auditing</div>
              <div className="cta-feature">📊 DeFi Protocol Assessment</div>
              <div className="cta-feature">🚨 Real-time Alerts</div>
              <div className="cta-feature">🔒 Staking-based Governance</div>
              <div className="cta-feature">🌍 Cross-chain Analysis</div>
            </div>

            <ConnectWallet onConnect={handleConnect} />
            
            <p className="hero-subtitle">
              Connect your Stacks wallet to access advanced security features, 
              submit threat reports, and help protect the blockchain ecosystem.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">🚀 Advanced Security Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <span className="feature-icon">🛡️</span>
              <h3 className="feature-title">Threat Intelligence Hub</h3>
              <p className="feature-description">
                Advanced real-time threat detection with AI-powered analysis. 
                Monitor suspicious activities across the blockchain network.
              </p>
            </div>
            
            <div className="feature-card">
              <span className="feature-icon">👥</span>
              <h3 className="feature-title">Community Verification</h3>
              <p className="feature-description">
                Decentralized reporting system with staking-based verification. 
                Community-driven security with economic incentives.
              </p>
            </div>
            
            <div className="feature-card">
              <span className="feature-icon">🔍</span>
              <h3 className="feature-title">Address Security Scanner</h3>
              <p className="feature-description">
                Instant security analysis for any blockchain address. 
                Check reputation, transaction history, and risk factors.
              </p>
            </div>
            
            <div className="feature-card">
              <span className="feature-icon">📊</span>
              <h3 className="feature-title">DeFi Protocol Analysis</h3>
              <p className="feature-description">
                Comprehensive security assessment for DeFi protocols. 
                Smart contract auditing and vulnerability detection.
              </p>
            </div>
            
            <div className="feature-card">
              <span className="feature-icon">🌐</span>
              <h3 className="feature-title">Cross-Chain Monitoring</h3>
              <p className="feature-description">
                Unified security monitoring across multiple blockchain networks. 
                Correlate threats and track malicious activities.
              </p>
            </div>
            
            <div className="feature-card">
              <span className="feature-icon">⚡</span>
              <h3 className="feature-title">Real-Time Alerts</h3>
              <p className="feature-description">
                Instant notifications for security threats and suspicious activities. 
                Stay protected with automated monitoring.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">10,000+</div>
              <div className="stat-label">Protected Transactions</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">500+</div>
              <div className="stat-label">Verified Reporters</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">99.9%</div>
              <div className="stat-label">Uptime Guarantee</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Security Monitoring</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  return (
    <div className="App">
      {connected && (
        <header className="app-header">
          <div className="container">
            <div className="header-content">
              <div className="header-brand">
                <h1 onClick={() => setCurrentView('landing')} style={{cursor: 'pointer'}}>
                  🛡️ StackGuard
                </h1>
              </div>
              
              <div className="user-info-header">
                <div className="user-address-header">
                  {userAddress.substring(0, 8)}...
                  {userAddress.substring(userAddress.length - 6)}
                </div>
                <button className="btn-secondary" onClick={() => {
                  setConnected(false);
                  setUserAddress('');
                  setCurrentView('landing');
                }}>
                  Disconnect
                </button>
              </div>
            </div>
          </div>
        </header>
      )}

      <NavigationBar />

      <main className="main-content">
        <div className="container">
          {renderMainContent()}
        </div>
      </main>

      <footer className="app-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>🛡️ StackGuard</h3>
              <p>Advanced blockchain security platform powered by Stacks</p>
            </div>
            
            <div className="footer-section">
              <h4>Features</h4>
              <ul>
                <li>Threat Intelligence</li>
                <li>Address Analysis</li>
                <li>DeFi Security</li>
                <li>Cross-chain Monitoring</li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4>Security</h4>
              <ul>
                <li>Community Verification</li>
                <li>Staking Governance</li>
                <li>Real-time Alerts</li>
                <li>Smart Contract Audits</li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4>Resources</h4>
              <ul>
                <li>Documentation</li>
                <li>API Reference</li>
                <li>Security Reports</li>
                <li>Community</li>
              </ul>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; 2024 StackGuard. Securing the blockchain ecosystem.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
