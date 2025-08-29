import React, { useState, useEffect } from 'react';
import smartContract from '../utils/smartContract';

const { checkAddressSecurity, getRiskLevel } = smartContract;

// Simple address validation function
const isValidStacksAddress = (address) => {
  if (!address || typeof address !== 'string') {
    return false;
  }
  // Stacks addresses start with ST (mainnet) or SP (testnet) followed by 39 characters
  const stacksAddressRegex = /^S[TP][0-9A-HJKMNP-Z]{39}$/;
  return stacksAddressRegex.test(address);
};

const AddressSecurityChecker = ({ address, onSecurityCheck }) => {
  const [securityStatus, setSecurityStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (address && isValidStacksAddress(address)) {
      checkAddress(address);
    }
  }, [address]);

  const checkAddress = async (targetAddress) => {
    if (!targetAddress) return;

    setLoading(true);
    
    try {
      const status = await checkAddressSecurity(targetAddress);
      setSecurityStatus(status);
      if (onSecurityCheck) onSecurityCheck(status);
    } catch (error) {
      console.error('Security check failed:', error);
      const errorStatus = { error: true, message: 'Security check failed' };
      setSecurityStatus(errorStatus);
      if (onSecurityCheck) onSecurityCheck(errorStatus);
    } finally {
      setLoading(false);
    }
  };

  // Remove the local getRiskLevel function since it's imported from utils

  if (!address || !isValidStacksAddress(address)) {
    return null;
  }

  if (loading) {
    return (
      <div className="security-checker loading">
        <div className="security-status">
          🔄 Checking address security...
        </div>
      </div>
    );
  }

  if (!securityStatus) {
    return null;
  }

  if (securityStatus.error) {
    return (
      <div className="security-checker error">
        <div className="security-status">
          ⚠️ Unable to verify address security
        </div>
      </div>
    );
  }

  if (securityStatus.clean) {
    return (
      <div className="security-checker clean">
        <div className="security-status verified">
          ✅ Address verified - No known threats
        </div>
      </div>
    );
  }

  if (securityStatus.isThreat) {
    const riskInfo = getRiskLevel(securityStatus.riskScore);
    
    return (
      <div className="security-checker threat">
        <div 
          className="security-status warning"
          style={{ 
            backgroundColor: riskInfo.bg,
            borderColor: riskInfo.color
          }}
        >
          <div className="threat-header">
            <span className="threat-icon">⚠️</span>
            <span className="threat-level" style={{ color: riskInfo.color }}>
              {riskInfo.level} RISK DETECTED
            </span>
          </div>
          
          <div className="threat-details">
            <div className="threat-info">
              <strong>Risk Score:</strong> {securityStatus.riskScore}/10
            </div>
            <div className="threat-info">
              <strong>Category:</strong> {securityStatus.threatCategory}
            </div>
            <div className="threat-info">
              <strong>Confidence:</strong> {securityStatus.confidence}%
            </div>
          </div>
          
          <div className="security-warning">
            <strong>⚠️ WARNING:</strong> This address has been flagged as potentially malicious. 
            Proceed with extreme caution!
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default AddressSecurityChecker;
