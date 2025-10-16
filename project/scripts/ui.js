import { state } from './state.js';
import { validators } from './validators.js';
import { search } from './search.js';
import { storage } from './storage.js';

export class UI {
  constructor() {
    this.currentSort = { field: 'date', order: 'desc' };
    this.currentSearch = '';
    this.editingId = null;

    state.subscribe(() => this.render());
  }

  init() {
    this.setupNavigation();
    this.setupEventListeners();
    this.showSection('dashboard');
  }

  setupNavigation() {
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = link.getAttribute('href').substring(1);
        this.showSection(section);
      });
    });
  }

  showSection(sectionId) {
    document.querySelectorAll('main > section').forEach(section => {
      section.classList.remove('active');
      section.setAttribute('aria-hidden', 'true');
    });

    const activeSection = document.getElementById(sectionId);
    if (activeSection) {
      activeSection.classList.add('active');
      activeSection.setAttribute('aria-hidden', 'false');

      document.querySelectorAll('nav a').forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${sectionId}`);
      });

      if (sectionId === 'dashboard') {
        this.renderDashboard();
      } else if (sectionId === 'transactions') {
        this.renderTransactions();
      } else if (sectionId === 'settings') {
        this.renderSettings();
      }
    }
  }

  setupEventListeners() {
    const form = document.getElementById('transaction-form');
    form.addEventListener('submit', (e) => this.handleSubmit(e));

    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));

    const caseToggle = document.getElementById('case-toggle');
    caseToggle.addEventListener('click', () => this.toggleSearchCase());

    const exportBtn = document.getElementById('export-btn');
    exportBtn.addEventListener('click', () => this.handleExport());

    const importBtn = document.getElementById('import-btn');
    const importFile = document.getElementById('import-file');
    importBtn.addEventListener('click', () => importFile.click());
    importFile.addEventListener('change', (e) => this.handleImport(e));

    const settingsForm = document.getElementById('settings-form');
    settingsForm.addEventListener('submit', (e) => this.handleSettingsSubmit(e));
  }

  handleSubmit(e) {
    e.preventDefault();

    const formData = {
      description: document.getElementById('description').value,
      amount: document.getElementById('amount').value,
      category: document.getElementById('category').value,
      date: document.getElementById('date').value
    };

    const errors = validators.validateAll(formData);

    this.clearErrors();

    if (Object.keys(errors).length > 0) {
      this.showErrors(errors);
      return;
    }

    const transaction = {
      description: validators.description.normalize(formData.description),
      amount: parseFloat(formData.amount),
      category: formData.category,
      date: formData.date
    };

    if (this.editingId) {
      state.updateTransaction(this.editingId, transaction);
      this.editingId = null;
      this.announceStatus('Transaction updated successfully');
    } else {
      state.addTransaction(transaction);
      this.announceStatus('Transaction added successfully');
    }

    e.target.reset();
    document.getElementById('date').valueAsDate = new Date();
    this.showSection('transactions');
  }

  showErrors(errors) {
    Object.keys(errors).forEach(field => {
      const input = document.getElementById(field);
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-message';
      errorDiv.textContent = errors[field];
      errorDiv.setAttribute('role', 'alert');
      input.parentNode.appendChild(errorDiv);
      input.classList.add('error');
    });
  }

  clearErrors() {
    document.querySelectorAll('.error-message').forEach(el => el.remove());
    document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
  }

  handleSearch(pattern) {
    this.currentSearch = pattern;
    this.renderTransactions();
  }

  toggleSearchCase() {
    const isCaseSensitive = !search.toggleCase();
    document.getElementById('case-toggle').textContent =
      isCaseSensitive ? 'Case: Aa' : 'Case: aa';
    if (this.currentSearch) {
      this.renderTransactions();
    }
  }

  renderTransactions() {
    let transactions = state.getTransactions();

    if (this.currentSearch) {
      try {
        transactions = search.filter(transactions, this.currentSearch);
        this.announceStatus(`Found ${transactions.length} matching transactions`, 'polite');
      } catch (error) {
        this.announceStatus(`Invalid search pattern: ${error.message}`, 'assertive');
        return;
      }
    }

    transactions = this.sortTransactions(transactions);

    const tbody = document.getElementById('transactions-tbody');
    tbody.innerHTML = '';

    if (transactions.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No transactions found</td></tr>';
      return;
    }

    transactions.forEach(transaction => {
      const row = document.createElement('tr');

      const dateCell = document.createElement('td');
      dateCell.textContent = transaction.date;
      dateCell.setAttribute('data-label', 'Date');

      const descCell = document.createElement('td');
      descCell.innerHTML = this.currentSearch ?
        search.highlight(transaction.description, this.currentSearch) :
        transaction.description;
      descCell.setAttribute('data-label', 'Description');

      const categoryCell = document.createElement('td');
      categoryCell.innerHTML = this.currentSearch ?
        search.highlight(transaction.category, this.currentSearch) :
        transaction.category;
      categoryCell.setAttribute('data-label', 'Category');

      const amountCell = document.createElement('td');
      amountCell.textContent = `$${transaction.amount.toFixed(2)}`;
      amountCell.setAttribute('data-label', 'Amount');

      const actionsCell = document.createElement('td');
      actionsCell.setAttribute('data-label', 'Actions');

      const editBtn = document.createElement('button');
      editBtn.textContent = 'Edit';
      editBtn.className = 'btn-small';
      editBtn.setAttribute('aria-label', `Edit ${transaction.description}`);
      editBtn.addEventListener('click', () => this.editTransaction(transaction));

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.className = 'btn-small btn-danger';
      deleteBtn.setAttribute('aria-label', `Delete ${transaction.description}`);
      deleteBtn.addEventListener('click', () => this.deleteTransaction(transaction.id));

      actionsCell.appendChild(editBtn);
      actionsCell.appendChild(deleteBtn);

      row.appendChild(dateCell);
      row.appendChild(descCell);
      row.appendChild(categoryCell);
      row.appendChild(amountCell);
      row.appendChild(actionsCell);

      tbody.appendChild(row);
    });
  }

  sortTransactions(transactions) {
    const sorted = [...transactions];
    const { field, order } = this.currentSort;

    sorted.sort((a, b) => {
      let aVal = a[field];
      let bVal = b[field];

      if (field === 'amount') {
        return order === 'asc' ? aVal - bVal : bVal - aVal;
      }

      if (field === 'description') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (order === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return sorted;
  }

  setupSortHandlers() {
    document.querySelectorAll('[data-sort]').forEach(header => {
      header.addEventListener('click', () => {
        const field = header.getAttribute('data-sort');
        if (this.currentSort.field === field) {
          this.currentSort.order = this.currentSort.order === 'asc' ? 'desc' : 'asc';
        } else {
          this.currentSort.field = field;
          this.currentSort.order = field === 'date' ? 'desc' : 'asc';
        }
        this.renderTransactions();
        this.updateSortIndicators();
      });
    });
  }

  updateSortIndicators() {
    document.querySelectorAll('[data-sort]').forEach(header => {
      const field = header.getAttribute('data-sort');
      const indicator = header.querySelector('.sort-indicator');
      if (field === this.currentSort.field) {
        indicator.textContent = this.currentSort.order === 'asc' ? ' ↑' : ' ↓';
      } else {
        indicator.textContent = '';
      }
    });
  }

  editTransaction(transaction) {
    this.editingId = transaction.id;
    document.getElementById('description').value = transaction.description;
    document.getElementById('amount').value = transaction.amount;
    document.getElementById('category').value = transaction.category;
    document.getElementById('date').value = transaction.date;

    this.showSection('add');
    this.announceStatus('Editing transaction');
  }

  deleteTransaction(id) {
    if (confirm('Are you sure you want to delete this transaction?')) {
      state.deleteTransaction(id);
      this.announceStatus('Transaction deleted');
    }
  }

  renderDashboard() {
    const transactions = state.getTransactions();
    const settings = state.data.settings;

    const total = transactions.reduce((sum, t) => sum + t.amount, 0);
    const count = transactions.length;

    const categoryTotals = {};
    transactions.forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

    const topCategory = Object.keys(categoryTotals).length > 0 ?
      Object.keys(categoryTotals).reduce((a, b) =>
        categoryTotals[a] > categoryTotals[b] ? a : b
      ) : 'None';

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentTotal = transactions
      .filter(t => new Date(t.date) >= sevenDaysAgo)
      .reduce((sum, t) => sum + t.amount, 0);

    document.getElementById('total-transactions').textContent = count;
    document.getElementById('total-amount').textContent = `$${total.toFixed(2)}`;
    document.getElementById('top-category').textContent = topCategory;
    document.getElementById('recent-spending').textContent = `$${recentTotal.toFixed(2)}`;

    const cap = settings.monthlyCap;
    const remaining = cap - total;
    const capStatus = document.getElementById('cap-status');

    if (remaining >= 0) {
      capStatus.textContent = `$${remaining.toFixed(2)} remaining`;
      capStatus.className = 'cap-status';
      this.announceStatus(`You have $${remaining.toFixed(2)} remaining in your monthly budget`, 'polite');
    } else {
      capStatus.textContent = `$${Math.abs(remaining).toFixed(2)} over budget`;
      capStatus.className = 'cap-status over-budget';
      this.announceStatus(`Warning: You are $${Math.abs(remaining).toFixed(2)} over your monthly budget`, 'assertive');
    }

    this.renderChart(categoryTotals);
  }

  renderChart(categoryTotals) {
    const chart = document.getElementById('category-chart');
    chart.innerHTML = '';

    const total = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);
    if (total === 0) {
      chart.innerHTML = '<p class="empty-state">No data to display</p>';
      return;
    }

    Object.entries(categoryTotals).forEach(([category, amount]) => {
      const percentage = (amount / total) * 100;

      const bar = document.createElement('div');
      bar.className = 'chart-bar';

      const label = document.createElement('div');
      label.className = 'chart-label';
      label.textContent = `${category}: $${amount.toFixed(2)}`;

      const fill = document.createElement('div');
      fill.className = 'chart-fill';
      fill.style.width = `${percentage}%`;
      fill.setAttribute('role', 'progressbar');
      fill.setAttribute('aria-valuenow', percentage.toFixed(1));
      fill.setAttribute('aria-valuemin', '0');
      fill.setAttribute('aria-valuemax', '100');
      fill.setAttribute('aria-label', `${category}: ${percentage.toFixed(1)}%`);

      bar.appendChild(label);
      bar.appendChild(fill);
      chart.appendChild(bar);
    });
  }

  renderSettings() {
    const settings = state.data.settings;

    document.getElementById('monthly-cap').value = settings.monthlyCap;
    document.getElementById('base-currency').value = settings.baseCurrency;
    document.getElementById('eur-rate').value = settings.exchangeRates.EUR;
    document.getElementById('gbp-rate').value = settings.exchangeRates.GBP;
  }

  handleSettingsSubmit(e) {
    e.preventDefault();

    const settings = {
      monthlyCap: parseFloat(document.getElementById('monthly-cap').value),
      baseCurrency: document.getElementById('base-currency').value,
      exchangeRates: {
        EUR: parseFloat(document.getElementById('eur-rate').value),
        GBP: parseFloat(document.getElementById('gbp-rate').value)
      }
    };

    state.updateSettings(settings);
    this.announceStatus('Settings saved successfully');
    this.showSection('dashboard');
  }

  handleExport() {
    const url = storage.exportJSON();
    if (!url) {
      this.announceStatus('No data to export', 'assertive');
      return;
    }

    const a = document.createElement('a');
    a.href = url;
    a.download = `finance-tracker-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    this.announceStatus('Data exported successfully');
  }

  handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = storage.importJSON(event.target.result);
        state.importData(importedData);
        this.announceStatus('Data imported successfully');
        this.showSection('dashboard');
      } catch (error) {
        this.announceStatus(`Import failed: ${error.message}`, 'assertive');
      }
    };
    reader.readAsText(file);

    e.target.value = '';
  }

  announceStatus(message, priority = 'polite') {
    const status = document.getElementById('status-message');
    status.textContent = message;
    status.setAttribute('aria-live', priority);

    setTimeout(() => {
      status.textContent = '';
    }, 3000);
  }

  render() {
    const currentSection = document.querySelector('section.active');
    if (currentSection) {
      const sectionId = currentSection.id;
      if (sectionId === 'dashboard') {
        this.renderDashboard();
      } else if (sectionId === 'transactions') {
        this.renderTransactions();
      } else if (sectionId === 'settings') {
        this.renderSettings();
      }
    }
  }
}
