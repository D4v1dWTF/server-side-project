# Finance Management Application

## Project Information
- Course: COMP3810SEF / COMPS381F
- Project: Personal Finance Management System
- Group: [Your Group Number]

## Project Description
A web application for managing personal finances with features including transaction tracking, budget management, savings goals, recurring transactions, and financial summaries.

## Project Structure

### server.js
Main server file that sets up Express, MongoDB connection, session management, and routes.

### package.json
Lists all dependencies:
- express: Web framework
- mongoose: MongoDB ODM
- ejs: Template engine
- express-session: Session management
- connect-mongo: MongoDB session store
- xlsx: Excel export functionality

### public/
Contains static files (CSS stylesheets)

### views/
EJS template files for rendering web pages:
- auth/: Login and registration pages
- dashboard.ejs: Main dashboard
- transactions/: Transaction CRUD pages
- budgets/: Budget management pages
- goals/: Savings goals pages
- categories/: Category management pages
- recurrings/: Recurring transaction pages
- reminders/: Bill reminder pages
- summary.ejs: Financial summary with charts

### models/
Mongoose schemas:
- User.js: User accounts with balances
- Transaction.js: Financial transactions
- Budget.js: Monthly budgets
- Goal.js: Savings goals
- Category.js: Transaction categories
- Recurring.js: Recurring transactions
- Reminder.js: Bill reminders
- Notification.js: System notifications

### routes/
Express route handlers:
- auth.js: Authentication routes
- dashboard.js: Dashboard routes
- transactions.js: Transaction CRUD
- budgets.js: Budget CRUD
- goals.js: Goal CRUD
- categories.js: Category CRUD
- recurrings.js: Recurring transaction CRUD
- reminders.js: Reminder CRUD
- export.js: Excel export
- summary.js: Summary page
- api.js: RESTful API endpoints

### middleware/
- auth.js: Authentication middleware
- notifications.js: Notification checking logic

## Cloud Server URL
[Your deployed URL here, e.g., https://your-app.render.com/]

## Operation Guides

### Login/Logout
1. Register a new account at /register
2. Enter username, email, password, and initial balances
3. Login at /login with your credentials
4. Click Logout in navigation to end session

### CRUD Web Pages

#### Transactions
- Create: Click "Add Transaction" button, fill form
- Read: View all transactions with search/filter options
- Update: Click "Edit" on any transaction
- Delete: Click "Delete" button (with confirmation)
- Export: Use export form to download Excel file

#### Budgets
- Create: Set monthly budget amount
- Read: View all budgets with spending status
- Update: Edit budget amount
- Delete: Remove budget entry

#### Goals
- Create: Set target amount and deadline
- Read: View progress bars for all goals
- Update: Modify goal details
- Delete: Remove goal

#### Categories
- Create: Add custom category with color
- Read: View all categories
- Update: Edit category name/color
- Delete: Remove category

#### Recurring Transactions
- Create: Set up automatic transactions (daily/weekly/monthly)
- Read: View all recurring transactions
- Update: Edit recurring details
- Delete: Remove recurring transaction
- Apply: Click "Apply Recurring Transactions" on dashboard

#### Reminders
- Create: Set bill reminder with due date
- Read: View all reminders
- Update: Edit reminder details
- Delete: Remove reminder
- Mark Paid: Click "Mark Paid" button

### RESTful API Services

All APIs are accessible without authentication as per project requirements.

#### GET /api/transactions
Get all transactions
Query params: userId, type, category, limit
Example: GET /api/transactions?userId=123&type=withdrawal

#### POST /api/transactions
Create new transaction
Body: { userId, type, accountType, amount, description, category }

#### PUT /api/transactions/:id
Update transaction
Body: { description, category, date }

#### DELETE /api/transactions/:id
Delete transaction

#### GET /api/budgets
Get all budgets
Query params: userId

#### POST /api/budgets
Create budget
Body: { userId, monthYear, budgetAmount }

#### PUT /api/budgets/:id
Update budget
Body: { budgetAmount }

#### DELETE /api/budgets/:id
Delete budget

#### GET /api/goals
Get all goals
Query params: userId

#### GET /api/categories
Get all categories
Query params: userId

#### GET /api/summary
Get expense summary by category
Query params: userId, month, year

#### GET /api/balance-trend
Get balance trend over time
Query params: userId, days

### CURL Testing Commands

```bash
# Get transactions
curl http://your-server.com/api/transactions?userId=USER_ID

# Create transaction
curl -X POST http://your-server.com/api/transactions \
  -H "Content-Type: application/json" \
  -d '{"userId":"USER_ID","type":"deposit","accountType":"current","amount":100,"description":"Test"}'

# Update transaction
curl -X PUT http://your-server.com/api/transactions/TRANSACTION_ID \
  -H "Content-Type: application/json" \
  -d '{"description":"Updated description"}'

# Delete transaction
curl -X DELETE http://your-server.com/api/transactions/TRANSACTION_ID

# Get budgets
curl http://your-server.com/api/budgets?userId=USER_ID

# Create budget
curl -X POST http://your-server.com/api/budgets \
  -H "Content-Type: application/json" \
  -d '{"userId":"USER_ID","monthYear":"2025-11","budgetAmount":2000}'

# Update budget
curl -X PUT http://your-server.com/api/budgets/BUDGET_ID \
  -H "Content-Type: application/json" \
  -d '{"budgetAmount":2500}'

# Delete budget
curl -X DELETE http://your-server.com/api/budgets/BUDGET_ID

# Get summary
curl http://your-server.com/api/summary?userId=USER_ID&month=11&year=2025

# Get balance trend
curl http://your-server.com/api/balance-trend?userId=USER_ID&days=30
```

## Setup Instructions

1. Install dependencies: `npm install`
2. Set environment variables:
   - MONGODB_URI: MongoDB connection string
   - PORT: Server port (default: 3000)
   - SESSION_SECRET: Secret for session encryption
3. Start server: `npm start`
4. Access application at http://localhost:3000

## Features

- User registration and login with session authentication
- Current and savings account balance management
- Transaction CRUD with categories
- Monthly budget tracking with notifications
- Savings goal tracking with progress bars
- Recurring transaction automation
- Bill reminder system
- Financial summary with pie charts
- Excel export functionality
- RESTful API endpoints
- Responsive design

