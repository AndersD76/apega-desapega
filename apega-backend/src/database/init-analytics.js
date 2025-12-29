/**
 * Script para criar tabela de analytics/eventos
 * Rastreia todas as interações importantes para o painel admin
 */

const { sql } = require('../config/database');

async function initAnalytics() {
  console.log('Criando tabelas de analytics...');

  try {
    // Verificar se a tabela analytics_events ja existe
    const analyticsExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'analytics_events'
      )
    `;

    if (!analyticsExists[0].exists) {
      console.log('Criando tabela analytics_events...');

      // Tabela de eventos/analytics
      await sql`
        CREATE TABLE analytics_events (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          event_type VARCHAR(50) NOT NULL,
          event_category VARCHAR(30) NOT NULL,
          user_id UUID REFERENCES users(id) ON DELETE SET NULL,
          product_id UUID REFERENCES products(id) ON DELETE SET NULL,
          metadata JSONB DEFAULT '{}',
          ip_address VARCHAR(45),
          user_agent TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `;

      console.log('Criando indices para analytics_events...');

      // Indices para consultas rapidas
      await sql`CREATE INDEX idx_analytics_event_type ON analytics_events(event_type)`;
      await sql`CREATE INDEX idx_analytics_category ON analytics_events(event_category)`;
      await sql`CREATE INDEX idx_analytics_user ON analytics_events(user_id)`;
      await sql`CREATE INDEX idx_analytics_product ON analytics_events(product_id)`;
      await sql`CREATE INDEX idx_analytics_created ON analytics_events(created_at)`;

      console.log('Tabela analytics_events criada!');
    } else {
      console.log('Tabela analytics_events ja existe.');
    }

    // Verificar se a tabela daily_metrics ja existe
    const metricsExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'daily_metrics'
      )
    `;

    if (!metricsExists[0].exists) {
      console.log('Criando tabela daily_metrics...');

      // Tabela de metricas diarias (agregadas)
      await sql`
        CREATE TABLE daily_metrics (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          date DATE NOT NULL UNIQUE,
          total_users INT DEFAULT 0,
          new_users INT DEFAULT 0,
          active_users INT DEFAULT 0,
          total_products INT DEFAULT 0,
          new_products INT DEFAULT 0,
          total_views INT DEFAULT 0,
          total_favorites INT DEFAULT 0,
          total_messages INT DEFAULT 0,
          total_sales INT DEFAULT 0,
          total_revenue DECIMAL(12,2) DEFAULT 0,
          total_commission DECIMAL(12,2) DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `;

      console.log('Tabela daily_metrics criada!');
    } else {
      console.log('Tabela daily_metrics ja existe.');
    }

    console.log('Tabelas de analytics prontas!');

  } catch (error) {
    console.error('Erro ao criar tabelas de analytics:', error);
    throw error;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  initAnalytics()
    .then(() => {
      console.log('Analytics inicializado!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Falha ao inicializar analytics:', error);
      process.exit(1);
    });
}

module.exports = { initAnalytics };
