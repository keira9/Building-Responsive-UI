// Main application entry point
import { state } from './state.js';
import { ui } from './ui.js';

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    // Initialize state from localStorage
    state.init();
    
    // Initialize UI
    ui.init();
    
    // Add import/export functionality
    addImportExportFeatures();
    
    console.log('Student Finance Tracker initialized');
});

// Add import/export features to settings page
function addImportExportFeatures() {
    const settingsPage = document.getElementById('settings');
    
    // Create import/export section
    const importExportSection = document.createElement('div');
    importExportSection.innerHTML = `
        <h3>Data Management</h3>
        <div class="form-group">
            <label for="import-file">Import Data:</label>
            <input type="file" id="import-file" accept=".json" />
            <small>Import transactions from a JSON file</small>
        </div>
        <div class="form-group">
            <button type="button" id="export-btn">Export Data</button>
            <small>Download your transactions as JSON</small>
        </div>
        <div class="form-group">
            <button type="button" id="clear-data-btn" style="background: var(--error-color);">Clear All Data</button>
            <small>⚠️ This will delete all transactions and reset settings</small>
        </div>
    `;
    
    settingsPage.appendChild(importExportSection);
    
    // Bind import/export events
    document.getElementById('import-file').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            ui.importData(file);
            e.target.value = ''; // Reset file input
        }
    });
    
    document.getElementById('export-btn').addEventListener('click', () => {
        ui.exportData();
    });
    
    document.getElementById('clear-data-btn').addEventListener('click', () => {
        if (confirm('Are you sure you want to delete ALL data? This cannot be undone.')) {
            if (confirm('This will permanently delete all transactions and settings. Continue?')) {
                state.clearAllData();
                ui.updateUI();
                ui.showSuccessMessage('All data cleared successfully!');
            }
        }
    });
}

// Service Worker registration for offline support (stretch feature)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Global error handler
window.addEventListener('error', (e) => {
    console.error('Application error:', e.error);
    // Could show user-friendly error message here
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    e.preventDefault();
});