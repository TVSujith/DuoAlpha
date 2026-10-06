const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, 'duoalpha.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Could not connect to SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database at', dbPath);
  }
});

// Helper for promise-based queries
function runAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function getAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function allAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function initDatabase() {
  // Enable foreign keys
  await runAsync('PRAGMA foreign_keys = ON');

  // Create Users table
  await runAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create Trades table
  await runAsync(`
    CREATE TABLE IF NOT EXISTS trades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      amount REAL NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create Capital Transactions table
  await runAsync(`
    CREATE TABLE IF NOT EXISTS capital_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL CHECK(type IN ('deposit', 'withdrawal')),
      amount REAL NOT NULL,
      notes TEXT,
      date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create Chat Messages table
  await runAsync(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender TEXT NOT NULL,
      text TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create Settings table
  await runAsync(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    )
  `);

  // Create Goals table
  await runAsync(`
    CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      month TEXT NOT NULL,
      target_amount REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Seed default master account: BhuvSusz / Krishna@0204
  const existingUser = await getAsync('SELECT * FROM users WHERE username = ?', ['BhuvSusz']);
  if (!existingUser) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('Krishna@0204', salt);
    await runAsync('INSERT INTO users (username, password_hash) VALUES (?, ?)', ['BhuvSusz', hash]);
    console.log('Seeded master user: BhuvSusz');
  }

  // Seed default settings
  const defaultSettings = [
    { key: 'daily_loss_limit', value: '5000' },
    { key: 'monthly_profit_goal', value: '50000' },
    { key: 'initial_capital', value: '0' },
    { key: 'theme', value: 'dark' },
    { key: 'partner_name_1', value: 'Sujith' },
    { key: 'partner_name_2', value: 'Bhuvana' }
  ];

  for (const s of defaultSettings) {
    const row = await getAsync('SELECT * FROM settings WHERE key = ?', [s.key]);
    if (!row) {
      await runAsync('INSERT INTO settings (key, value) VALUES (?, ?)', [s.key, s.value]);
    } else if (s.key === 'partner_name_2' && (row.value === 'Friend' || !row.value)) {
      await runAsync('UPDATE settings SET value = ? WHERE key = ?', ['Bhuvana', 'partner_name_2']);
    } else if (s.key === 'initial_capital' && row.value === '100000') {
      await runAsync('UPDATE settings SET value = ? WHERE key = ?', ['0', 'initial_capital']);
    }
  }

  console.log('Database initialized successfully.');
}

module.exports = {
  db,
  dbPath,
  runAsync,
  getAsync,
  allAsync,
  initDatabase
};
