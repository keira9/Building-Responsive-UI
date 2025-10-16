export class Search {
  constructor() {
    this.regex = null;
    this.caseInsensitive = true;
  }

  setPattern(pattern, caseInsensitive = true) {
    this.caseInsensitive = caseInsensitive;
    try {
      const flags = caseInsensitive ? 'gi' : 'g';
      this.regex = new RegExp(pattern, flags);
      return { success: true, regex: this.regex };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  filter(transactions, pattern) {
    if (!pattern) return transactions;

    const result = this.setPattern(pattern, this.caseInsensitive);
    if (!result.success) {
      throw new Error(result.error);
    }

    return transactions.filter(transaction => {
      const searchText = `${transaction.description} ${transaction.category} ${transaction.amount}`;
      return this.regex.test(searchText);
    });
  }

  highlight(text, pattern) {
    if (!pattern) return text;

    const result = this.setPattern(pattern, this.caseInsensitive);
    if (!result.success) return text;

    return text.replace(this.regex, match => `<mark>${match}</mark>`);
  }

  toggleCase() {
    this.caseInsensitive = !this.caseInsensitive;
    return this.caseInsensitive;
  }
}

export const search = new Search();
