/**
 * Rotas de Checkout - Pagamento integrado com Mercado Pago
 */

const express = require('express');
const { sql } = require('../config/database');
const { authenticate } = require('../middleware/auth');
const mercadopago = require('../services/mercadopago');

const router = express.Router();

// Taxa de comissão
const COMMISSION_RATE = 0.10; // 10%
const PREMIUM_COMMISSION_RATE = 0.01; // 1% para Premium

// Gerar número do pedido
const generateOrderNumber = () => {
  const date = new Date();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `AP${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${random}`;
};

/**
 * POST /api/checkout/pix
 * Criar pagamento via PIX
 */
router.post('/pix', authenticate, async (req, res, next) => {
  try {
    const { product_id, address_id, shipping_option } = req.body;

    // Validar produto
    const products = await sql`
      SELECT p.*, u.subscription_type as seller_subscription
      FROM products p
      JOIN users u ON p.seller_id = u.id
      WHERE p.id = ${product_id} AND p.status = 'active'
    `;

    if (products.length === 0) {
      return res.status(404).json({ error: true, message: 'Produto não disponível' });
    }

    const product = products[0];

    if (product.seller_id === req.user.id) {
      return res.status(400).json({ error: true, message: 'Você não pode comprar seu próprio produto' });
    }

    // Buscar dados do comprador
    const buyer = await sql`SELECT * FROM users WHERE id = ${req.user.id}`;

    // Calcular valores
    const productPrice = parseFloat(product.price);
    const shippingPrice = shipping_option?.price || 15.00;
    const totalAmount = productPrice + shippingPrice;

    const commissionRate = product.seller_subscription === 'premium' ? PREMIUM_COMMISSION_RATE : COMMISSION_RATE;
    const commissionAmount = productPrice * commissionRate;
    const sellerReceives = productPrice - commissionAmount;

    // Criar pedido pendente
    const orderNumber = generateOrderNumber();
    const newOrder = await sql`
      INSERT INTO orders (
        order_number, buyer_id, seller_id, product_id,
        product_price, shipping_price, shipping_service, shipping_delivery_time,
        commission_rate, commission_amount, seller_receives, total_amount,
        shipping_address_id, payment_method, status
      )
      VALUES (
        ${orderNumber}, ${req.user.id}, ${product.seller_id}, ${product_id},
        ${productPrice}, ${shippingPrice}, ${shipping_option?.name || null}, ${shipping_option?.deliveryTime || null},
        ${commissionRate}, ${commissionAmount}, ${sellerReceives}, ${totalAmount},
        ${address_id || null}, 'pix', 'pending_payment'
      )
      RETURNING *
    `;

    // Criar pagamento PIX no Mercado Pago
    const pixPayment = await mercadopago.createPixPayment({
      orderId: newOrder[0].id,
      orderNumber: orderNumber,
      amount: totalAmount,
      description: `${product.title} - Apega Desapega`,
      payerEmail: buyer[0].email,
      payerCpf: buyer[0].cpf,
      payerName: buyer[0].name
    });

    // Salvar ID do pagamento
    await sql`
      UPDATE orders
      SET payment_id = ${pixPayment.paymentId}
      WHERE id = ${newOrder[0].id}
    `;

    res.status(201).json({
      success: true,
      order: newOrder[0],
      payment: {
        id: pixPayment.paymentId,
        status: pixPayment.status,
        qrCode: pixPayment.qrCode,
        qrCodeBase64: pixPayment.qrCodeBase64,
        expirationDate: pixPayment.expirationDate
      }
    });
  } catch (error) {
    console.error('Erro no checkout PIX:', error);
    next(error);
  }
});

/**
 * POST /api/checkout/card
 * Criar pagamento via Cartão de Crédito
 */
router.post('/card', authenticate, async (req, res, next) => {
  try {
    const {
      product_id,
      address_id,
      shipping_option,
      card_token,
      installments,
      payment_method_id,
      issuer_id
    } = req.body;

    // Validar produto
    const products = await sql`
      SELECT p.*, u.subscription_type as seller_subscription
      FROM products p
      JOIN users u ON p.seller_id = u.id
      WHERE p.id = ${product_id} AND p.status = 'active'
    `;

    if (products.length === 0) {
      return res.status(404).json({ error: true, message: 'Produto não disponível' });
    }

    const product = products[0];

    if (product.seller_id === req.user.id) {
      return res.status(400).json({ error: true, message: 'Você não pode comprar seu próprio produto' });
    }

    // Buscar dados do comprador
    const buyer = await sql`SELECT * FROM users WHERE id = ${req.user.id}`;

    // Calcular valores
    const productPrice = parseFloat(product.price);
    const shippingPrice = shipping_option?.price || 15.00;
    const totalAmount = productPrice + shippingPrice;

    const commissionRate = product.seller_subscription === 'premium' ? PREMIUM_COMMISSION_RATE : COMMISSION_RATE;
    const commissionAmount = productPrice * commissionRate;
    const sellerReceives = productPrice - commissionAmount;

    // Criar pedido
    const orderNumber = generateOrderNumber();
    const newOrder = await sql`
      INSERT INTO orders (
        order_number, buyer_id, seller_id, product_id,
        product_price, shipping_price, shipping_service, shipping_delivery_time,
        commission_rate, commission_amount, seller_receives, total_amount,
        shipping_address_id, payment_method, status
      )
      VALUES (
        ${orderNumber}, ${req.user.id}, ${product.seller_id}, ${product_id},
        ${productPrice}, ${shippingPrice}, ${shipping_option?.name || null}, ${shipping_option?.deliveryTime || null},
        ${commissionRate}, ${commissionAmount}, ${sellerReceives}, ${totalAmount},
        ${address_id || null}, 'credit_card', 'processing'
      )
      RETURNING *
    `;

    // Criar pagamento no Mercado Pago
    const cardPayment = await mercadopago.createCardPayment({
      orderId: newOrder[0].id,
      orderNumber: orderNumber,
      amount: totalAmount,
      description: `${product.title} - Apega Desapega`,
      payerEmail: buyer[0].email,
      payerCpf: buyer[0].cpf,
      payerName: buyer[0].name,
      token: card_token,
      installments: installments || 1,
      paymentMethodId: payment_method_id,
      issuerId: issuer_id
    });

    // Atualizar pedido com status do pagamento
    const orderStatus = mercadopago.mapPaymentStatus(cardPayment.status);
    await sql`
      UPDATE orders
      SET payment_id = ${cardPayment.paymentId}, status = ${orderStatus === 'paid' ? 'pending_shipment' : orderStatus}
      WHERE id = ${newOrder[0].id}
    `;

    // Se aprovado, marcar produto como vendido
    if (orderStatus === 'paid') {
      await sql`UPDATE products SET status = 'sold' WHERE id = ${product_id}`;
      await sql`DELETE FROM cart_items WHERE product_id = ${product_id}`;
    }

    res.status(201).json({
      success: true,
      order: { ...newOrder[0], status: orderStatus === 'paid' ? 'pending_shipment' : orderStatus },
      payment: {
        id: cardPayment.paymentId,
        status: cardPayment.status,
        approved: cardPayment.status === 'approved'
      }
    });
  } catch (error) {
    console.error('Erro no checkout cartão:', error);
    next(error);
  }
});

/**
 * POST /api/checkout/boleto
 * Criar pagamento via Boleto
 */
router.post('/boleto', authenticate, async (req, res, next) => {
  try {
    const { product_id, address_id, shipping_option } = req.body;

    // Validar produto
    const products = await sql`
      SELECT p.*, u.subscription_type as seller_subscription
      FROM products p
      JOIN users u ON p.seller_id = u.id
      WHERE p.id = ${product_id} AND p.status = 'active'
    `;

    if (products.length === 0) {
      return res.status(404).json({ error: true, message: 'Produto não disponível' });
    }

    const product = products[0];

    if (product.seller_id === req.user.id) {
      return res.status(400).json({ error: true, message: 'Você não pode comprar seu próprio produto' });
    }

    // Buscar dados do comprador e endereço
    const buyer = await sql`SELECT * FROM users WHERE id = ${req.user.id}`;
    const address = address_id
      ? await sql`SELECT * FROM addresses WHERE id = ${address_id}`
      : [];

    // Calcular valores
    const productPrice = parseFloat(product.price);
    const shippingPrice = shipping_option?.price || 15.00;
    const totalAmount = productPrice + shippingPrice;

    const commissionRate = product.seller_subscription === 'premium' ? PREMIUM_COMMISSION_RATE : COMMISSION_RATE;
    const commissionAmount = productPrice * commissionRate;
    const sellerReceives = productPrice - commissionAmount;

    // Criar pedido
    const orderNumber = generateOrderNumber();
    const newOrder = await sql`
      INSERT INTO orders (
        order_number, buyer_id, seller_id, product_id,
        product_price, shipping_price, shipping_service, shipping_delivery_time,
        commission_rate, commission_amount, seller_receives, total_amount,
        shipping_address_id, payment_method, status
      )
      VALUES (
        ${orderNumber}, ${req.user.id}, ${product.seller_id}, ${product_id},
        ${productPrice}, ${shippingPrice}, ${shipping_option?.name || null}, ${shipping_option?.deliveryTime || null},
        ${commissionRate}, ${commissionAmount}, ${sellerReceives}, ${totalAmount},
        ${address_id || null}, 'boleto', 'pending_payment'
      )
      RETURNING *
    `;

    // Criar boleto no Mercado Pago
    const boletoPayment = await mercadopago.createBoletoPayment({
      orderId: newOrder[0].id,
      orderNumber: orderNumber,
      amount: totalAmount,
      description: `${product.title} - Apega Desapega`,
      payerEmail: buyer[0].email,
      payerCpf: buyer[0].cpf,
      payerName: buyer[0].name,
      payerAddress: address[0] || null
    });

    // Salvar ID do pagamento
    await sql`
      UPDATE orders
      SET payment_id = ${boletoPayment.paymentId}
      WHERE id = ${newOrder[0].id}
    `;

    res.status(201).json({
      success: true,
      order: newOrder[0],
      payment: {
        id: boletoPayment.paymentId,
        status: boletoPayment.status,
        boletoUrl: boletoPayment.boletoUrl,
        barcode: boletoPayment.barcode,
        expirationDate: boletoPayment.expirationDate
      }
    });
  } catch (error) {
    console.error('Erro no checkout boleto:', error);
    next(error);
  }
});

/**
 * POST /api/checkout/webhook
 * Webhook do Mercado Pago para notificações de pagamento
 */
router.post('/webhook', async (req, res, next) => {
  try {
    const { type, data } = req.body;

    console.log('Webhook recebido:', type, data);

    if (type === 'payment') {
      // Consultar status do pagamento
      const paymentInfo = await mercadopago.getPaymentStatus(data.id);
      const orderStatus = mercadopago.mapPaymentStatus(paymentInfo.status);

      // Buscar pedido pelo payment_id
      const orders = await sql`
        SELECT * FROM orders WHERE payment_id = ${data.id}
      `;

      if (orders.length > 0) {
        const order = orders[0];

        // Atualizar status do pedido
        await sql`
          UPDATE orders
          SET status = ${orderStatus === 'paid' ? 'pending_shipment' : orderStatus}
          WHERE id = ${order.id}
        `;

        // Se aprovado, marcar produto como vendido
        if (orderStatus === 'paid') {
          await sql`UPDATE products SET status = 'sold' WHERE id = ${order.product_id}`;
          await sql`DELETE FROM cart_items WHERE product_id = ${order.product_id}`;

          // Criar notificação para vendedor
          await sql`
            INSERT INTO notifications (user_id, type, title, message, data)
            VALUES (
              ${order.seller_id},
              'sale',
              'Nova venda!',
              ${`Você vendeu ${order.order_number}. Prepare o envio!`},
              ${JSON.stringify({ orderId: order.id })}
            )
          `;

          // Criar notificação para comprador
          await sql`
            INSERT INTO notifications (user_id, type, title, message, data)
            VALUES (
              ${order.buyer_id},
              'order',
              'Pagamento confirmado!',
              ${`Seu pedido ${order.order_number} foi confirmado.`},
              ${JSON.stringify({ orderId: order.id })}
            )
          `;
        }
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Erro no webhook:', error);
    res.status(200).send('OK'); // Sempre retornar 200 para o MP
  }
});

/**
 * GET /api/checkout/payment/:paymentId
 * Consultar status do pagamento
 */
router.get('/payment/:paymentId', authenticate, async (req, res, next) => {
  try {
    const { paymentId } = req.params;

    const paymentInfo = await mercadopago.getPaymentStatus(paymentId);

    res.json({
      success: true,
      payment: paymentInfo
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
