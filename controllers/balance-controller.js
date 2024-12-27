import balanceManager from '../components/balance.js';
import addressManager from '../components/address.js';
import eventBus, { Events } from '../utils/event-bus.js';

export class BalanceController {
  constructor() {
    this.balanceManager = balanceManager;
    this.addressManager = addressManager;
    this.refreshInterval = null;
    this.initEventListeners();
    this.initializeView();
    this.startAutoRefresh();
  }

  initEventListeners() {
    // Listen for transaction events
    this.transactionListener = () => this.updateBalanceDisplay();
    eventBus.on(Events.TRANSACTION_SENT, this.transactionListener);
    eventBus.on(Events.TRANSACTION_CONFIRMED, this.transactionListener);

    // Listen for address events
    this.addressListener = () => this.updateBalanceDisplay();
    eventBus.on(Events.ADDRESS_CHANGED, this.addressListener);
    eventBus.on(Events.ADDRESS_GENERATED, this.addressListener);
  }

  async initializeView() {
    console.log('Initializing balance view...');
    await this.updateBalanceDisplay();
    await this.updateBalanceInfo();
  }

  async updateBalanceDisplay() {
    const balanceElements = document.querySelectorAll('.balance-amount');
    if (balanceElements.length > 0) {
      try {
        console.log('Fetching current balance...');
        const currentAddress = this.addressManager.getCurrentAddress();
        const balance = (await this.balanceManager.getBalance()).total;
        console.log('Current balance:', balance);
        
        balanceElements.forEach(element => {
          element.textContent = balance.toFixed(8);
        });
      } catch (error) {
        console.error('Failed to update balance:', error);
        balanceElements.forEach(element => {
          element.textContent = '0.00000000';
        });
      }
    }
  }

  async updateBalanceInfo() {
    const availableElement = document.querySelector('.balance-info-value');
    const pendingElement = document.querySelectorAll('.balance-info-value')[1];

    if (availableElement && pendingElement) {
      try {
        console.log('Fetching balance info...');
        const currentAddress = this.addressManager.getCurrentAddress();
        const balance = (await this.balanceManager.getBalance()).total;
        console.log('Balance info:', balance);
        
        availableElement.textContent = `${balance.toFixed(8)} BTCZ`;
        pendingElement.textContent = '0.00000000 BTCZ';
      } catch (error) {
        console.error('Failed to update balance info:', error);
        availableElement.textContent = '0.00000000 BTCZ';
        pendingElement.textContent = '0.00000000 BTCZ';
      }
    }
  }

  startAutoRefresh() {
    // Initial update
    this.updateBalanceDisplay();
    this.updateBalanceInfo();

    // Set up interval for periodic updates
    this.refreshInterval = setInterval(() => {
      this.updateBalanceDisplay();
      this.updateBalanceInfo();
    }, 5000);
  }

  destroy() {
    // Clean up event listeners
    if (this.transactionListener) {
      eventBus.off(Events.TRANSACTION_SENT, this.transactionListener);
      eventBus.off(Events.TRANSACTION_CONFIRMED, this.transactionListener);
    }

    if (this.addressListener) {
      eventBus.off(Events.ADDRESS_CHANGED, this.addressListener);
      eventBus.off(Events.ADDRESS_GENERATED, this.addressListener);
    }

    // Clean up refresh interval
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }
}
