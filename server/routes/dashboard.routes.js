const express = require('express');
const router = express.Router();
const { calculateStats } = require('./trades.routes');
const { getCapitalSummary } = require('./capital.routes');
const { allAsync } = require('../database');
const { authenticateToken } = require('../auth');

router.use(authenticateToken);

// GET /api/dashboard - Complete dashboard summary in one call
router.get('/', async (req, res) => {
  try {
    const [tradeStats, capitalSummary] = await Promise.all([
      calculateStats(),
      getCapitalSummary()
    ]);

    const recentTrades = await allAsync(
      'SELECT * FROM trades ORDER BY date DESC, id DESC LIMIT 5'
    );

    const recentChat = await allAsync(
      'SELECT * FROM chat_messages ORDER BY id DESC LIMIT 5'
    );

    res.json({
      capital: {
        currentCapital: capitalSummary.currentCapital,
        totalDeposited: capitalSummary.totalDeposited,
        totalWithdrawn: capitalSummary.totalWithdrawn
      },
      pnl: {
        totalProfit: tradeStats.totalProfit,
        totalLoss: tradeStats.totalLoss,
        netPnL: tradeStats.netPnL,
        todayPnL: tradeStats.todayPnL,
        monthlyPnL: tradeStats.monthlyPnL
      },
      risk: {
        maxDailyLossLimit: tradeStats.maxDailyLossLimit,
        dailyLossBreached: tradeStats.dailyLossBreached
      },
      goal: {
        monthlyGoal: tradeStats.monthlyGoal,
        monthlyGoalProgress: tradeStats.monthlyGoalProgress
      },
      metrics: {
        winningDaysCount: tradeStats.winningDaysCount,
        losingDaysCount: tradeStats.losingDaysCount,
        winRate: tradeStats.winRate,
        bestDay: tradeStats.bestDay,
        worstDay: tradeStats.worstDay,
        totalTrades: tradeStats.totalTrades
      },
      recentTrades,
      recentChat: recentChat.reverse()
    });
  } catch (err) {
    console.error('Dashboard aggregation error:', err);
    res.status(500).json({ error: 'Failed to aggregate dashboard data' });
  }
});

module.exports = router;
