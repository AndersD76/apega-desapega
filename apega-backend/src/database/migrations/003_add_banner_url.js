require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

async function migrate() {
  console.log('Conectando ao Neon PostgreSQL...');
  const sql = neon(process.env.DATABASE_URL);

  try {
    console.log('Adicionando campo banner_url na tabela users...');

    await sql`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS banner_url TEXT
    `;

    console.log('Migration concluida com sucesso!');
  } catch (error) {
    console.error('Erro na migration:', error.message);
    process.exit(1);
  }
}

migrate();
