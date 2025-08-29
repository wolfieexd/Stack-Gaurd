import React, { useState, useEffect } from 'react';
import { submitCommunityThreatReport, getUserReports, getCommunityStats } from '../utils/smartContract';
import './CommunityReporting.css';

const CommunityReporting = ({ connected, userAddress }) => {
  const [reportForm, setReportForm] = useState({
    targetAddress: '',
    threatType: 'phishing',
    severity: 'medium',
    description: '',
    evidence: '',
    category: 'scam'
  });
  const [userReports, setUserReports] = useState([]);
  const [communityStats, setCommunityStats] = useState({
    totalReports: 0,
    verifiedReports: 0,
    activeReporters: 0,
    reputationScore: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');
  const [activeTab, setActiveTab] = useState('report');

  useEffect(() => {
    if (connected && userAddress) {
      loadUserReports();
      loadCommunityStats();
    }
  }, [connected, userAddress]);

  const loadUserReports = async () => {
    try {
      const reports = await getUserReports(userAddress);
      setUserReports(reports);
    } catch (error) {
      console.error('Error loading user reports:', error);
    }
  };

  const loadCommunityStats = async () => {
    try {
      const stats = await getCommunityStats();
      setCommunityStats(stats);
    } catch (error) {
      console.error('Error loading community stats:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReportForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!connected) {
      setSubmitStatus('Please connect your wallet to submit a report');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('');

    try {
      const result = await submitCommunityThreatReport({
        ...reportForm,
        reporter: userAddress,
        timestamp: Date.now()
      });

      if (result.success) {
        setSubmitStatus('✅ Threat report submitted successfully! Thank you for keeping the community safe.');
        setReportForm({
          targetAddress: '',
          threatType: 'phishing',
          severity: 'medium',
          description: '',
          evidence: '',
          category: 'scam'
        });
        loadUserReports();
        loadCommunityStats();
      } else {
        setSubmitStatus('❌ Failed to submit report. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      setSubmitStatus('❌ Error submitting report: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getThreatTypeIcon = (type) => {
    const icons = {
      phishing: '🎣',
      scam: '⚠️',
      malware: '🦠',
      'money-laundering': '💰',
      'suspicious-activity': '🔍',
      spam: '📧',
      'fake-token': '🪙'
    };
    return icons[type] || '⚠️';
  };

  const getSeverityColor = (severity) => {
    const colors = {
      low: '#27ae60',
      medium: '#f39c12',
      high: '#e67e22',
      critical: '#e74c3c'
    };
    return colors[severity] || '#f39c12';
  };

  if (!connected) {
    return (
      <div className="community-reporting-disconnected">
        <div className="disconnect-message">
          <h2>🛡️ Community Threat Reporting</h2>
          <p>Connect your wallet to participate in community-driven security reporting and help protect the Stacks ecosystem.</p>
          <div className="community-features">
            <div className="feature">
              <span className="feature-icon">📝</span>
              <h3>Submit Threat Reports</h3>
              <p>Report malicious addresses and suspicious activities</p>
            </div>
            <div className="feature">
              <span className="feature-icon">🏆</span>
              <h3>Earn Reputation</h3>
              <p>Build your security reputation through verified reports</p>
            </div>
            <div className="feature">
              <span className="feature-icon">👥</span>
              <h3>Community Protection</h3>
              <p>Help protect fellow Stacks users from threats</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="community-reporting">
      <div className="reporting-header">
        <h2>🛡️ Community Threat Reporting</h2>
        <p>Help protect the Stacks community by reporting threats and suspicious activities</p>
      </div>

      {/* Community Stats Dashboard */}
      <div className="community-stats">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-value">{communityStats.totalReports}</div>
          <div className="stat-label">Total Reports</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{communityStats.verifiedReports}</div>
          <div className="stat-label">Verified Reports</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-value">{communityStats.activeReporters}</div>
          <div className="stat-label">Active Reporters</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-value">{communityStats.reputationScore}</div>
          <div className="stat-label">Your Reputation</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'report' ? 'active' : ''}`}
          onClick={() => setActiveTab('report')}
        >
          📝 Submit Report
        </button>
        <button 
          className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          📋 My Reports
        </button>
      </div>

      {/* Submit Report Form */}
      {activeTab === 'report' && (
        <div className="report-form-container">
          <form onSubmit={handleSubmitReport} className="threat-report-form">
            <div className="form-group">
              <label htmlFor="targetAddress">Suspicious Address *</label>
              <input
                type="text"
                id="targetAddress"
                name="targetAddress"
                value={reportForm.targetAddress}
                onChange={handleInputChange}
                placeholder="SP1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="threatType">Threat Type *</label>
                <select
                  id="threatType"
                  name="threatType"
                  value={reportForm.threatType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="phishing">🎣 Phishing</option>
                  <option value="scam">⚠️ Scam</option>
                  <option value="malware">🦠 Malware Distribution</option>
                  <option value="money-laundering">💰 Money Laundering</option>
                  <option value="suspicious-activity">🔍 Suspicious Activity</option>
                  <option value="spam">📧 Spam</option>
                  <option value="fake-token">🪙 Fake Token</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="severity">Severity Level *</label>
                <select
                  id="severity"
                  name="severity"
                  value={reportForm.severity}
                  onChange={handleInputChange}
                  required
                >
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🟠 High</option>
                  <option value="critical">🔴 Critical</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={reportForm.description}
                onChange={handleInputChange}
                placeholder="Describe the threat or suspicious activity in detail..."
                rows="4"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="evidence">Evidence (URLs, Transaction IDs, etc.)</label>
              <textarea
                id="evidence"
                name="evidence"
                value={reportForm.evidence}
                onChange={handleInputChange}
                placeholder="Provide any supporting evidence such as transaction IDs, URLs, screenshots, etc."
                rows="3"
              />
            </div>

            {submitStatus && (
              <div className={`submit-status ${submitStatus.includes('✅') ? 'success' : 'error'}`}>
                {submitStatus}
              </div>
            )}

            <button 
              type="submit" 
              className="submit-report-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? '🔄 Submitting...' : '🛡️ Submit Threat Report'}
            </button>
          </form>
        </div>
      )}

      {/* User Reports History */}
      {activeTab === 'history' && (
        <div className="user-reports-container">
          <h3>Your Threat Reports ({userReports.length})</h3>
          {userReports.length === 0 ? (
            <div className="no-reports">
              <p>You haven't submitted any threat reports yet.</p>
              <button 
                className="switch-tab-btn"
                onClick={() => setActiveTab('report')}
              >
                Submit Your First Report
              </button>
            </div>
          ) : (
            <div className="reports-list">
              {userReports.map((report, index) => (
                <div key={index} className="report-card">
                  <div className="report-header">
                    <div className="report-icon">
                      {getThreatTypeIcon(report.threatType)}
                    </div>
                    <div className="report-info">
                      <h4>{report.targetAddress}</h4>
                      <span 
                        className="severity-badge"
                        style={{ backgroundColor: getSeverityColor(report.severity) }}
                      >
                        {report.severity.toUpperCase()}
                      </span>
                    </div>
                    <div className="report-status">
                      <span className={`status ${report.status || 'pending'}`}>
                        {report.status === 'verified' ? '✅ Verified' : '⏳ Pending'}
                      </span>
                    </div>
                  </div>
                  <div className="report-content">
                    <p><strong>Threat Type:</strong> {report.threatType}</p>
                    <p><strong>Description:</strong> {report.description}</p>
                    {report.evidence && (
                      <p><strong>Evidence:</strong> {report.evidence}</p>
                    )}
                    <p><strong>Submitted:</strong> {new Date(report.timestamp).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CommunityReporting;
