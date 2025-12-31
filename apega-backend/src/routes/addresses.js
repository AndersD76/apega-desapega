const express = require('express');
const { sql } = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Listar endereços
router.get('/', authenticate, async (req, res, next) => {
  try {
    const addresses = await sql`
      SELECT * FROM addresses
      WHERE user_id = ${req.user.id}
      ORDER BY is_default DESC, created_at DESC
    `;

    res.json({ success: true, addresses });
  } catch (error) {
    next(error);
  }
});

// Criar endereço
router.post('/', authenticate, async (req, res, next) => {
  try {
    const {
      label,
      recipient_name,
      street,
      number,
      complement,
      neighborhood,
      city,
      state,
      zipcode,
      is_default
    } = req.body;

    // Validações
    if (!recipient_name || !street || !number || !neighborhood || !city || !state || !zipcode) {
      return res.status(400).json({
        error: true,
        message: 'Preencha todos os campos obrigatórios'
      });
    }

    // Se for definido como padrão, remover padrão dos outros
    if (is_default) {
      await sql`UPDATE addresses SET is_default = false WHERE user_id = ${req.user.id}`;
    }

    // Se for o primeiro endereço, definir como padrão
    const existingCount = await sql`SELECT COUNT(*) as count FROM addresses WHERE user_id = ${req.user.id}`;
    const shouldBeDefault = is_default || parseInt(existingCount[0].count) === 0;

    const newAddress = await sql`
      INSERT INTO addresses (
        user_id, label, recipient_name, street, number, complement,
        neighborhood, city, state, zipcode, is_default
      )
      VALUES (
        ${req.user.id}, ${label || null}, ${recipient_name}, ${street}, ${number},
        ${complement || null}, ${neighborhood}, ${city}, ${state}, ${zipcode}, ${shouldBeDefault}
      )
      RETURNING *
    `;

    res.status(201).json({ success: true, address: newAddress[0] });
  } catch (error) {
    next(error);
  }
});

// Atualizar endereço
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      label,
      recipient_name,
      street,
      number,
      complement,
      neighborhood,
      city,
      state,
      zipcode,
      is_default
    } = req.body;

    // Verificar se pertence ao usuário
    const existing = await sql`SELECT id FROM addresses WHERE id = ${id} AND user_id = ${req.user.id}`;

    if (existing.length === 0) {
      return res.status(404).json({ error: true, message: 'Endereço não encontrado' });
    }

    // Se for definido como padrão, remover padrão dos outros
    if (is_default) {
      await sql`UPDATE addresses SET is_default = false WHERE user_id = ${req.user.id}`;
    }

    const updated = await sql`
      UPDATE addresses
      SET
        label = COALESCE(${label}, label),
        recipient_name = COALESCE(${recipient_name}, recipient_name),
        street = COALESCE(${street}, street),
        number = COALESCE(${number}, number),
        complement = COALESCE(${complement}, complement),
        neighborhood = COALESCE(${neighborhood}, neighborhood),
        city = COALESCE(${city}, city),
        state = COALESCE(${state}, state),
        zipcode = COALESCE(${zipcode}, zipcode),
        is_default = COALESCE(${is_default}, is_default)
      WHERE id = ${id}
      RETURNING *
    `;

    res.json({ success: true, address: updated[0] });
  } catch (error) {
    next(error);
  }
});

// Deletar endereço
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;

    const deleted = await sql`
      DELETE FROM addresses
      WHERE id = ${id} AND user_id = ${req.user.id}
      RETURNING is_default
    `;

    if (deleted.length === 0) {
      return res.status(404).json({ error: true, message: 'Endereço não encontrado' });
    }

    // Se era o padrão, definir outro como padrão
    if (deleted[0].is_default) {
      await sql`
        UPDATE addresses SET is_default = true
        WHERE id = (
          SELECT id FROM addresses
          WHERE user_id = ${req.user.id}
          ORDER BY created_at DESC
          LIMIT 1
        )
      `;
    }

    res.json({ success: true, message: 'Endereço removido' });
  } catch (error) {
    next(error);
  }
});

// Buscar endereço por CEP (ViaCEP)
router.get('/cep/:cep', async (req, res, next) => {
  try {
    const { cep } = req.params;
    const cleanCep = cep.replace(/\D/g, '');

    if (cleanCep.length !== 8) {
      return res.status(400).json({ error: true, message: 'CEP inválido' });
    }

    // Buscar na API ViaCEP
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    const data = await response.json();

    if (data.erro) {
      return res.status(404).json({ error: true, message: 'CEP não encontrado' });
    }

    res.json({
      success: true,
      address: {
        street: data.logradouro || '',
        neighborhood: data.bairro || '',
        city: data.localidade || '',
        state: data.uf || '',
        zipcode: cleanCep,
      }
    });
  } catch (error) {
    console.error('Erro ao buscar CEP:', error);
    res.status(500).json({ error: true, message: 'Erro ao buscar CEP' });
  }
});

// Definir como padrão
router.patch('/:id/default', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Remover padrão atual
    await sql`UPDATE addresses SET is_default = false WHERE user_id = ${req.user.id}`;

    // Definir novo padrão
    const updated = await sql`
      UPDATE addresses SET is_default = true
      WHERE id = ${id} AND user_id = ${req.user.id}
      RETURNING *
    `;

    if (updated.length === 0) {
      return res.status(404).json({ error: true, message: 'Endereço não encontrado' });
    }

    res.json({ success: true, address: updated[0] });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
