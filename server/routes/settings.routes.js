const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { runAsync, getAsync, allAsync, dbPath } = require('../database');
const { authenticateToken } = require('../auth');

router.use(authenticateToken);

const upload = multer({ dest: path.resolve(__dirname, '../uploads/') });

// Ensure uploads dir exists
const uploadsDir = path.resolve(__dirname, '../uploads/');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// GET /api/settings - Retrieve all system settings
router.get('/', async (req, res) => {
  try {
    const rows = await allAsync('SELECT * FROM settings');
    const settings = {};
    rows.forEach(r => {
      settings[r.key] = r.value;
    });

    // Also get current month's goal if set in goals table or settings
    const currentMonth = new Date().toISOString().substring(0, 7);
    const goalRow = await getAsync('SELECT * FROM goals WHERE month = ?', [currentMonth]);
    if (goalRow) {
      settings.monthly_profit_goal = goalRow.target_amount;
    }

    res.json({ settings });
  } catch (err) {
    console.error('Error fetching settings:', err);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// PUT /api/settings - Update settings
router.put('/', async (req, res) => {
  try {
    const { daily_loss_limit, monthly_profit_goal, theme, partner_name_1, partner_name_2 } = req.body;

    if (daily_loss_limit !== undefined) {
      await runAsync(
        'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
        ['daily_loss_limit', String(daily_loss_limit)]
      );
    }

    if (monthly_profit_goal !== undefined) {
      await runAsync(
        'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
        ['monthly_profit_goal', String(monthly_profit_goal)]
      );

      const currentMonth = new Date().toISOString().substring(0, 7);
      await runAsync(
        'INSERT INTO goals (month, target_amount) VALUES (?, ?)',
        [currentMonth, Number(monthly_profit_goal)]
      );
    }

    if (theme !== undefined) {
      await runAsync(
        'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
        ['theme', String(theme)]
      );
    }

    if (partner_name_1 !== undefined) {
      await runAsync(
        'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
        ['partner_name_1', String(partner_name_1)]
      );
    }

    if (partner_name_2 !== undefined) {
      await runAsync(
        'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
        ['partner_name_2', String(partner_name_2)]
      );
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('settings:updated', req.body);
    }

    res.json({ success: true, message: 'Settings saved successfully' });
  } catch (err) {
    console.error('Error saving settings:', err);
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

// GET /api/settings/backup/db - Download SQLite database backup
router.get('/backup/db', (req, res) => {
  try {
    if (!fs.existsSync(dbPath)) {
      return res.status(404).json({ error: 'Database file not found' });
    }
    const filename = `duoalpha_backup_${new Date().toISOString().split('T')[0]}.db`;
    res.download(dbPath, filename);
  } catch (err) {
    console.error('Database backup error:', err);
    res.status(500).json({ error: 'Backup download failed' });
  }
});

// GET /api/settings/backup/json - Download Full JSON backup
router.get('/backup/json', async (req, res) => {
  try {
    const trades = await allAsync('SELECT * FROM trades');
    const capital = await allAsync('SELECT * FROM capital_transactions');
    const chat = await allAsync('SELECT * FROM chat_messages');
    const settings = await allAsync('SELECT * FROM settings');
    const goals = await allAsync('SELECT * FROM goals');

    const backupData = {
      appName: 'DuoAlpha',
      exportedAt: new Date().toISOString(),
      trades,
      capital,
      chat,
      settings,
      goals
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="duoalpha_export_${new Date().toISOString().split('T')[0]}.json"`
    );
    res.send(JSON.stringify(backupData, null, 2));
  } catch (err) {
    console.error('JSON backup error:', err);
    res.status(500).json({ error: 'JSON backup export failed' });
  }
});

// POST /api/settings/restore/json - Restore from JSON backup
router.post('/restore/json', express.json({ limit: '10mb' }), async (req, res) => {
  try {
    const { trades, capital, settings, goals } = req.body;

    if (!trades && !capital) {
      return res.status(400).json({ error: 'Invalid backup format' });
    }

    // Restore trades
    if (Array.isArray(trades)) {
      await runAsync('DELETE FROM trades');
      for (const t of trades) {
        await runAsync(
          'INSERT INTO trades (date, amount, notes, created_at) VALUES (?, ?, ?, ?)',
          [t.date, t.amount, t.notes || '', t.created_at || new Date().toISOString()]
        );
      }
    }

    // Restore capital
    if (Array.isArray(capital)) {
      await runAsync('DELETE FROM capital_transactions');
      for (const c of capital) {
        await runAsync(
          'INSERT INTO capital_transactions (type, amount, notes, date, created_at) VALUES (?, ?, ?, ?, ?)',
          [c.type, c.amount, c.notes || '', c.date, c.created_at || new Date().toISOString()]
        );
      }
    }

    // Restore settings
    if (Array.isArray(settings)) {
      for (const s of settings) {
        await runAsync(
          'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
          [s.key, s.value]
        );
      }
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('system:alert', {
        type: 'database_restored',
        title: 'Database Restored',
        message: 'System data has been successfully restored from backup.'
      });
      io.emit('data:reload');
    }

    res.json({ success: true, message: 'Database restored successfully' });
  } catch (err) {
    console.error('Restore error:', err);
    res.status(500).json({ error: 'Failed to restore database from backup' });
  }
});

module.exports = router;
