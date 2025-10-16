// Application state management
import { storage } from './storage.js';

export const state = {
    transactions: [],
    settings: {
        currency: '$',
        spendingLimit: null
    },
    currentPage: 'dashboard',
    searchTerm: '',
    sortBy: 'date-desc',
    
    // Initialize state from localStorage
    init() {
        this.transactions = storage.loadTransactions();
        this.settings = storage.loadSettings();
    },

    // Add new transaction
    addTransaction(transactionData) {
        const transaction = {
            id: this.generateId(),
            ...transactionData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        this.transactions.push(transaction);
        this.saveTransactions();
        return transaction;
    },

    // Update existing transaction
    updateTransaction(id, updates) {
        const index = this.transactions.findIndex(t => t.id === id);
        if (index === -1) return null;
        
        this.transactions[index] = {
            ...this.transactions[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        
        this.saveTransactions();
        return this.transactions[index];
    },

    // Delete transaction
    deleteTransaction(id) {
        const index = this.transactions.findIndex(t => t.id === id);
        if (index === -1) return false;
        
        this.transactions.splice(index, 1);
        this.saveTransactions();
        return true;
    },

    // Get transaction by ID
    getTransaction(id) {
        return this.transactions.find(t => t.id === id);
    },

    // Save transactions to storage
    saveTransactions() {
        storage.saveTransactions(this.transactions);
    },

    // Update settings
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        storage.saveSettings(this.settings);
        

    },



    // Generate unique ID
    generateId() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 5);
        return `txn_${timestamp}_${random}`;
    },

    // Get statistics
    getStats() {
        const total = this.transactions.reduce((sum, t) => sum + t.amount, 0);
        const count = this.transactions.length;
        
        // Get top category
        const categoryTotals = {};
        this.transactions.forEach(t => {
            categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
        });
        
        const topCategory = Object.keys(categoryTotals).reduce((a, b) => 
            categoryTotals[a] > categoryTotals[b] ? a : b, 'None'
        );

        // Get last 7 days spending
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const recentSpending = this.transactions
            .filter(t => new Date(t.date) >= sevenDaysAgo)
            .reduce((sum, t) => sum + t.amount, 0);

        // Get current month spending
        const now = new Date();
        const currentMonth = this.transactions
            .filter(t => {
                const transactionDate = new Date(t.date);
                return transactionDate.getMonth() === now.getMonth() && 
                       transactionDate.getFullYear() === now.getFullYear();
            })
            .reduce((sum, t) => sum + t.amount, 0);

        return {
            total,
            count,
            topCategory,
            recentSpending,
            currentMonth,
            average: count > 0 ? total / count : 0,
            categoryTotals
        };
    },

    // Check spending limit
    checkSpendingLimit() {
        if (!this.settings.spendingLimit) return null;
        
        const stats = this.getStats();
        const limit = this.settings.spendingLimit;
        const current = stats.currentMonth;
        
        if (current >= limit) {
            return {
                type: 'exceeded',
                message: `You've exceeded your monthly limit of ${this.settings.currency}${limit.toFixed(2)} by ${this.settings.currency}${(current - limit).toFixed(2)}`,
                percentage: (current / limit) * 100
            };
        } else if (current >= limit * 0.8) {
            return {
                type: 'warning',
                message: `You've used ${((current / limit) * 100).toFixed(1)}% of your monthly limit (${this.settings.currency}${current.toFixed(2)} of ${this.settings.currency}${limit.toFixed(2)})`,
                percentage: (current / limit) * 100
            };
        }
        
        return null;
    },

    // Import data
    importData(jsonData) {
        const result = storage.importData(jsonData);
        if (result.success) {
            this.transactions = storage.loadTransactions();
            this.settings = storage.loadSettings();
        }
        return result;
    },

    // Export data
    exportData() {
        return storage.exportData();
    },

    // Clear all data
    clearAllData() {
        this.transactions = [];
        this.settings = {
            currency: '$',
            spendingLimit: null
        };
        storage.saveTransactions(this.transactions);
        storage.saveSettings(this.settings);
    }
};