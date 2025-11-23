const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middleware/auth');
const Transaction = require('../models/Transaction');
const XLSX = require('xlsx');

// Export transactions
router.post('/', isLoggedIn, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { range, startDate, endDate } = req.body;

    let query = { userId };
    let dateRange = {};

    // Determine date range
    const now = new Date();
    if (range === 'day') {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      dateRange = { $gte: start };
    } else if (range === 'month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      dateRange = { $gte: start };
    } else if (range === 'year') {
      const start = new Date(now.getFullYear(), 0, 1);
      dateRange = { $gte: start };
    } else if (range === 'custom' && startDate && endDate) {
      dateRange = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (Object.keys(dateRange).length > 0) {
      query.date = dateRange;
    }

    const transactions = await Transaction.find(query).sort({ date: -1 });

    if (transactions.length === 0) {
      return res.redirect('/transactions?error=No transactions to export');
    }

    // Calculate totals
    let totalIncome = 0;
    let totalExpenses = 0;
    transactions.forEach(t => {
      if (t.type === 'deposit') {
        totalIncome += t.amount;
      } else {
        totalExpenses += t.amount;
      }
    });

    // Prepare data for Excel
    const excelData = [
      ['Summary'],
      ['Total Income', totalIncome.toFixed(2)],
      ['Total Expenses', totalExpenses.toFixed(2)],
      ['Net', (totalIncome - totalExpenses).toFixed(2)],
      [],
      ['Date', 'Description', 'Type', 'Account', 'Amount', 'Category', 'Balance After']
    ];

    transactions.forEach(t => {
      excelData.push([
        t.date.toISOString().split('T')[0],
        t.description,
        t.type,
        t.accountType,
        t.amount.toFixed(2),
        t.category,
        t.balanceAfter.toFixed(2)
      ]);
    });

    // Create workbook
    const ws = XLSX.utils.aoa_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transactions');

    // Generate filename
    const filename = `transactions_${range}_${Date.now()}.xlsx`;

    // Write to buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (error) {
    console.error('Export error:', error);
    res.redirect('/transactions?error=Failed to export transactions');
  }
});

module.exports = router;

