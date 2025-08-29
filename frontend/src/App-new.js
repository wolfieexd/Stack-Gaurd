import React, { useState } from 'react';
import ConnectWallet from './components/ConnectWallet';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const [connected, setConnected] = useState(false);
  const [userAddress, setUserAddress] = useState('');

  const handleConnect = (address) => {
    setConnected(!!address);
    setUserAddress(address || '');
  };

  const LandingPage = () => (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              🛡️ StackGuard
            </h1>
            <h2 className="hero-subtitle">
              AI-Powered Blockchain Security
            </h2>
            <p className="hero-description">
              The first decentralized threat intelligence network for Stacks blockchain. 
              Protect yourself and the community with real-time AI-driven security analysis 
              and transparent on-chain threat reporting.
            </p>
            <div className="hero-cta">
              <ConnectWallet 
                onConnect={handleConnect}
                connected={connected}
                userAddress={userAddress}
              />
              <p className="cta-subtitle">Connect your wallet to access the security dashboard</p>
            </div>
          </div>
          <div className="hero-visual">
            <div className="security-badge">
              <div className="badge-icon">🔐</div>
              <div className="badge-text">
                <div className="badge-title">Network Status</div>
                <div className="badge-status">🟢 Secure</div>
              </div>
            </div>
            <div className="threat-preview">
              <div className="preview-header">Live Threat Feed</div>
              <div className="preview-items">
                <div className="preview-item critical">
                  <div className="item-severity">CRITICAL</div>
                  <div className="item-address">ST2QKZ...BP2</div>
                  <div className="item-time">2m ago</div>
                </div>
                <div className="preview-item high">
                  <div className="item-severity">HIGH</div>
                  <div className="item-address">ST1JAH...80H</div>
                  <div className="item-time">15m ago</div>
                </div>
                <div className="preview-item medium">
                  <div className="item-severity">MEDIUM</div>
                  <div className="item-address">ST319C...VPF</div>
                  <div className="item-time">1h ago</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-container">
          <h2 className="section-title">Comprehensive Blockchain Security</h2>
          <p className="section-subtitle">
            Four pillars of protection safeguarding the Stacks ecosystem
          </p>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3 className="feature-title">AI Analysis</h3>
              <p className="feature-description">
                Advanced machine learning algorithms analyze transaction patterns, 
                detecting suspicious activities and potential threats in real-time.
              </p>
              <div className="feature-stats">
                <span className="stat">99.2% Accuracy</span>
                <span className="stat">Real-time Processing</span>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon">⛓️</div>
              <h3 className="feature-title">On-Chain Reports</h3>
              <p className="feature-description">
                All threat intelligence is stored immutably on the Stacks blockchain, 
                ensuring transparency, verifiability, and censorship resistance.
              </p>
              <div className="feature-stats">
                <span className="stat">Immutable Records</span>
                <span className="stat">100% Transparent</span>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3 className="feature-title">Community Driven</h3>
              <p className="feature-description">
                Powered by a decentralized network of security researchers and users 
                who contribute threat intelligence and validate security reports.
              </p>
              <div className="feature-stats">
                <span className="stat">Crowdsourced Intelligence</span>
                <span className="stat">Democratic Validation</span>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3 className="feature-title">Real-Time Protection</h3>
              <p className="feature-description">
                Instant threat detection and alerting system that protects users 
                before they interact with malicious addresses or contracts.
              </p>
              <div className="feature-stats">
                <span className="stat">Instant Alerts</span>
                <span className="stat">Proactive Defense</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-container">
          <h2 className="section-title">Network Security Overview</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Monitoring</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">1,247</div>
              <div className="stat-label">Threats Detected</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">99.8%</div>
              <div className="stat-label">Network Uptime</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">5,692</div>
              <div className="stat-label">Protected Users</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <h2 className="cta-title">Ready to Secure Your Blockchain Experience?</h2>
          <p className="cta-description">
            Join thousands of users protecting the Stacks ecosystem with AI-powered threat intelligence
          </p>
          <ConnectWallet 
            onConnect={handleConnect}
            connected={connected}
            userAddress={userAddress}
          />
        </div>
      </section>
    </div>
  );

  return (
    <div className="App">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="logo-section">
            <h1>🛡️ StackGuard</h1>
            <p>AI-Powered Blockchain Security</p>
          </div>
          <div className="nav-section">
            {connected ? (
              <div className="user-info">
                <span className="user-address">
                  {userAddress?.substring(0, 8)}...{userAddress?.slice(-6)}
                </span>
                <ConnectWallet 
                  onConnect={handleConnect}
                  connected={connected}
                  userAddress={userAddress}
                />
              </div>
            ) : (
              <ConnectWallet 
                onConnect={handleConnect}
                connected={connected}
                userAddress={userAddress}
              />
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main">
        {connected ? (
          <Dashboard userAddress={userAddress} />
        ) : (
          <LandingPage />
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>🛡️ StackGuard</h3>
            <p>Protecting the Stacks ecosystem with AI-powered threat intelligence</p>
          </div>
          <div className="footer-section">
            <h4>Platform</h4>
            <ul>
              <li><a href="#dashboard">Security Dashboard</a></li>
              <li><a href="#threats">Threat Intelligence</a></li>
              <li><a href="#reports">On-Chain Reports</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Community</h4>
            <ul>
              <li><a href="#discord">Discord</a></li>
              <li><a href="#twitter">Twitter</a></li>
              <li><a href="#github">GitHub</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Resources</h4>
            <ul>
              <li><a href="#docs">Documentation</a></li>
              <li><a href="#api">API Reference</a></li>
              <li><a href="#support">Support</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 StackGuard. Securing the decentralized future.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
