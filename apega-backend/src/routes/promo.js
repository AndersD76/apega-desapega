const express = require('express');
const router = express.Router();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

// Middleware de autenticação (opcional - permite verificar status sem login)
const optionalAuth = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) {
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'apega-secret-key');
      req.userId = decoded.userId;
    } catch (err) {
      // Token inválido, continua sem autenticação
    }
  }
  next();
};

// Middleware de autenticação obrigatória
const requireAuth = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: true, message: 'Token não fornecido' });
  }
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'apega-secret-key');
    req.userId = decoded.userId;
    req.isAdmin = decoded.isAdmin || false;
    next();
  } catch (err) {
    return res.status(401).json({ error: true, message: 'Token inválido' });
  }
};

// GET /api/promo/status - Verificar status das promoções e vagas disponíveis
router.get('/status', optionalAuth, async (req, res) => {
  try {
    // Buscar todas as promoções ativas
    const promos = await sql`
      SELECT
        id,
        promo_name,
        total_slots,
        used_slots,
        (total_slots - used_slots) as available_slots,
        benefits,
        is_active
      FROM promo_settings
      WHERE is_active = true
      ORDER BY promo_name
    `;

    // Calcular totais
    const premiumPromo = promos.find(p => p.promo_name === 'premium_launch');
    const reducedRatePromo = promos.find(p => p.promo_name === 'reduced_rate_launch');

    const totalSlots = promos.reduce((sum, p) => sum + p.total_slots, 0);
    const usedSlots = promos.reduce((sum, p) => sum + p.used_slots, 0);
    const availableSlots = totalSlots - usedSlots;

    // Verificar se deve mostrar onboarding (ainda há vagas)
    const showOnboarding = availableSlots > 0;

    // Verificar qual promo está disponível
    let currentPromo = null;
    if (premiumPromo && premiumPromo.available_slots > 0) {
      currentPromo = {
        type: 'premium_launch',
        name: 'Premium Grátis + Taxa 5%',
        slotsRemaining: premiumPromo.available_slots,
        benefits: premiumPromo.benefits
      };
    } else if (reducedRatePromo && reducedRatePromo.available_slots > 0) {
      currentPromo = {
        type: 'reduced_rate_launch',
        name: 'Taxa Reduzida 5%',
        slotsRemaining: reducedRatePromo.available_slots,
        benefits: reducedRatePromo.benefits
      };
    }

    // Verificar se o usuário já tem promo (se logado)
    let userPromo = null;
    if (req.userId) {
      const userPromoData = await sql`
        SELECT
          pu.slot_number,
          pu.benefits_applied,
          ps.promo_name,
          ps.benefits
        FROM promo_users pu
        JOIN promo_settings ps ON pu.promo_id = ps.id
        WHERE pu.user_id = ${req.userId}
      `;
      if (userPromoData.length > 0) {
        userPromo = userPromoData[0];
      }
    }

    res.json({
      showOnboarding,
      totalSlots,
      usedSlots,
      availableSlots,
      currentPromo,
      userPromo,
      promos: promos.map(p => ({
        name: p.promo_name,
        total: p.total_slots,
        used: p.used_slots,
        available: p.available_slots,
        benefits: p.benefits
      }))
    });
  } catch (error) {
    console.error('Erro ao buscar status de promoções:', error);
    res.status(500).json({ error: true, message: 'Erro ao buscar promoções' });
  }
});

// POST /api/promo/claim - Reivindicar vaga promocional
router.post('/claim', requireAuth, async (req, res) => {
  try {
    // Verificar se usuário já tem promo
    const existingPromo = await sql`
      SELECT id FROM promo_users WHERE user_id = ${req.userId}
    `;

    if (existingPromo.length > 0) {
      return res.status(400).json({
        error: true,
        message: 'Você já está participando de uma promoção'
      });
    }

    // Buscar promo disponível (primeiro premium, depois taxa reduzida)
    const availablePromo = await sql`
      SELECT id, promo_name, total_slots, used_slots, benefits
      FROM promo_settings
      WHERE is_active = true AND used_slots < total_slots
      ORDER BY
        CASE promo_name
          WHEN 'premium_launch' THEN 1
          WHEN 'reduced_rate_launch' THEN 2
          ELSE 3
        END
      LIMIT 1
    `;

    if (availablePromo.length === 0) {
      return res.status(400).json({
        error: true,
        message: 'Não há mais vagas disponíveis'
      });
    }

    const promo = availablePromo[0];
    const slotNumber = promo.used_slots + 1;
    const benefits = promo.benefits;

    // Criar registro de promo para o usuário
    await sql`
      INSERT INTO promo_users (user_id, promo_id, slot_number, benefits_applied)
      VALUES (${req.userId}, ${promo.id}, ${slotNumber}, ${JSON.stringify(benefits)})
    `;

    // Atualizar contador de slots usados
    await sql`
      UPDATE promo_settings
      SET used_slots = used_slots + 1, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${promo.id}
    `;

    // Atualizar usuário com os benefícios
    const updates = {
      commission_rate: benefits.commission_rate || 10,
      promo_type: promo.promo_name
    };

    if (benefits.premium_free) {
      const months = benefits.premium_duration_months || 12;
      await sql`
        UPDATE users
        SET
          subscription_type = 'premium',
          subscription_expires_at = CURRENT_TIMESTAMP + INTERVAL '${months} months',
          commission_rate = ${updates.commission_rate},
          promo_type = ${updates.promo_type}
        WHERE id = ${req.userId}
      `;
    } else {
      await sql`
        UPDATE users
        SET
          commission_rate = ${updates.commission_rate},
          promo_type = ${updates.promo_type}
        WHERE id = ${req.userId}
      `;
    }

    // Buscar dados atualizados do usuário
    const updatedUser = await sql`
      SELECT
        id, email, name, subscription_type, subscription_expires_at,
        commission_rate, promo_type
      FROM users
      WHERE id = ${req.userId}
    `;

    res.json({
      success: true,
      message: `Parabéns! Você garantiu a vaga ${slotNumber} da promoção!`,
      promo: {
        name: promo.promo_name,
        slotNumber,
        benefits
      },
      user: updatedUser[0]
    });
  } catch (error) {
    console.error('Erro ao reivindicar promoção:', error);
    res.status(500).json({ error: true, message: 'Erro ao processar promoção' });
  }
});

// GET /api/promo/admin - Estatísticas para o painel admin
router.get('/admin', requireAuth, async (req, res) => {
  try {
    // Verificar se é admin (aceita admin fixo ou usuário admin do banco)
    if (!req.isAdmin && req.userId !== 'admin') {
      const user = await sql`
        SELECT is_admin FROM users WHERE id = ${req.userId}
      `;
      if (!user.length || !user[0].is_admin) {
        return res.status(403).json({ error: true, message: 'Acesso negado' });
      }
    }

    // Buscar todas as promoções
    const promos = await sql`
      SELECT
        id,
        promo_name,
        total_slots,
        used_slots,
        (total_slots - used_slots) as available_slots,
        benefits,
        is_active,
        created_at,
        updated_at
      FROM promo_settings
      ORDER BY created_at DESC
    `;

    // Buscar usuários promocionais com detalhes
    const promoUsers = await sql`
      SELECT
        pu.id,
        pu.slot_number,
        pu.benefits_applied,
        pu.created_at as claimed_at,
        ps.promo_name,
        u.id as user_id,
        u.name as user_name,
        u.email as user_email,
        u.avatar_url,
        u.subscription_type,
        u.commission_rate
      FROM promo_users pu
      JOIN promo_settings ps ON pu.promo_id = ps.id
      JOIN users u ON pu.user_id = u.id
      ORDER BY pu.created_at DESC
    `;

    // Buscar lojas oficiais
    const officialStores = await sql`
      SELECT
        id, name, email, avatar_url, subscription_type,
        commission_rate, is_official, is_verified, promo_type,
        created_at
      FROM users
      WHERE is_official = true
      ORDER BY created_at DESC
    `;

    // Estatísticas gerais
    const totalSlots = promos.reduce((sum, p) => sum + p.total_slots, 0);
    const usedSlots = promos.reduce((sum, p) => sum + p.used_slots, 0);
    const premiumPromo = promos.find(p => p.promo_name === 'premium_launch');
    const reducedRatePromo = promos.find(p => p.promo_name === 'reduced_rate_launch');

    res.json({
      stats: {
        totalSlots,
        usedSlots,
        availableSlots: totalSlots - usedSlots,
        percentUsed: totalSlots > 0 ? Math.round((usedSlots / totalSlots) * 100) : 0,
        premiumSlots: {
          total: premiumPromo?.total_slots || 0,
          used: premiumPromo?.used_slots || 0,
          available: (premiumPromo?.total_slots || 0) - (premiumPromo?.used_slots || 0)
        },
        reducedRateSlots: {
          total: reducedRatePromo?.total_slots || 0,
          used: reducedRatePromo?.used_slots || 0,
          available: (reducedRatePromo?.total_slots || 0) - (reducedRatePromo?.used_slots || 0)
        }
      },
      promos,
      promoUsers,
      officialStores
    });
  } catch (error) {
    console.error('Erro ao buscar dados admin de promoções:', error);
    res.status(500).json({ error: true, message: 'Erro ao buscar dados' });
  }
});

module.exports = router;
