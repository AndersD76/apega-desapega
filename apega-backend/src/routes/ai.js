/**
 * Rotas de IA para análise de roupas
 * Acesso restrito a:
 * - Assinantes Premium
 * - 10 primeiros usuários cadastrados (vagas grátis)
 */

const express = require('express');
const multer = require('multer');
const { sql } = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { uploadToCloudinary } = require('../config/cloudinary');
const { analyzeClothing, improveDescription, suggestCategory } = require('../services/ai');

const router = express.Router();

// Configuração do multer para upload em memória
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB para análise de IA
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido. Use JPG, PNG ou WEBP.'), false);
    }
  },
});

/**
 * Middleware para verificar se usuário tem acesso à IA
 * Critérios:
 * 1. Assinante Premium ativo
 * 2. Um dos 10 primeiros usuários cadastrados
 */
async function checkAIAccess(req, res, next) {
  try {
    const userId = req.user.id;

    // Verificar se é Premium
    const user = await sql`
      SELECT
        subscription_type,
        subscription_expires_at,
        created_at
      FROM users
      WHERE id = ${userId}
    `;

    if (!user.length) {
      return res.status(404).json({ error: true, message: 'Usuário não encontrado' });
    }

    const userData = user[0];

    // Verificar Premium ativo
    const isPremium = userData.subscription_type === 'premium' &&
      (!userData.subscription_expires_at || new Date(userData.subscription_expires_at) > new Date());

    if (isPremium) {
      req.aiAccessType = 'premium';
      return next();
    }

    // Verificar se é um dos 10 primeiros usuários
    const earlyUsers = await sql`
      SELECT id FROM users
      ORDER BY created_at ASC
      LIMIT 10
    `;

    const isEarlyUser = earlyUsers.some(u => u.id === userId);

    if (isEarlyUser) {
      req.aiAccessType = 'early_user';
      return next();
    }

    // Não tem acesso
    return res.status(403).json({
      error: true,
      message: 'Acesso à IA exclusivo para assinantes Premium',
      code: 'AI_ACCESS_DENIED',
      upgradeUrl: '/premium'
    });

  } catch (error) {
    console.error('Erro ao verificar acesso IA:', error);
    return res.status(500).json({ error: true, message: 'Erro ao verificar acesso' });
  }
}

/**
 * GET /api/ai/status
 * Verifica status de acesso à IA do usuário
 */
router.get('/status', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await sql`
      SELECT
        subscription_type,
        subscription_expires_at,
        created_at
      FROM users
      WHERE id = ${userId}
    `;

    if (!user.length) {
      return res.status(404).json({ error: true, message: 'Usuário não encontrado' });
    }

    const userData = user[0];

    // Verificar Premium
    const isPremium = userData.subscription_type === 'premium' &&
      (!userData.subscription_expires_at || new Date(userData.subscription_expires_at) > new Date());

    // Verificar early user
    const earlyUsers = await sql`
      SELECT id FROM users
      ORDER BY created_at ASC
      LIMIT 10
    `;
    const isEarlyUser = earlyUsers.some(u => u.id === userId);

    // Contar quantas vagas grátis restam
    const userCount = await sql`SELECT COUNT(*) as count FROM users`;
    const freeSlots = Math.max(0, 10 - parseInt(userCount[0].count));

    res.json({
      hasAccess: isPremium || isEarlyUser,
      accessType: isPremium ? 'premium' : isEarlyUser ? 'early_user' : 'none',
      isPremium,
      isEarlyUser,
      freeSlots,
      features: {
        analyzeClothing: isPremium || isEarlyUser,
        suggestPrice: isPremium || isEarlyUser,
        improveDescription: isPremium || isEarlyUser,
        virtualTryOn: isPremium, // Só premium
        enhanceImage: isPremium, // Só premium
      }
    });

  } catch (error) {
    console.error('Erro ao verificar status IA:', error);
    res.status(500).json({ error: true, message: 'Erro ao verificar status' });
  }
});

/**
 * POST /api/ai/analyze
 * Analisa uma imagem de roupa e retorna informações detalhadas
 */
router.post('/analyze', authenticate, checkAIAccess, upload.single('image'), async (req, res) => {
  try {
    let imageUrl = req.body.imageUrl;

    // Se enviou arquivo, fazer upload para Cloudinary
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer, {
        folder: 'apega/ai-analysis',
        transformation: [
          { width: 1024, height: 1024, crop: 'limit' },
          { quality: 'auto:good' }
        ]
      });
      imageUrl = uploadResult.secure_url;
    }

    if (!imageUrl) {
      return res.status(400).json({ error: true, message: 'Envie uma imagem para análise' });
    }

    // Analisar com IA
    const analysis = await analyzeClothing(imageUrl);

    // Buscar categorias disponíveis
    const categories = await sql`SELECT slug, name FROM categories WHERE is_active = true`;

    // Sugerir categoria
    const suggestedCategory = suggestCategory(analysis, categories);

    res.json({
      success: true,
      analysis,
      suggestedCategory,
      imageUrl,
      accessType: req.aiAccessType
    });

  } catch (error) {
    console.error('Erro na análise de IA:', error);
    res.status(500).json({
      error: true,
      message: 'Erro ao analisar imagem. Tente novamente.',
      details: error.message
    });
  }
});

/**
 * POST /api/ai/improve-description
 * Melhora a descrição do produto
 */
router.post('/improve-description', authenticate, checkAIAccess, async (req, res) => {
  try {
    const { analysis, userDescription } = req.body;

    if (!analysis) {
      return res.status(400).json({ error: true, message: 'Análise não fornecida' });
    }

    const improved = await improveDescription(analysis, userDescription);

    res.json({
      success: true,
      improved,
      accessType: req.aiAccessType
    });

  } catch (error) {
    console.error('Erro ao melhorar descrição:', error);
    res.status(500).json({ error: true, message: 'Erro ao melhorar descrição' });
  }
});

/**
 * GET /api/ai/free-slots
 * Retorna quantas vagas grátis de IA restam
 */
router.get('/free-slots', async (req, res) => {
  try {
    const userCount = await sql`SELECT COUNT(*) as count FROM users`;
    const totalUsers = parseInt(userCount[0].count);
    const freeSlots = Math.max(0, 10 - totalUsers);

    res.json({
      freeSlots,
      totalSlots: 10,
      usedSlots: Math.min(10, totalUsers),
      message: freeSlots > 0
        ? `Restam ${freeSlots} vagas com IA Premium grátis!`
        : 'Todas as vagas grátis foram preenchidas'
    });

  } catch (error) {
    console.error('Erro ao buscar vagas:', error);
    res.status(500).json({ error: true, message: 'Erro ao buscar vagas' });
  }
});

module.exports = router;
