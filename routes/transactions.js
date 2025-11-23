const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middleware/auth');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');
const Category = require('../models/Category');
const { checkNotifications } = require('../middleware/notifications');

// List transactions
router.get('/', isLoggedIn, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { search, category, type, accountType, startDate, endDate } = req.query;

    let query = { userId };

    if (search) {
      query.description = { $regex: search, $options: 'i' };
    }
    if (category && category !== 'all') {
      query.category = category;
    }
    if (type && type !== 'all') {
      query.type = type;
    }
    if (accountType && accountType !== 'all') {
      query.accountType = accountType;
    }
    if (startDate) {
      query.date = { ...query.date, $gte: new Date(startDate) };
    }
    if (endDate) {
      query.date = { ...query.date, $lte: new Date(endDate) };
    }

    const transactions = await Transaction.find(query).sort({ date: -1 });
    const categories = await Category.find({ userId });

    res.render('transactions/list', { transactions, categories });
  } catch (error) {
    console.error('List transactions error:', error);
    res.status(500).send('Error loading transactions');
  }
});

// Create transaction form
router.get('/create', isLoggedIn, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const categories = await Category.find({ userId });
    res.render('transactions/create', { categories });
  } catch (error) {
    console.error('Create transaction form error:', error);
    res.status(500).send('Error loading form');
  }
});

// Create transaction handler
router.post('/create', isLoggedIn, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { type, accountType, amount, description, category, date } = req.body;

    // Validation
    if (!type || !['deposit', 'withdrawal'].includes(type)) {
      return res.redirect('/transactions/create?error=Invalid transaction type');
    }
    if (!accountType || !['current', 'savings'].includes(accountType)) {
      return res.redirect('/transactions/create?error=Invalid account type');
    }
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      return res.redirect('/transactions/create?error=Amount must be a positive number');
    }
    if (!description || description.trim().length === 0) {
      return res.redirect('/transactions/create?error=Description is required');
    }

    const user = await User.findById(userId);
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
          return res.redirect('/transactions/create?error=Insufficient balance');
        }
        user.currentBalance -= amt;
        balanceAfter = user.currentBalance;
      } else {
        if (user.savingsBalance < amt) {
          return res.redirect('/transactions/create?error=Insufficient balance');
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
      date: date ? new Date(date) : new Date(),
      balanceAfter
    });
    await transaction.save();

    // Update budget if withdrawal
    if (type === 'withdrawal') {
      const now = new Date();
      const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const budget = await Budget.findOne({ userId, monthYear });
      if (budget) {
        budget.currentSpent += amt;
        await budget.save();
      }
    }

    // Update goal progress if deposit to savings
    if (type === 'deposit' && accountType === 'savings') {
      const goals = await Goal.find({ userId });
      for (const goal of goals) {
        goal.currentProgress += amt;
        await goal.save();
      }
    }

    // Check notifications
    await checkNotifications(userId);

    res.redirect('/transactions?success=Transaction created');
  } catch (error) {
    console.error('Create transaction error:', error);
    res.redirect('/transactions/create?error=Failed to create transaction');
  }
});

// Update transaction form
router.get('/:id/edit', isLoggedIn, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const transaction = await Transaction.findOne({ _id: req.params.id, userId });
    if (!transaction) {
      return res.status(404).send('Transaction not found');
    }
    const categories = await Category.find({ userId });
    res.render('transactions/edit', { transaction, categories });
  } catch (error) {
    console.error('Edit transaction form error:', error);
    res.status(500).send('Error loading form');
  }
});

// Update transaction handler
router.post('/:id/edit', isLoggedIn, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const transaction = await Transaction.findOne({ _id: req.params.id, userId });
    if (!transaction) {
      return res.status(404).send('Transaction not found');
    }

    const { description, category, date } = req.body;

    // Validation
    if (!description || description.trim().length === 0) {
      return res.redirect(`/transactions/${req.params.id}/edit?error=Description is required`);
    }

    transaction.description = description.trim();
    transaction.category = category || 'Uncategorized';
    if (date) {
      transaction.date = new Date(date);
    }
    await transaction.save();

    res.redirect('/transactions?success=Transaction updated');
  } catch (error) {
    console.error('Update transaction error:', error);
    res.redirect(`/transactions/${req.params.id}/edit?error=Failed to update`);
  }
});

// Delete transaction
router.post('/:id/delete', isLoggedIn, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const transaction = await Transaction.findOne({ _id: req.params.id, userId });
    if (!transaction) {
      return res.status(404).send('Transaction not found');
    }

    // Reverse the transaction effect on balance
    const user = await User.findById(userId);
    if (transaction.type === 'deposit') {
      if (transaction.accountType === 'current') {
        user.currentBalance -= transaction.amount;
      } else {
        user.savingsBalance -= transaction.amount;
      }
    } else {
      if (transaction.accountType === 'current') {
        user.currentBalance += transaction.amount;
      } else {
        user.savingsBalance += transaction.amount;
      }
    }
    await user.save();

    // Update budget if withdrawal
    if (transaction.type === 'withdrawal') {
      const date = new Date(transaction.date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const budget = await Budget.findOne({ userId, monthYear });
      if (budget) {
        budget.currentSpent = Math.max(0, budget.currentSpent - transaction.amount);
        await budget.save();
      }
    }

    await Transaction.findByIdAndDelete(req.params.id);
    res.redirect('/transactions?success=Transaction deleted');
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.redirect('/transactions?error=Failed to delete transaction');
  }
});

module.exports = router;

