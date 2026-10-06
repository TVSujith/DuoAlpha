const express = require('express');
const router = express.Router();
const { runAsync, getAsync, allAsync } = require('../database');
const { authenticateToken } = require('../auth');

router.use(authenticateToken);

// Helper to compute capital stats
async function getCapitalSummary() {
  const transactions = await allAsync(
    'SELECT * FROM capital_transactions ORDER BY date DESC, id DESC'
  );

  let totalDeposited = 0;
  let totalWithdrawn = 0;

  transactions.forEach(t => {
    const amt = Number(t.amount);
    if (t.type === 'deposit') {
      totalDeposited += amt;
    } else if (t.type === 'withdrawal') {
      totalWithdrawn += amt;
    }
  });

  // Get net trading P&L from trades table
  const pnlRow = await getAsync('SELECT SUM(amount) as netTradingPnL FROM trades');
  const netTradingPnL = pnlRow && pnlRow.netTradingPnL ? Number(pnlRow.netTradingPnL) : 0;

  // Current capital is net deposits minus withdrawals plus net trading profit/loss
  const currentCapital = totalDeposited - totalWithdrawn + netTradingPnL;

  return {
    currentCapital: Number(currentCapital.toFixed(2)),
    totalDeposited: Number(totalDeposited.toFixed(2)),
    totalWithdrawn: Number(totalWithdrawn.toFixed(2)),
    netTradingPnL: Number(netTradingPnL.toFixed(2)),
    transactions
  };
}

// GET /api/capital - Capital summary and transactions
router.get('/', async (req, res) => {
  try {
    const summary = await getCapitalSummary();
    res.json(summary);
  } catch (err) {
    console.error('Error fetching capital summary:', err);
    res.status(500).json({ error: 'Failed to fetch capital summary' });
  }
});

// POST /api/capital - Deposit or Withdraw
router.post('/', async (req, res) => {
  try {
    const { type, amount, notes, date } = req.body;

    if (!type || !['deposit', 'withdrawal'].includes(type)) {
      return res.status(400).json({ error: 'Type must be "deposit" or "withdrawal"' });
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }

    const txDate = date || new Date().toISOString().split('T')[0];

    // If withdrawal, verify current capital is sufficient
    if (type === 'withdrawal') {
      const current = await getCapitalSummary();
      if (numAmount > current.currentCapital) {
        return res.status(400).json({
          error: `Insufficient capital. Maximum withdrawable: ₹${current.currentCapital.toLocaleString('en-IN')}`
        });
      }
    }

    const result = await runAsync(
      'INSERT INTO capital_transactions (type, amount, notes, date) VALUES (?, ?, ?, ?)',
      [type, numAmount, notes || '', txDate]
    );

    const newTx = await getAsync('SELECT * FROM capital_transactions WHERE id = ?', [result.lastID]);
    const summary = await getCapitalSummary();

    const io = req.app.get('io');
    if (io) {
      io.emit('capital:updated', { transaction: newTx, summary });
      io.emit('system:alert', {
        type: 'capital_change',
        title: `${type === 'deposit' ? 'Funds Deposited' : 'Funds Withdrawn'}`,
        message: `${type === 'deposit' ? '+₹' : '-₹'}${numAmount.toLocaleString('en-IN')} ${notes ? `(${notes})` : ''}`
      });
    }

    res.status(201).json({ transaction: newTx, summary });
  } catch (err) {
    console.error('Error recording capital transaction:', err);
    res.status(500).json({ error: 'Failed to process capital transaction' });
  }
});

module.exports = { router, getCapitalSummary };
