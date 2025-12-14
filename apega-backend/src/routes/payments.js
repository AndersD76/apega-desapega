const express = require('express');
const { sql } = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Listar métodos de pagamento
router.get('/', authenticate, async (req, res, next) => {
  try {
    const payments = await sql`
      SELECT * FROM payment_methods
      WHERE user_id = ${req.user.id}
      ORDER BY is_default DESC, created_at DESC
    `;

    res.json({ success: true, payments });
  } catch (error) {
    next(error);
  }
});

// Adicionar método de pagamento
router.post('/', authenticate, async (req, res, next) => {
  try {
    const {
      type,
      card_brand,
      card_last_four,
      card_holder_name,
      card_expiry,
      pix_key,
      pix_key_type,
      is_default
    } = req.body;

    if (!type) {
      return res.status(400).json({ error: true, message: 'Tipo é obrigatório' });
    }

    // Se for padrão, remover padrão dos outros
    if (is_default) {
      await sql`UPDATE payment_methods SET is_default = false WHERE user_id = ${req.user.id}`;
    }

    // Se for o primeiro, definir como padrão
    const existingCount = await sql`SELECT COUNT(*) as count FROM payment_methods WHERE user_id = ${req.user.id}`;
    const shouldBeDefault = is_default || parseInt(existingCount[0].count) === 0;

    const newPayment = await sql`
      INSERT INTO payment_methods (
        user_id, type, card_brand, card_last_four, card_holder_name,
        card_expiry, pix_key, pix_key_type, is_default
      )
      VALUES (
        ${req.user.id}, ${type}, ${card_brand || null}, ${card_last_four || null},
        ${card_holder_name || null}, ${card_expiry || null}, ${pix_key || null},
        ${pix_key_type || null}, ${shouldBeDefault}
      )
      RETURNING *
    `;

    res.status(201).json({ success: true, payment: newPayment[0] });
  } catch (error) {
    next(error);
  }
});

// Deletar método de pagamento
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;

    const deleted = await sql`
      DELETE FROM payment_methods
      WHERE id = ${id} AND user_id = ${req.user.id}
      RETURNING is_default
    `;

    if (deleted.length === 0) {
      return res.status(404).json({ error: true, message: 'Método não encontrado' });
    }

    // Se era padrão, definir outro
    if (deleted[0].is_default) {
      await sql`
        UPDATE payment_methods SET is_default = true
        WHERE user_id = ${req.user.id}
        ORDER BY created_at DESC
        LIMIT 1
      `;
    }

    res.json({ success: true, message: 'Método removido' });
  } catch (error) {
    next(error);
  }
});

// Definir como padrão
router.patch('/:id/default', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;

    await sql`UPDATE payment_methods SET is_default = false WHERE user_id = ${req.user.id}`;

    const updated = await sql`
      UPDATE payment_methods SET is_default = true
      WHERE id = ${id} AND user_id = ${req.user.id}
      RETURNING *
    `;

    if (updated.length === 0) {
      return res.status(404).json({ error: true, message: 'Método não encontrado' });
    }

    res.json({ success: true, payment: updated[0] });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
