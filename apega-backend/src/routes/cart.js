const express = require('express');
const { sql } = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Listar itens do carrinho
router.get('/', authenticate, async (req, res, next) => {
  try {
    const items = await sql`
      SELECT
        ci.id as cart_item_id,
        ci.created_at as added_at,
        p.*,
        u.name as seller_name,
        u.avatar_url as seller_avatar,
        u.store_name,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as image_url
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      JOIN users u ON p.seller_id = u.id
      WHERE ci.user_id = ${req.user.id}
        AND p.status = 'active'
      ORDER BY ci.created_at DESC
    `;

    // Calcular totais
    const subtotal = items.reduce((sum, item) => sum + parseFloat(item.price), 0);
    const shipping = items.length > 0 ? 15.00 : 0;
    const total = subtotal + shipping;

    res.json({
      success: true,
      items,
      summary: {
        subtotal,
        shipping,
        total,
        itemCount: items.length
      }
    });
  } catch (error) {
    next(error);
  }
});

// Adicionar ao carrinho
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { product_id } = req.body;

    // Verificar se produto existe e está ativo
    const products = await sql`
      SELECT * FROM products WHERE id = ${product_id} AND status = 'active'
    `;

    if (products.length === 0) {
      return res.status(404).json({ error: true, message: 'Produto não disponível' });
    }

    // Não pode adicionar próprio produto
    if (products[0].seller_id === req.user.id) {
      return res.status(400).json({ error: true, message: 'Você não pode comprar seu próprio produto' });
    }

    // Verificar se já está no carrinho
    const existing = await sql`
      SELECT id FROM cart_items WHERE user_id = ${req.user.id} AND product_id = ${product_id}
    `;

    if (existing.length > 0) {
      return res.status(400).json({ error: true, message: 'Produto já está no carrinho' });
    }

    await sql`
      INSERT INTO cart_items (user_id, product_id)
      VALUES (${req.user.id}, ${product_id})
    `;

    res.status(201).json({ success: true, message: 'Produto adicionado ao carrinho' });
  } catch (error) {
    next(error);
  }
});

// Remover do carrinho
router.delete('/:product_id', authenticate, async (req, res, next) => {
  try {
    const { product_id } = req.params;

    await sql`
      DELETE FROM cart_items
      WHERE user_id = ${req.user.id} AND product_id = ${product_id}
    `;

    res.json({ success: true, message: 'Produto removido do carrinho' });
  } catch (error) {
    next(error);
  }
});

// Limpar carrinho
router.delete('/', authenticate, async (req, res, next) => {
  try {
    await sql`DELETE FROM cart_items WHERE user_id = ${req.user.id}`;

    res.json({ success: true, message: 'Carrinho limpo' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
