const express = require('express');
const { sql } = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Listar avaliações recebidas por um usuário
router.get('/user/:user_id', async (req, res, next) => {
  try {
    const { user_id } = req.params;

    const reviews = await sql`
      SELECT
        r.*,
        u.name as reviewer_name,
        u.avatar_url as reviewer_avatar,
        p.title as product_title
      FROM reviews r
      JOIN users u ON r.reviewer_id = u.id
      JOIN orders o ON r.order_id = o.id
      JOIN products p ON o.product_id = p.id
      WHERE r.reviewed_user_id = ${user_id}
      ORDER BY r.created_at DESC
    `;

    // Calcular média
    const avgResult = await sql`
      SELECT AVG(rating) as average, COUNT(*) as total
      FROM reviews WHERE reviewed_user_id = ${user_id}
    `;

    res.json({
      success: true,
      reviews,
      stats: {
        average: parseFloat(avgResult[0].average) || 0,
        total: parseInt(avgResult[0].total)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Minhas avaliações (recebidas e feitas)
router.get('/my', authenticate, async (req, res, next) => {
  try {
    const { type = 'received' } = req.query;

    let reviews;

    if (type === 'received') {
      reviews = await sql`
        SELECT
          r.*,
          u.name as reviewer_name,
          u.avatar_url as reviewer_avatar,
          p.title as product_title
        FROM reviews r
        JOIN users u ON r.reviewer_id = u.id
        JOIN orders o ON r.order_id = o.id
        JOIN products p ON o.product_id = p.id
        WHERE r.reviewed_user_id = ${req.user.id}
        ORDER BY r.created_at DESC
      `;
    } else {
      reviews = await sql`
        SELECT
          r.*,
          u.name as reviewed_name,
          u.avatar_url as reviewed_avatar,
          p.title as product_title
        FROM reviews r
        JOIN users u ON r.reviewed_user_id = u.id
        JOIN orders o ON r.order_id = o.id
        JOIN products p ON o.product_id = p.id
        WHERE r.reviewer_id = ${req.user.id}
        ORDER BY r.created_at DESC
      `;
    }

    res.json({ success: true, reviews });
  } catch (error) {
    next(error);
  }
});

// Criar avaliação
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { order_id, rating, comment } = req.body;

    if (!order_id || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        error: true,
        message: 'Pedido e avaliação (1-5) são obrigatórios'
      });
    }

    // Verificar se o pedido existe e pertence ao usuário
    const orders = await sql`
      SELECT * FROM orders WHERE id = ${order_id}
        AND (buyer_id = ${req.user.id} OR seller_id = ${req.user.id})
        AND status = 'completed'
    `;

    if (orders.length === 0) {
      return res.status(404).json({
        error: true,
        message: 'Pedido não encontrado ou não finalizado'
      });
    }

    const order = orders[0];

    // Determinar quem está sendo avaliado
    const reviewedUserId = order.buyer_id === req.user.id ? order.seller_id : order.buyer_id;

    // Verificar se já avaliou
    const existing = await sql`
      SELECT id FROM reviews
      WHERE order_id = ${order_id} AND reviewer_id = ${req.user.id}
    `;

    if (existing.length > 0) {
      return res.status(400).json({ error: true, message: 'Você já avaliou este pedido' });
    }

    // Criar avaliação
    const newReview = await sql`
      INSERT INTO reviews (order_id, reviewer_id, reviewed_user_id, rating, comment)
      VALUES (${order_id}, ${req.user.id}, ${reviewedUserId}, ${rating}, ${comment || null})
      RETURNING *
    `;

    // Atualizar média do usuário avaliado
    const avgResult = await sql`
      SELECT AVG(rating) as average, COUNT(*) as total
      FROM reviews WHERE reviewed_user_id = ${reviewedUserId}
    `;

    await sql`
      UPDATE users
      SET rating = ${parseFloat(avgResult[0].average)}, total_reviews = ${parseInt(avgResult[0].total)}
      WHERE id = ${reviewedUserId}
    `;

    res.status(201).json({ success: true, review: newReview[0] });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
