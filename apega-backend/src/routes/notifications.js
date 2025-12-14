const express = require('express');
const { sql } = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Listar notificações
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { page = 1, limit = 30 } = req.query;
    const offset = (page - 1) * limit;

    const notifications = await sql`
      SELECT * FROM notifications
      WHERE user_id = ${req.user.id}
      ORDER BY created_at DESC
      LIMIT ${parseInt(limit)}
      OFFSET ${offset}
    `;

    // Contar não lidas
    const unreadCount = await sql`
      SELECT COUNT(*) as count FROM notifications
      WHERE user_id = ${req.user.id} AND is_read = false
    `;

    res.json({
      success: true,
      notifications,
      unreadCount: parseInt(unreadCount[0].count)
    });
  } catch (error) {
    next(error);
  }
});

// Marcar como lida
router.patch('/:id/read', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;

    await sql`
      UPDATE notifications SET is_read = true
      WHERE id = ${id} AND user_id = ${req.user.id}
    `;

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Marcar todas como lidas
router.patch('/read-all', authenticate, async (req, res, next) => {
  try {
    await sql`
      UPDATE notifications SET is_read = true
      WHERE user_id = ${req.user.id}
    `;

    res.json({ success: true, message: 'Todas as notificações foram marcadas como lidas' });
  } catch (error) {
    next(error);
  }
});

// Deletar notificação
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;

    await sql`
      DELETE FROM notifications
      WHERE id = ${id} AND user_id = ${req.user.id}
    `;

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
