// StackGuard Browser Extension - Content Script
class StackGuardContent {
    constructor() {
        this.apiEndpoint = 'http://localhost:3001';
        this.addressRegex = /(S[PT][A-Z0-9]{39})/g;
        this.isScanning = false;
        this.init();
    }
    
    init() {
        this.injectStyles();
        this.scanForStacksAddresses();
        this.setupMutationObserver();
        this.setupEventListeners();
        
        // Scan periodically for new addresses
        setInterval(() => {
            this.scanForStacksAddresses();
        }, 5000);
    }
    
    injectStyles() {
        const styles = `
            .stackguard-address-highlight {
                background: rgba(255, 215, 0, 0.2) !important;
                border: 1px dashed #ffd700 !important;
                border-radius: 3px !important;
                padding: 1px 3px !important;
                position: relative !important;
                cursor: pointer !important;
            }
            
            .stackguard-address-danger {
                background: rgba(244, 67, 54, 0.2) !important;
                border: 1px dashed #f44336 !important;
                animation: stackguard-pulse 2s infinite;
            }
            
            .stackguard-address-warning {
                background: rgba(255, 152, 0, 0.2) !important;
                border: 1px dashed #ff9800 !important;
            }
            
            .stackguard-tooltip {
                position: absolute;
                top: -50px;
                left: 0;
                background: #333;
                color: white;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 12px;
                white-space: nowrap;
                z-index: 999999;
                opacity: 0;
                transition: opacity 0.3s ease;
                pointer-events: none;
            }
            
            .stackguard-tooltip::after {
                content: '';
                position: absolute;
                top: 100%;
                left: 20px;
                border: 5px solid transparent;
                border-top-color: #333;
            }
            
            .stackguard-tooltip.show {
                opacity: 1;
            }
            
            @keyframes stackguard-pulse {
                0% { opacity: 0.8; }
                50% { opacity: 0.4; }
                100% { opacity: 0.8; }
            }
            
            .stackguard-protection-badge {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 10px 15px;
                border-radius: 25px;
                font-size: 12px;
                font-weight: bold;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                z-index: 999998;
                cursor: pointer;
                transition: transform 0.3s ease;
            }
            
            .stackguard-protection-badge:hover {
                transform: translateY(-2px);
            }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }
    
    scanForStacksAddresses() {
        if (this.isScanning) return;
        this.isScanning = true;
        
        try {
            const walker = document.createTreeWalker(
                document.body,
                NodeFilter.SHOW_TEXT,
                null,
                false
            );
            
            const textNodes = [];
            let node;
            
            while (node = walker.nextNode()) {
                if (node.textContent.match(this.addressRegex)) {
                    textNodes.push(node);
                }
            }
            
            textNodes.forEach(textNode => {
                this.highlightAddressesInNode(textNode);
            });
            
        } catch (error) {
            console.error('Error scanning for addresses:', error);
        } finally {
            this.isScanning = false;
        }
    }
    
    highlightAddressesInNode(textNode) {
        const text = textNode.textContent;
        const matches = [...text.matchAll(this.addressRegex)];
        
        if (matches.length === 0) return;
        
        const parent = textNode.parentNode;
        if (!parent || parent.classList?.contains('stackguard-address-highlight')) {
            return; // Already processed
        }
        
        let newHTML = text;
        const addresses = [];
        
        matches.reverse().forEach(match => {
            const address = match[0];
            addresses.push(address);
            
            const spanId = `stackguard-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const replacement = `<span class="stackguard-address-highlight" data-address="${address}" data-span-id="${spanId}">${address}</span>`;
            
            newHTML = newHTML.substring(0, match.index) + replacement + newHTML.substring(match.index + address.length);
        });
        
        const wrapper = document.createElement('span');
        wrapper.innerHTML = newHTML;
        parent.replaceChild(wrapper, textNode);
        
        // Check security for each address
        addresses.forEach(address => {
            this.checkAddressSecurity(address);
        });
    }
    
    async checkAddressSecurity(address) {
        try {
            const response = await chrome.runtime.sendMessage({
                type: 'CHECK_ADDRESS',
                address: address
            });
            
            this.updateAddressHighlight(address, response);
        } catch (error) {
            console.error('Error checking address security:', error);
        }
    }
    
    updateAddressHighlight(address, securityData) {
        const elements = document.querySelectorAll(`[data-address="${address}"]`);
        
        elements.forEach(element => {
            // Remove existing classes
            element.classList.remove('stackguard-address-danger', 'stackguard-address-warning');
            
            // Add appropriate class based on risk
            if (securityData.risk === 'critical' || securityData.risk === 'high') {
                element.classList.add('stackguard-address-danger');
            } else if (securityData.risk === 'medium') {
                element.classList.add('stackguard-address-warning');
            }
            
            // Add tooltip
            this.addTooltip(element, securityData);
            
            // Add click handler
            element.addEventListener('click', (e) => {
                e.preventDefault();
                this.showAddressDetails(address, securityData);
            });
        });
    }
    
    addTooltip(element, securityData) {
        const tooltip = document.createElement('div');
        tooltip.className = 'stackguard-tooltip';
        
        let riskEmoji = '✅';
        if (securityData.risk === 'critical') riskEmoji = '🚨';
        else if (securityData.risk === 'high') riskEmoji = '⚠️';
        else if (securityData.risk === 'medium') riskEmoji = '🔶';
        
        tooltip.textContent = `${riskEmoji} ${securityData.threat} (${securityData.confidence}% confidence)`;
        element.appendChild(tooltip);
        
        // Show/hide tooltip on hover
        element.addEventListener('mouseenter', () => {
            tooltip.classList.add('show');
        });
        
        element.addEventListener('mouseleave', () => {
            tooltip.classList.remove('show');
        });
    }
    
    showAddressDetails(address, securityData) {
        const modal = document.createElement('div');
        modal.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                z-index: 999999;
                display: flex;
                justify-content: center;
                align-items: center;
            ">
                <div style="
                    background: white;
                    padding: 30px;
                    border-radius: 15px;
                    max-width: 500px;
                    text-align: center;
                    font-family: Arial, sans-serif;
                ">
                    <h3 style="margin-bottom: 20px; color: #333;">
                        🛡️ Address Security Report
                    </h3>
                    <p style="font-family: monospace; background: #f5f5f5; padding: 10px; border-radius: 5px; word-break: break-all;">
                        ${address}
                    </p>
                    <div style="margin: 20px 0;">
                        <p><strong>Risk Level:</strong> ${securityData.risk}</p>
                        <p><strong>Threat Type:</strong> ${securityData.threat}</p>
                        <p><strong>Confidence:</strong> ${securityData.confidence}%</p>
                    </div>
                    <div style="display: flex; gap: 15px; justify-content: center;">
                        <button onclick="this.closest('div').parentElement.remove()" style="
                            background: #2196F3;
                            color: white;
                            border: none;
                            padding: 10px 20px;
                            border-radius: 5px;
                            cursor: pointer;
                        ">Close</button>
                        <button onclick="window.open('${this.apiEndpoint}', '_blank')" style="
                            background: #4CAF50;
                            color: white;
                            border: none;
                            padding: 10px 20px;
                            border-radius: 5px;
                            cursor: pointer;
                        ">View Full Report</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    setupMutationObserver() {
        const observer = new MutationObserver((mutations) => {
            let shouldScan = false;
            
            mutations.forEach(mutation => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE) {
                            shouldScan = true;
                        }
                    });
                }
            });
            
            if (shouldScan) {
                setTimeout(() => this.scanForStacksAddresses(), 1000);
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    setupEventListeners() {
        // Listen for messages from background script
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.type === 'SECURITY_ALERT') {
                this.showSecurityAlert(message.data);
            }
        });
        
        // Add protection badge
        this.addProtectionBadge();
    }
    
    addProtectionBadge() {
        const badge = document.createElement('div');
        badge.className = 'stackguard-protection-badge';
        badge.textContent = '🛡️ Protected by StackGuard';
        badge.addEventListener('click', () => {
            window.open(this.apiEndpoint, '_blank');
        });
        
        document.body.appendChild(badge);
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            badge.style.opacity = '0.3';
        }, 5000);
        
        // Show on hover
        badge.addEventListener('mouseenter', () => {
            badge.style.opacity = '1';
        });
    }
    
    showSecurityAlert(alertData) {
        chrome.notifications?.create({
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: 'StackGuard Security Alert',
            message: alertData.message
        });
    }
}

// Initialize content script when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new StackGuardContent();
    });
} else {
    new StackGuardContent();
}
