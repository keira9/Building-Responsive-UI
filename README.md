# Student Finance Tracker

A web application for students to track and manage their expenses with easy search, validation, and reporting.

## Live Demo
[View Live Application](https://yourusername.github.io/BuildingUIsummative/)

## Features

- Dashboard: See total expenses, record count, and top spending categories  
- Transaction Management: Add, edit, delete records with validation  
- Search: Regex-powered search with highlights  
- Data Persistence: Save data in localStorage, import/export JSON  
- Responsive & Accessible: Works on all devices, full keyboard navigation, screen reader support  
- Themes & Alerts: Dark/light mode and budget notifications

## Validation Examples

- Description: No leading/trailing spaces `/^\S(?:.*\S)?$/`  
- Amount: Positive numbers, up to 2 decimals `/^(0|[1-9]\d*)(\.\d{1,2})?$/`  
- Date: YYYY-MM-DD format `/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/`  
- Category: Letters, spaces, hyphens only `/^[A-Za-z]+(?:[ -][A-Za-z]+)*$/`  

Advanced patterns detect duplicates, cents, and beverages  

## Usage

1. Clone or download the repo  
2. Open `index.html` in your browser  
3. Add transactions, search, and track your expenses  
4. Use "Import Data" in Settings to load `seed.json` sample data  

### Customization

- Add categories in `index.html` dropdown  
- Add new regex patterns in `scripts/validators.js`  
- Adjust colors in `styles/style.css`

## Browser Support
Chrome, Firefox, Safari, Edge (modern versions)

## Contributing
1. Fork the repository  
2. Make changes in a feature branch  
3. Test and submit a pull request  

## Contact
Email: student@example.com  
GitHub: [github.com/student](https://github.com/student)  
Portfolio: [student-portfolio.com](https://student-portfolio.com)
