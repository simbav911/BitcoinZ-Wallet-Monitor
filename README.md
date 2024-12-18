# BitcoinZ Wallet Monitor

A comprehensive web-based dashboard for monitoring BitcoinZ wallet and node status in real-time.

## Features

- **Blockchain Status Monitoring**
  - Real-time block height display
  - Visual sync status indication (synced vs reindexing)
  - Accurate progress tracking with percentage display
  - Automatic status updates every 5 seconds

- **Network Information**
  - Connection status and peer count
  - Network totals (bytes sent/received)
  - Detailed network configuration

- **Mining Information**
  - Current block details
  - Network difficulty
  - Hash rate statistics
  - Mining pool information

- **System Resource Monitoring**
  - RAM usage with visual graphs
  - CPU utilization tracking
  - Disk space monitoring
  - Real-time resource updates

- **Node Management**
  - Start/Stop/Restart node controls
  - Live node status indicator
  - Detailed log viewing
  - Configurable log refresh settings

## Technologies Used

- HTML5
- CSS3 with modern UI features
- JavaScript (ES6+)
- Chart.js for data visualization

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/bitcoinz-wallet-monitor.git
   cd bitcoinz-wallet-monitor
   ```

2. Configure your BitcoinZ node:
   - Ensure your BitcoinZ node is running and accessible
   - The monitor expects the node's RPC interface to be enabled
   - Default RPC port is typically 1979

3. Set up the web interface:
   - Configure the API endpoints in your server to match the expected routes
   - Ensure CORS is properly configured if running on a different domain
   - Set up proper authentication if needed

## Usage

1. Start your BitcoinZ node
2. Open `index.html` in a web browser
3. The dashboard will automatically:
   - Connect to your node
   - Display current status
   - Update information every 5 seconds
   - Show sync progress
   - Monitor system resources

## API Endpoints Required

The application expects the following API endpoints to be available:

- `/wallet-info`: GET - Returns wallet and blockchain information
  ```json
  {
    "blockchainInfo": {
      "blocks": number,
      "headers": number,
      "size_on_disk": number
    },
    "info": {
      "version": string,
      "protocolversion": number,
      "connections": number
    }
  }
  ```

- `/getmininginfo`: GET - Returns mining statistics
- `/getnetworkinfo`: GET - Returns network configuration and status
- `/getnettotals`: GET - Returns network traffic information
- `/system-resource-info`: GET - Returns system resource usage
- `/bitcoinz-status`: GET - Returns node operational status
- `/bitcoinz-logs`: GET - Returns node logs
  - Query parameter: `lines` (number of log lines to return)
- `/start-bitcoinz`: POST - Starts the BitcoinZ node
- `/restart-bitcoinz`: POST - Restarts the BitcoinZ node
- `/stop-bitcoinz`: POST - Stops the BitcoinZ node

## Recent Updates

- Added visual indicators for sync status
- Improved progress tracking accuracy
- Enhanced UI with status-specific styling
- Fixed progress calculation for synced state
- Added automatic 100% progress indication when fully synced

## Troubleshooting

Common issues and solutions:

1. **Monitor shows "Failed to load wallet information"**
   - Verify BitcoinZ node is running
   - Check RPC connection settings
   - Ensure proper network connectivity

2. **Progress stuck at certain percentage**
   - Check disk space availability
   - Verify node has proper permissions
   - Check node log for potential issues

3. **System resource graphs not updating**
   - Ensure proper permissions for resource monitoring
   - Check browser console for errors
   - Verify server endpoint accessibility

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/YourFeature`
3. Commit your changes: `git commit -am 'Add YourFeature'`
4. Push to the branch: `git push origin feature/YourFeature`
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For support, please:
1. Check the issues section for known problems
2. Create a new issue if your problem is not listed
3. Provide detailed information about your setup and the issue