require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');

async function resetPassword() {
  const sql = neon(process.env.DATABASE_URL);

  const email = 'daniel.br.rs@hotmail.com';
  const newPassword = 'Teste123@';

  console.log(`Resetting password for: ${email}`);

  const newHash = await bcrypt.hash(newPassword, 10);

  const result = await sql`
    UPDATE users SET password_hash = ${newHash}
    WHERE email = ${email.toLowerCase()}
    RETURNING id, email, name
  `;

  if (result.length > 0) {
    console.log('Password reset successful!');
    console.log('User:', result[0]);
  } else {
    console.log('User not found');
  }
}

resetPassword().catch(console.error);
