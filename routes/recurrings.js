const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middleware/auth');
const Recurring = require('../models/Recurring');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');
const Category = require('../models/Category');
const { checkNotifications } = require('../middleware/notifications');

// List recurrings
router.get('/', isLoggedIn, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const recurrings = await Recurring.find({ userId }).sort({ createdAt: -1 });
    res.render('recurrings/list', { recurrings });
  } catch (error) {
    console.error('List recurrings error:', error);
    res.status(500).send('Error loading recurring transactions');
  }
});

// Create recurring form
router.get('/create', isLoggedIn, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const categories = await Category.find({ userId });
    res.render('recurrings/create', { categories });
  } catch (error) {
    console.error('Create recurring form error:', error);
    res.status(500).send('Error loading form');
  }
});

// Create recurring handler
router.post('/create', isLoggedIn, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { type, accountType, amount, description, category, frequency, dayOfMonth } = req.body;

    // Validation
    if (!type || !['deposit', 'withdrawal'].includes(type)) {
      return res.redirect('/recurrings/create?error=Invalid transaction type');
    }
    if (!accountType || !['current', 'savings'].includes(accountType)) {
      return res.redirect('/recurrings/create?error=Invalid account type');
    }
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      return res.redirect('/recurrings/create?error=Amount must be a positive number');
    }
    if (!description || description.trim().length === 0) {
      return res.redirect('/recurrings/create?error=Description is required');
    }
    if (!frequency || !['daily', 'weekly', 'monthly'].includes(frequency)) {
      return res.redirect('/recurrings/create?error=Invalid frequency');
    }
    if (frequency === 'monthly') {
      const day = parseInt(dayOfMonth);
      if (isNaN(day) || day < 1 || day > 31) {
        return res.redirect('/recurrings/create?error=Day of month must be 1-31');
      }
    }

    await Recurring.create({
      userId,
      type,
      accountType,
      amount: amt,
      description: description.trim(),
      category: category || 'Uncategorized',
      frequency,
      dayOfMonth: frequency === 'monthly' ? parseInt(dayOfMonth) : null
    });

    res.redirect('/recurrings?success=Recurring transaction created');
  } catch (error) {
    console.error('Create recurring error:', error);
    res.redirect('/recurrings/create?error=Failed to create recurring transaction');
  }
});

// Apply recurring transactions (called on dashboard load or manually)
router.post('/apply', isLoggedIn, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const now = new Date();
    const today = now.getDate();

    const recurrings = await Recurring.find({ userId, isActive: true });
    let appliedCount = 0;

    for (const recurring of recurrings) {
      let shouldApply = false;

      if (recurring.frequency === 'daily') {
        shouldApply = !recurring.lastAppliedDate ||
          recurring.lastAppliedDate.toDateString() !== now.toDateString();
      } else if (recurring.frequency === 'weekly') {
        const daysSince = recurring.lastAppliedDate ?
          Math.floor((now - recurring.lastAppliedDate) / (1000 * 60 * 60 * 24)) : 999;
        shouldApply = daysSince >= 7;
      } else if (recurring.frequency === 'monthly') {
        shouldApply = today === recurring.dayOfMonth &&
          (!recurring.lastAppliedDate || recurring.lastAppliedDate.getMonth() !== now.getMonth());
      }

      if (shouldApply) {
        const user = await User.findById(userId);
        let balanceAfter;

        if (recurring.type === 'deposit') {
          if (recurring.accountType === 'current') {
            user.currentBalance += recurring.amount;
            balanceAfter = user.currentBalance;
          } else {
            user.savingsBalance += recurring.amount;
            balanceAfter = user.savingsBalance;
          }
        } else {
          if (recurring.accountType === 'current') {
            if (user.currentBalance < recurring.amount) {
              continue; // Skip if insufficient balance
            }
            user.currentBalance -= recurring.amount;
            balanceAfter = user.currentBalance;
          } else {
            if (user.savingsBalance < recurring.amount) {
              continue;
            }
            user.savingsBalance -= recurring.amount;
            balanceAfter = user.savingsBalance;
          }
        }

        await user.save();

        await Transaction.create({
          userId,
          type: recurring.type,
          accountType: recurring.accountType,
          amount: recurring.amount,
          description: `[Recurring] ${recurring.description}`,
          category: recurring.category,
          date: now,
          balanceAfter
        });

        recurring.lastAppliedDate = now;
        await recurring.save();

        // Update budget if withdrawal
        if (recurring.type === 'withdrawal') {
          const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
          const budget = await Budget.findOne({ userId, monthYear });
          if (budget) {
            budget.currentSpent += recurring.amount;
            await budget.save();
          }
        }

        // Update goal progress if deposit to savings
        if (recurring.type === 'deposit' && recurring.accountType === 'savings') {
          const goals = await Goal.find({ userId });
          for (const goal of goals) {
            goal.currentProgress += recurring.amount;
            await goal.save();
          }
        }

        appliedCount++;
      }
    }

    await checkNotifications(userId);
    res.redirect(`/dashboard?success=${appliedCount} recurring transaction(s) applied`);
  } catch (error) {
    console.error('Apply recurrings error:', error);
    res.redirect('/dashboard?error=Failed to apply recurring transactions');
  }
});

// Update recurring form
router.get('/:id/edit', isLoggedIn, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const recurring = await Recurring.findOne({ _id: req.params.id, userId });
    if (!recurring) {
      return res.status(404).send('Recurring transaction not found');
    }
    const categories = await Category.find({ userId });
    res.render('recurrings/edit', { recurring, categories });
  } catch (error) {
    console.error('Edit recurring form error:', error);
    res.status(500).send('Error loading form');
  }
});

// Update recurring handler
router.post('/:id/edit', isLoggedIn, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const recurring = await Recurring.findOne({ _id: req.params.id, userId });
    if (!recurring) {
      return res.status(404).send('Recurring transaction not found');
    }

    const { description, category, isActive } = req.body;

    if (!description || description.trim().length === 0) {
      return res.redirect(`/recurrings/${req.params.id}/edit?error=Description is required`);
    }

    recurring.description = description.trim();
    recurring.category = category || 'Uncategorized';
    recurring.isActive = isActive === 'true';
    await recurring.save();

    res.redirect('/recurrings?success=Recurring transaction updated');
  } catch (error) {
    console.error('Update recurring error:', error);
    res.redirect(`/recurrings/${req.params.id}/edit?error=Failed to update`);
  }
});

// Delete recurring
router.post('/:id/delete', isLoggedIn, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const recurring = await Recurring.findOne({ _id: req.params.id, userId });
    if (!recurring) {
      return res.status(404).send('Recurring transaction not found');
    }

    await Recurring.findByIdAndDelete(req.params.id);
    res.redirect('/recurrings?success=Recurring transaction deleted');
  } catch (error) {
    console.error('Delete recurring error:', error);
    res.redirect('/recurrings?error=Failed to delete recurring transaction');
  }
});

module.exports = router;

