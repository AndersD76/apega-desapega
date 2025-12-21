/**
 * Serviço de IA para análise de roupas
 * - Avalia peças (marca, condição, material)
 * - Sugere preço baseado no mercado
 * - Disponível apenas para Premium e 10 primeiros usuários
 */

const OpenAI = require('openai');

// Cliente OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Analisa uma imagem de roupa e retorna informações detalhadas
 * @param {string} imageUrl - URL da imagem ou base64
 * @returns {Object} Análise da peça
 */
async function analyzeClothing(imageUrl) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Você é um especialista em moda e avaliação de roupas usadas para brechós online.
Analise a imagem da peça de roupa e retorne um JSON com as seguintes informações:

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
  "descricaoSugerida": "descrição atrativa para anúncio",
  "tituloSugerido": "título curto e atrativo",
  "dicasVenda": ["dica 1", "dica 2"],
  "pontosFavoraveis": ["ponto 1", "ponto 2"],
  "pontosAtencao": ["ponto de atenção se houver"]
}

Seja preciso na avaliação de preço considerando o mercado brasileiro de brechós online.
Preços devem estar em reais (R$).`
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analise esta peça de roupa e forneça todas as informações para venda em brechó online:'
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
                detail: 'high'
              }
            }
          ]
        }
      ],
      max_tokens: 1500,
      temperature: 0.3,
    });

    const content = response.choices[0].message.content;

    // Extrair JSON da resposta
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error('Não foi possível processar a resposta da IA');
  } catch (error) {
    console.error('Erro na análise de IA:', error);
    throw error;
  }
}

/**
 * Gera uma descrição melhorada para a peça
 * @param {Object} analysis - Análise prévia da peça
 * @param {string} userDescription - Descrição do usuário (opcional)
 * @returns {Object} Descrição e título otimizados
 */
async function improveDescription(analysis, userDescription = '') {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Você é um copywriter especializado em moda para brechós online.
Crie descrições que vendem, usando técnicas de marketing e SEO.
Seja conciso mas atrativo. Use emojis com moderação.`
        },
        {
          role: 'user',
          content: `Melhore a descrição desta peça para vender melhor:

Análise da peça:
${JSON.stringify(analysis, null, 2)}

Descrição do vendedor:
${userDescription || 'Não fornecida'}

Retorne um JSON com:
{
  "titulo": "título otimizado (max 60 caracteres)",
  "descricao": "descrição completa e atrativa",
  "hashtags": ["hashtag1", "hashtag2"]
}`
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;
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
      titulo: analysis.tituloSugerido,
      descricao: analysis.descricaoSugerida,
      hashtags: []
    };
  }
}

/**
 * Sugere categoria baseado na análise
 * @param {Object} analysis - Análise da peça
 * @param {Array} categories - Lista de categorias disponíveis
 * @returns {string} Slug da categoria sugerida
 */
function suggestCategory(analysis, categories) {
  const tipoMap = {
    'vestido': 'vestidos',
    'blusa': 'blusas',
    'camiseta': 'blusas',
    'camisa': 'blusas',
    'top': 'blusas',
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
    'colar': 'acessorios',
    'brinco': 'acessorios',
    'pulseira': 'acessorios',
    'anel': 'acessorios',
    'relógio': 'acessorios',
    'cinto': 'acessorios',
    'óculos': 'acessorios',
  };

  const tipo = (analysis.tipo || '').toLowerCase();

  for (const [key, value] of Object.entries(tipoMap)) {
    if (tipo.includes(key)) {
      return value;
    }
  }

  return 'all';
}

module.exports = {
  analyzeClothing,
  improveDescription,
  suggestCategory,
};
