const express = require("express");
const { exec } = require("child_process");
const cors = require("cors");
const os = require("os");

const app = express();
const port = 3000;

app.use(cors());
// Serve static files from the current directory
app.use(express.static(__dirname));

let walletData = [];

// Remove redundant route since express.static will handle serving index.html
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

function fetchData() {
  // Get both blockchain info and general info in parallel
  Promise.all([
    new Promise((resolve) => {
      exec("bitcoinz-cli getblockchaininfo", (error, stdout, stderr) => {
        if (error || !stdout) {
          console.error("Error getting blockchain info:", error);
          resolve({});
        } else {
          try {
            resolve(JSON.parse(stdout));
          } catch (parseError) {
            console.error("Error parsing blockchain info:", parseError);
            resolve({});
          }
        }
      });
    }),
    new Promise((resolve) => {
      exec("bitcoinz-cli getinfo", (error, stdout, stderr) => {
        if (error || !stdout) {
          console.error("Error getting info:", error);
          resolve({});
        } else {
          try {
            resolve(JSON.parse(stdout));
          } catch (parseError) {
            console.error("Error parsing info:", parseError);
            resolve({});
          }
        }
      });
    })
  ]).then(([blockchainInfo, info]) => {
    // Always push data even if some values are missing
    walletData.push({
      timestamp: Date.now(),
      blockchainInfo: {
        ...blockchainInfo,
        blocks: blockchainInfo.blocks || info.blocks || 0,
        headers: blockchainInfo.headers || 0,
        verificationprogress: blockchainInfo.verificationprogress || 0
      },
      info: {
        ...info,
        blocks: info.blocks || blockchainInfo.blocks || 0,
        connections: info.connections || 0,
        version: info.version || 0
      }
    });

    if (walletData.length > 60) {
      walletData.shift();
    }
  });
}

// Fetch data every 5 seconds
setInterval(fetchData, 5000);

function fetchAndParse(command, callback) {
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return callback({ error: "Failed to fetch data" });
    }
    if (!stdout) {
      return callback({ error: "No data returned from command" });
    }
    try {
      const data = JSON.parse(stdout);
      callback(data);
    } catch (parseError) {
      console.error(`JSON parse error: ${parseError}`);
      callback({ error: "Failed to parse data" });
    }
  });
}

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/wallet-info", (req, res) => {
  res.json(walletData);
});

app.get("/getmininginfo", (req, res) => {
  fetchAndParse("bitcoinz-cli getmininginfo", (data) => {
    res.json(data);
  });
});

app.get("/getnetworkinfo", (req, res) => {
  fetchAndParse("bitcoinz-cli getnetworkinfo", (data) => {
    res.json(data);
  });
});

app.get("/getnettotals", (req, res) => {
  fetchAndParse("bitcoinz-cli getnettotals", (data) => {
    res.json(data);
  });
});

app.get("/getwalletinfo", (req, res) => {
  fetchAndParse("bitcoinz-cli getwalletinfo", (data) => {
    if (data.error && data.error.includes("Method not found")) {
      res.json({
        error: "Wallet functionality is not enabled on this node.",
      });
    } else {
      res.json(data);
    }
  });
});

app.get("/system-resource-info", (req, res) => {
  const memoryInfo = {
    totalMem: os.totalmem(),
    freeMem: os.freemem(),
  };

  const cpuInfo = {
    cores: os.cpus().length,
    loadavg: os.loadavg(), // Returns an array of 3 numbers representing the load average over the last 1, 5, and 15 minutes
  };

  exec("df -h / | awk 'NR==2{print $2, $3, $5}'", (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return res.status(500).json({ error: "Failed to fetch disk info" });
    }

    const diskInfo = stdout.trim().split(/\s+/);

    res.json({
      memory: memoryInfo,
      cpu: cpuInfo,
      disk: {
        total: diskInfo[0],
        used: diskInfo[1],
        available: diskInfo[2],
      },
    });
  });
});

app.get("/bitcoinz-status", (req, res) => {
  // First try systemctl
  exec("systemctl is-active bitcoinz", (error, stdout, stderr) => {
    if (!error && stdout.trim() === 'active') {
      res.json({ status: 'active' });
    } else {
      // If systemctl fails, try bitcoinz-cli
      exec("bitcoinz-cli getinfo", (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return res.status(500).json({ error: "Failed to check service status" });
        }
        try {
          JSON.parse(stdout); // If we can parse the output, the node is running
          res.json({ status: 'active' });
        } catch (parseError) {
          console.error(`JSON parse error: ${parseError}`);
          res.status(500).json({ error: "Failed to check service status" });
        }
      });
    }
  });
});

app.get("/bitcoinz-logs", (req, res) => {
  let lines = parseInt(req.query.lines) || 200; // Default to 200 lines
  // Ensure lines is between 10 and 1000 for safety
  lines = Math.max(10, Math.min(1000, lines));
  // Try to read from the debug.log file in the .bitcoinz directory
  exec(`tail -n ${lines} /root/.bitcoinz/debug.log`, (error, stdout, stderr) => {
    if (error) {
      console.error(`debug.log error: ${error}`);
      // If that fails, try journalctl
      exec(`journalctl -u bitcoinz -n ${lines}`, (error2, stdout2, stderr2) => {
        if (error2) {
          console.error(`journalctl error: ${error2}`);
          return res.status(500).json({ error: "Failed to fetch logs from both debug.log and journalctl" });
        }
        res.send(`<pre>${stdout2}</pre>`);
      });
    } else {
      // Format the log output to be more readable
      const formattedLogs = stdout
        .split('\n')
        .map(line => line.trim())
        .filter(line => line) // Remove empty lines
        .join('\n');
      res.send(`<pre>${formattedLogs}</pre>`);
    }
  });
});

function executeCommand(command, res) {
				exec(command, (error, stdout, stderr) => {
								if (error) {
												console.error(`exec error: ${error}`);
												return res.status(500).json({ error: 'Failed to execute command' });
								}
								res.json({ output: stdout });
				});
}

app.get('/start-bitcoinz', (req, res) => {
  executeCommand('systemctl start bitcoinz', res);
});

app.get('/stop-bitcoinz', (req, res) => {
  executeCommand('systemctl stop bitcoinz', res);
});

app.get('/restart-bitcoinz', (req, res) => {
  executeCommand('systemctl restart bitcoinz', res);
});

app.listen(port, () => {
		console.log(`Server is running on port ${port}`);
});