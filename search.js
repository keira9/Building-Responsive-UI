// Search and filtering module
export const search = {
    // Compile regex safely
    compileRegex(pattern, flags = 'i') {
        try {
            return pattern ? new RegExp(pattern, flags) : null;
        } catch (error) {
            console.warn('Invalid regex pattern:', pattern, error.message);
            return null;
        }
    },

    // Highlight matches in text
    highlightMatches(text, regex) {
        if (!regex || !text) return text;
        
        try {
            return text.replace(regex, match => `<mark>${match}</mark>`);
        } catch (error) {
            console.warn('Error highlighting matches:', error);
            return text;
        }
    },

    // Search transactions with regex
    searchTransactions(transactions, searchTerm, caseSensitive = false) {
        if (!searchTerm.trim()) return transactions;

        const flags = caseSensitive ? 'g' : 'gi';
        const regex = this.compileRegex(searchTerm, flags);
        
        if (!regex) return transactions;

        return transactions.filter(transaction => {
            const searchableText = [
                transaction.description,
                transaction.category,
                transaction.amount.toString(),
                transaction.date
            ].join(' ');
            
            return regex.test(searchableText);
        });
    },

    // Sort transactions
    sortTransactions(transactions, sortBy) {
        const sorted = [...transactions];
        
        switch (sortBy) {
            case 'date-desc':
                return sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            case 'date-asc':
                return sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
            
            case 'amount-desc':
                return sorted.sort((a, b) => b.amount - a.amount);
            
            case 'amount-asc':
                return sorted.sort((a, b) => a.amount - b.amount);
            
            case 'description-asc':
                return sorted.sort((a, b) => a.description.localeCompare(b.description));
            
            case 'description-desc':
                return sorted.sort((a, b) => b.description.localeCompare(a.description));
            
            case 'category-asc':
                return sorted.sort((a, b) => a.category.localeCompare(b.category));
            
            default:
                return sorted;
        }
    },

    // Filter transactions by date range
    filterByDateRange(transactions, startDate, endDate) {
        if (!startDate && !endDate) return transactions;
        
        return transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            
            if (startDate && transactionDate < new Date(startDate)) {
                return false;
            }
            
            if (endDate && transactionDate > new Date(endDate)) {
                return false;
            }
            
            return true;
        });
    },

    // Filter transactions by category
    filterByCategory(transactions, categories) {
        if (!categories || categories.length === 0) return transactions;
        
        return transactions.filter(transaction => 
            categories.includes(transaction.category)
        );
    },

    // Filter transactions by amount range
    filterByAmountRange(transactions, minAmount, maxAmount) {
        return transactions.filter(transaction => {
            if (minAmount !== null && transaction.amount < minAmount) {
                return false;
            }
            
            if (maxAmount !== null && transaction.amount > maxAmount) {
                return false;
            }
            
            return true;
        });
    },

    // Get search suggestions based on existing data
    getSearchSuggestions(transactions, query) {
        if (!query || query.length < 2) return [];
        
        const suggestions = new Set();
        const lowerQuery = query.toLowerCase();
        
        transactions.forEach(transaction => {
            // Add matching descriptions
            if (transaction.description.toLowerCase().includes(lowerQuery)) {
                suggestions.add(transaction.description);
            }
            
            // Add matching categories
            if (transaction.category.toLowerCase().includes(lowerQuery)) {
                suggestions.add(transaction.category);
            }
        });
        
        return Array.from(suggestions).slice(0, 5);
    },

    // Advanced search with multiple criteria
    advancedSearch(transactions, criteria) {
        let results = [...transactions];
        
        // Apply text search
        if (criteria.searchTerm) {
            results = this.searchTransactions(results, criteria.searchTerm, criteria.caseSensitive);
        }
        
        // Apply date range filter
        if (criteria.startDate || criteria.endDate) {
            results = this.filterByDateRange(results, criteria.startDate, criteria.endDate);
        }
        
        // Apply category filter
        if (criteria.categories && criteria.categories.length > 0) {
            results = this.filterByCategory(results, criteria.categories);
        }
        
        // Apply amount range filter
        if (criteria.minAmount !== null || criteria.maxAmount !== null) {
            results = this.filterByAmountRange(results, criteria.minAmount, criteria.maxAmount);
        }
        
        // Apply sorting
        if (criteria.sortBy) {
            results = this.sortTransactions(results, criteria.sortBy);
        }
        
        return results;
    }
};