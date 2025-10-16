// Validation module with regex patterns
export const validators = {
    // Regex patterns
    patterns: {
        // Description: no leading/trailing spaces, collapse doubles
        description: /^\S(?:.*\S)?$/,
        
        // Amount: positive number with optional 2 decimal places
        amount: /^(0|[1-9]\d*)(\.\d{1,2})?$/,
        
        // Date: YYYY-MM-DD format
        date: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
        
        // Category: letters, spaces, hyphens only
        category: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/,
        
        // Advanced: detect duplicate words (back-reference)
        duplicateWords: /\b(\w+)\s+\1\b/i,
        
        // Advanced: cents present in amount
        centsPresent: /\.\d{2}\b/,
        
        // Advanced: beverage keywords
        beverageKeywords: /(coffee|tea|juice|soda|water)/i
    },

    // Validate description field
    validateDescription(value) {
        const trimmed = value.trim();
        
        if (!trimmed) {
            return { valid: false, message: 'Description is required' };
        }
        
        if (!this.patterns.description.test(trimmed)) {
            return { valid: false, message: 'Description cannot have leading/trailing spaces' };
        }
        
        // Check for duplicate words
        if (this.patterns.duplicateWords.test(trimmed)) {
            return { valid: false, message: 'Description contains duplicate words' };
        }
        
        if (trimmed.length < 3) {
            return { valid: false, message: 'Description must be at least 3 characters' };
        }
        
        if (trimmed.length > 100) {
            return { valid: false, message: 'Description must be less than 100 characters' };
        }
        
        return { valid: true, value: trimmed };
    },

    // Validate amount field
    validateAmount(value) {
        const trimmed = value.trim();
        
        if (!trimmed) {
            return { valid: false, message: 'Amount is required' };
        }
        
        if (!this.patterns.amount.test(trimmed)) {
            return { valid: false, message: 'Amount must be a valid positive number (e.g., 12.50)' };
        }
        
        const numValue = parseFloat(trimmed);
        if (numValue <= 0) {
            return { valid: false, message: 'Amount must be greater than 0' };
        }
        
        if (numValue > 999999.99) {
            return { valid: false, message: 'Amount cannot exceed 999,999.99' };
        }
        
        return { valid: true, value: numValue };
    },

    // Validate date field
    validateDate(value) {
        if (!value) {
            return { valid: false, message: 'Date is required' };
        }
        
        if (!this.patterns.date.test(value)) {
            return { valid: false, message: 'Date must be in YYYY-MM-DD format' };
        }
        
        const date = new Date(value);
        const today = new Date();
        today.setHours(23, 59, 59, 999); // End of today
        
        if (isNaN(date.getTime())) {
            return { valid: false, message: 'Invalid date' };
        }
        
        if (date > today) {
            return { valid: false, message: 'Date cannot be in the future' };
        }
        
        // Check if date is too far in the past (more than 10 years)
        const tenYearsAgo = new Date();
        tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
        
        if (date < tenYearsAgo) {
            return { valid: false, message: 'Date cannot be more than 10 years ago' };
        }
        
        return { valid: true, value: value };
    },

    // Validate category field
    validateCategory(value) {
        if (!value) {
            return { valid: false, message: 'Category is required' };
        }
        
        if (!this.patterns.category.test(value)) {
            return { valid: false, message: 'Category can only contain letters, spaces, and hyphens' };
        }
        
        return { valid: true, value: value };
    },

    // Validate entire form
    validateForm(formData) {
        const results = {
            description: this.validateDescription(formData.description || ''),
            amount: this.validateAmount(formData.amount || ''),
            category: this.validateCategory(formData.category || ''),
            date: this.validateDate(formData.date || '')
        };
        
        const isValid = Object.values(results).every(result => result.valid);
        
        return {
            valid: isValid,
            results,
            data: isValid ? {
                description: results.description.value,
                amount: results.amount.value,
                category: results.category.value,
                date: results.date.value
            } : null
        };
    },

    // Advanced regex examples for search
    getSearchPatterns() {
        return {
            'Cents present': this.patterns.centsPresent,
            'Beverage keywords': this.patterns.beverageKeywords,
            'Duplicate words': this.patterns.duplicateWords,
            'Food items': /(lunch|dinner|breakfast|snack|meal)/i,
            'Transport': /(bus|taxi|uber|train|metro)/i,
            'Books/Education': /(book|textbook|course|class|tuition)/i
        };
    }
};