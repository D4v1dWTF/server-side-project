const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middleware/auth');
const Transaction = require('../models/Transaction');
const Category = require('../models/Category');

router.get('/', isLoggedIn, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { month, year } = req.query;
    
    const now = new Date();
    const selectedMonth = month ? parseInt(month) : now.getMonth() + 1;
    const selectedYear = year ? parseInt(year) : now.getFullYear();
    
    const start = new Date(selectedYear, selectedMonth - 1, 1);
    const end = new Date(selectedYear, selectedMonth, 0, 23, 59, 59);
    
    const transactions = await Transaction.find({
      userId,
      type: 'withdrawal',
      date: { $gte: start, $lte: end }
    });
    
    const categories = await Category.find({ userId });
    const categoryMap = {};
    categories.forEach(c => {
      categoryMap[c.name] = c.color;
    });
    
    const categoryBreakdown = {};
    let totalExpenses = 0;
    let totalIncome = 0;
    
    transactions.forEach(t => {
      const cat = t.category || 'Uncategorized';
      if (!categoryBreakdown[cat]) {
        categoryBreakdown[cat] = 0;
      }
      categoryBreakdown[cat] += t.amount;
      totalExpenses += t.amount;
    });
    
    const incomeTransactions = await Transaction.find({
      userId,
      type: 'deposit',
      date: { $gte: start, $lte: end }
    });
    
    incomeTransactions.forEach(t => {
      totalIncome += t.amount;
    });
    
    const chartData = Object.keys(categoryBreakdown).map(cat => ({
      label: cat,
      value: categoryBreakdown[cat],
      color: categoryMap[cat] || '#95a5a6'
    }));
    
    res.render('summary', {
      chartData,
      categoryBreakdown,
      totalExpenses,
      totalIncome,
      selectedMonth,
      selectedYear,
      months: Array.from({ length: 12 }, (_, i) => i + 1),
      years: Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i)
    });
  } catch (error) {
    console.error('Summary error:', error);
    res.status(500).send('Error loading summary');
  }
});

module.exports = router;

