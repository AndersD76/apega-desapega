require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function fixImageUrls() {
  try {
    // Atualizar URLs na tabela product_images
    const result = await sql`
      UPDATE product_images
      SET image_url = REPLACE(image_url, 'http://192.168.0.128:3001', 'https://apega-desapega-production.up.railway.app')
      WHERE image_url LIKE '%192.168.0.128%'
      RETURNING id, image_url
    `;

    console.log(`Atualizadas ${result.length} imagens de produtos`);

    // Atualizar avatares dos usuários se houver
    const userResult = await sql`
      UPDATE users
      SET avatar_url = REPLACE(avatar_url, 'http://192.168.0.128:3001', 'https://apega-desapega-production.up.railway.app')
      WHERE avatar_url LIKE '%192.168.0.128%'
      RETURNING id, avatar_url
    `;

    console.log(`Atualizados ${userResult.length} avatares de usuários`);

    console.log('URLs corrigidas com sucesso!');
  } catch (error) {
    console.error('Erro:', error);
  }
}

fixImageUrls();
