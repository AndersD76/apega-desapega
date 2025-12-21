/**
 * Rotas de IA para análise de roupas
 * Acesso restrito a assinantes Premium
 *
 * Funcionalidades:
 * - Análise de roupa (1 imagem por produto)
 * - Sugestão de preço
 * - Remoção de fundo
 * - Melhoria de imagem
 */

const express = require('express');
const multer = require('multer');
const { sql } = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { uploadToCloudinary } = require('../config/cloudinary');
const {
  analyzeClothing,
  improveDescription,
  suggestCategory,
  virtualTryOn,
  enhanceImage,
  removeBackground,
  getServicesStatus,
} = require('../services/ai');

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
 * Apenas assinantes Premium ativos têm acesso
 */
async function checkAIAccess(req, res, next) {
  try {
    const userId = req.user.id;

    const user = await sql`
      SELECT
        subscription_type,
        subscription_expires_at
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

    // Não tem acesso (apenas Premium)
    return res.status(403).json({
      error: true,
      message: 'Recursos de IA exclusivos para assinantes Premium',
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
 * Apenas Premium tem acesso a todos os recursos de IA
 */
router.get('/status', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await sql`
      SELECT
        subscription_type,
        subscription_expires_at
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

    res.json({
      hasAccess: isPremium,
      accessType: isPremium ? 'premium' : 'free',
      isPremium,
      features: {
        analyzeClothing: isPremium,      // Análise com IA (1 imagem)
        suggestPrice: isPremium,          // Sugestão de preço
        improveDescription: isPremium,    // Melhorar descrição
        removeBackground: isPremium,      // Remover fundo
        enhanceImage: isPremium,          // Melhorar imagem
        virtualTryOn: isPremium,          // Prova virtual
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
    const rawAnalysis = await analyzeClothing(imageUrl);

    // Normalizar resposta para o formato esperado pelo frontend
    const analysis = {
      tipo: rawAnalysis.tipo || '',
      marca: rawAnalysis.marca || 'Não identificada',
      condicao: rawAnalysis.condicao || 'bom_estado',
      cores: rawAnalysis.cores || (rawAnalysis.cor ? [rawAnalysis.cor] : []),
      materiais: rawAnalysis.materiais || (rawAnalysis.material ? [rawAnalysis.material] : []),
      tamanho: rawAnalysis.tamanhoEstimado || rawAnalysis.tamanho || '',
      estilo: rawAnalysis.estilo || 'casual',
      precoSugerido: {
        minimo: rawAnalysis.precoSugerido?.minimo || 0,
        maximo: rawAnalysis.precoSugerido?.maximo || 0,
        recomendado: rawAnalysis.precoSugerido?.ideal || rawAnalysis.precoSugerido?.recomendado || 0
      },
      descricaoSugerida: rawAnalysis.descricaoSugerida || '',
      tituloSugerido: rawAnalysis.tituloSugerido || '',
      caracteristicas: rawAnalysis.pontosFavoraveis || [],
      palavrasChave: rawAnalysis.hashtags || [],
      // Campos extras do Claude
      condicaoDetalhes: rawAnalysis.condicaoDetalhes || '',
      estacao: rawAnalysis.estacao || '',
      dicasVenda: rawAnalysis.dicasVenda || [],
      pontosAtencao: rawAnalysis.pontosAtencao || []
    };

    // Buscar categorias disponíveis
    const categories = await sql`SELECT slug, name FROM categories WHERE is_active = true`;

    // Sugerir categoria
    const suggestedCategory = suggestCategory(rawAnalysis, categories);

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
 * GET /api/ai/pricing
 * Retorna informações sobre planos e preços da IA
 */
router.get('/pricing', async (req, res) => {
  res.json({
    plans: {
      free: {
        name: 'Grátis',
        aiFeatures: false,
        description: 'Publique produtos manualmente'
      },
      premium: {
        name: 'Premium',
        aiFeatures: true,
        price: 19.90,
        description: 'Análise com IA, sugestão de preço, remoção de fundo e mais',
        features: [
          'Análise automática de roupas',
          'Sugestão de preço inteligente',
          'Remoção de fundo das fotos',
          'Melhoria automática de imagens',
          'Prova virtual (em breve)'
        ]
      }
    }
  });
});

/**
 * POST /api/ai/virtual-tryon
 * Gera virtual try-on (roupa no modelo)
 * Apenas Premium (verificado pelo middleware)
 */
router.post('/virtual-tryon', authenticate, checkAIAccess, async (req, res) => {
  try {
    const { clothingImageUrl, modelImageUrl } = req.body;

    if (!clothingImageUrl) {
      return res.status(400).json({ error: true, message: 'URL da imagem da roupa é obrigatória' });
    }

    const result = await virtualTryOn(clothingImageUrl, modelImageUrl);

    res.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('Erro no virtual try-on:', error);
    res.status(500).json({
      error: true,
      message: 'Erro ao gerar virtual try-on',
      details: error.message
    });
  }
});

/**
 * POST /api/ai/enhance-image
 * Melhora a imagem (remove fundo, etc)
 * Apenas Premium (verificado pelo middleware)
 */
router.post('/enhance-image', authenticate, checkAIAccess, upload.single('image'), async (req, res) => {
  try {
    let imageUrl = req.body.imageUrl;

    // Se enviou arquivo, fazer upload para Cloudinary
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer, {
        folder: 'apega/ai-enhance',
      });
      imageUrl = uploadResult.secure_url;
    }

    if (!imageUrl) {
      return res.status(400).json({ error: true, message: 'Envie uma imagem' });
    }

    const result = await enhanceImage(imageUrl);

    res.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('Erro ao melhorar imagem:', error);
    res.status(500).json({
      error: true,
      message: 'Erro ao melhorar imagem',
      details: error.message
    });
  }
});

/**
 * POST /api/ai/remove-background
 * Remove fundo da imagem
 * Apenas Premium (verificado pelo middleware)
 */
router.post('/remove-background', authenticate, checkAIAccess, upload.single('image'), async (req, res) => {
  try {
    let imageUrl = req.body.imageUrl;

    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer, {
        folder: 'apega/ai-bg-remove',
      });
      imageUrl = uploadResult.secure_url;
    }

    if (!imageUrl) {
      return res.status(400).json({ error: true, message: 'Envie uma imagem' });
    }

    const result = await removeBackground(imageUrl);

    res.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('Erro ao remover fundo:', error);
    res.status(500).json({
      error: true,
      message: 'Erro ao remover fundo',
      details: error.message
    });
  }
});

/**
 * GET /api/ai/services
 * Retorna status dos serviços de IA configurados
 */
router.get('/services', async (req, res) => {
  res.json({
    services: getServicesStatus(),
    providers: {
      analysis: 'Claude 3.5 Sonnet (Anthropic)',
      virtualTryOn: 'Replicate (Kolors)',
      imageEnhancement: 'Photoroom / Remove.bg'
    }
  });
});

module.exports = router;
