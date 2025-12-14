const express = require('express');
const { sql } = require('../config/database');

const router = express.Router();

// Listar categorias
router.get('/', async (req, res, next) => {
  try {
    const categories = await sql`
      SELECT
        c.*,
        (SELECT COUNT(*) FROM products WHERE category_id = c.id AND status = 'active') as product_count
      FROM categories c
      WHERE c.is_active = true
      ORDER BY c.sort_order
    `;

    res.json({ success: true, categories });
  } catch (error) {
    next(error);
  }
});

// Obter categoria por slug
router.get('/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;

    const categories = await sql`
      SELECT * FROM categories WHERE slug = ${slug} AND is_active = true
    `;

    if (categories.length === 0) {
      return res.status(404).json({ error: true, message: 'Categoria não encontrada' });
    }

    res.json({ success: true, category: categories[0] });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
