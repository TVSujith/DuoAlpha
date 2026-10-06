const express = require('express');
const router = express.Router();
const { runAsync, getAsync, allAsync } = require('../database');
const { authenticateToken } = require('../auth');

router.use(authenticateToken);

// Helper to get formatted stats
async function calculateStats() {
  const trades = await allAsync('SELECT * FROM trades ORDER BY date ASC, id ASC');

  let totalProfit = 0;
  let totalLoss = 0;
  let netPnL = 0;

  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = todayStr.substring(0, 7); // YYYY-MM

  let todayPnL = 0;
  let monthlyPnL = 0;

  // Day aggregations
  const dailyMap = {};
  const monthlyMap = {};

  trades.forEach(t => {
    const amt = Number(t.amount);
    if (amt > 0) {
      totalProfit += amt;
    } else {
      totalLoss += Math.abs(amt);
    }
    netPnL += amt;

    if (t.date === todayStr) {
      todayPnL += amt;
    }
    if (t.date && t.date.startsWith(currentMonthStr)) {
      monthlyPnL += amt;
    }

    // Daily
    if (!dailyMap[t.date]) dailyMap[t.date] = 0;
    dailyMap[t.date] += amt;

    // Monthly
    const mKey = t.date ? t.date.substring(0, 7) : 'Unknown';
    if (!monthlyMap[mKey]) monthlyMap[mKey] = 0;
    monthlyMap[mKey] += amt;
  });

  // Winning and losing days
  const dailyEntries = Object.entries(dailyMap).sort((a, b) => a[0].localeCompare(b[0]));
  let winningDaysCount = 0;
  let losingDaysCount = 0;
  let breakEvenDaysCount = 0;
  let bestDay = null; // { date, amount }
  let worstDay = null; // { date, amount }

  let runningCapital = 0;
  // Get initial capital
  const capRow = await getAsync("SELECT value FROM settings WHERE key = 'initial_capital'");
  const initialCap = capRow ? Number(capRow.value) : 0;
  runningCapital = initialCap;

  const equityCurve = [];
  dailyEntries.forEach(([date, dayAmount]) => {
    if (dayAmount > 0) winningDaysCount++;
    else if (dayAmount < 0) losingDaysCount++;
    else breakEvenDaysCount++;

    if (!bestDay || dayAmount > bestDay.amount) {
      bestDay = { date, amount: dayAmount };
    }
    if (!worstDay || dayAmount < worstDay.amount) {
      worstDay = { date, amount: dayAmount };
    }

    runningCapital += dayAmount;
    equityCurve.push({
      date,
      dayPnL: dayAmount,
      equity: runningCapital
    });
  });

  const totalTradingDays = winningDaysCount + losingDaysCount;
  const winRate = totalTradingDays > 0 ? (winningDaysCount / totalTradingDays) * 100 : 0;

  // Check Daily Loss limit
  const limitRow = await getAsync("SELECT value FROM settings WHERE key = 'daily_loss_limit'");
  const maxDailyLossLimit = limitRow ? Math.abs(Number(limitRow.value)) : 5000;
  const dailyLossBreached = todayPnL < 0 && Math.abs(todayPnL) >= maxDailyLossLimit;

  // Monthly Profit goal progress
  const goalRow = await getAsync("SELECT value FROM settings WHERE key = 'monthly_profit_goal'");
  const monthlyGoal = goalRow ? Number(goalRow.value) : 50000;
  const monthlyGoalProgress = monthlyGoal > 0 ? Math.min(Math.max((monthlyPnL / monthlyGoal) * 100, 0), 100) : 0;

  return {
    totalProfit: Number(totalProfit.toFixed(2)),
    totalLoss: Number(totalLoss.toFixed(2)),
    netPnL: Number(netPnL.toFixed(2)),
    todayPnL: Number(todayPnL.toFixed(2)),
    monthlyPnL: Number(monthlyPnL.toFixed(2)),
    winningDaysCount,
    losingDaysCount,
    breakEvenDaysCount,
    totalTrades: trades.length,
    winRate: Number(winRate.toFixed(1)),
    bestDay,
    worstDay,
    maxDailyLossLimit,
    dailyLossBreached,
    monthlyGoal,
    monthlyGoalProgress: Number(monthlyGoalProgress.toFixed(1)),
    equityCurve,
    dailyMap,
    monthlyMap
  };
}

// GET /api/trades - List trades
router.get('/', async (req, res) => {
  try {
    const { search, filter, sortBy = 'date', order = 'DESC' } = req.query;

    let query = 'SELECT * FROM trades WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (notes LIKE ? OR date LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (filter === 'profit') {
      query += ' AND amount > 0';
    } else if (filter === 'loss') {
      query += ' AND amount < 0';
    }

    const validSortCols = ['date', 'amount', 'created_at'];
    const sortCol = validSortCols.includes(sortBy) ? sortBy : 'date';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    query += ` ORDER BY ${sortCol} ${sortOrder}, id DESC`;

    const trades = await allAsync(query, params);
    res.json({ trades });
  } catch (err) {
    console.error('Error fetching trades:', err);
    res.status(500).json({ error: 'Failed to fetch trades' });
  }
});

// GET /api/trades/stats - Aggregate stats
router.get('/stats', async (req, res) => {
  try {
    const stats = await calculateStats();
    res.json(stats);
  } catch (err) {
    console.error('Error calculating trade stats:', err);
    res.status(500).json({ error: 'Failed to calculate trade stats' });
  }
});

// POST /api/trades - Add trade entry
router.post('/', async (req, res) => {
  try {
    const { date, amount, notes } = req.body;

    if (!date || amount === undefined || amount === null || isNaN(amount)) {
      return res.status(400).json({ error: 'Valid date and numeric amount are required' });
    }

    const numAmount = Number(amount);
    const result = await runAsync(
      'INSERT INTO trades (date, amount, notes, created_at, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
      [date, numAmount, notes || '']
    );

    const newTrade = await getAsync('SELECT * FROM trades WHERE id = ?', [result.lastID]);
    const stats = await calculateStats();

    // Broadcast through socket
    const io = req.app.get('io');
    if (io) {
      io.emit('trade:created', { trade: newTrade, stats });
      if (stats.dailyLossBreached) {
        io.emit('system:alert', {
          type: 'risk_warning',
          title: 'Daily Loss Limit Reached',
          message: `Today's net loss is -₹${Math.abs(stats.todayPnL).toLocaleString('en-IN')}, exceeding the limit of -₹${stats.maxDailyLossLimit.toLocaleString('en-IN')}. Trade safe!`
        });
      }
      if (stats.monthlyPnL >= stats.monthlyGoal && stats.monthlyGoal > 0) {
        io.emit('system:alert', {
          type: 'goal_achievement',
          title: 'Goal Achieved!',
          message: `Congratulations DuoAlpha team! Monthly profit goal of ₹${stats.monthlyGoal.toLocaleString('en-IN')} reached!`
        });
      }
    }

    res.status(201).json({ trade: newTrade, stats });
  } catch (err) {
    console.error('Error creating trade:', err);
    res.status(500).json({ error: 'Failed to create trade entry' });
  }
});

// PUT /api/trades/:id - Edit trade entry
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { date, amount, notes } = req.body;

    if (!date || amount === undefined || isNaN(amount)) {
      return res.status(400).json({ error: 'Valid date and numeric amount are required' });
    }

    const trade = await getAsync('SELECT * FROM trades WHERE id = ?', [id]);
    if (!trade) {
      return res.status(404).json({ error: 'Trade not found' });
    }

    await runAsync(
      'UPDATE trades SET date = ?, amount = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [date, Number(amount), notes || '', id]
    );

    const updatedTrade = await getAsync('SELECT * FROM trades WHERE id = ?', [id]);
    const stats = await calculateStats();

    const io = req.app.get('io');
    if (io) {
      io.emit('trade:updated', { trade: updatedTrade, stats });
    }

    res.json({ trade: updatedTrade, stats });
  } catch (err) {
    console.error('Error updating trade:', err);
    res.status(500).json({ error: 'Failed to update trade' });
  }
});

// DELETE /api/trades/:id - Delete trade entry
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const trade = await getAsync('SELECT * FROM trades WHERE id = ?', [id]);
    if (!trade) {
      return res.status(404).json({ error: 'Trade not found' });
    }

    await runAsync('DELETE FROM trades WHERE id = ?', [id]);
    const stats = await calculateStats();

    const io = req.app.get('io');
    if (io) {
      io.emit('trade:deleted', { id: Number(id), stats });
    }

    res.json({ success: true, message: 'Trade deleted', stats });
  } catch (err) {
    console.error('Error deleting trade:', err);
    res.status(500).json({ error: 'Failed to delete trade' });
  }
});

module.exports = { router, calculateStats };
