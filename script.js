// Chart instances for system resources
let ramChart = null;
let cpuChart = null;
let diskChart = null;

document.addEventListener("DOMContentLoaded", () => {
  // Get existing canvas elements
  const blockHeightCtx = document
    .getElementById("blockHeightChart")
    .getContext("2d");

  const blockHeightChart = new Chart(blockHeightCtx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Current Blocks",
          data: [],
          borderColor: "#3498db",
          backgroundColor: "rgba(52, 152, 219, 0.1)",
          borderWidth: 2,
          fill: true,
        },
        {
          label: "Target Headers",
          data: [],
          borderColor: "#e74c3c",
          backgroundColor: "rgba(231, 76, 60, 0.1)",
          borderWidth: 2,
          fill: false,
        }
      ],
    },
    options: {
      responsive: true,
      scales: {
        x: {
          title: {
            display: true,
            text: "Time",
          },
          grid: {
            color: "rgba(0, 0, 0, 0.05)",
          }
        },
        y: {
          title: {
            display: true,
            text: "Block Height",
          },
          grid: {
            color: "rgba(0, 0, 0, 0.05)",
          }
        },
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
        }
      }
    },
  });

  function updateChart(data) {
    const latestData = data[data.length - 1];
    if (!latestData) return;

    const blockchainInfo = latestData.blockchainInfo;
    const info = latestData.info;

    // Update block height with more context
    const blockHeightElement = document.getElementById("block-height");
    if (blockHeightElement) {
      const blocks = blockchainInfo.blocks || 0;
      const headers = blockchainInfo.headers || 0;
      const sizeOnDisk = (blockchainInfo.size_on_disk || 0) / (1024 * 1024 * 1024); // Convert to GiB
      const totalSize = 14.19; // Total expected size in GiB
      const sizePercent = ((sizeOnDisk / totalSize) * 100).toFixed(2);
      
      // Check if blocks match headers (indicating sync is complete)
      if (blocks === headers && blocks > 0) {
        blockHeightElement.textContent = `Current Block Height: ${blocks}`;
        blockHeightElement.className = 'synced';
      } else {
        blockHeightElement.textContent = `Reindexing blocks | ${sizeOnDisk.toFixed(2)} GiB / ${totalSize} GiB (${sizePercent}%, ${blocks} blocks)`;
        blockHeightElement.className = 'reindexing';
      }
    }

    // Update progress chart
    const blocks = blockchainInfo.blocks || 0;
    const headers = blockchainInfo.headers || 0;
    let progress;
    
    // If blocks match headers, show 100% progress
    if (blocks === headers && blocks > 0) {
        progress = 100;
    } else {
        const sizeOnDisk = (blockchainInfo.size_on_disk || 0) / (1024 * 1024 * 1024); // Convert to GiB
        const totalSize = 14.19; // Total expected size in GiB
        progress = (sizeOnDisk / totalSize) * 100;
    }
    const progressElement = document.getElementById("progressChart");
    if (progressElement) {
      const progressCtx = progressElement.getContext("2d");
      if (!progressCtx.chart) {
        progressCtx.chart = new Chart(progressCtx, {
          type: "bar",
          data: {
            labels: ["Synchronization Progress"],
            datasets: [
              {
                label: "Progress",
                data: [progress],
                backgroundColor: "rgba(52, 152, 219, 0.6)",
                borderColor: "rgba(52, 152, 219, 1)",
                borderWidth: 1,
              },
            ],
          },
          options: {
            indexAxis: "y",
            responsive: true,
            scales: {
              x: {
                beginAtZero: true,
                max: 100,
                grid: {
                  color: "rgba(0, 0, 0, 0.05)",
                },
                title: {
                  display: true,
                  text: "Percentage",
                },
              },
            },
            plugins: {
              legend: {
                display: false,
              },
            },
          },
        });
      } else {
        progressCtx.chart.data.datasets[0].data = [progress];
        progressCtx.chart.update('none');
      }
    }

    // Update additional info
    const additionalInfo = document.getElementById("additional-info");
    if (additionalInfo) {
      additionalInfo.innerHTML = `
        <div class="info-item">
          <span class="info-label">Version:</span>
          <span class="info-value">${info.version || "N/A"}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Protocol Version:</span>
          <span class="info-value">${info.protocolversion || "N/A"}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Connections:</span>
          <span class="info-value">${info.connections || "N/A"}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Reindex Progress:</span>
          <span class="info-value">
            ${((blockchainInfo.size_on_disk || 0) / (1024 * 1024 * 1024)).toFixed(2)} GiB / 14.19 GiB
          </span>
        </div>
        <div class="info-item">
          <span class="info-label">Current Blocks:</span>
          <span class="info-value">${blockchainInfo.blocks || 0}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Chain:</span>
          <span class="info-value">${blockchainInfo.chain || "N/A"}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Headers:</span>
          <span class="info-value">${blockchainInfo.headers || "N/A"}</span>
        </div>
      `;
    }

    // Update charts
    blockHeightChart.data.labels = data.map((d) =>
      new Date(d.timestamp).toLocaleTimeString()
    );
    // Update block height chart with both blocks and headers
    blockHeightChart.data.datasets = [
      {
        label: "Current Blocks",
        data: data.map((d) => d.blockchainInfo.blocks || 0),
        borderColor: "#3498db",
        backgroundColor: "rgba(52, 152, 219, 0.1)",
        borderWidth: 2,
        fill: true,
      },
      {
        label: "Target Headers",
        data: data.map((d) => d.blockchainInfo.headers || 0),
        borderColor: "#e74c3c",
        backgroundColor: "rgba(231, 76, 60, 0.1)",
        borderWidth: 2,
        fill: false,
      }
    ];
    blockHeightChart.update('none');
  }

  function updateSystemResourceCharts(data) {
    const systemResourceInfo = document.getElementById('system-resource-info');
    if (!systemResourceInfo) return;

    // Create canvas elements if they don't exist
    if (!document.getElementById('ramUsageChart')) {
      systemResourceInfo.innerHTML = `
        <div class="chart-wrapper">
          <canvas id="ramUsageChart"></canvas>
        </div>
        <div class="chart-wrapper">
          <canvas id="cpuUsageChart"></canvas>
        </div>
        <div class="chart-wrapper">
          <canvas id="diskUsageChart"></canvas>
        </div>
      `;
    }

    // Clear any existing resource details
    document.querySelectorAll('.resource-details').forEach(el => el.remove());

    // RAM Usage Chart with detailed info
    const totalRAM = data.memory.totalMem / (1024 * 1024 * 1024); // Convert to GB
    const freeRAM = data.memory.freeMem / (1024 * 1024 * 1024);
    const usedRAM = totalRAM - freeRAM;
    const ramUsagePercent = (usedRAM / totalRAM) * 100;
    
    // Add RAM details text
    const ramDetails = document.createElement('div');
    ramDetails.className = 'resource-details';
    ramDetails.innerHTML = `
      <strong>RAM Usage:</strong> ${usedRAM.toFixed(2)} GB / ${totalRAM.toFixed(2)} GB (${ramUsagePercent.toFixed(1)}%)
    `;
    document.getElementById('ramUsageChart').parentElement.appendChild(ramDetails);
    
    const ramCtx = document.getElementById('ramUsageChart').getContext('2d');
    
    if (ramChart) {
      ramChart.data.datasets[0].data = [ramUsagePercent, 100 - ramUsagePercent];
      ramChart.update('none');
    } else {
      ramChart = new Chart(ramCtx, {
        type: 'doughnut',
        data: {
          labels: ['Used RAM', 'Free RAM'],
          datasets: [{
            data: [ramUsagePercent, 100 - ramUsagePercent],
            backgroundColor: ['rgba(52, 152, 219, 0.6)', 'rgba(52, 152, 219, 0.2)'],
            borderColor: ['rgba(52, 152, 219, 1)', 'rgba(52, 152, 219, 0.5)'],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'RAM Usage (%)' }
          }
        }
      });
    }

    // CPU Usage Chart with detailed info
    const cpuLoad = data.cpu.loadavg[0] / data.cpu.cores * 100;
    const cpuDetails = document.createElement('div');
    cpuDetails.className = 'resource-details';
    cpuDetails.innerHTML = `
      <strong>CPU Usage:</strong> ${cpuLoad.toFixed(1)}% (${data.cpu.cores} cores)
      <br>
      <strong>Load Average:</strong> ${data.cpu.loadavg.map(load => load.toFixed(2)).join(', ')} (1m, 5m, 15m)
    `;
    document.getElementById('cpuUsageChart').parentElement.appendChild(cpuDetails);
    
    const cpuCtx = document.getElementById('cpuUsageChart').getContext('2d');
    
    if (cpuChart) {
      cpuChart.data.datasets[0].data = [cpuLoad];
      cpuChart.update('none');
    } else {
      cpuChart = new Chart(cpuCtx, {
        type: 'bar',
        data: {
          labels: ['CPU Load'],
          datasets: [{
            label: 'CPU Load (%)',
            data: [cpuLoad],
            backgroundColor: 'rgba(46, 204, 113, 0.6)',
            borderColor: 'rgba(46, 204, 113, 1)',
            borderWidth: 1
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          scales: {
            x: {
              beginAtZero: true,
              max: 100,
              grid: {
                color: "rgba(0, 0, 0, 0.05)",
              },
              title: { display: true, text: 'Percentage' }
            }
          },
          plugins: { legend: { display: false } }
        }
      });
    }

    // Disk Usage Chart with detailed info
    const diskUsagePercent = parseInt(data.disk.used.replace('%', ''));
    const diskDetails = document.createElement('div');
    diskDetails.className = 'resource-details';
    diskDetails.innerHTML = `
      <strong>Disk Space:</strong> ${data.disk.used} used of ${data.disk.total}
      <br>
      <strong>Available:</strong> ${data.disk.available}
    `;
    document.getElementById('diskUsageChart').parentElement.appendChild(diskDetails);
    
    const diskCtx = document.getElementById('diskUsageChart').getContext('2d');
    
    if (diskChart) {
      diskChart.data.datasets[0].data = [diskUsagePercent, 100 - diskUsagePercent];
      diskChart.update('none');
    } else {
      diskChart = new Chart(diskCtx, {
        type: 'doughnut',
        data: {
          labels: ['Used Space', 'Free Space'],
          datasets: [{
            data: [diskUsagePercent, 100 - diskUsagePercent],
            backgroundColor: ['rgba(155, 89, 182, 0.6)', 'rgba(155, 89, 182, 0.2)'],
            borderColor: ['rgba(155, 89, 182, 1)', 'rgba(155, 89, 182, 0.5)'],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Disk Usage (%)' }
          }
        }
      });
    }
  }

  function fetchSystemResourceInfo() {
    fetch("/system-resource-info")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch system resource info");
        }
        return response.json();
      })
      .then((data) => {
        updateSystemResourceCharts(data);
      })
      .catch((error) => {
        console.error("Error fetching system resource info:", error);
      });
  }

  function fetchData() {
    fetch("/wallet-info")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch wallet info");
        }
        return response.json();
      })
      .then((data) => {
        updateChart(data);
        fetchAdditionalData("getmininginfo", "mining-data");
        fetchAdditionalData("getnetworkinfo", "network-data");
        fetchAdditionalData("getnettotals", "net-totals-data");
      })
      .catch((error) => {
        console.error("Error fetching wallet info:", error);
        const walletData = document.getElementById("wallet-data");
        if (walletData) {
          walletData.innerHTML = "<p>Failed to load wallet information.</p>";
        }
      });
  }

  function fetchAdditionalData(endpoint, elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;

    fetch(`/${endpoint}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch ${endpoint}`);
        }
        return response.json();
      })
      .then((data) => {
        if (endpoint === "getmininginfo") {
          updateMiningInfo(data);
        } else if (endpoint === "getnetworkinfo") {
          updateNetworkInfo(data);
        } else if (endpoint === "getnettotals") {
          updateNetTotalsInfo(data);
        }
      })
      .catch((error) => {
        console.error(`Error fetching ${endpoint}:`, error);
        element.innerHTML = `<p>Failed to load ${endpoint}</p>`;
      });
  }

  function updateMiningInfo(data) {
    const miningInfo = document.getElementById("mining-data");
    if (!miningInfo) return;

    miningInfo.innerHTML = `
      <div class="info-item">
        <span class="info-label">Blocks:</span>
        <span class="info-value">${data.blocks || "N/A"}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Current Block Size:</span>
        <span class="info-value">${data.currentblocksize || "N/A"}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Current Block Tx:</span>
        <span class="info-value">${data.currentblocktx || "N/A"}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Difficulty:</span>
        <span class="info-value">${data.difficulty || "N/A"}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Network Hashps:</span>
        <span class="info-value">${data.networkhashps || "N/A"}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Pooled Tx:</span>
        <span class="info-value">${data.pooledtx || "N/A"}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Chain:</span>
        <span class="info-value">${data.chain || "N/A"}</span>
      </div>
    `;
  }

  function updateNetworkInfo(data) {
    const networkInfo = document.getElementById("network-data");
    if (!networkInfo) return;

    let networksHtml = `<div class="info-item"><span class="info-label">Networks:</span></div><ul>`;
    data.networks.forEach((network) => {
      networksHtml += `<li>${network.name}: Reachable - ${
        network.reachable ? "Yes" : "No"
      }</li>`;
    });
    networksHtml += "</ul>";

    networkInfo.innerHTML = `
      <div class="info-item">
        <span class="info-label">Version:</span>
        <span class="info-value">${data.version || "N/A"}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Subversion:</span>
        <span class="info-value">${data.subversion || "N/A"}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Protocol Version:</span>
        <span class="info-value">${data.protocolversion || "N/A"}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Connections:</span>
        <span class="info-value">${data.connections || "N/A"}</span>
      </div>
      ${networksHtml}
      <div class="info-item">
        <span class="info-label">Relay Fee:</span>
        <span class="info-value">${data.relayfee || "N/A"}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Local Addresses:</span>
      </div>
      <ul>
        ${data.localaddresses
          .map(
            (addr) =>
              `<li>${addr.address}:${addr.port} (Score: ${addr.score})</li>`
          )
          .join("")}
      </ul>
    `;
  }

  function updateNetTotalsInfo(data) {
    const netTotalsInfo = document.getElementById("net-totals-data");
    if (!netTotalsInfo) return;

    netTotalsInfo.innerHTML = `
      <div class="info-item">
        <span class="info-label">Total Bytes Received:</span>
        <span class="info-value">${formatBytes(data.totalbytesrecv)}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Total Bytes Sent:</span>
        <span class="info-value">${formatBytes(data.totalbytessent)}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Time:</span>
        <span class="info-value">${new Date(data.timemillis).toLocaleString()}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Upload Target:</span>
        <span class="info-value">${formatBytes(data.uploadtarget.target)}/s</span>
      </div>
    `;
  }

  function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  function updateNodeStatus() {
    fetch("/bitcoinz-status")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch node status");
        }
        return response.json();
      })
      .then((data) => {
        const statusElement = document.getElementById("node-status");
        if (statusElement) {
          if (data.status === "active") {
            statusElement.textContent = "Running";
            statusElement.style.color = "#2ecc71";
          } else {
            statusElement.textContent = "Stopped";
            statusElement.style.color = "#e74c3c";
          }
        }
      })
      .catch((error) => {
        console.error("Error fetching node status:", error);
        const statusElement = document.getElementById("node-status");
        if (statusElement) {
          statusElement.textContent = "Error";
          statusElement.style.color = "#e74c3c";
        }
      });
  }

  let logRefreshInterval;

  function fetchLogs() {
    const lines = document.getElementById('log-lines').value;
    fetch(`/bitcoinz-logs?lines=${lines}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch logs");
        }
        return response.text();
      })
      .then((logs) => {
        const logOutput = document.getElementById("log-output");
        if (logOutput) {
          logOutput.innerHTML = logs;
          // Auto-scroll to bottom if user hasn't scrolled up
          if (logOutput.scrollHeight - logOutput.scrollTop === logOutput.clientHeight) {
            logOutput.scrollTop = logOutput.scrollHeight;
          }
        }
      })
      .catch((error) => {
        console.error("Error fetching logs:", error);
        const logOutput = document.getElementById("log-output");
        if (logOutput) {
          logOutput.innerHTML = "<p>Failed to load logs.</p>";
        }
      });
  }

  function setupLogControls() {
    const refreshButton = document.getElementById('refresh-logs');
    const autoRefreshCheckbox = document.getElementById('auto-refresh');
    const refreshIntervalInput = document.getElementById('refresh-interval');
    const logLinesInput = document.getElementById('log-lines');

    function updateLogRefreshInterval() {
      clearInterval(logRefreshInterval);
      if (autoRefreshCheckbox.checked) {
        const interval = Math.max(2, parseInt(refreshIntervalInput.value) || 5) * 1000;
        logRefreshInterval = setInterval(fetchLogs, interval);
      }
    }

    // Event listeners for controls
    refreshButton.addEventListener('click', fetchLogs);
    
    autoRefreshCheckbox.addEventListener('change', () => {
      refreshIntervalInput.disabled = !autoRefreshCheckbox.checked;
      updateLogRefreshInterval();
    });

    refreshIntervalInput.addEventListener('change', updateLogRefreshInterval);
    
    logLinesInput.addEventListener('change', () => {
      logLinesInput.value = Math.max(10, Math.min(1000, parseInt(logLinesInput.value) || 200));
      fetchLogs();
    });

    // Initial setup
    refreshIntervalInput.disabled = !autoRefreshCheckbox.checked;
    fetchLogs();
    updateLogRefreshInterval();
  }

  function setupControlButtons() {
    const startBtn = document.getElementById("start-btn");
    const restartBtn = document.getElementById("restart-btn");
    const stopBtn = document.getElementById("stop-btn");

    if (startBtn) {
      startBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to start the BitcoinZ node?")) {
          fetch("/start-bitcoinz")
            .then((response) => {
              if (!response.ok) {
                throw new Error("Failed to start BitcoinZ node");
              }
              updateNodeStatus();
            })
            .catch((error) => {
              console.error("Error starting BitcoinZ node:", error);
            });
        }
      });
    }

    if (restartBtn) {
      restartBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to restart the BitcoinZ node?")) {
          fetch("/restart-bitcoinz")
            .then((response) => {
              if (!response.ok) {
                throw new Error("Failed to restart BitcoinZ node");
              }
              updateNodeStatus();
            })
            .catch((error) => {
              console.error("Error restarting BitcoinZ node:", error);
            });
        }
      });
    }

    if (stopBtn) {
      stopBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to stop the BitcoinZ node?")) {
          fetch("/stop-bitcoinz")
            .then((response) => {
              if (!response.ok) {
                throw new Error("Failed to stop BitcoinZ node");
              }
              updateNodeStatus();
            })
            .catch((error) => {
              console.error("Error stopping BitcoinZ node:", error);
            });
        }
      });
    }
  }

  // Initialize everything with proper error handling
  try {
    fetchData();
    setInterval(fetchData, 5000);
    fetchAdditionalData("getmininginfo", "mining-data");
    fetchAdditionalData("getnetworkinfo", "network-data");
    fetchAdditionalData("getnettotals", "net-totals-data");
    fetchSystemResourceInfo();
    setInterval(fetchSystemResourceInfo, 5000);
    setupControlButtons();
    setupLogControls();
    setInterval(updateNodeStatus, 10000);
  } catch (error) {
    console.error("Error during initialization:", error);
  }
});