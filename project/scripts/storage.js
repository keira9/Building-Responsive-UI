const STORAGE_KEY = 'financeTrackerData';

export const storage = {
  load() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to load data:', error);
      return null;
    }
  },

  save(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Failed to save data:', error);
      return false;
    }
  },

  clear() {
    localStorage.removeItem(STORAGE_KEY);
  },

  exportJSON() {
    const data = this.load();
    if (!data) return null;

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });
    return URL.createObjectURL(blob);
  },

  importJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString);

      if (!data.transactions || !Array.isArray(data.transactions)) {
        throw new Error('Invalid data structure: missing transactions array');
      }

      for (const transaction of data.transactions) {
        if (!transaction.id || !transaction.description ||
            typeof transaction.amount !== 'number' ||
            !transaction.category || !transaction.date) {
          throw new Error('Invalid transaction structure');
        }
      }

      return data;
    } catch (error) {
      throw new Error(`Import failed: ${error.message}`);
    }
  }
};
