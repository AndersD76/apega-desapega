/**
 * Servico de Analytics
 * Rastreia eventos e interacoes para o painel administrativo
 */

const { sql } = require('../config/database');

// Tipos de eventos
const EventTypes = {
  // Usuarios
  USER_REGISTER: 'user_register',
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  USER_PROFILE_UPDATE: 'user_profile_update',
  USER_SUBSCRIPTION_CHANGE: 'user_subscription_change',

  // Produtos
  PRODUCT_CREATE: 'product_create',
  PRODUCT_UPDATE: 'product_update',
  PRODUCT_DELETE: 'product_delete',
  PRODUCT_VIEW: 'product_view',
  PRODUCT_SHARE: 'product_share',

  // Favoritos
  FAVORITE_ADD: 'favorite_add',
  FAVORITE_REMOVE: 'favorite_remove',

  // Mensagens
  MESSAGE_SEND: 'message_send',
  CONVERSATION_START: 'conversation_start',

  // Compras
  CHECKOUT_START: 'checkout_start',
  CHECKOUT_COMPLETE: 'checkout_complete',
  PAYMENT_SUCCESS: 'payment_success',
  PAYMENT_FAILED: 'payment_failed',

  // AI
  AI_ANALYZE: 'ai_analyze',
  AI_ENHANCE: 'ai_enhance',

  // Busca
  SEARCH_PERFORM: 'search_perform',
};

// Categorias de eventos
const EventCategories = {
  USER: 'user',
  PRODUCT: 'product',
  INTERACTION: 'interaction',
  TRANSACTION: 'transaction',
  AI: 'ai',
  SEARCH: 'search',
};

/**
 * Registra um evento de analytics
 * @param {Object} params - Parametros do evento
 */
async function trackEvent({
  eventType,
  eventCategory,
  userId = null,
  productId = null,
  metadata = {},
  req = null,
}) {
  try {
    const ipAddress = req?.ip || req?.headers?.['x-forwarded-for'] || null;
    const userAgent = req?.headers?.['user-agent'] || null;

    await sql`
      INSERT INTO analytics_events (
        event_type, event_category, user_id, product_id,
        metadata, ip_address, user_agent
      ) VALUES (
        ${eventType}, ${eventCategory}, ${userId}, ${productId},
        ${JSON.stringify(metadata)}, ${ipAddress}, ${userAgent}
      )
    `;
  } catch (error) {
    // Log mas nao quebra a aplicacao
    console.error('[Analytics] Erro ao registrar evento:', error.message);
  }
}

/**
 * Obtem metricas gerais do sistema
 */
async function getOverviewMetrics() {
  try {
    const [users, products, sales, revenue] = await Promise.all([
      // Total de usuarios
      sql`SELECT COUNT(*) as total,
          COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as today,
          COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as week
          FROM users`,

      // Total de produtos
      sql`SELECT COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'active') as active,
          COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as today
          FROM products WHERE status != 'deleted'`,

      // Vendas (produtos vendidos)
      sql`SELECT COUNT(*) as total,
          COUNT(*) FILTER (WHERE updated_at > NOW() - INTERVAL '24 hours') as today,
          COUNT(*) FILTER (WHERE updated_at > NOW() - INTERVAL '7 days') as week
          FROM products WHERE status = 'sold'`,

      // Receita estimada (comissoes)
      sql`SELECT
          COALESCE(SUM(price * 0.20), 0) as total_commission,
          COALESCE(SUM(price), 0) as total_gmv
          FROM products WHERE status = 'sold'`,
    ]);

    // Views e favoritos agregados
    const [viewsData, favoritesData] = await Promise.all([
      sql`SELECT COALESCE(SUM(views), 0) as total FROM products`,
      sql`SELECT COUNT(*) as total FROM favorites`,
    ]);

    return {
      users: {
        total: parseInt(users[0].total),
        today: parseInt(users[0].today),
        thisWeek: parseInt(users[0].week),
      },
      products: {
        total: parseInt(products[0].total),
        active: parseInt(products[0].active),
        today: parseInt(products[0].today),
      },
      sales: {
        total: parseInt(sales[0].total),
        today: parseInt(sales[0].today),
        thisWeek: parseInt(sales[0].week),
      },
      revenue: {
        totalCommission: parseFloat(revenue[0].total_commission),
        totalGMV: parseFloat(revenue[0].total_gmv),
      },
      engagement: {
        totalViews: parseInt(viewsData[0].total),
        totalFavorites: parseInt(favoritesData[0].total),
      },
    };
  } catch (error) {
    console.error('[Analytics] Erro ao obter metricas:', error);
    throw error;
  }
}

/**
 * Obtem metricas de um periodo especifico
 */
async function getMetricsByPeriod(startDate, endDate) {
  try {
    const events = await sql`
      SELECT
        DATE(created_at) as date,
        event_type,
        COUNT(*) as count
      FROM analytics_events
      WHERE created_at >= ${startDate} AND created_at <= ${endDate}
      GROUP BY DATE(created_at), event_type
      ORDER BY date
    `;

    // Agrupar por data
    const grouped = {};
    events.forEach(e => {
      const date = e.date.toISOString().split('T')[0];
      if (!grouped[date]) {
        grouped[date] = {};
      }
      grouped[date][e.event_type] = parseInt(e.count);
    });

    return grouped;
  } catch (error) {
    console.error('[Analytics] Erro ao obter metricas por periodo:', error);
    throw error;
  }
}

/**
 * Obtem top produtos por views/favoritos
 */
async function getTopProducts(limit = 10, metric = 'views') {
  try {
    if (metric === 'favorites') {
      const products = await sql`
        SELECT p.id, p.title, p.price, p.views,
          (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as image_url,
          (SELECT COUNT(*) FROM favorites WHERE product_id = p.id) as favorites_count
        FROM products p
        WHERE p.status = 'active'
        ORDER BY favorites_count DESC
        LIMIT ${limit}
      `;
      return products;
    }

    const products = await sql`
      SELECT p.id, p.title, p.price, p.views,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as image_url,
        (SELECT COUNT(*) FROM favorites WHERE product_id = p.id) as favorites_count
      FROM products p
      WHERE p.status = 'active'
      ORDER BY p.views DESC NULLS LAST
      LIMIT ${limit}
    `;
    return products;
  } catch (error) {
    console.error('[Analytics] Erro ao obter top produtos:', error);
    throw error;
  }
}

/**
 * Obtem estatisticas de usuarios
 */
async function getUserStats() {
  try {
    const stats = await sql`
      SELECT
        subscription_type,
        COUNT(*) as count
      FROM users
      GROUP BY subscription_type
    `;

    const byCity = await sql`
      SELECT city, state, COUNT(*) as count
      FROM users
      WHERE city IS NOT NULL
      GROUP BY city, state
      ORDER BY count DESC
      LIMIT 10
    `;

    return {
      bySubscription: stats.reduce((acc, s) => {
        acc[s.subscription_type || 'free'] = parseInt(s.count);
        return acc;
      }, {}),
      byCity,
    };
  } catch (error) {
    console.error('[Analytics] Erro ao obter stats de usuarios:', error);
    throw error;
  }
}

/**
 * Obtem eventos recentes
 */
async function getRecentEvents(limit = 50) {
  try {
    const events = await sql`
      SELECT
        ae.*,
        u.name as user_name,
        p.title as product_title
      FROM analytics_events ae
      LEFT JOIN users u ON ae.user_id = u.id
      LEFT JOIN products p ON ae.product_id = p.id
      ORDER BY ae.created_at DESC
      LIMIT ${limit}
    `;
    return events;
  } catch (error) {
    console.error('[Analytics] Erro ao obter eventos recentes:', error);
    throw error;
  }
}

module.exports = {
  EventTypes,
  EventCategories,
  trackEvent,
  getOverviewMetrics,
  getMetricsByPeriod,
  getTopProducts,
  getUserStats,
  getRecentEvents,
};
