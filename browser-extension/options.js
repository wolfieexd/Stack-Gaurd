// StackGuard Browser Extension - Options Page Script
class StackGuardOptions {
    constructor() {
        this.settings = {
            enableRealTimeScanning: true,
            enableNotifications: true,
            enableAddressWarnings: true,
            enablePhishingProtection: true,
            apiEndpoint: 'http://localhost:3001',
            updateFrequency: 4
        };
        this.init();
    }
    
    async init() {
        await this.loadSettings();
        await this.loadStatistics();
        this.setupEventListeners();
        this.updateUI();
    }
    
    async loadSettings() {
        try {
            const stored = await chrome.storage.sync.get(this.settings);
            this.settings = { ...this.settings, ...stored };
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }
    
    async saveSettings() {
        try {
            await chrome.storage.sync.set(this.settings);
            this.showStatus('Settings saved successfully!', 'success');
        } catch (error) {
            console.error('Error saving settings:', error);
            this.showStatus('Failed to save settings', 'error');
        }
    }
    
    async loadStatistics() {
        try {
            const stats = await chrome.storage.local.get([
                'addressesScanned',
                'threatsBlocked', 
                'sitesProtected',
                'reportsSubmitted'
            ]);
            
            document.getElementById('addresses-scanned').textContent = stats.addressesScanned || 0;
            document.getElementById('threats-blocked').textContent = stats.threatsBlocked || 0;
            document.getElementById('sites-protected').textContent = stats.sitesProtected || 0;
            document.getElementById('reports-submitted').textContent = stats.reportsSubmitted || 0;
            
        } catch (error) {
            console.error('Error loading statistics:', error);
        }
    }
    
    setupEventListeners() {
        // Toggle switches
        document.querySelectorAll('.toggle-switch').forEach(toggle => {
            toggle.addEventListener('click', () => {
                const setting = toggle.getAttribute('data-setting');
                this.settings[setting] = !this.settings[setting];
                this.updateToggle(toggle, this.settings[setting]);
            });
        });
        
        // Input fields
        document.getElementById('api-endpoint').addEventListener('change', (e) => {
            this.settings.apiEndpoint = e.target.value;
        });
        
        document.getElementById('update-frequency').addEventListener('change', (e) => {
            this.settings.updateFrequency = parseInt(e.target.value);
        });
        
        // Action buttons
        document.getElementById('save-settings').addEventListener('click', () => {
            this.saveSettings();
        });
        
        document.getElementById('reset-settings').addEventListener('click', () => {
            this.resetSettings();
        });
        
        document.getElementById('export-data').addEventListener('click', () => {
            this.exportData();
        });
        
        document.getElementById('clear-cache').addEventListener('click', () => {
            this.clearCache();
        });
        
        document.getElementById('open-dashboard').addEventListener('click', () => {
            chrome.tabs.create({ url: this.settings.apiEndpoint });
        });
        
        // Footer links
        document.getElementById('privacy-policy').addEventListener('click', (e) => {
            e.preventDefault();
            chrome.tabs.create({ url: 'https://stackguard.com/privacy' });
        });
        
        document.getElementById('support').addEventListener('click', (e) => {
            e.preventDefault();
            chrome.tabs.create({ url: 'https://stackguard.com/support' });
        });
        
        document.getElementById('report-bug').addEventListener('click', (e) => {
            e.preventDefault();
            chrome.tabs.create({ url: 'https://github.com/stackguard/extension/issues' });
        });
    }
    
    updateUI() {
        // Update toggle switches
        document.querySelectorAll('.toggle-switch').forEach(toggle => {
            const setting = toggle.getAttribute('data-setting');
            this.updateToggle(toggle, this.settings[setting]);
        });
        
        // Update input fields
        document.getElementById('api-endpoint').value = this.settings.apiEndpoint;
        document.getElementById('update-frequency').value = this.settings.updateFrequency;
    }
    
    updateToggle(toggleElement, isActive) {
        if (isActive) {
            toggleElement.classList.add('active');
        } else {
            toggleElement.classList.remove('active');
        }
    }
    
    async resetSettings() {
        if (confirm('Are you sure you want to reset all settings to defaults?')) {
            this.settings = {
                enableRealTimeScanning: true,
                enableNotifications: true,
                enableAddressWarnings: true,
                enablePhishingProtection: true,
                apiEndpoint: 'http://localhost:3001',
                updateFrequency: 4
            };
            
            this.updateUI();
            await this.saveSettings();
            this.showStatus('Settings reset to defaults', 'success');
        }
    }
    
    async exportData() {
        try {
            const allData = await chrome.storage.sync.get();
            const localData = await chrome.storage.local.get();
            
            const exportData = {
                settings: allData,
                statistics: localData,
                exportDate: new Date().toISOString(),
                version: '1.0.0'
            };
            
            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: 'application/json'
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `stackguard-data-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            
            URL.revokeObjectURL(url);
            this.showStatus('Data exported successfully!', 'success');
            
        } catch (error) {
            console.error('Error exporting data:', error);
            this.showStatus('Failed to export data', 'error');
        }
    }
    
    async clearCache() {
        if (confirm('Are you sure you want to clear the threat database cache?')) {
            try {
                await chrome.storage.local.remove(['threatDatabase']);
                this.showStatus('Cache cleared successfully!', 'success');
                
                // Reload statistics
                await this.loadStatistics();
                
            } catch (error) {
                console.error('Error clearing cache:', error);
                this.showStatus('Failed to clear cache', 'error');
            }
        }
    }
    
    showStatus(message, type) {
        const statusElement = document.getElementById('status-message');
        statusElement.textContent = message;
        statusElement.className = `status-message status-${type}`;
        statusElement.style.display = 'block';
        
        setTimeout(() => {
            statusElement.style.display = 'none';
        }, 5000);
    }
    
    // Update statistics periodically
    startStatisticsUpdate() {
        setInterval(() => {
            this.loadStatistics();
        }, 30000); // Update every 30 seconds
    }
}

// Initialize options page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const options = new StackGuardOptions();
    options.startStatisticsUpdate();
});
