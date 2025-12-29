/**
 * Rotas de Tags de Produtos
 */

const express = require('express');
const { sql } = require('../config/database');
const { authenticate, optionalAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/tags
 * Lista todas as tags disponiveis agrupadas por categoria
 */
router.get('/', async (req, res, next) => {
  try {
    const tags = await sql`
      SELECT * FROM product_tags
      WHERE is_active = true
      ORDER BY category, sort_order, name
    `;

    // Agrupar por categoria
    const grouped = tags.reduce((acc, tag) => {
      if (!acc[tag.category]) {
        acc[tag.category] = [];
      }
      acc[tag.category].push(tag);
      return acc;
    }, {});

    res.json({
      success: true,
      tags,
      grouped: {
        ano: grouped.ano || [],
        estilo: grouped.estilo || [],
        colecao: grouped.colecao || [],
        especial: grouped.especial || [],
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/tags/:slug
 * Obter tag por slug
 */
router.get('/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;

    const tags = await sql`
      SELECT * FROM product_tags WHERE slug = ${slug}
    `;

    if (tags.length === 0) {
      return res.status(404).json({ error: true, message: 'Tag nao encontrada' });
    }

    res.json({ success: true, tag: tags[0] });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/tags/:slug/products
 * Lista produtos com uma tag especifica
 */
router.get('/:slug/products', optionalAuth, async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Buscar tag
    const tagResult = await sql`
      SELECT id, name FROM product_tags WHERE slug = ${slug}
    `;

    if (tagResult.length === 0) {
      return res.status(404).json({ error: true, message: 'Tag nao encontrada' });
    }

    const tag = tagResult[0];

    // Buscar produtos com essa tag
    const products = await sql`
      SELECT
        p.*,
        u.name as seller_name,
        u.avatar_url as seller_avatar,
        u.city as seller_city,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as image_url,
        ${req.user ? sql`EXISTS(SELECT 1 FROM favorites WHERE user_id = ${req.user.id} AND product_id = p.id)` : sql`false`} as is_favorited
      FROM products p
      JOIN product_tag_relations ptr ON p.id = ptr.product_id
      JOIN users u ON p.seller_id = u.id
      WHERE ptr.tag_id = ${tag.id} AND p.status = 'active'
      ORDER BY p.created_at DESC
      LIMIT ${parseInt(limit)} OFFSET ${offset}
    `;

    // Contar total
    const countResult = await sql`
      SELECT COUNT(*) as total
      FROM products p
      JOIN product_tag_relations ptr ON p.id = ptr.product_id
      WHERE ptr.tag_id = ${tag.id} AND p.status = 'active'
    `;
    const total = parseInt(countResult[0].total);

    res.json({
      success: true,
      tag,
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/tags/product/:productId
 * Adiciona tags a um produto
 */
router.post('/product/:productId', authenticate, async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { tagIds } = req.body;

    if (!tagIds || !Array.isArray(tagIds)) {
      return res.status(400).json({ error: true, message: 'tagIds deve ser um array' });
    }

    // Verificar se o produto pertence ao usuario
    const product = await sql`
      SELECT seller_id FROM products WHERE id = ${productId}
    `;

    if (product.length === 0) {
      return res.status(404).json({ error: true, message: 'Produto nao encontrado' });
    }

    if (product[0].seller_id !== req.user.id) {
      return res.status(403).json({ error: true, message: 'Sem permissao' });
    }

    // Remover tags antigas
    await sql`DELETE FROM product_tag_relations WHERE product_id = ${productId}`;

    // Adicionar novas tags
    for (const tagId of tagIds) {
      await sql`
        INSERT INTO product_tag_relations (product_id, tag_id)
        VALUES (${productId}, ${tagId})
        ON CONFLICT DO NOTHING
      `;
    }

    // Buscar tags atualizadas
    const updatedTags = await sql`
      SELECT pt.* FROM product_tags pt
      JOIN product_tag_relations ptr ON pt.id = ptr.tag_id
      WHERE ptr.product_id = ${productId}
    `;

    res.json({
      success: true,
      message: 'Tags atualizadas',
      tags: updatedTags
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/tags/product/:productId
 * Lista tags de um produto
 */
router.get('/product/:productId', async (req, res, next) => {
  try {
    const { productId } = req.params;

    const tags = await sql`
      SELECT pt.* FROM product_tags pt
      JOIN product_tag_relations ptr ON pt.id = ptr.tag_id
      WHERE ptr.product_id = ${productId}
      ORDER BY pt.category, pt.sort_order
    `;

    res.json({ success: true, tags });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
