# BitcoinZ Wallet Monitor

This is a simple web-based dashboard to monitor the BitcoinZ wallet and node status.

## Features

- Displays the current block height
- Shows synchronization progress
- Provides network connection information
- Displays mining information
- Shows system resource usage (RAM, CPU, Disk)
- Allows starting, stopping, and restarting the BitcoinZ node
- Displays BitcoinZ node logs

## Technologies Used

- HTML
- CSS
- JavaScript
- Chart.js

## Setup

1.  Clone the repository
2.  Open `index.html` in your browser

## API Endpoints

The application uses the following API endpoints:

-   `/wallet-info`: Returns wallet information
-   `/getmininginfo`: Returns mining information
-   `/getnetworkinfo`: Returns network information
-   `/getnettotals`: Returns network totals
-   `/system-resource-info`: Returns system resource information
-   `/bitcoinz-status`: Returns the status of the BitcoinZ node
-   `/bitcoinz-logs`: Returns BitcoinZ node logs
-   `/start-bitcoinz`: Starts the BitcoinZ node
-   `/restart-bitcoinz`: Restarts the BitcoinZ node
-   `/stop-bitcoinz`: Stops the BitcoinZ node

## Contributing

Feel free to contribute to this project by submitting pull requests.

## License

This project is open source and available under the MIT License.