// StackGuard Browser Extension - Popup Script
class StackGuardPopup {
    constructor() {
        this.apiEndpoint = 'http://localhost:3001'; // Your StackGuard API
        this.currentTab = null;
        this.init();
    }
    
    async init() {
        await this.getCurrentTab();
        await this.checkCurrentSite();
        this.setupEventListeners();
        this.hideLoading();
    }
    
    async getCurrentTab() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            this.currentTab = tab;
            return tab;
        } catch (error) {
            console.error('Error getting current tab:', error);
            return null;
        }
    }
    
    async checkCurrentSite() {
        if (!this.currentTab) return;
        
        const url = new URL(this.currentTab.url);
        const domain = url.hostname;
        
        // Update UI with current site
        document.getElementById('site-url').textContent = domain;
        
        // Check if site is related to Stacks/crypto
        const isCryptoSite = this.isCryptoRelatedSite(domain);
        
        if (isCryptoSite) {
            await this.performSecurityCheck(domain);
        } else {
            this.showSiteStatus('clean', 'No crypto activity detected');
        }
    }
    
    isCryptoRelatedSite(domain) {
        const cryptoKeywords = [
            'stacks', 'bitcoin', 'btc', 'defi', 'dapp', 'wallet', 
            'exchange', 'crypto', 'blockchain', 'nft', 'swap',
            'uniswap', 'sushiswap', 'metamask', 'phantom'
        ];
        
        return cryptoKeywords.some(keyword => 
            domain.toLowerCase().includes(keyword)
        );
    }
    
    async performSecurityCheck(domain) {
        try {
            // Simulate security check (replace with actual API call)
            const securityData = await this.checkDomainSecurity(domain);
            
            if (securityData.isThreat) {
                this.showThreatAlert(securityData);
            } else {
                this.showSiteStatus('clean', 'Site appears safe for crypto activities');
            }
        } catch (error) {
            console.error('Security check failed:', error);
            this.showSiteStatus('unknown', 'Unable to verify site security');
        }
    }
    
    async checkDomainSecurity(domain) {
        // Demo security check - replace with real API
        const knownThreats = [
            'fake-stacks-wallet.com',
            'phishing-btc.net',
            'scam-defi.org'
        ];
        
        if (knownThreats.includes(domain)) {
            return {
                isThreat: true,
                threatType: 'phishing',
                risk: 'critical',
                description: 'This site has been reported for cryptocurrency phishing attacks'
            };
        }
        
        return { isThreat: false };
    }
    
    showSiteStatus(status, message) {
        const statusIcon = document.getElementById('status-icon');
        const statusText = document.getElementById('status-text');
        const siteStatus = document.getElementById('site-status');
        
        siteStatus.textContent = message;
        
        switch (status) {
            case 'clean':
                statusIcon.textContent = '✅';
                statusText.textContent = 'Site Security: Clean';
                break;
            case 'warning':
                statusIcon.textContent = '⚠️';
                statusText.textContent = 'Site Security: Warning';
                break;
            case 'threat':
                statusIcon.textContent = '🚨';
                statusText.textContent = 'Site Security: Threat Detected';
                break;
            case 'unknown':
                statusIcon.textContent = '❓';
                statusText.textContent = 'Site Security: Unknown';
                break;
        }
    }
    
    showThreatAlert(threatData) {
        this.showSiteStatus('threat', threatData.description);
        
        const alertsContainer = document.getElementById('threat-alerts');
        alertsContainer.innerHTML = `
            <div class="threat-alert">
                <h4>⚠️ Security Threat Detected!</h4>
                <p><strong>Risk Level:</strong> <span class="risk-level risk-${threatData.risk}">${threatData.risk}</span></p>
                <p><strong>Threat Type:</strong> ${threatData.threatType}</p>
                <p>${threatData.description}</p>
            </div>
        `;
    }
    
    setupEventListeners() {
        // Check address button
        document.getElementById('check-address').addEventListener('click', () => {
            this.checkStacksAddress();
        });
        
        // Report threat button
        document.getElementById('report-threat').addEventListener('click', () => {
            this.openReportThreat();
        });
        
        // View dashboard button
        document.getElementById('view-dashboard').addEventListener('click', () => {
            this.openDashboard();
        });
        
        // Options link
        document.getElementById('options-link').addEventListener('click', (e) => {
            e.preventDefault();
            chrome.runtime.openOptionsPage();
        });
        
        // Enter key for address input
        document.getElementById('address-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkStacksAddress();
            }
        });
    }
    
    async checkStacksAddress() {
        const addressInput = document.getElementById('address-input');
        const address = addressInput.value.trim();
        
        if (!address) {
            this.showAddressResult('error', 'Please enter a Stacks address');
            return;
        }
        
        if (!this.isValidStacksAddress(address)) {
            this.showAddressResult('error', 'Invalid Stacks address format');
            return;
        }
        
        try {
            const result = await this.performAddressCheck(address);
            this.showAddressResult('success', result);
        } catch (error) {
            this.showAddressResult('error', 'Failed to check address security');
        }
    }
    
    isValidStacksAddress(address) {
        return address.startsWith('SP') || address.startsWith('ST');
    }
    
    async performAddressCheck(address) {
        // Demo address check - replace with actual API call
        const demoThreats = {
            'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5': {
                risk: 'critical',
                threat: 'Malware distribution'
            },
            'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG': {
                risk: 'high',
                threat: 'Phishing attempts'
            }
        };
        
        if (demoThreats[address]) {
            return demoThreats[address];
        }
        
        return { risk: 'clean', threat: 'No threats detected' };
    }
    
    showAddressResult(type, result) {
        const alertsContainer = document.getElementById('threat-alerts');
        
        if (type === 'success') {
            const riskClass = result.risk === 'clean' ? 'clean' : result.risk;
            alertsContainer.innerHTML = `
                <div class="security-status">
                    <h4>Address Security Check</h4>
                    <p><strong>Risk Level:</strong> <span class="risk-level risk-${riskClass}">${result.risk}</span></p>
                    <p>${result.threat}</p>
                </div>
            `;
        } else {
            alertsContainer.innerHTML = `
                <div class="threat-alert">
                    <h4>❌ Error</h4>
                    <p>${result}</p>
                </div>
            `;
        }
    }
    
    openReportThreat() {
        const reportUrl = this.currentTab ? 
            `${this.apiEndpoint}?report=${encodeURIComponent(this.currentTab.url)}` :
            `${this.apiEndpoint}`;
        
        chrome.tabs.create({ url: reportUrl });
    }
    
    openDashboard() {
        chrome.tabs.create({ url: this.apiEndpoint });
    }
    
    hideLoading() {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
    }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new StackGuardPopup();
});

// Handle extension badge updates
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'SECURITY_ALERT') {
        // Update popup with security alert
        console.log('Security alert received:', message);
    }
});
