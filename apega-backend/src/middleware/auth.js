const jwt = require('jsonwebtoken');
const { sql } = require('../config/database');

// Middleware de autenticação
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: true, message: 'Token não fornecido' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Buscar usuário no banco
    const users = await sql`
      SELECT id, email, name, subscription_type, is_active
      FROM users
      WHERE id = ${decoded.userId}
    `;

    if (users.length === 0) {
      return res.status(401).json({ error: true, message: 'Usuário não encontrado' });
    }

    if (!users[0].is_active) {
      return res.status(401).json({ error: true, message: 'Conta desativada' });
    }

    req.user = users[0];
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: true, message: 'Token inválido' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: true, message: 'Token expirado' });
    }
    next(error);
  }
};

// Middleware opcional de autenticação (não bloqueia, mas adiciona user se logado)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const users = await sql`
        SELECT id, email, name, subscription_type
        FROM users
        WHERE id = ${decoded.userId} AND is_active = true
      `;

      if (users.length > 0) {
        req.user = users[0];
      }
    }
    next();
  } catch {
    // Token inválido, mas continua sem autenticação
    next();
  }
};

// Verificar se e admin
const requireAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: true, message: 'Token nao fornecido' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.isAdmin) {
      return res.status(403).json({ error: true, message: 'Acesso nao autorizado' });
    }

    if (decoded.userId === 'admin') {
      req.admin = {
        id: 'admin',
        name: 'Administrador',
        email: process.env.ADMIN_EMAIL || 'admin@apegadesapega.com',
        is_admin: true
      };
      return next();
    }

    const users = await sql`
      SELECT id, email, name, is_admin, is_active
      FROM users
      WHERE id = ${decoded.userId} AND is_admin = true
    `;

    if (users.length === 0) {
      return res.status(403).json({ error: true, message: 'Usuario nao e admin' });
    }

    if (!users[0].is_active) {
      return res.status(401).json({ error: true, message: 'Conta desativada' });
    }

    req.admin = users[0];
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: true, message: 'Token invalido' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: true, message: 'Token expirado' });
    }
    next(error);
  }
};

// Verificar se e usuario premium
const requirePremium = (req, res, next) => {
  if (req.user.subscription_type !== 'premium') {
    return res.status(403).json({
      error: true,
      message: 'Esta funcionalidade requer assinatura Premium'
    });
  }
  next();
};

module.exports = { authenticate, optionalAuth, requireAdmin, requirePremium };
