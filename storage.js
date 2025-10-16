// Storage module for localStorage operations
const STORAGE_KEY = 'finance-tracker:data';
const SETTINGS_KEY = 'finance-tracker:settings';

export const storage = {
    // Load transactions from localStorage
    loadTransactions() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error loading transactions:', error);
            return [];
        }
    },

    // Save transactions to localStorage
    saveTransactions(transactions) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
            return true;
        } catch (error) {
            console.error('Error saving transactions:', error);
            return false;
        }
    },

    // Load settings from localStorage
    loadSettings() {
        try {
            const data = localStorage.getItem(SETTINGS_KEY);
            return data ? JSON.parse(data) : {
                currency: '$',
                spendingLimit: null
            };
        } catch (error) {
            console.error('Error loading settings:', error);
            return { currency: '$', spendingLimit: null };
        }
    },

    // Save settings to localStorage
    saveSettings(settings) {
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
            return true;
        } catch (error) {
            console.error('Error saving settings:', error);
            return false;
        }
    },

    // Export data as JSON
    exportData() {
        const transactions = this.loadTransactions();
        const settings = this.loadSettings();
        return {
            transactions,
            settings,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
    },

    // Import and validate JSON data
    importData(jsonData) {
        try {
            const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
            
            // Validate structure
            if (!data.transactions || !Array.isArray(data.transactions)) {
                throw new Error('Invalid data format: transactions array required');
            }

            // Validate each transaction
            for (const transaction of data.transactions) {
                if (!this.validateTransaction(transaction)) {
                    throw new Error(`Invalid transaction: ${JSON.stringify(transaction)}`);
                }
            }

            // Save validated data
            this.saveTransactions(data.transactions);
            if (data.settings) {
                this.saveSettings({ ...this.loadSettings(), ...data.settings });
            }

            return { success: true, count: data.transactions.length };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Validate transaction structure
    validateTransaction(transaction) {
        const required = ['id', 'description', 'amount', 'category', 'date', 'createdAt'];
        return required.every(field => transaction.hasOwnProperty(field)) &&
               typeof transaction.amount === 'number' &&
               transaction.amount >= 0 &&
               /^\d{4}-\d{2}-\d{2}$/.test(transaction.date);
    }
};