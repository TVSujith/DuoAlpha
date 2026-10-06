const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const { initDatabase, getAsync, runAsync } = require('./database');

const authRoutes = require('./routes/auth.routes');
const { router: tradesRoutes } = require('./routes/trades.routes');
const { router: capitalRoutes } = require('./routes/capital.routes');
const chatRoutes = require('./routes/chat.routes');
const reportsRoutes = require('./routes/reports.routes');
const settingsRoutes = require('./routes/settings.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

const app = express();
const server = http.createServer(app);

// Enable CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.set('io', io);

// Socket.io real-time management
let onlineUsers = new Set();

io.on('connection', (socket) => {
  const socketId = socket.id;
  onlineUsers.add(socketId);
  io.emit('presence:update', { onlineCount: onlineUsers.size });

  socket.on('chat:typing', (data) => {
    socket.broadcast.emit('chat:typing', data);
  });

  socket.on('disconnect', () => {
    onlineUsers.delete(socketId);
    io.emit('presence:update', { onlineCount: onlineUsers.size });
  });
});

// Register API routes
app.use('/api/auth', authRoutes);
app.use('/api/trades', tradesRoutes);
app.use('/api/capital', capitalRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'DuoAlpha', timestamp: new Date().toISOString() });
});

// Serve frontend in production or if dist exists
const path = require('path');
const distPath = path.resolve(__dirname, '../client/dist');
const fs = require('fs');

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/socket.io')) {
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });
}

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await initDatabase();
    server.listen(PORT, () => {
      console.log(`=========================================`);
      console.log(`  DUOALPHA TRADING SERVER STARTED        `);
      console.log(`  Port: ${PORT}                          `);
      console.log(`  http://localhost:${PORT}               `);
      console.log(`=========================================`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
