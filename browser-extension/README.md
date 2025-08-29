# 🛡️ StackGuard Browser Extension

**Real-time security protection for Stacks blockchain interactions**

## 🚀 Features

### ✅ **Real-time Address Scanning**
- Automatically detects and highlights Stacks addresses on any webpage
- Instant security assessment with visual risk indicators
- Hover tooltips showing threat details and confidence levels

### 🚨 **Threat Detection**
- **Phishing Protection** - Blocks known phishing sites
- **Malware Detection** - Identifies malware distribution addresses
- **Scam Prevention** - Warns about reported scam addresses
- **Suspicious Activity** - Flags addresses with unusual patterns

### 🔍 **Quick Security Check**
- Popup interface for instant address lookup
- Integration with StackGuard threat intelligence database
- One-click reporting for new threats

### 🌐 **Website Protection**
- Automatic scanning of crypto-related websites
- Security badges and warnings for dangerous sites
- Real-time protection while browsing DeFi platforms

### 📊 **Community Integration**
- Submit threat reports directly from the browser
- Access full StackGuard dashboard
- View community statistics and your contributions

## 🛠️ Installation

### Method 1: Developer Mode (Recommended for testing)

1. **Download the Extension**
   ```
   Download or clone the StackGuard repository
   Navigate to: /browser-extension/
   ```

2. **Enable Developer Mode**
   - Open Chrome/Edge and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right)

3. **Load the Extension**
   - Click "Load unpacked"
   - Select the `browser-extension` folder
   - The extension will be installed and activated

4. **Configure Settings**
   - Click the StackGuard extension icon
   - Go to "Settings & Options"
   - Configure your preferences

### Method 2: Chrome Web Store (Coming Soon)
The extension will be available on the Chrome Web Store after review.

## 🔧 Configuration

### Security Settings
- **Real-time Address Scanning**: Scan addresses automatically
- **Security Notifications**: Show browser notifications for threats
- **Address Warnings**: Display warning overlays on dangerous sites
- **Phishing Protection**: Block access to known phishing sites

### API Configuration
- **StackGuard API Endpoint**: `http://localhost:3001` (default)
- **Update Frequency**: How often to update threat database (4 hours default)

## 🎯 How It Works

### 1. **Address Detection**
The extension scans web pages for Stacks addresses (starting with SP or ST) and highlights them with security indicators:

- 🟢 **Green**: Clean address, no threats detected
- 🟡 **Yellow**: Medium risk, suspicious activity
- 🟠 **Orange**: High risk, phishing attempts
- 🔴 **Red**: Critical risk, known malicious address

### 2. **Real-time Protection**
When you visit crypto-related websites, the extension:
- Checks the domain against threat databases
- Shows security badges and warnings
- Updates the browser badge with threat level
- Displays notifications for immediate threats

### 3. **Interactive Features**
- **Click any highlighted address** to see detailed security report
- **Use the popup** to manually check addresses
- **Report threats** directly to the community
- **Access full dashboard** for comprehensive security analysis

## 📱 Usage Examples

### Checking an Address
1. Visit any website with Stacks addresses
2. Addresses are automatically highlighted with risk colors
3. Hover over an address to see threat details
4. Click for full security report

### Manual Address Check
1. Click the StackGuard extension icon
2. Enter a Stacks address in the input field
3. Click "Check Address Security"
4. View the security assessment

### Reporting a Threat
1. Click the extension icon
2. Select "Report Security Threat"
3. Fill out the threat report form
4. Submit to help protect the community

## 🛡️ Security & Privacy

### Data Collection
- **No personal data** is collected or stored
- **Address checks** are performed securely
- **Threat reports** are anonymous by default
- **Local storage** used for settings and cache only

### Permissions Explained
- `activeTab`: Check security of current website
- `storage`: Save settings and threat database cache
- `notifications`: Show security alerts
- `alarms`: Schedule database updates
- `host_permissions`: Scan web pages for addresses

## 🔄 Updates

The extension automatically:
- Updates threat databases every 4 hours
- Syncs with the latest StackGuard intelligence
- Downloads new security patterns
- Maintains local cache for faster lookups

## 🆘 Support & Troubleshooting

### Common Issues

**Extension not detecting addresses:**
- Ensure "Real-time Address Scanning" is enabled in settings
- Try refreshing the page
- Check if the address format is valid (SP/ST prefix)

**API connection issues:**
- Verify the StackGuard dashboard is running at `http://localhost:3001`
- Check the API endpoint in extension settings
- Ensure no firewall is blocking the connection

**Notifications not showing:**
- Enable "Security Notifications" in extension settings
- Check browser notification permissions
- Verify notifications aren't blocked for the extension

### Getting Help
- Open an issue on [GitHub](https://github.com/stackguard/extension)
- Visit the [Support Page](https://stackguard.com/support)
- Email: support@stackguard.com

## 🚀 Development

### Building the Extension
```bash
cd browser-extension
# All files are ready to load as unpacked extension
```

### Project Structure
```
browser-extension/
├── manifest.json          # Extension manifest
├── popup.html             # Extension popup UI
├── popup.js               # Popup functionality
├── background.js          # Service worker
├── content.js             # Content script
├── content.css            # Content styles
├── options.html           # Settings page
├── options.js             # Settings functionality
└── icons/                 # Extension icons (add your own)
```

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Built for the Stacks blockchain community
- Powered by StackGuard threat intelligence
- Inspired by community-driven security initiatives

---

**Stay safe in the crypto space with StackGuard! 🛡️**
