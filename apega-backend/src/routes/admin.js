/**
 * Rotas do Painel Administrativo
 * Acesso restrito a usuarios admin
 */

const express = require('express');
const { sql } = require('../config/database');
const { authenticate } = require('../middleware/auth');
const {
  getOverviewMetrics,
  getMetricsByPeriod,
  getTopProducts,
  getUserStats,
  getRecentEvents,
} = require('../services/analytics');

const router = express.Router();

/**
 * Middleware para verificar se usuario e admin
 */
async function checkAdmin(req, res, next) {
  try {
    // Se for admin fixo (já verificado no middleware authenticate)
    if (req.user.id === 'admin' && req.user.is_admin) {
      return next();
    }

    const user = await sql`
      SELECT is_admin FROM users WHERE id = ${req.user.id}
    `;

    if (!user.length || !user[0].is_admin) {
      return res.status(403).json({
        error: true,
        message: 'Acesso restrito a administradores'
      });
    }

    next();
  } catch (error) {
    console.error('Erro ao verificar admin:', error);
    res.status(500).json({ error: true, message: 'Erro interno' });
  }
}

/**
 * GET /api/admin/dashboard
 * Retorna metricas gerais do painel
 */
router.get('/dashboard', authenticate, checkAdmin, async (req, res) => {
  try {
    const metrics = await getOverviewMetrics();
    res.json({ success: true, metrics });
  } catch (error) {
    console.error('Erro ao obter dashboard:', error);
    res.status(500).json({ error: true, message: 'Erro ao obter metricas' });
  }
});

/**
 * GET /api/admin/metrics
 * Retorna metricas por periodo
 */
router.get('/metrics', authenticate, checkAdmin, async (req, res) => {
  try {
    const { startDate, endDate, period = '7d' } = req.query;

    let start, end;
    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      end = new Date();
      switch (period) {
        case '24h':
          start = new Date(Date.now() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          start = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      }
    }

    const metrics = await getMetricsByPeriod(start, end);
    res.json({ success: true, metrics, period: { start, end } });
  } catch (error) {
    console.error('Erro ao obter metricas:', error);
    res.status(500).json({ error: true, message: 'Erro ao obter metricas' });
  }
});

/**
 * GET /api/admin/products/top
 * Retorna produtos mais populares
 */
router.get('/products/top', authenticate, checkAdmin, async (req, res) => {
  try {
    const { limit = 10, metric = 'views' } = req.query;
    const products = await getTopProducts(parseInt(limit), metric);
    res.json({ success: true, products });
  } catch (error) {
    console.error('Erro ao obter top produtos:', error);
    res.status(500).json({ error: true, message: 'Erro ao obter produtos' });
  }
});

/**
 * GET /api/admin/users
 * Retorna lista de usuarios com filtros
 */
router.get('/users', authenticate, checkAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, subscription, sort = 'recent' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = sql`
      SELECT
        u.id, u.name, u.email, u.phone, u.city, u.state,
        u.subscription_type, u.created_at,
        (SELECT COUNT(*) FROM products WHERE seller_id = u.id AND status != 'deleted') as products_count,
        (SELECT COUNT(*) FROM products WHERE seller_id = u.id AND status = 'sold') as sales_count
      FROM users u
      WHERE 1=1
    `;

    // Aplicar filtros
    if (search) {
      query = sql`${query} AND (u.name ILIKE ${'%' + search + '%'} OR u.email ILIKE ${'%' + search + '%'})`;
    }

    if (subscription) {
      query = sql`${query} AND u.subscription_type = ${subscription}`;
    }

    // Ordenacao
    if (sort === 'sales') {
      query = sql`${query} ORDER BY sales_count DESC`;
    } else if (sort === 'products') {
      query = sql`${query} ORDER BY products_count DESC`;
    } else {
      query = sql`${query} ORDER BY u.created_at DESC`;
    }

    query = sql`${query} LIMIT ${parseInt(limit)} OFFSET ${offset}`;

    const users = await query;

    // Total para paginacao
    const countResult = await sql`SELECT COUNT(*) as total FROM users`;
    const total = parseInt(countResult[0].total);

    res.json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erro ao listar usuarios:', error);
    res.status(500).json({ error: true, message: 'Erro ao listar usuarios' });
  }
});

/**
 * GET /api/admin/users/stats
 * Retorna estatisticas de usuarios
 */
router.get('/users/stats', authenticate, checkAdmin, async (req, res) => {
  try {
    const stats = await getUserStats();
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Erro ao obter stats usuarios:', error);
    res.status(500).json({ error: true, message: 'Erro ao obter estatisticas' });
  }
});

/**
 * GET /api/admin/products
 * Retorna lista de produtos para moderacao
 */
router.get('/products', authenticate, checkAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, category, sort = 'recent' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let products = await sql`
      SELECT
        p.*,
        u.name as seller_name, u.email as seller_email,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as image_url,
        (SELECT COUNT(*) FROM favorites WHERE product_id = p.id) as favorites_count
      FROM products p
      LEFT JOIN users u ON p.seller_id = u.id
      WHERE p.status != 'deleted'
      ${status ? sql`AND p.status = ${status}` : sql``}
      ORDER BY p.created_at DESC
      LIMIT ${parseInt(limit)} OFFSET ${offset}
    `;

    const countResult = await sql`
      SELECT COUNT(*) as total FROM products WHERE status != 'deleted'
      ${status ? sql`AND status = ${status}` : sql``}
    `;
    const total = parseInt(countResult[0].total);

    res.json({
      success: true,
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    res.status(500).json({ error: true, message: 'Erro ao listar produtos' });
  }
});

/**
 * PUT /api/admin/products/:id/status
 * Altera status de um produto (moderacao)
 */
router.put('/products/:id/status', authenticate, checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    const validStatuses = ['active', 'paused', 'deleted', 'sold'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: true, message: 'Status invalido' });
    }

    await sql`
      UPDATE products
      SET status = ${status}, updated_at = NOW()
      WHERE id = ${id}
    `;

    // Log da acao
    console.log(`[Admin] Produto ${id} alterado para ${status} por admin ${req.user.id}. Motivo: ${reason || 'N/A'}`);

    res.json({ success: true, message: 'Status atualizado' });
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).json({ error: true, message: 'Erro ao atualizar' });
  }
});

/**
 * PUT /api/admin/users/:id/subscription
 * Altera assinatura de um usuario
 */
router.put('/users/:id/subscription', authenticate, checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { subscription_type, expires_at } = req.body;

    await sql`
      UPDATE users
      SET
        subscription_type = ${subscription_type},
        subscription_expires_at = ${expires_at || null},
        updated_at = NOW()
      WHERE id = ${id}
    `;

    console.log(`[Admin] Usuario ${id} assinatura alterada para ${subscription_type} por admin ${req.user.id}`);

    res.json({ success: true, message: 'Assinatura atualizada' });
  } catch (error) {
    console.error('Erro ao atualizar assinatura:', error);
    res.status(500).json({ error: true, message: 'Erro ao atualizar' });
  }
});

/**
 * GET /api/admin/events
 * Retorna eventos recentes do sistema
 */
router.get('/events', authenticate, checkAdmin, async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const events = await getRecentEvents(parseInt(limit));
    res.json({ success: true, events });
  } catch (error) {
    console.error('Erro ao obter eventos:', error);
    res.status(500).json({ error: true, message: 'Erro ao obter eventos' });
  }
});

/**
 * GET /api/admin/sales
 * Retorna vendas e comissoes
 */
router.get('/sales', authenticate, checkAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const sales = await sql`
      SELECT
        p.id, p.title, p.price, p.updated_at as sold_at,
        u.name as seller_name, u.email as seller_email,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as image_url,
        CASE
          WHEN u.subscription_type = 'premium' THEN p.price * 0.10
          ELSE p.price * 0.20
        END as commission
      FROM products p
      LEFT JOIN users u ON p.seller_id = u.id
      WHERE p.status = 'sold'
      ORDER BY p.updated_at DESC
      LIMIT ${parseInt(limit)} OFFSET ${offset}
    `;

    // Totais
    const totals = await sql`
      SELECT
        COUNT(*) as total_sales,
        COALESCE(SUM(p.price), 0) as total_gmv,
        COALESCE(SUM(
          CASE
            WHEN u.subscription_type = 'premium' THEN p.price * 0.10
            ELSE p.price * 0.20
          END
        ), 0) as total_commission
      FROM products p
      LEFT JOIN users u ON p.seller_id = u.id
      WHERE p.status = 'sold'
    `;

    res.json({
      success: true,
      sales,
      totals: {
        totalSales: parseInt(totals[0].total_sales),
        totalGMV: parseFloat(totals[0].total_gmv),
        totalCommission: parseFloat(totals[0].total_commission)
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(totals[0].total_sales),
        pages: Math.ceil(parseInt(totals[0].total_sales) / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erro ao obter vendas:', error);
    res.status(500).json({ error: true, message: 'Erro ao obter vendas' });
  }
});

module.exports = router;
