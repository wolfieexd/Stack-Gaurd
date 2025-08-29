import React from 'react';

function NavigationBar({ connected, currentView, setCurrentView }) {
  if (!connected) return null;

  return (
    <nav className="app-nav">
      <div className="nav-buttons">
        <button 
          className={`nav-button ${currentView === 'dashboard' ? 'active' : ''}`}
          onClick={() => setCurrentView('dashboard')}
        >
          📊 Dashboard
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
}

export default NavigationBar;
