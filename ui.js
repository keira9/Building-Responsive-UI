// UI management module
import { state } from './state.js';
import { search } from './search.js';
import { validators } from './validators.js';

export const ui = {
    // Initialize UI
    init() {
        this.bindEvents();
        this.showPage('dashboard');
        this.updateUI();
    },

    // Bind event listeners
    bindEvents() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.target.dataset.page;
                this.showPage(page);
            });
        });



        // Form submission
        document.getElementById('transaction-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });

        // Settings form
        document.getElementById('settings-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSettingsSubmit();
        });

        // Search and sort
        document.getElementById('search-input').addEventListener('input', (e) => {
            state.searchTerm = e.target.value;
            this.updateRecordsTable();
        });

        document.getElementById('sort-by').addEventListener('change', (e) => {
            state.sortBy = e.target.value;
            this.updateRecordsTable();
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.clearSearch();
            }
        });
    },

    // Show specific page
    showPage(pageId) {
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.dataset.page === pageId);
        });

        // Update pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.toggle('active', page.id === pageId);
        });

        state.currentPage = pageId;

        // Update page-specific content
        switch (pageId) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'records':
                this.updateRecordsTable();
                break;
            case 'add-transaction':
                this.resetForm();
                break;
            case 'settings':
                this.updateSettingsForm();
                break;
        }
    },

    // Update entire UI
    updateUI() {
        this.updateDashboard();
        this.updateRecordsTable();

        this.updateSettingsForm();
    },

    // Update dashboard statistics
    updateDashboard() {
        const stats = state.getStats();
        const currency = state.settings.currency;

        document.getElementById('total-expenses').textContent = 
            `${currency}${stats.total.toFixed(2)}`;
        document.getElementById('record-count').textContent = stats.count;
        document.getElementById('top-category').textContent = 
            stats.count > 0 ? stats.topCategory : '-';

        // Update spending alert
        this.updateSpendingAlert();
    },

    // Update spending alert
    updateSpendingAlert() {
        const alert = document.getElementById('spending-alert');
        const limitCheck = state.checkSpendingLimit();

        if (limitCheck) {
            alert.textContent = limitCheck.message;
            alert.className = `alert ${limitCheck.type}`;
            alert.setAttribute('aria-live', limitCheck.type === 'exceeded' ? 'assertive' : 'polite');
        } else {
            alert.textContent = '';
            alert.className = 'alert';
            alert.removeAttribute('aria-live');
        }
    },

    // Update records table
    updateRecordsTable() {
        const searchResults = search.searchTransactions(
            state.transactions, 
            state.searchTerm
        );
        const sortedResults = search.sortTransactions(searchResults, state.sortBy);
        
        const tbody = document.getElementById('transactions-body');
        const mobileContainer = document.getElementById('records-mobile');
        const noRecordsMsg = document.getElementById('no-records-message');
        
        if (sortedResults.length === 0) {
            tbody.innerHTML = '';
            mobileContainer.innerHTML = '';
            noRecordsMsg.style.display = 'block';
            return;
        }

        noRecordsMsg.style.display = 'none';
        
        const regex = search.compileRegex(state.searchTerm);
        const currency = state.settings.currency;

        // Desktop table view
        tbody.innerHTML = sortedResults.map(transaction => `
            <tr>
                <td>${search.highlightMatches(transaction.description, regex)}</td>
                <td>${currency}${transaction.amount.toFixed(2)}</td>
                <td>${search.highlightMatches(transaction.category, regex)}</td>
                <td>${transaction.date}</td>
                <td>
                    <button class="action-btn" onclick="ui.editTransaction('${transaction.id}')" 
                            aria-label="Edit transaction">Edit</button>
                    <button class="action-btn delete" onclick="ui.deleteTransaction('${transaction.id}')" 
                            aria-label="Delete transaction">Delete</button>
                </td>
            </tr>
        `).join('');
        
        // Mobile card view
        mobileContainer.innerHTML = sortedResults.map(transaction => `
            <div class="record-card">
                <h3>${search.highlightMatches(transaction.description, regex)}</h3>
                <div class="record-meta">
                    <span>${currency}${transaction.amount.toFixed(2)}</span>
                    <span>${search.highlightMatches(transaction.category, regex)}</span>
                    <span>${transaction.date}</span>
                </div>
                <div class="record-actions">
                    <button class="action-btn" onclick="ui.editTransaction('${transaction.id}')" 
                            aria-label="Edit transaction">Edit</button>
                    <button class="action-btn delete" onclick="ui.deleteTransaction('${transaction.id}')" 
                            aria-label="Delete transaction">Delete</button>
                </div>
            </div>
        `).join('');
    },

    // Handle form submission
    handleFormSubmit() {
        const form = document.getElementById('transaction-form');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        const editId = form.dataset.editId;
        
        // Clear previous errors
        this.clearFormErrors();
        
        // Validate form
        const validation = validators.validateForm(data);
        
        if (!validation.valid) {
            this.showFormErrors(validation.results);
            return;
        }

        // Add or update transaction
        if (editId) {
            state.updateTransaction(editId, validation.data);
            this.showSuccessMessage('Transaction updated successfully!');
            delete form.dataset.editId;
            document.getElementById('submit-btn').textContent = 'Add Transaction';
        } else {
            state.addTransaction(validation.data);
            this.showSuccessMessage('Transaction added successfully!');
        }
        
        // Reset form and update UI
        this.resetForm();
        this.updateUI();
        
        // Navigate to records page
        this.showPage('records');
    },

    // Handle settings form submission
    handleSettingsSubmit() {
        const formData = new FormData(document.getElementById('settings-form'));
        const data = Object.fromEntries(formData);
        
        const settings = {
            currency: data.currency,
            spendingLimit: data['spending-limit'] ? parseFloat(data['spending-limit']) : null
        };
        
        state.updateSettings(settings);
        this.showSuccessMessage('Settings saved successfully!');
        this.updateUI();
    },

    // Show form validation errors
    showFormErrors(results) {
        Object.keys(results).forEach(field => {
            const result = results[field];
            const errorElement = document.getElementById(`${field}-error`);
            const inputElement = document.getElementById(field);
            
            if (!result.valid) {
                errorElement.textContent = result.message;
                inputElement.classList.add('error');
            }
        });
    },

    // Clear form errors
    clearFormErrors() {
        document.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
        });
        document.querySelectorAll('.error').forEach(el => {
            el.classList.remove('error');
        });
    },

    // Reset form
    resetForm() {
        document.getElementById('transaction-form').reset();
        document.getElementById('date').value = new Date().toISOString().split('T')[0];
        this.clearFormErrors();
    },

    // Update settings form
    updateSettingsForm() {
        document.getElementById('currency').value = state.settings.currency;
        document.getElementById('spending-limit').value = 
            state.settings.spendingLimit || '';
    },



    // Edit transaction
    editTransaction(id) {
        const transaction = state.getTransaction(id);
        if (!transaction) return;

        // Fill form with transaction data
        document.getElementById('description').value = transaction.description;
        document.getElementById('amount').value = transaction.amount;
        document.getElementById('category').value = transaction.category;
        document.getElementById('date').value = transaction.date;

        // Change form to edit mode
        const form = document.getElementById('transaction-form');
        const submitBtn = document.getElementById('submit-btn');
        
        form.dataset.editId = id;
        submitBtn.textContent = 'Update Transaction';
        
        // Navigate to form page
        this.showPage('add-transaction');
    },

    // Delete transaction
    deleteTransaction(id) {
        if (confirm('Are you sure you want to delete this transaction?')) {
            state.deleteTransaction(id);
            this.updateUI();
            this.showSuccessMessage('Transaction deleted successfully!');
        }
    },

    // Clear search
    clearSearch() {
        document.getElementById('search-input').value = '';
        state.searchTerm = '';
        this.updateRecordsTable();
    },

    // Show success message
    showSuccessMessage(message) {
        // Create temporary success message
        const alert = document.createElement('div');
        alert.className = 'alert success';
        alert.textContent = message;
        alert.setAttribute('role', 'status');
        alert.setAttribute('aria-live', 'polite');
        
        document.querySelector('main').insertBefore(alert, document.querySelector('.page'));
        
        setTimeout(() => {
            alert.remove();
        }, 3000);
    },

    // Export data
    exportData() {
        const data = state.exportData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { 
            type: 'application/json' 
        });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `finance-tracker-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        this.showSuccessMessage('Data exported successfully!');
    },

    // Import data
    importData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const result = state.importData(e.target.result);
                if (result.success) {
                    this.updateUI();
                    this.showSuccessMessage(`Imported ${result.count} transactions successfully!`);
                } else {
                    alert(`Import failed: ${result.error}`);
                }
            } catch (error) {
                alert(`Import failed: ${error.message}`);
            }
        };
        reader.readAsText(file);
    }
};

// Make ui available globally for onclick handlers
window.ui = ui;