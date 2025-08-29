// StackGuard Browser Extension - Background Service Worker
class StackGuardBackground {
    constructor() {
        this.apiEndpoint = 'http://localhost:3001';
        this.threatDatabase = new Map();
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadThreatDatabase();
        this.schedulePeriodicChecks();
    }
    
    setupEventListeners() {
        // Handle extension installation
        chrome.runtime.onInstalled.addListener((details) => {
            if (details.reason === 'install') {
                this.onFirstInstall();
            }
        });
        
        // Handle tab updates
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            if (changeInfo.status === 'complete' && tab.url) {
                this.checkTabSecurity(tabId, tab.url);
            }
        });
        
        // Handle messages from content scripts
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleMessage(message, sender, sendResponse);
            return true; // Keep channel open for async response
        });
        
        // Handle alarms for periodic checks
        chrome.alarms.onAlarm.addListener((alarm) => {
            if (alarm.name === 'updateThreatDB') {
                this.updateThreatDatabase();
            }
        });
    }
    
    onFirstInstall() {
        // Show welcome notification
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: 'StackGuard Installed!',
            message: 'Your Stacks security guardian is now active. Stay protected!'
        });
        
        // Set default options
        chrome.storage.sync.set({
            enableRealTimeScanning: true,
            enableNotifications: true,
            enableAddressWarnings: true,
            apiEndpoint: this.apiEndpoint
        });
        
        // Open welcome page
        chrome.tabs.create({ url: 'options.html' });
    }
    
    async checkTabSecurity(tabId, url) {
        try {
            const urlObj = new URL(url);
            const domain = urlObj.hostname;
            
            // Skip non-HTTP(S) URLs
            if (!url.startsWith('http')) return;
            
            // Check if domain is crypto-related
            if (this.isCryptoRelatedDomain(domain)) {
                const threatLevel = await this.checkDomainThreat(domain);
                await this.updateTabBadge(tabId, threatLevel);
                
                if (threatLevel.risk > 0) {
                    this.showSecurityAlert(tabId, domain, threatLevel);
                }
            }
            
        } catch (error) {
            console.error('Error checking tab security:', error);
        }
    }
    
    isCryptoRelatedDomain(domain) {
        const cryptoKeywords = [
            'stacks', 'bitcoin', 'btc', 'defi', 'dapp', 'wallet',
            'exchange', 'crypto', 'blockchain', 'nft', 'swap',
            'lending', 'yield', 'farming', 'mining', 'trading'
        ];
        
        const cryptoDomains = [
            'stacksblockchain.com', 'stacks.co', 'stackswap.org',
            'coinbase.com', 'binance.com', 'kraken.com', 'gemini.com'
        ];
        
        return cryptoKeywords.some(keyword => domain.includes(keyword)) ||
               cryptoDomains.includes(domain);
    }
    
    async checkDomainThreat(domain) {
        // Check local cache first
        if (this.threatDatabase.has(domain)) {
            return this.threatDatabase.get(domain);
        }
        
        // Demo threat check
        const knownThreats = {
            'fake-stacks-wallet.com': { risk: 5, type: 'phishing' },
            'scam-defi.org': { risk: 4, type: 'scam' },
            'malware-crypto.net': { risk: 5, type: 'malware' }
        };
        
        const threat = knownThreats[domain] || { risk: 0, type: 'clean' };
        
        // Cache result
        this.threatDatabase.set(domain, threat);
        
        return threat;
    }
    
    async updateTabBadge(tabId, threatLevel) {
        let badgeText = '';
        let badgeColor = '#4CAF50'; // Green for safe
        
        if (threatLevel.risk >= 4) {
            badgeText = '⚠️';
            badgeColor = '#F44336'; // Red for dangerous
        } else if (threatLevel.risk >= 2) {
            badgeText = '!';
            badgeColor = '#FF9800'; // Orange for warning
        }
        
        try {
            await chrome.action.setBadgeText({ text: badgeText, tabId });
            await chrome.action.setBadgeBackgroundColor({ color: badgeColor, tabId });
        } catch (error) {
            console.error('Error updating badge:', error);
        }
    }
    
    async showSecurityAlert(tabId, domain, threatLevel) {
        const settings = await chrome.storage.sync.get(['enableNotifications']);
        
        if (!settings.enableNotifications) return;
        
        const messages = {
            'phishing': `⚠️ PHISHING ALERT: ${domain} may be trying to steal your crypto!`,
            'scam': `🚨 SCAM WARNING: ${domain} has been reported for fraudulent activities`,
            'malware': `🦠 MALWARE THREAT: ${domain} may contain malicious software`
        };
        
        const message = messages[threatLevel.type] || `⚠️ Security warning for ${domain}`;
        
        // Show browser notification
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: 'StackGuard Security Alert',
            message: message,
            buttons: [
                { title: 'View Details' },
                { title: 'Report False Positive' }
            ]
        });
        
        // Inject warning overlay into the page
        this.injectSecurityWarning(tabId, domain, threatLevel);
    }
    
    async injectSecurityWarning(tabId, domain, threatLevel) {
        try {
            await chrome.scripting.executeScript({
                target: { tabId },
                func: this.createWarningOverlay,
                args: [domain, threatLevel]
            });
        } catch (error) {
            console.error('Error injecting warning:', error);
        }
    }
    
    createWarningOverlay(domain, threatLevel) {
        // This function runs in the page context
        const overlay = document.createElement('div');
        overlay.id = 'stackguard-security-warning';
        overlay.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                z-index: 999999;
                display: flex;
                justify-content: center;
                align-items: center;
                font-family: Arial, sans-serif;
            ">
                <div style="
                    background: white;
                    padding: 30px;
                    border-radius: 15px;
                    max-width: 500px;
                    text-align: center;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                ">
                    <h2 style="color: #F44336; margin-bottom: 20px;">
                        🛡️ StackGuard Security Warning
                    </h2>
                    <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
                        This website (${domain}) has been flagged as potentially dangerous:
                    </p>
                    <p style="color: #666; font-size: 14px; margin-bottom: 30px;">
                        <strong>${threatLevel.type.toUpperCase()}</strong> - Risk Level: ${threatLevel.risk}/5
                    </p>
                    <div style="display: flex; gap: 15px; justify-content: center;">
                        <button onclick="window.history.back()" style="
                            background: #F44336;
                            color: white;
                            border: none;
                            padding: 12px 24px;
                            border-radius: 6px;
                            cursor: pointer;
                            font-size: 14px;
                        ">Go Back Safely</button>
                        <button onclick="document.getElementById('stackguard-security-warning').remove()" style="
                            background: #2196F3;
                            color: white;
                            border: none;
                            padding: 12px 24px;
                            border-radius: 6px;
                            cursor: pointer;
                            font-size: 14px;
                        ">Continue (Not Recommended)</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
    }
    
    async handleMessage(message, sender, sendResponse) {
        switch (message.type) {
            case 'CHECK_ADDRESS':
                const result = await this.checkStacksAddress(message.address);
                sendResponse(result);
                break;
                
            case 'REPORT_THREAT':
                const reportResult = await this.submitThreatReport(message.data);
                sendResponse(reportResult);
                break;
                
            case 'GET_SITE_SECURITY':
                const siteResult = await this.checkDomainThreat(message.domain);
                sendResponse(siteResult);
                break;
        }
    }
    
    async checkStacksAddress(address) {
        // Demo address checking
        const demoThreats = {
            'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5': {
                risk: 'critical',
                threat: 'Malware distribution',
                confidence: 95
            },
            'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG': {
                risk: 'high',
                threat: 'Phishing attempts',
                confidence: 88
            }
        };
        
        return demoThreats[address] || {
            risk: 'clean',
            threat: 'No threats detected',
            confidence: 100
        };
    }
    
    async loadThreatDatabase() {
        // Load threat database from storage or API
        try {
            const stored = await chrome.storage.local.get(['threatDatabase']);
            if (stored.threatDatabase) {
                this.threatDatabase = new Map(Object.entries(stored.threatDatabase));
            }
        } catch (error) {
            console.error('Error loading threat database:', error);
        }
    }
    
    async saveThreatDatabase() {
        try {
            const dbObject = Object.fromEntries(this.threatDatabase);
            await chrome.storage.local.set({ threatDatabase: dbObject });
        } catch (error) {
            console.error('Error saving threat database:', error);
        }
    }
    
    schedulePeriodicChecks() {
        // Update threat database every 4 hours
        chrome.alarms.create('updateThreatDB', { 
            delayInMinutes: 1,
            periodInMinutes: 240
        });
    }
    
    async updateThreatDatabase() {
        console.log('Updating threat database...');
        // In real implementation, fetch latest threats from API
        await this.saveThreatDatabase();
    }
}

// Initialize background script
const stackGuardBackground = new StackGuardBackground();
