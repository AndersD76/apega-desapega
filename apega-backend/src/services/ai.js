/**
 * Serviço de IA para análise de roupas
 *
 * Provedores:
 * - Claude 3.5 Sonnet (Anthropic) → Análise + Sugestão de Preço
 * - Replicate (IDM-VTON/Kolors) → Virtual Try-On
 * - Photoroom/Remove.bg → Melhorar Imagem
 *
 * Disponível apenas para Premium e 10 primeiros usuários
 */

const Anthropic = require('@anthropic-ai/sdk');
const axios = require('axios');

// Cliente Anthropic (Claude)
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Prompt do sistema para análise de roupas
const CLOTHING_ANALYSIS_PROMPT = `Você é um especialista em moda e avaliação de roupas usadas para brechós online brasileiros.
Analise a imagem da peça de roupa e retorne APENAS um JSON válido (sem markdown, sem explicações) com as seguintes informações:

{
  "tipo": "tipo da peça (vestido, blusa, calça, etc)",
  "marca": "marca identificada ou 'Não identificada'",
  "marcaConfianca": "alta/média/baixa",
  "condicao": "novo_com_etiqueta/seminovo/bom_estado/usado/muito_usado",
  "condicaoDetalhes": "descrição detalhada do estado",
  "material": "material principal (algodão, poliéster, seda, etc)",
  "cor": "cor principal",
  "cores": ["lista de cores"],
  "tamanhoEstimado": "P/M/G/GG ou número",
  "estilo": "casual/social/festa/esportivo/etc",
  "estacao": "verão/inverno/meia-estação/todas",
  "precoSugerido": {
    "minimo": número,
    "maximo": número,
    "ideal": número
  },
  "descricaoSugerida": "descrição atrativa para anúncio (máximo 200 caracteres)",
  "tituloSugerido": "título curto e atrativo (máximo 60 caracteres)",
  "dicasVenda": ["dica 1", "dica 2"],
  "pontosFavoraveis": ["ponto 1", "ponto 2"],
  "pontosAtencao": ["ponto de atenção se houver"]
}

Considere o mercado brasileiro de brechós online. Preços em reais (R$).
Retorne APENAS o JSON, sem texto adicional.`;

/**
 * Analisa uma imagem de roupa usando Claude 3.5 Sonnet
 * @param {string} imageUrl - URL da imagem ou base64
 * @returns {Object} Análise da peça
 */
async function analyzeClothing(imageUrl) {
  try {
    // Determinar se é base64 ou URL
    let imageContent;

    if (imageUrl.startsWith('data:')) {
      // Base64
      const matches = imageUrl.match(/^data:(.+);base64,(.+)$/);
      if (matches) {
        imageContent = {
          type: 'base64',
          media_type: matches[1],
          data: matches[2],
        };
      }
    } else {
      // URL - precisamos baixar e converter para base64
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const base64 = Buffer.from(response.data).toString('base64');
      const contentType = response.headers['content-type'] || 'image/jpeg';
      imageContent = {
        type: 'base64',
        media_type: contentType,
        data: base64,
      };
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: imageContent,
            },
            {
              type: 'text',
              text: CLOTHING_ANALYSIS_PROMPT,
            },
          ],
        },
      ],
    });

    const content = message.content[0].text;

    // Extrair JSON da resposta
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error('Não foi possível processar a resposta da IA');
  } catch (error) {
    console.error('Erro na análise Claude:', error);
    throw error;
  }
}

/**
 * Gera virtual try-on usando Replicate (Kolors ou IDM-VTON)
 * @param {string} clothingImageUrl - URL da imagem da roupa
 * @param {string} modelImageUrl - URL da imagem do modelo (opcional)
 * @returns {Object} URLs das imagens geradas
 */
async function virtualTryOn(clothingImageUrl, modelImageUrl = null) {
  try {
    const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

    if (!REPLICATE_API_TOKEN) {
      throw new Error('REPLICATE_API_TOKEN não configurada');
    }

    // Usar modelo padrão se não fornecido
    const defaultModelImage = 'https://replicate.delivery/pbxt/KgH4aIlGPKFLBfSbLVCwOIfXvvfpiPCFzqq4HRbqgvWFfJjE/model.png';

    // Usar Kolors Virtual Try-On (mais barato ~$0.03)
    const response = await axios.post(
      'https://api.replicate.com/v1/predictions',
      {
        version: 'feab5e5c89eb19556d5af23e9c5a1f9e53ee15e96fb8c7e9c0e2a5f6df1f1c9b',
        input: {
          cloth_image: clothingImageUrl,
          model_image: modelImageUrl || defaultModelImage,
          category: 'upper_body', // upper_body, lower_body, full_body
        },
      },
      {
        headers: {
          'Authorization': `Token ${REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Aguardar resultado (polling)
    let prediction = response.data;
    while (prediction.status !== 'succeeded' && prediction.status !== 'failed') {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const statusResponse = await axios.get(
        `https://api.replicate.com/v1/predictions/${prediction.id}`,
        {
          headers: { 'Authorization': `Token ${REPLICATE_API_TOKEN}` },
        }
      );
      prediction = statusResponse.data;
    }

    if (prediction.status === 'failed') {
      throw new Error('Falha ao gerar virtual try-on');
    }

    return {
      success: true,
      outputUrl: prediction.output,
      provider: 'replicate_kolors',
    };
  } catch (error) {
    console.error('Erro no virtual try-on:', error);
    throw error;
  }
}

/**
 * Remove fundo da imagem usando Remove.bg
 * @param {string} imageUrl - URL da imagem
 * @returns {Object} URL da imagem sem fundo
 */
async function removeBackground(imageUrl) {
  try {
    const REMOVE_BG_API_KEY = process.env.REMOVE_BG_API_KEY;

    if (!REMOVE_BG_API_KEY) {
      throw new Error('REMOVE_BG_API_KEY não configurada');
    }

    const response = await axios.post(
      'https://api.remove.bg/v1.0/removebg',
      {
        image_url: imageUrl,
        size: 'auto',
        format: 'png',
      },
      {
        headers: {
          'X-Api-Key': REMOVE_BG_API_KEY,
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer',
      }
    );

    // Converter para base64
    const base64 = Buffer.from(response.data).toString('base64');

    return {
      success: true,
      imageBase64: `data:image/png;base64,${base64}`,
      provider: 'removebg',
    };
  } catch (error) {
    console.error('Erro ao remover fundo:', error);
    throw error;
  }
}

/**
 * Melhora imagem usando Photoroom API
 * @param {string} imageUrl - URL da imagem
 * @param {Object} options - Opções de melhoria
 * @returns {Object} URL da imagem melhorada
 */
async function enhanceImage(imageUrl, options = {}) {
  try {
    const PHOTOROOM_API_KEY = process.env.PHOTOROOM_API_KEY;

    if (!PHOTOROOM_API_KEY) {
      // Fallback para remove.bg se Photoroom não configurado
      return removeBackground(imageUrl);
    }

    const response = await axios.post(
      'https://sdk.photoroom.com/v1/segment',
      {
        image_url: imageUrl,
        ...options,
      },
      {
        headers: {
          'x-api-key': PHOTOROOM_API_KEY,
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer',
      }
    );

    const base64 = Buffer.from(response.data).toString('base64');

    return {
      success: true,
      imageBase64: `data:image/png;base64,${base64}`,
      provider: 'photoroom',
    };
  } catch (error) {
    console.error('Erro ao melhorar imagem:', error);
    // Tentar fallback para remove.bg
    try {
      return await removeBackground(imageUrl);
    } catch {
      throw error;
    }
  }
}

/**
 * Gera uma descrição melhorada para a peça usando Claude
 * @param {Object} analysis - Análise prévia da peça
 * @param {string} userDescription - Descrição do usuário (opcional)
 * @returns {Object} Descrição e título otimizados
 */
async function improveDescription(analysis, userDescription = '') {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `Você é um copywriter especializado em moda para brechós online.
Crie descrições que vendem, usando técnicas de marketing e SEO.

Análise da peça:
${JSON.stringify(analysis, null, 2)}

Descrição do vendedor:
${userDescription || 'Não fornecida'}

Retorne APENAS um JSON válido:
{
  "titulo": "título otimizado (max 60 caracteres)",
  "descricao": "descrição completa e atrativa (max 500 caracteres)",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3"]
}`
        }
      ],
    });

    const content = message.content[0].text;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return {
      titulo: analysis.tituloSugerido,
      descricao: analysis.descricaoSugerida,
      hashtags: []
    };
  } catch (error) {
    console.error('Erro ao melhorar descrição:', error);
    return {
      titulo: analysis.tituloSugerido || 'Peça de moda',
      descricao: analysis.descricaoSugerida || 'Linda peça em ótimo estado',
      hashtags: []
    };
  }
}

/**
 * Sugere categoria baseado na análise
 * @param {Object} analysis - Análise da peça
 * @returns {string} Slug da categoria sugerida
 */
function suggestCategory(analysis) {
  const tipoMap = {
    'vestido': 'vestidos',
    'blusa': 'blusas',
    'camiseta': 'blusas',
    'camisa': 'blusas',
    'top': 'blusas',
    'cropped': 'blusas',
    'calça': 'calcas',
    'jeans': 'calcas',
    'legging': 'calcas',
    'saia': 'saias',
    'short': 'shorts',
    'bermuda': 'shorts',
    'conjunto': 'conjuntos',
    'macacão': 'conjuntos',
    'bolsa': 'bolsas',
    'mochila': 'bolsas',
    'carteira': 'bolsas',
    'sapato': 'calcados',
    'tênis': 'calcados',
    'sandália': 'calcados',
    'bota': 'calcados',
    'salto': 'calcados',
    'colar': 'acessorios',
    'brinco': 'acessorios',
    'pulseira': 'acessorios',
    'anel': 'acessorios',
    'relógio': 'acessorios',
    'cinto': 'acessorios',
    'óculos': 'acessorios',
    'lenço': 'acessorios',
    'chapéu': 'acessorios',
  };

  const tipo = (analysis.tipo || '').toLowerCase();

  for (const [key, value] of Object.entries(tipoMap)) {
    if (tipo.includes(key)) {
      return value;
    }
  }

  return 'all';
}

/**
 * Verifica quais serviços de IA estão configurados
 * @returns {Object} Status dos serviços
 */
function getServicesStatus() {
  return {
    claude: !!process.env.ANTHROPIC_API_KEY,
    replicate: !!process.env.REPLICATE_API_TOKEN,
    removebg: !!process.env.REMOVE_BG_API_KEY,
    photoroom: !!process.env.PHOTOROOM_API_KEY,
  };
}

module.exports = {
  analyzeClothing,
  virtualTryOn,
  removeBackground,
  enhanceImage,
  improveDescription,
  suggestCategory,
  getServicesStatus,
};
