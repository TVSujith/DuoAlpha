const express = require('express');
const router = express.Router();
const XLSX = require('xlsx');
const { allAsync } = require('../database');
const { authenticateToken } = require('../auth');

router.use(authenticateToken);

// GET /api/reports/monthly - Monthly aggregated metrics
router.get('/monthly', async (req, res) => {
  try {
    const trades = await allAsync('SELECT * FROM trades ORDER BY date DESC');

    const monthlyMap = {};

    trades.forEach(t => {
      const monthKey = t.date ? t.date.substring(0, 7) : 'Unknown';
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = {
          month: monthKey,
          totalTrades: 0,
          winningTrades: 0,
          losingTrades: 0,
          grossProfit: 0,
          grossLoss: 0,
          netPnL: 0,
          trades: []
        };
      }

      const m = monthlyMap[monthKey];
      const amt = Number(t.amount);
      m.totalTrades += 1;
      if (amt > 0) {
        m.winningTrades += 1;
        m.grossProfit += amt;
      } else if (amt < 0) {
        m.losingTrades += 1;
        m.grossLoss += Math.abs(amt);
      }
      m.netPnL += amt;
      m.trades.push(t);
    });

    const report = Object.values(monthlyMap).map(m => {
      const winRate = m.totalTrades > 0 ? (m.winningTrades / m.totalTrades) * 100 : 0;
      return {
        ...m,
        grossProfit: Number(m.grossProfit.toFixed(2)),
        grossLoss: Number(m.grossLoss.toFixed(2)),
        netPnL: Number(m.netPnL.toFixed(2)),
        winRate: Number(winRate.toFixed(1))
      };
    }).sort((a, b) => b.month.localeCompare(a.month));

    res.json({ report });
  } catch (err) {
    console.error('Error generating monthly report:', err);
    res.status(500).json({ error: 'Failed to generate monthly report' });
  }
});

// GET /api/reports/export/csv - Download trade log as CSV
router.get('/export/csv', async (req, res) => {
  try {
    const trades = await allAsync('SELECT * FROM trades ORDER BY date DESC, id DESC');

    const headers = ['ID', 'Date', 'Amount', 'Type', 'Notes', 'Created Timestamp'];
    const rows = trades.map(t => [
      t.id,
      t.date,
      t.amount,
      t.amount >= 0 ? 'Profit' : 'Loss',
      `"${(t.notes || '').replace(/"/g, '""')}"`,
      t.created_at
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="duoalpha_trades_${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csvContent);
  } catch (err) {
    console.error('CSV export error:', err);
    res.status(500).json({ error: 'Failed to export CSV' });
  }
});

// GET /api/reports/export/excel - Download trade log and capital as Excel XLSX
router.get('/export/excel', async (req, res) => {
  try {
    const trades = await allAsync('SELECT * FROM trades ORDER BY date DESC, id DESC');
    const capital = await allAsync('SELECT * FROM capital_transactions ORDER BY date DESC, id DESC');

    const tradesData = trades.map(t => ({
      ID: t.id,
      Date: t.date,
      Amount: t.amount,
      Type: t.amount >= 0 ? 'Profit' : 'Loss',
      Notes: t.notes || '',
      Created: t.created_at
    }));

    const capitalData = capital.map(c => ({
      ID: c.id,
      Date: c.date,
      Type: c.type.toUpperCase(),
      Amount: c.amount,
      Notes: c.notes || '',
      Created: c.created_at
    }));

    const workbook = XLSX.utils.book_new();
    const tradesSheet = XLSX.utils.json_to_sheet(tradesData);
    const capitalSheet = XLSX.utils.json_to_sheet(capitalData);

    XLSX.utils.book_append_sheet(workbook, tradesSheet, 'Trades');
    XLSX.utils.book_append_sheet(workbook, capitalSheet, 'Capital Transactions');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="duoalpha_report_${new Date().toISOString().split('T')[0]}.xlsx"`);
    res.send(buffer);
  } catch (err) {
    console.error('Excel export error:', err);
    res.status(500).json({ error: 'Failed to export Excel report' });
  }
});

module.exports = router;
