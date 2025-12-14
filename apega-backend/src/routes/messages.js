const express = require('express');
const { sql } = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Listar conversas
router.get('/conversations', authenticate, async (req, res, next) => {
  try {
    const conversations = await sql`
      SELECT
        c.*,
        CASE
          WHEN c.user1_id = ${req.user.id} THEN u2.id
          ELSE u1.id
        END as other_user_id,
        CASE
          WHEN c.user1_id = ${req.user.id} THEN u2.name
          ELSE u1.name
        END as other_user_name,
        CASE
          WHEN c.user1_id = ${req.user.id} THEN u2.avatar_url
          ELSE u1.avatar_url
        END as other_user_avatar,
        p.title as product_title,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as product_image,
        (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND sender_id != ${req.user.id} AND is_read = false) as unread_count
      FROM conversations c
      JOIN users u1 ON c.user1_id = u1.id
      JOIN users u2 ON c.user2_id = u2.id
      LEFT JOIN products p ON c.product_id = p.id
      WHERE c.user1_id = ${req.user.id} OR c.user2_id = ${req.user.id}
      ORDER BY c.last_message_at DESC
    `;

    res.json({ success: true, conversations });
  } catch (error) {
    next(error);
  }
});

// Obter ou criar conversa
router.post('/conversations', authenticate, async (req, res, next) => {
  try {
    const { other_user_id, product_id } = req.body;

    if (!other_user_id) {
      return res.status(400).json({ error: true, message: 'ID do usuário é obrigatório' });
    }

    // Verificar se já existe conversa
    let conversation = await sql`
      SELECT * FROM conversations
      WHERE (user1_id = ${req.user.id} AND user2_id = ${other_user_id})
         OR (user1_id = ${other_user_id} AND user2_id = ${req.user.id})
      LIMIT 1
    `;

    if (conversation.length === 0) {
      // Criar nova conversa
      conversation = await sql`
        INSERT INTO conversations (user1_id, user2_id, product_id)
        VALUES (${req.user.id}, ${other_user_id}, ${product_id || null})
        RETURNING *
      `;
    }

    res.json({ success: true, conversation: conversation[0] });
  } catch (error) {
    next(error);
  }
});

// Listar mensagens de uma conversa
router.get('/conversations/:id/messages', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    // Verificar se usuário faz parte da conversa
    const conversation = await sql`
      SELECT * FROM conversations
      WHERE id = ${id} AND (user1_id = ${req.user.id} OR user2_id = ${req.user.id})
    `;

    if (conversation.length === 0) {
      return res.status(404).json({ error: true, message: 'Conversa não encontrada' });
    }

    // Marcar mensagens como lidas
    await sql`
      UPDATE messages SET is_read = true
      WHERE conversation_id = ${id} AND sender_id != ${req.user.id}
    `;

    const messages = await sql`
      SELECT
        m.*,
        u.name as sender_name,
        u.avatar_url as sender_avatar
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.conversation_id = ${id}
      ORDER BY m.created_at DESC
      LIMIT ${parseInt(limit)}
      OFFSET ${offset}
    `;

    res.json({ success: true, messages: messages.reverse() });
  } catch (error) {
    next(error);
  }
});

// Enviar mensagem
router.post('/conversations/:id/messages', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: true, message: 'Mensagem não pode ser vazia' });
    }

    // Verificar se usuário faz parte da conversa
    const conversation = await sql`
      SELECT * FROM conversations
      WHERE id = ${id} AND (user1_id = ${req.user.id} OR user2_id = ${req.user.id})
    `;

    if (conversation.length === 0) {
      return res.status(404).json({ error: true, message: 'Conversa não encontrada' });
    }

    // Criar mensagem
    const newMessage = await sql`
      INSERT INTO messages (conversation_id, sender_id, content)
      VALUES (${id}, ${req.user.id}, ${content.trim()})
      RETURNING *
    `;

    // Atualizar última mensagem da conversa
    await sql`
      UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP WHERE id = ${id}
    `;

    // Criar notificação para o outro usuário
    const otherUserId = conversation[0].user1_id === req.user.id
      ? conversation[0].user2_id
      : conversation[0].user1_id;

    await sql`
      INSERT INTO notifications (user_id, type, title, message, data)
      VALUES (
        ${otherUserId},
        'message',
        'Nova mensagem',
        ${`${req.user.name} enviou uma mensagem`},
        ${JSON.stringify({ conversation_id: id })}
      )
    `;

    res.status(201).json({ success: true, message: newMessage[0] });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
