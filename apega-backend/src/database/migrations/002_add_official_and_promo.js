require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

async function migrate() {
  console.log('🔄 Conectando ao Neon PostgreSQL...');
  const sql = neon(process.env.DATABASE_URL);

  try {
    // Adicionar campos na tabela users
    console.log('📝 Adicionando campos is_official e commission_rate...');

    await sql`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS is_official BOOLEAN DEFAULT FALSE
    `;

    await sql`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(4,2) DEFAULT 10.00
    `;

    await sql`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS promo_type VARCHAR(50)
    `;

    // Criar tabela de configurações de promoção
    console.log('📝 Criando tabela promo_settings...');
    await sql`
      CREATE TABLE IF NOT EXISTS promo_settings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        promo_name VARCHAR(100) NOT NULL,
        total_slots INTEGER NOT NULL,
        used_slots INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        benefits JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Criar tabela de usuários promocionais
    console.log('📝 Criando tabela promo_users...');
    await sql`
      CREATE TABLE IF NOT EXISTS promo_users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id),
        promo_id UUID NOT NULL REFERENCES promo_settings(id),
        slot_number INTEGER NOT NULL,
        benefits_applied JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, promo_id)
      )
    `;

    // Inserir configurações de promoção padrão
    console.log('📝 Inserindo promoções de lançamento...');

    // Promo 1: 5 primeiros - Premium grátis + 5% comissão
    await sql`
      INSERT INTO promo_settings (promo_name, total_slots, used_slots, benefits, is_active)
      VALUES (
        'premium_launch',
        5,
        0,
        '{"premium_free": true, "premium_duration_months": 12, "commission_rate": 5, "description": "Premium grátis por 1 ano + comissão de apenas 5%"}'::jsonb,
        true
      )
      ON CONFLICT DO NOTHING
    `;

    // Promo 2: Próximos 45 - Taxa reduzida 5%
    await sql`
      INSERT INTO promo_settings (promo_name, total_slots, used_slots, benefits, is_active)
      VALUES (
        'reduced_rate_launch',
        45,
        0,
        '{"premium_free": false, "commission_rate": 5, "description": "Comissão reduzida de apenas 5%"}'::jsonb,
        true
      )
      ON CONFLICT DO NOTHING
    `;

    // Atualizar usuário daniel.br.rs para premium e oficial
    console.log('📝 Atualizando usuário daniel.br.rs...');
    await sql`
      UPDATE users
      SET
        subscription_type = 'premium',
        subscription_expires_at = CURRENT_TIMESTAMP + INTERVAL '10 years',
        is_official = true,
        is_verified = true,
        commission_rate = 0,
        promo_type = 'official_store'
      WHERE email = 'daniel.br.rs@hotmail.com'
    `;

    console.log('\n✅ Migration concluída com sucesso!');

    // Verificar resultado
    const user = await sql`
      SELECT id, email, name, subscription_type, is_official, commission_rate, promo_type
      FROM users
      WHERE email = 'daniel.br.rs@hotmail.com'
    `;

    if (user.length > 0) {
      console.log('\n👤 Usuário atualizado:', user[0]);
    } else {
      console.log('\n⚠️ Usuário daniel.br.rs@hotmail.com não encontrado');
    }

  } catch (error) {
    console.error('❌ Erro na migration:', error.message);
    process.exit(1);
  }
}

migrate();
