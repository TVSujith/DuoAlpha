const express = require('express');
const router = express.Router();
const { runAsync, getAsync, allAsync } = require('../database');
const { authenticateToken } = require('../auth');

router.use(authenticateToken);

// GET /api/chat - Get chat message history
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const messages = await allAsync(
      'SELECT * FROM chat_messages ORDER BY id DESC LIMIT ?',
      [limit]
    );
    // Return in chronological order
    res.json({ messages: messages.reverse() });
  } catch (err) {
    console.error('Error fetching chat messages:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// POST /api/chat - Save new message
router.post('/', async (req, res) => {
  try {
    const { sender, text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Message text cannot be empty' });
    }

    const senderName = (sender && sender.trim()) || 'Sujith';

    const result = await runAsync(
      'INSERT INTO chat_messages (sender, text, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
      [senderName, text.trim()]
    );

    const newMessage = await getAsync('SELECT * FROM chat_messages WHERE id = ?', [result.lastID]);

    const io = req.app.get('io');
    if (io) {
      io.emit('chat:message', newMessage);
      io.emit('system:alert', {
        type: 'chat_notification',
        title: `Alpha Room: ${senderName}`,
        message: text.length > 60 ? text.substring(0, 57) + '...' : text
      });
    }

    res.status(201).json({ message: newMessage });
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// DELETE /api/chat/clear - Clear chat history (optional admin utility)
router.delete('/clear', async (req, res) => {
  try {
    await runAsync('DELETE FROM chat_messages');
    const io = req.app.get('io');
    if (io) {
      io.emit('chat:cleared');
    }
    res.json({ success: true, message: 'Chat history cleared' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear chat' });
  }
});

module.exports = router;
