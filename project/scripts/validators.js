export const validators = {
  description: {
    pattern: /^\S(?:.*\S)?$/,
    message: 'Description cannot have leading/trailing spaces',
    test(value) {
      const trimmed = value.trim();
      const collapsed = trimmed.replace(/\s+/g, ' ');
      return this.pattern.test(collapsed);
    },
    normalize(value) {
      return value.trim().replace(/\s+/g, ' ');
    }
  },

  amount: {
    pattern: /^(0|[1-9]\d*)(\.\d{1,2})?$/,
    message: 'Amount must be a valid number with up to 2 decimal places',
    test(value) {
      return this.pattern.test(value);
    }
  },

  date: {
    pattern: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
    message: 'Date must be in YYYY-MM-DD format',
    test(value) {
      if (!this.pattern.test(value)) return false;

      const date = new Date(value);
      return date instanceof Date && !isNaN(date);
    }
  },

  category: {
    pattern: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/,
    message: 'Category must contain only letters, spaces, and hyphens',
    test(value) {
      return this.pattern.test(value);
    }
  },

  duplicateWords: {
    pattern: /\b(\w+)\s+\1\b/i,
    message: 'Contains duplicate words',
    test(value) {
      return !this.pattern.test(value);
    }
  },

  hasCents: {
    pattern: /\.\d{2}\b/,
    message: 'Should include cents',
    test(value) {
      return this.pattern.test(value);
    }
  },

  validateAll(formData) {
    const errors = {};

    if (!this.description.test(formData.description)) {
      errors.description = this.description.message;
    }

    if (!this.duplicateWords.test(formData.description)) {
      errors.description = this.duplicateWords.message;
    }

    if (!this.amount.test(formData.amount)) {
      errors.amount = this.amount.message;
    }

    if (!this.date.test(formData.date)) {
      errors.date = this.date.message;
    }

    if (!this.category.test(formData.category)) {
      errors.category = this.category.message;
    }

    return errors;
  }
};
