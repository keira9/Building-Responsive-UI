# Student Finance Tracker

A responsive, accessible web application for students to track their expenses with advanced regex validation and search capabilities.

## 🎯 Chosen Theme
**Student Finance Tracker** - A comprehensive expense tracking application designed specifically for students to manage their finances across categories like Food, Transport, Books, Entertainment, Fees, and Other.

## 🚀 Live Demo
[View Live Application](https://yourusername.github.io/BuildingUIsummative/)

## ✨ Features

### Core Features
- **Dashboard**: Real-time statistics showing total expenses, record count, and top spending category
- **Transaction Management**: Add, edit, and delete expense records with full validation
- **Advanced Search**: Regex-powered search with highlighting and pattern matching
- **Data Persistence**: Auto-save to localStorage with JSON import/export
- **Responsive Design**: Mobile-first layout that works on all devices
- **Accessibility**: Full keyboard navigation, ARIA labels, and screen reader support
- **Settings**: Currency selection and spending limit alerts

### Advanced Features
- **Regex Validation**: 4+ validation rules including advanced patterns
- **Search Highlighting**: Visual highlighting of search matches
- **Spending Alerts**: ARIA live regions for budget notifications
- **Dark/Light Theme**: Persistent theme toggle
- **Data Export/Import**: JSON file handling with validation
- **Offline Support**: Works without internet connection

## 🔍 Regex Catalog

### Basic Validation Patterns

1. **Description Validation**
   - Pattern: `/^\S(?:.*\S)?$/`
   - Purpose: Prevents leading/trailing spaces and ensures non-empty content
   - Examples: ✅ "Lunch at cafeteria" | ❌ " Leading space" | ❌ "Trailing space "

2. **Amount Validation**
   - Pattern: `/^(0|[1-9]\d*)(\.\d{1,2})?$/`
   - Purpose: Validates positive numbers with optional 2 decimal places
   - Examples: ✅ "12.50" | ✅ "100" | ❌ "01.50" | ❌ "-5.00"

3. **Date Validation**
   - Pattern: `/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/`
   - Purpose: Ensures YYYY-MM-DD format
   - Examples: ✅ "2025-01-15" | ❌ "25-01-15" | ❌ "2025/01/15"

4. **Category Validation**
   - Pattern: `/^[A-Za-z]+(?:[ -][A-Za-z]+)*$/`
   - Purpose: Allows letters, spaces, and hyphens only
   - Examples: ✅ "Food" | ✅ "Health-Care" | ❌ "Food123" | ❌ "Food!"

### Advanced Patterns

5. **Duplicate Words Detection (Back-reference)**
   - Pattern: `/\b(\w+)\s+\1\b/i`
   - Purpose: Catches repeated words in descriptions
   - Examples: ✅ Matches "pizza pizza" | ✅ Matches "the the quick"

6. **Cents Detection**
   - Pattern: `/\.\d{2}\b/`
   - Purpose: Finds amounts with exact cent values
   - Examples: ✅ Matches "12.50" | ❌ No match for "12.5"

7. **Beverage Keywords**
   - Pattern: `/(coffee|tea|juice|soda|water)/i`
   - Purpose: Identifies beverage-related expenses
   - Examples: ✅ Matches "Morning coffee" | ✅ Matches "Green tea"

### Search Patterns
- **Food Items**: `/(lunch|dinner|breakfast|snack|meal)/i`
- **Transport**: `/(bus|taxi|uber|train|metro)/i`
- **Books/Education**: `/(book|textbook|course|class|tuition)/i`

## ⌨️ Keyboard Navigation

### Global Shortcuts
- `Tab` / `Shift+Tab`: Navigate between interactive elements
- `Enter` / `Space`: Activate buttons and links
- `Escape`: Clear search input

### Navigation
- `Tab` through navigation links
- `Enter` to activate page navigation
- `Arrow keys` in dropdown menus

### Forms
- `Tab` to move between form fields
- `Enter` to submit forms
- `Escape` to clear validation errors

### Tables
- `Tab` to navigate action buttons
- `Enter` to activate edit/delete actions
- `Space` to confirm delete dialogs

## ♿ Accessibility Features

### Semantic Structure
- Proper heading hierarchy (h1 → h2 → h3)
- Semantic landmarks: `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`
- Form labels properly associated with inputs
- Table headers with proper scope

### ARIA Implementation
- `role="status"` for success messages
- `aria-live="polite"` for spending warnings
- `aria-live="assertive"` for spending limit exceeded
- `aria-label` for icon buttons and actions
- `aria-describedby` for form validation errors

### Visual Accessibility
- High contrast color scheme (4.5:1 minimum ratio)
- Visible focus indicators (2px outline)
- No color-only information conveyance
- Scalable text (supports 200% zoom)

### Keyboard Accessibility
- Skip-to-content link for screen readers
- Full keyboard navigation support
- Logical tab order
- No keyboard traps

### Screen Reader Support
- Descriptive alt text for images
- Form validation announced to screen readers
- Status updates announced appropriately
- Table data properly structured

## 🏗️ Technical Architecture

### File Structure
```
BuildingUIsummative/
├── index.html              # Main HTML structure
├── styles/
│   └── style.css          # Responsive CSS with animations
├── scripts/
│   ├── app.js             # Main application entry point
│   ├── state.js           # Application state management
│   ├── ui.js              # DOM manipulation and events
│   ├── storage.js         # localStorage operations
│   ├── validators.js      # Regex validation patterns
│   └── search.js          # Search and filtering logic
├── seed.json              # Sample data for testing
├── tests.html             # Regex and functionality tests
└── README.md              # This documentation
```

### Module Architecture
- **ES6 Modules**: Clean separation of concerns
- **State Management**: Centralized application state
- **Event-Driven**: Reactive UI updates
- **Error Handling**: Graceful error recovery

### Responsive Design
- **Mobile First**: Base styles for 360px+
- **Tablet**: Enhanced layout at 768px+
- **Desktop**: Full features at 1024px+
- **Flexbox**: Modern layout system
- **CSS Grid**: Dashboard statistics layout

## 🧪 Testing

### Running Tests
1. Open `tests.html` in your browser
2. Click "Run All Tests" or individual test buttons
3. View results in the output panel

### Test Coverage
- ✅ Regex pattern validation
- ✅ Form validation logic
- ✅ Search functionality
- ✅ Data import/export
- ✅ Edge cases and error handling

### Manual Testing Checklist
- [ ] Add/edit/delete transactions
- [ ] Search with various regex patterns
- [ ] Import/export JSON data
- [ ] Keyboard-only navigation
- [ ] Screen reader compatibility
- [ ] Mobile responsive design
- [ ] Theme switching
- [ ] Spending limit alerts

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+)
- No additional dependencies required

### Installation
1. Clone or download the repository
2. Open `index.html` in your web browser
3. Start tracking your expenses!

### Loading Sample Data
1. Go to Settings page
2. Click "Import Data"
3. Select the `seed.json` file
4. Sample transactions will be loaded

## 🎨 Customization

### Adding New Categories
Edit the category dropdown in `index.html`:
```html
<option value="YourCategory">Your Category</option>
```

### Custom Regex Patterns
Add new patterns in `scripts/validators.js`:
```javascript
customPattern: /your-regex-here/
```

### Styling
Modify CSS custom properties in `styles/style.css`:
```css
:root {
    --primary-color: #your-color;
}
```

## 🔧 Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📱 PWA Features (Stretch)
- Offline functionality with service worker
- App-like experience on mobile devices
- Background sync for data persistence

## 🤝 Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License
This project is open source and available under the [MIT License](LICENSE).

## 👤 Contact
- **Email**: student@example.com
- **GitHub**: [github.com/student](https://github.com/student)
- **Portfolio**: [student-portfolio.com](https://student-portfolio.com)

---

