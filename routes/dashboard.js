const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middleware/auth');
const { checkNotifications } = require('../middleware/notifications');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const Goal = require('../models/Goal');
const Budget = require('../models/Budget');
const Recurring = require('../models/Recurring');

// Dashboard
router.get('/', isLoggedIn, async (req, res) => {
  try {
    const userId = req.session.user.id;

    const now = new Date();
    const today = now.getDate();

    const recurrings = await Recurring.find({ userId, isActive: true });
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
            if (user.currentBalance >= recurring.amount) {
              user.currentBalance -= recurring.amount;
              balanceAfter = user.currentBalance;
            } else {
              continue;
            }
          } else {
            if (user.savingsBalance >= recurring.amount) {
              user.savingsBalance -= recurring.amount;
              balanceAfter = user.savingsBalance;
            } else {
              continue;
            }
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

        if (recurring.type === 'withdrawal') {
          const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
          const budget = await Budget.findOne({ userId, monthYear });
          if (budget) {
            budget.currentSpent += recurring.amount;
            await budget.save();
          }
        }

        if (recurring.type === 'deposit' && recurring.accountType === 'savings') {
          const goals = await Goal.find({ userId });
          for (const goal of goals) {
            goal.currentProgress += recurring.amount;
            await goal.save();
          }
        }
      }
    }

    await checkNotifications(userId);

    const user = await User.findById(userId);
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);
    const goals = await Goal.find({ userId }).sort({ deadline: 1 });
    const budget = await Budget.findOne({
      userId,
      monthYear: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
    });

    const recentTransactions = await Transaction.find({ userId })
      .sort({ date: -1 })
      .limit(5);

    const upcomingRecurrings = await Recurring.find({ userId, isActive: true })
      .sort({ dayOfMonth: 1 })
      .limit(5);

    res.render('dashboard', {
      user,
      notifications,
      goals,
      budget,
      recentTransactions,
      upcomingRecurrings,
      error: req.query.error,
      success: req.query.success
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).send('Error loading dashboard');
  }
});

// Update account balances
router.post('/update-balances', isLoggedIn, async (req, res) => {
  try {
    const { currentBalance, savingsBalance } = req.body;
    const userId = req.session.user.id;

    // Validation
    const currentBal = parseFloat(currentBalance);
    const savingsBal = parseFloat(savingsBalance);
    if (isNaN(currentBal) || isNaN(savingsBal) || currentBal < 0 || savingsBal < 0) {
      return res.redirect('/dashboard?error=Invalid balance values');
    }

    await User.findByIdAndUpdate(userId, {
      currentBalance: currentBal,
      savingsBalance: savingsBal
    });

    res.redirect('/dashboard?success=Balances updated');
  } catch (error) {
    console.error('Update balances error:', error);
    res.redirect('/dashboard?error=Failed to update balances');
  }
});

module.exports = router;

