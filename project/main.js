import './style.css';
import { UI } from './scripts/ui.js';

document.addEventListener('DOMContentLoaded', () => {
  const ui = new UI();
  ui.init();

  document.getElementById('date').valueAsDate = new Date();

  ui.setupSortHandlers();
  ui.renderDashboard();
});
