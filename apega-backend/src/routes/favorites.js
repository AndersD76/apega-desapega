const express = require('express');
const { sql } = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { trackEvent, EventTypes, EventCategories } = require('../services/analytics');

const router = express.Router();

// Listar favoritos
router.get('/', authenticate, async (req, res, next) => {
  try {
    const favorites = await sql`
      SELECT
        f.id as favorite_id,
        f.created_at as favorited_at,
        p.*,
        u.name as seller_name,
        u.avatar_url as seller_avatar,
        u.city as seller_city,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as image_url
      FROM favorites f
      JOIN products p ON f.product_id = p.id
      JOIN users u ON p.seller_id = u.id
      WHERE f.user_id = ${req.user.id}
      ORDER BY f.created_at DESC
    `;

    res.json({ success: true, favorites });
  } catch (error) {
    next(error);
  }
});

// Adicionar aos favoritos
router.post('/:product_id', authenticate, async (req, res, next) => {
  try {
    const { product_id } = req.params;

    // Verificar se produto existe
    const products = await sql`SELECT id FROM products WHERE id = ${product_id}`;

    if (products.length === 0) {
      return res.status(404).json({ error: true, message: 'Produto não encontrado' });
    }

    // Verificar se já está nos favoritos
    const existing = await sql`
      SELECT id FROM favorites WHERE user_id = ${req.user.id} AND product_id = ${product_id}
    `;

    if (existing.length > 0) {
      return res.status(400).json({ error: true, message: 'Produto já está nos favoritos' });
    }

    await sql`
      INSERT INTO favorites (user_id, product_id)
      VALUES (${req.user.id}, ${product_id})
    `;

    // Track evento de favorito
    trackEvent({
      eventType: EventTypes.FAVORITE_ADD,
      eventCategory: EventCategories.INTERACTION,
      userId: req.user.id,
      productId: product_id,
      req,
    });

    res.status(201).json({ success: true, message: 'Adicionado aos favoritos' });
  } catch (error) {
    next(error);
  }
});

// Remover dos favoritos
router.delete('/:product_id', authenticate, async (req, res, next) => {
  try {
    const { product_id } = req.params;

    const deleted = await sql`
      DELETE FROM favorites
      WHERE user_id = ${req.user.id} AND product_id = ${product_id}
      RETURNING id
    `;

    if (deleted.length > 0) {
      // Track evento de remover favorito
      trackEvent({
        eventType: EventTypes.FAVORITE_REMOVE,
        eventCategory: EventCategories.INTERACTION,
        userId: req.user.id,
        productId: product_id,
        req,
      });
    }

    res.json({ success: true, message: 'Removido dos favoritos' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
