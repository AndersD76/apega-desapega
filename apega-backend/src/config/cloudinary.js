const cloudinary = require('cloudinary').v2;

// Configurar Cloudinary com variáveis de ambiente
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload de imagem para Cloudinary
const uploadToCloudinary = async (fileBuffer, folder = 'products') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `apega-desapega/${folder}`,
        resource_type: 'image',
        transformation: [
          { width: 800, height: 800, crop: 'limit' },
          { quality: 'auto' },
          { fetch_format: 'auto' }
        ]
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    uploadStream.end(fileBuffer);
  });
};

// Deletar imagem do Cloudinary
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Erro ao deletar imagem do Cloudinary:', error);
    throw error;
  }
};

/**
 * Gera variações de imagem automaticamente usando Cloudinary
 * @param {string} publicId - ID público da imagem original
 * @returns {Array} URLs das variações geradas
 */
const generateImageVariations = (publicId) => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`;

  // Variação 1: Fundo removido (e_background_removal) ou branco
  const variation1 = `${baseUrl}/e_background_removal,w_800,h_800,c_pad,b_white,q_auto,f_auto/${publicId}`;

  // Variação 2: Zoom no centro com crop quadrado
  const variation2 = `${baseUrl}/w_800,h_800,c_fill,g_center,q_auto,f_auto/${publicId}`;

  // Variação 3: Imagem com borda e sombra (estilo lifestyle)
  const variation3 = `${baseUrl}/w_750,h_750,c_pad,b_rgb:f5f5f5,r_20,e_shadow:50,q_auto,f_auto/${publicId}`;

  return [variation1, variation2, variation3];
};

/**
 * Upload com geração automática de variações
 * @param {Buffer} fileBuffer - Buffer da imagem
 * @param {string} folder - Pasta destino
 * @param {boolean} generateVariations - Se deve gerar variações
 * @returns {Object} Resultado com URL original e variações
 */
const uploadWithVariations = async (fileBuffer, folder = 'products', generateVariations = true) => {
  const result = await uploadToCloudinary(fileBuffer, folder);

  if (!generateVariations) {
    return { original: result, variations: [] };
  }

  const variations = generateImageVariations(result.public_id);

  return {
    original: result,
    variations: variations.map((url, index) => ({
      url,
      type: index === 0 ? 'no_background' : index === 1 ? 'centered' : 'styled'
    }))
  };
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  deleteFromCloudinary,
  generateImageVariations,
  uploadWithVariations
};
