const Budget = require('../models/Budget');
const Goal = require('../models/Goal');
const Reminder = require('../models/Reminder');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');

async function checkNotifications(userId) {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const budget = await Budget.findOne({ userId, monthYear: currentMonth });
  if (budget) {
    const percentage = (budget.currentSpent / budget.budgetAmount) * 100;
    let message = '';
    let type = 'info';

    if (percentage >= 100) {
      message = `Budget exceeded! You've gone over by ${(percentage - 100).toFixed(1)}%—time to adjust.`;
      type = 'critical';
    } else if (percentage >= 95) {
      message = `Critical: Almost at limit (95%)—cut back now.`;
      type = 'critical';
    } else if (percentage >= 90) {
      message = `Alert: 90% of budget used—review your expenses.`;
      type = 'alert';
    } else if (percentage >= 80) {
      message = `Warning: You've spent 80% of your budget—spend wisely!`;
      type = 'warning';
    }

    if (message) {
      const existing = await Notification.findOne({
        userId,
        message,
        createdAt: { $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) }
      });
      if (!existing) {
        await Notification.create({ userId, message, type });
      }
    }
  }

  const goals = await Goal.find({ userId });
  for (const goal of goals) {
    const progress = (goal.currentProgress / goal.targetAmount) * 100;
    const daysUntilDeadline = Math.ceil((goal.deadline - now) / (1000 * 60 * 60 * 24));
    const daysTotal = Math.ceil((goal.deadline - goal.createdAt) / (1000 * 60 * 60 * 24));
    const midpoint = daysTotal / 2;

    if (daysUntilDeadline > 0 && daysUntilDeadline <= midpoint && progress < 50) {
      const message = `You're behind on your "${goal.description}" goal—boost your savings!`;
      const existing = await Notification.findOne({
        userId,
        message,
        createdAt: { $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) }
      });
      if (!existing) {
        await Notification.create({ userId, message, type: 'warning' });
      }
    }
  }

  const reminders = await Reminder.find({ userId, isPaid: false });
  for (const reminder of reminders) {
    const daysUntilDue = Math.ceil((reminder.dueDate - now) / (1000 * 60 * 60 * 24));
    if (daysUntilDue <= 3 && daysUntilDue >= 0) {
      const message = `Reminder: ${reminder.description} ($${reminder.amount.toFixed(2)}) due in ${daysUntilDue} day(s)`;
      const existing = await Notification.findOne({
        userId,
        message,
        createdAt: { $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) }
      });
      if (!existing) {
        await Notification.create({ userId, message, type: 'alert' });
      }
    }
  }
}

module.exports = { checkNotifications };

