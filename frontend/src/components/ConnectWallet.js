import React, { useState, useEffect, useMemo } from 'react';
import { showConnect, AppConfig, UserSession } from '@stacks/connect';
import { checkContractDeployment } from '../utils/smartContract';

const ConnectWallet = ({ onConnect, connected, userAddress }) => {
  const [connecting, setConnecting] = useState(false);
  const [contractStatus, setContractStatus] = useState('checking'); // 'checking', 'deployed', 'not-deployed'

  // Initialize app config with useMemo to prevent re-creation
  const appConfig = useMemo(() => new AppConfig(['store_write', 'publish_data']), []);
  const userSession = useMemo(() => new UserSession({ appConfig }), [appConfig]);

  // Check contract deployment status on component mount
  useEffect(() => {
    const checkContract = async () => {
      try {
        const isDeployed = await checkContractDeployment();
        setContractStatus(isDeployed ? 'deployed' : 'not-deployed');
      } catch (error) {
        console.error('Error checking contract deployment:', error);
        setContractStatus('not-deployed');
      }
    };
    
    checkContract();
  }, []);

  // Check for existing connection on mount
  useEffect(() => {
    if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then((userData) => {
        console.log('Existing connection found:', userData);
        if (userData && userData.profile && userData.profile.stxAddress) {
          const address = userData.profile.stxAddress.mainnet;
          console.log('Restored address:', address);
          onConnect(address);
        }
      });
    } else if (userSession.isUserSignedIn()) {
      const userData = userSession.loadUserData();
      console.log('User already signed in:', userData);
      if (userData && userData.profile && userData.profile.stxAddress) {
        const address = userData.profile.stxAddress.mainnet;
        console.log('Loaded address:', address);
        onConnect(address);
      }
    }
  }, [userSession, onConnect]);

  const handleConnect = async () => {
    setConnecting(true);
    console.log('Connect button clicked, showing wallet connect dialog');
    console.log('Buffer availability:', typeof window.Buffer);
    console.log('Process availability:', typeof window.process);
    
    try {
      console.log('About to call showConnect...');
      await showConnect({
        appDetails: {
          name: 'StackGuard',
          icon: window.location.origin + '/logo512.png',
        },
        redirectTo: '/',
        onFinish: (payload) => {
          console.log('onFinish called with payload:', payload);
          console.log('Wallet connected payload:', payload);
          setConnecting(false);
          
          // Handle different wallet response formats
          let address = null;
          
          // Check for Leather wallet format
          if (payload.userSession && payload.userSession.loadUserData) {
            const userData = payload.userSession.loadUserData();
            if (userData.profile && userData.profile.stxAddress) {
              address = userData.profile.stxAddress.mainnet;
            }
          }
          // Check for standard Stacks Connect format
          else if (payload.addresses && payload.addresses.stx && payload.addresses.stx.length > 0) {
            address = payload.addresses.stx[0].address;
          }
          // Check for direct address format
          else if (payload.address) {
            address = payload.address;
          }
          // Check for userAddress format
          else if (payload.userAddress) {
            address = payload.userAddress;
          }
          
          if (address) {
            console.log('Address found:', address);
            onConnect(address);
          } else {
            console.warn('No address found in payload:', payload);
            // Try to get it from userSession directly
            if (userSession.isUserSignedIn()) {
              const userData = userSession.loadUserData();
              if (userData.profile && userData.profile.stxAddress) {
                address = userData.profile.stxAddress.mainnet;
                console.log('Got address from session:', address);
                onConnect(address);
              }
            }
          }
        },
        onCancel: () => {
          console.log('User canceled connection');
          setConnecting(false);
        },
      });
    } catch (error) {
      console.error('Connection error:', error);
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    console.log('Disconnecting wallet...');
    try {
      // Clear user session
      if (userSession) {
        userSession.signUserOut();
      }
      
      // Clear all related localStorage items
      localStorage.removeItem('blockstack-session');
      localStorage.removeItem('blockstack-auth');
      localStorage.removeItem('stacks-connect');
      localStorage.removeItem('connect-auth');
      
      // Clear any sessionStorage items
      sessionStorage.clear();
      
      console.log('Wallet disconnected, calling onConnect(null)');
      onConnect(null);
    } catch (error) {
      console.error('Error during disconnect:', error);
      // Force disconnect even if there's an error
      onConnect(null);
    }
  };

  const handleRefreshConnection = () => {
    console.log('Refreshing connection...');
    if (userSession.isUserSignedIn()) {
      const userData = userSession.loadUserData();
      console.log('Refresh - user data:', userData);
      if (userData && userData.profile && userData.profile.stxAddress) {
        const address = userData.profile.stxAddress.mainnet;
        console.log('Refresh - found address:', address);
        onConnect(address);
      }
    }
  };

  if (connected && userAddress) {
    return (
      <div className="wallet-connected">
        <div className="address-display">
          🔗 {userAddress.substring(0, 8)}...{userAddress.slice(-6)}
        </div>
        {contractStatus === 'not-deployed' && (
          <div style={{ fontSize: '12px', color: '#ff6b35', marginBottom: '8px' }}>
            ⚠️ Smart contract not deployed - Live data unavailable
          </div>
        )}
        <button 
          onClick={handleDisconnect}
          className="btn btn-secondary"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div>
      {contractStatus === 'checking' && (
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
          🔍 Checking smart contract...
        </div>
      )}
      {contractStatus === 'not-deployed' && (
        <div style={{ fontSize: '12px', color: '#ff6b35', marginBottom: '8px' }}>
          ⚠️ Demo mode disabled - Contract required for live data
        </div>
      )}
      <button 
        onClick={handleConnect}
        disabled={connecting}
        className="btn btn-primary"
      >
        {connecting ? '🔄 Connecting...' : '🔗 Connect Wallet'}
      </button>
    </div>
  );
};

export default ConnectWallet;
