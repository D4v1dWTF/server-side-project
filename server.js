require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');

const app = express();

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/financeapp';
const SESSION_SECRET = process.env.SESSION_SECRET || 'your-secret-key-change-in-production';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: MONGODB_URI
  }),
  cookie: {
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const transactionRoutes = require('./routes/transactions');
const budgetRoutes = require('./routes/budgets');
const recurringRoutes = require('./routes/recurrings');
const goalRoutes = require('./routes/goals');
const categoryRoutes = require('./routes/categories');
const reminderRoutes = require('./routes/reminders');
const exportRoutes = require('./routes/export');
const summaryRoutes = require('./routes/summary');
const apiRoutes = require('./routes/api');

app.use('/', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/transactions', transactionRoutes);
app.use('/budgets', budgetRoutes);
app.use('/recurrings', recurringRoutes);
app.use('/goals', goalRoutes);
app.use('/categories', categoryRoutes);
app.use('/reminders', reminderRoutes);
app.use('/export', exportRoutes);
app.use('/summary', summaryRoutes);
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  if (req.session.user) {
    res.redirect('/dashboard');
  } else {
    res.redirect('/login');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

