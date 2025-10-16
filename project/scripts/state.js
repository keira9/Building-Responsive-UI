import { storage } from './storage.js';

class State {
  constructor() {
    this.data = this.loadInitialData();
    this.listeners = [];
  }

  loadInitialData() {
    const saved = storage.load();
    if (saved) return saved;

    return {
      transactions: [],
      categories: ['Food', 'Books', 'Transport', 'Entertainment', 'Fees', 'Other'],
      settings: {
        baseCurrency: 'USD',
        exchangeRates: {
          EUR: 0.85,
          GBP: 0.73
        },
        monthlyCap: 500
      }
    };
  }

  subscribe(listener) {
    this.listeners.push(listener);
  }

  notify() {
    storage.save(this.data);
    this.listeners.forEach(listener => listener(this.data));
  }

  addTransaction(transaction) {
    const newTransaction = {
      ...transaction,
      id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.transactions.push(newTransaction);
    this.notify();
    return newTransaction;
  }

  updateTransaction(id, updates) {
    const index = this.data.transactions.findIndex(t => t.id === id);
    if (index === -1) return false;

    this.data.transactions[index] = {
      ...this.data.transactions[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.notify();
    return true;
  }

  deleteTransaction(id) {
    const index = this.data.transactions.findIndex(t => t.id === id);
    if (index === -1) return false;

    this.data.transactions.splice(index, 1);
    this.notify();
    return true;
  }

  getTransactions() {
    return [...this.data.transactions];
  }

  updateSettings(settings) {
    this.data.settings = { ...this.data.settings, ...settings };
    this.notify();
  }

  addCategory(category) {
    if (!this.data.categories.includes(category)) {
      this.data.categories.push(category);
      this.notify();
    }
  }

  importData(importedData) {
    this.data = importedData;
    this.notify();
  }

  clearAllData() {
    this.data = this.loadInitialData();
    storage.clear();
    this.notify();
  }
}

export const state = new State();
