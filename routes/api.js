const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');
const Category = require('../models/Category');
const Reminder = require('../models/Reminder');

// GET /api/transactions
router.get('/transactions', async (req, res) => {
  try {
    const { userId, type, category, limit } = req.query;
    let query = {};
    
    if (userId) query.userId = userId;
    if (type) query.type = type;
    if (category) query.category = category;
    
    let transactions = Transaction.find(query).sort({ date: -1 });
    if (limit) transactions = transactions.limit(parseInt(limit));
    
    const results = await transactions;
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/transactions
router.post('/transactions', async (req, res) => {
  try {
    const { userId, type, accountType, amount, description, category } = req.body;
    
    if (!userId || !type || !accountType || !amount || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (!['deposit', 'withdrawal'].includes(type)) {
      return res.status(400).json({ error: 'Invalid type' });
    }
    
    if (!['current', 'savings'].includes(accountType)) {
      return res.status(400).json({ error: 'Invalid account type' });
    }
    
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    
    const User = require('../models/User');
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    let balanceAfter;
    if (type === 'deposit') {
      if (accountType === 'current') {
        user.currentBalance += amt;
        balanceAfter = user.currentBalance;
      } else {
        user.savingsBalance += amt;
        balanceAfter = user.savingsBalance;
      }
    } else {
      if (accountType === 'current') {
        if (user.currentBalance < amt) {
          return res.status(400).json({ error: 'Insufficient balance' });
        }
        user.currentBalance -= amt;
        balanceAfter = user.currentBalance;
      } else {
        if (user.savingsBalance < amt) {
          return res.status(400).json({ error: 'Insufficient balance' });
        }
        user.savingsBalance -= amt;
        balanceAfter = user.savingsBalance;
      }
    }
    
    await user.save();
    
    const transaction = new Transaction({
      userId,
      type,
      accountType,
      amount: amt,
      description: description.trim(),
      category: category || 'Uncategorized',
      balanceAfter
    });
    
    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/transactions/:id
router.put('/transactions/:id', async (req, res) => {
  try {
    const { description, category, date } = req.body;
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    if (description) transaction.description = description.trim();
    if (category) transaction.category = category;
    if (date) transaction.date = new Date(date);
    
    await transaction.save();
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/transactions/:id
router.delete('/transactions/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    res.json({ message: 'Transaction deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/budgets
router.get('/budgets', async (req, res) => {
  try {
    const { userId } = req.query;
    let query = {};
    if (userId) query.userId = userId;
    
    const budgets = await Budget.find(query).sort({ monthYear: -1 });
    res.json(budgets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/budgets
router.post('/budgets', async (req, res) => {
  try {
    const { userId, monthYear, budgetAmount } = req.body;
    
    if (!userId || !monthYear || !budgetAmount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const amount = parseFloat(budgetAmount);
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    
    const budget = new Budget({
      userId,
      monthYear,
      budgetAmount: amount,
      currentSpent: 0
    });
    
    await budget.save();
    res.status(201).json(budget);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/budgets/:id
router.put('/budgets/:id', async (req, res) => {
  try {
    const { budgetAmount } = req.body;
    const budget = await Budget.findById(req.params.id);
    
    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }
    
    if (budgetAmount) {
      const amount = parseFloat(budgetAmount);
      if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({ error: 'Invalid amount' });
      }
      budget.budgetAmount = amount;
    }
    
    await budget.save();
    res.json(budget);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/budgets/:id
router.delete('/budgets/:id', async (req, res) => {
  try {
    const budget = await Budget.findByIdAndDelete(req.params.id);
    
    if (!budget) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    res.json({ message: 'Budget deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/goals
router.get('/goals', async (req, res) => {
  try {
    const { userId } = req.query;
    let query = {};
    if (userId) query.userId = userId;
    
    const goals = await Goal.find(query).sort({ deadline: 1 });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/categories
router.get('/categories', async (req, res) => {
  try {
    const { userId } = req.query;
    let query = {};
    if (userId) query.userId = userId;
    
    const categories = await Category.find(query).sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/summary
router.get('/summary', async (req, res) => {
  try {
    const { userId, month, year } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId required' });
    }
    
    let dateQuery = { userId, type: 'withdrawal' };
    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      dateQuery.date = { $gte: start, $lte: end };
    }
    
    const transactions = await Transaction.find(dateQuery);
    
    const categoryBreakdown = {};
    let totalExpenses = 0;
    
    transactions.forEach(t => {
      const cat = t.category || 'Uncategorized';
      if (!categoryBreakdown[cat]) {
        categoryBreakdown[cat] = 0;
      }
      categoryBreakdown[cat] += t.amount;
      totalExpenses += t.amount;
    });
    
    res.json({
      categoryBreakdown,
      totalExpenses,
      transactionCount: transactions.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/balance-trend
router.get('/balance-trend', async (req, res) => {
  try {
    const { userId, days } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId required' });
    }
    
    const daysBack = parseInt(days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);
    
    const transactions = await Transaction.find({
      userId,
      date: { $gte: startDate }
    }).sort({ date: 1 });
    
    const trend = [];
    let balance = 0;
    
    transactions.forEach(t => {
      if (t.type === 'deposit') {
        balance += t.amount;
      } else {
        balance -= t.amount;
      }
      trend.push({
        date: t.date.toISOString().split('T')[0],
        balance: balance
      });
    });
    
    res.json(trend);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

