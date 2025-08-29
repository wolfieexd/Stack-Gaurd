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

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <div className="logo-section">
            <h1>🛡️ StackGuard</h1>
            <p>AI-Powered Blockchain Security</p>
          </div>
          <div className="wallet-section">
            <ConnectWallet 
              onConnect={handleConnect}
              connected={connected}
              userAddress={userAddress}
            />
          </div>
        </div>
      </header>

      <main className="app-main">
        {connected ? (
          <Dashboard userAddress={userAddress} />
        ) : (
          <div className="welcome-section">
            <div className="hero-content">
              <h2>🚀 Welcome to StackGuard</h2>
              <p>
                Real-time AI threat detection and on-chain intelligence for the Stacks ecosystem.
                Connect your wallet to access the security dashboard.
              </p>

              <div className="features-grid">
                <div className="feature-card">
                  <div className="feature-icon">🤖</div>
                  <h3>AI Analysis</h3>
                  <p>Advanced machine learning algorithms analyze transaction patterns in real-time</p>
                </div>

                <div className="feature-card">
                  <div className="feature-icon">⛓️</div>
                  <h3>On-Chain Reports</h3>
                  <p>Immutable threat intelligence stored directly on the blockchain</p>
                </div>

                <div className="feature-card">
                  <div className="feature-icon">🌐</div>
                  <h3>Community Driven</h3>
                  <p>Decentralized security network powered by the community</p>
                </div>

                <div className="feature-card">
                  <div className="feature-icon">⚡</div>
                  <h3>Real-Time Protection</h3>
                  <p>Instant threat detection and automated response capabilities</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <p>© 2025 StackGuard - Securing the Future of DeFi</p>
          <div className="footer-links">
            <a href="#docs">Documentation</a>
            <a href="#api">API</a>
            <a href="#github">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
