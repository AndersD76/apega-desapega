/**
 * Rotas de Assinatura Premium - Integração com Mercado Pago
 */

const express = require('express');
const { sql } = require('../config/database');
const { authenticate } = require('../middleware/auth');
const mercadopago = require('../services/mercadopago');

const router = express.Router();

// Preços das assinaturas
const SUBSCRIPTION_PRICES = {
  monthly: 49.90,
  yearly: 499.90
};

/**
 * POST /api/subscriptions/pix
 * Criar assinatura com PIX
 */
router.post('/pix', authenticate, async (req, res, next) => {
  try {
    const { plan } = req.body; // 'monthly' ou 'yearly'

    if (!plan || !['monthly', 'yearly'].includes(plan)) {
      return res.status(400).json({ error: true, message: 'Plano inválido' });
    }

    const price = SUBSCRIPTION_PRICES[plan];
    const planName = plan === 'monthly' ? 'Mensal' : 'Anual';

    // Criar pagamento PIX
    const externalRef = `subscription_${req.user.id}_${plan}_${Date.now()}`;
    const paymentResult = await mercadopago.createPixPayment({
      orderId: externalRef,
      orderNumber: `SUB-${req.user.id}-${Date.now()}`,
      amount: price,
      description: `Assinatura Premium ${planName} - Apega Desapega`,
      payerEmail: req.user.email,
      payerCpf: req.user.cpf || '00000000000',
      payerName: req.user.name
    });

    // Salvar registro da assinatura pendente
    const expiresAt = new Date();
    if (plan === 'monthly') {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    } else {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    }

    await sql`
      INSERT INTO subscriptions (user_id, plan, price, status, starts_at, expires_at)
      VALUES (${req.user.id}, ${plan}, ${price}, 'pending', NOW(), ${expiresAt})
      ON CONFLICT DO NOTHING
    `;

    res.json({
      success: true,
      payment: {
        id: paymentResult.paymentId,
        status: paymentResult.status,
        pix_qr_code: paymentResult.qrCode,
        pix_qr_code_base64: paymentResult.qrCodeBase64,
        expires_at: paymentResult.expirationDate
      },
      plan,
      price
    });
  } catch (error) {
    console.error('Erro ao criar assinatura PIX:', error);
    next(error);
  }
});

/**
 * POST /api/subscriptions/boleto
 * Criar assinatura com Boleto
 */
router.post('/boleto', authenticate, async (req, res, next) => {
  try {
    const { plan } = req.body;

    if (!plan || !['monthly', 'yearly'].includes(plan)) {
      return res.status(400).json({ error: true, message: 'Plano inválido' });
    }

    const price = SUBSCRIPTION_PRICES[plan];
    const planName = plan === 'monthly' ? 'Mensal' : 'Anual';

    // Criar pagamento Boleto
    const externalRef = `subscription_${req.user.id}_${plan}_${Date.now()}`;
    const paymentResult = await mercadopago.createBoletoPayment({
      orderId: externalRef,
      orderNumber: `SUB-${req.user.id}-${Date.now()}`,
      amount: price,
      description: `Assinatura Premium ${planName} - Apega Desapega`,
      payerEmail: req.user.email,
      payerCpf: req.user.cpf || '00000000000',
      payerName: req.user.name,
      payerAddress: {
        zipcode: '99010000',
        street: 'Rua Principal',
        number: '100',
        neighborhood: 'Centro',
        city: 'Passo Fundo',
        state: 'RS'
      }
    });

    res.json({
      success: true,
      payment: {
        id: paymentResult.paymentId,
        status: paymentResult.status,
        barcode: paymentResult.barcode,
        boleto_url: paymentResult.boletoUrl,
        expires_at: paymentResult.expirationDate
      },
      plan,
      price
    });
  } catch (error) {
    console.error('Erro ao criar assinatura boleto:', error);
    next(error);
  }
});

/**
 * POST /api/subscriptions/webhook
 * Webhook para confirmar pagamento de assinatura
 */
router.post('/webhook', async (req, res, next) => {
  try {
    const notification = req.body;

    if (notification.type === 'payment') {
      const paymentId = notification.data?.id;

      if (paymentId) {
        const paymentInfo = await mercadopago.getPaymentStatus(paymentId);

        if (paymentInfo.status === 'approved') {
          const externalRef = paymentInfo.external_reference || '';
          const parts = externalRef.split('_');

          if (parts[0] === 'subscription' && parts.length >= 3) {
            const userId = parts[1];
            const plan = parts[2];

            // Calcular data de expiração
            const expiresAt = new Date();
            if (plan === 'monthly') {
              expiresAt.setMonth(expiresAt.getMonth() + 1);
            } else {
              expiresAt.setFullYear(expiresAt.getFullYear() + 1);
            }

            // Atualizar usuário para premium
            await sql`
              UPDATE users
              SET subscription_type = 'premium',
                  subscription_expires_at = ${expiresAt}
              WHERE id = ${userId}
            `;

            // Atualizar assinatura
            await sql`
              UPDATE subscriptions
              SET status = 'active'
              WHERE user_id = ${userId} AND status = 'pending'
            `;

            // Criar transação
            await sql`
              INSERT INTO transactions (user_id, type, amount, description, status)
              VALUES (${userId}, 'subscription', ${-paymentInfo.transaction_amount},
                      ${`Assinatura Premium ${plan === 'monthly' ? 'Mensal' : 'Anual'}`}, 'completed')
            `;

            console.log(`Assinatura ativada para usuário ${userId}`);
          }
        }
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Erro no webhook de assinatura:', error);
    res.status(200).json({ received: true });
  }
});

/**
 * GET /api/subscriptions/status
 * Verificar status da assinatura do usuário
 */
router.get('/status', authenticate, async (req, res, next) => {
  try {
    const user = await sql`
      SELECT subscription_type, subscription_expires_at
      FROM users WHERE id = ${req.user.id}
    `;

    if (user.length === 0) {
      return res.status(404).json({ error: true, message: 'Usuário não encontrado' });
    }

    const isPremium = user[0].subscription_type === 'premium' &&
                      user[0].subscription_expires_at &&
                      new Date(user[0].subscription_expires_at) > new Date();

    res.json({
      success: true,
      isPremium,
      subscriptionType: user[0].subscription_type,
      expiresAt: user[0].subscription_expires_at
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/subscriptions/cancel
 * Cancelar assinatura
 */
router.post('/cancel', authenticate, async (req, res, next) => {
  try {
    await sql`
      UPDATE subscriptions
      SET status = 'cancelled', cancelled_at = NOW()
      WHERE user_id = ${req.user.id} AND status = 'active'
    `;

    // Não remover premium imediatamente - deixar até expirar
    res.json({
      success: true,
      message: 'Assinatura cancelada. Você terá acesso até o fim do período pago.'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
