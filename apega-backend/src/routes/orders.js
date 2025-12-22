const express = require('express');
const { sql } = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Taxa de comissão
const COMMISSION_RATE = 0.05; // 5% (promocional para primeiros 50)
const PREMIUM_COMMISSION_RATE = 0.01; // 1% para Premium

// Gerar número do pedido
const generateOrderNumber = () => {
  const date = new Date();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `AP${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${random}`;
};

// Listar pedidos do usuário (compras)
router.get('/purchases', authenticate, async (req, res, next) => {
  try {
    const { status } = req.query;

    let orders;

    if (status && status !== 'all') {
      orders = await sql`
        SELECT
          o.*,
          p.title as product_title,
          p.brand as product_brand,
          p.size as product_size,
          (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as product_image,
          u.name as seller_name,
          u.avatar_url as seller_avatar
        FROM orders o
        JOIN products p ON o.product_id = p.id
        JOIN users u ON o.seller_id = u.id
        WHERE o.buyer_id = ${req.user.id} AND o.status = ${status}
        ORDER BY o.created_at DESC
      `;
    } else {
      orders = await sql`
        SELECT
          o.*,
          p.title as product_title,
          p.brand as product_brand,
          p.size as product_size,
          (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as product_image,
          u.name as seller_name,
          u.avatar_url as seller_avatar
        FROM orders o
        JOIN products p ON o.product_id = p.id
        JOIN users u ON o.seller_id = u.id
        WHERE o.buyer_id = ${req.user.id}
        ORDER BY o.created_at DESC
      `;
    }

    res.json({ success: true, orders });
  } catch (error) {
    next(error);
  }
});

// Listar vendas do usuário
router.get('/sales', authenticate, async (req, res, next) => {
  try {
    const { status } = req.query;

    let orders;

    if (status && status !== 'all') {
      orders = await sql`
        SELECT
          o.*,
          p.title as product_title,
          p.brand as product_brand,
          p.size as product_size,
          (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as product_image,
          u.name as buyer_name,
          u.avatar_url as buyer_avatar
        FROM orders o
        JOIN products p ON o.product_id = p.id
        JOIN users u ON o.buyer_id = u.id
        WHERE o.seller_id = ${req.user.id} AND o.status = ${status}
        ORDER BY o.created_at DESC
      `;
    } else {
      orders = await sql`
        SELECT
          o.*,
          p.title as product_title,
          p.brand as product_brand,
          p.size as product_size,
          (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as product_image,
          u.name as buyer_name,
          u.avatar_url as buyer_avatar
        FROM orders o
        JOIN products p ON o.product_id = p.id
        JOIN users u ON o.buyer_id = u.id
        WHERE o.seller_id = ${req.user.id}
        ORDER BY o.created_at DESC
      `;
    }

    res.json({ success: true, orders });
  } catch (error) {
    next(error);
  }
});

// Obter detalhes do pedido
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;

    const orders = await sql`
      SELECT
        o.*,
        p.title as product_title,
        p.brand as product_brand,
        p.size as product_size,
        p.description as product_description,
        seller.name as seller_name,
        seller.avatar_url as seller_avatar,
        seller.phone as seller_phone,
        buyer.name as buyer_name,
        buyer.avatar_url as buyer_avatar,
        buyer.phone as buyer_phone,
        a.street, a.number, a.complement, a.neighborhood, a.city, a.state, a.zipcode, a.recipient_name
      FROM orders o
      JOIN products p ON o.product_id = p.id
      JOIN users seller ON o.seller_id = seller.id
      JOIN users buyer ON o.buyer_id = buyer.id
      LEFT JOIN addresses a ON o.shipping_address_id = a.id
      WHERE o.id = ${id}
        AND (o.buyer_id = ${req.user.id} OR o.seller_id = ${req.user.id})
    `;

    if (orders.length === 0) {
      return res.status(404).json({ error: true, message: 'Pedido não encontrado' });
    }

    // Buscar imagens do produto
    const images = await sql`
      SELECT image_url FROM product_images WHERE product_id = ${orders[0].product_id} ORDER BY sort_order
    `;

    const order = {
      ...orders[0],
      product_images: images.map(i => i.image_url)
    };

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
});

// Criar pedido (comprar produto)
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { product_id, address_id, payment_method } = req.body;

    // Buscar produto
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

    // Não pode comprar próprio produto
    if (product.seller_id === req.user.id) {
      return res.status(400).json({ error: true, message: 'Você não pode comprar seu próprio produto' });
    }

    // Calcular valores
    const productPrice = parseFloat(product.price);
    const shippingPrice = 15.00; // Frete fixo por enquanto
    const totalAmount = productPrice + shippingPrice;

    // Calcular comissão baseada no tipo de assinatura do vendedor
    const commissionRate = product.seller_subscription === 'premium' ? PREMIUM_COMMISSION_RATE : COMMISSION_RATE;
    const commissionAmount = productPrice * commissionRate;
    const sellerReceives = productPrice - commissionAmount;

    // Gerar número do pedido
    const orderNumber = generateOrderNumber();

    // Criar pedido
    const newOrder = await sql`
      INSERT INTO orders (
        order_number, buyer_id, seller_id, product_id,
        product_price, shipping_price, commission_rate, commission_amount,
        seller_receives, total_amount, shipping_address_id, payment_method, status
      )
      VALUES (
        ${orderNumber}, ${req.user.id}, ${product.seller_id}, ${product_id},
        ${productPrice}, ${shippingPrice}, ${commissionRate}, ${commissionAmount},
        ${sellerReceives}, ${totalAmount}, ${address_id || null}, ${payment_method || null}, 'pending_payment'
      )
      RETURNING *
    `;

    // Marcar produto como vendido
    await sql`UPDATE products SET status = 'sold' WHERE id = ${product_id}`;

    // Remover do carrinho de todos os usuários
    await sql`DELETE FROM cart_items WHERE product_id = ${product_id}`;

    res.status(201).json({
      success: true,
      message: 'Pedido criado com sucesso',
      order: newOrder[0]
    });
  } catch (error) {
    next(error);
  }
});

// Atualizar status do pedido
router.patch('/:id/status', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, shipping_code, shipping_carrier } = req.body;

    const orders = await sql`
      SELECT * FROM orders WHERE id = ${id}
    `;

    if (orders.length === 0) {
      return res.status(404).json({ error: true, message: 'Pedido não encontrado' });
    }

    const order = orders[0];

    // Validar permissão
    if (order.seller_id !== req.user.id && order.buyer_id !== req.user.id) {
      return res.status(403).json({ error: true, message: 'Sem permissão' });
    }

    // Atualizar status
    let updateData = { status };

    if (status === 'shipped' && shipping_code) {
      updateData.shipping_code = shipping_code;
      updateData.shipping_carrier = shipping_carrier;
      updateData.shipped_at = new Date();
    }

    if (status === 'delivered') {
      updateData.delivered_at = new Date();
    }

    if (status === 'completed') {
      // Liberar pagamento para o vendedor
      await sql`
        UPDATE users
        SET balance = balance + ${order.seller_receives}
        WHERE id = ${order.seller_id}
      `;

      // Registrar transação
      await sql`
        INSERT INTO transactions (user_id, order_id, type, amount, description)
        VALUES (${order.seller_id}, ${id}, 'sale', ${order.seller_receives}, ${`Venda #${order.order_number}`})
      `;

      // Buscar tipo de assinatura do comprador para calcular cashback
      const buyerInfo = await sql`SELECT subscription_type FROM users WHERE id = ${order.buyer_id}`;
      const isPremiumBuyer = buyerInfo[0]?.subscription_type === 'premium';

      // Cashback: 2% para free, 0.5% para premium
      const cashbackRate = isPremiumBuyer ? 0.005 : 0.02;
      const cashbackAmount = order.product_price * cashbackRate;

      await sql`
        UPDATE users
        SET cashback_balance = cashback_balance + ${cashbackAmount}
        WHERE id = ${order.buyer_id}
      `;

      await sql`
        INSERT INTO transactions (user_id, order_id, type, amount, description)
        VALUES (${order.buyer_id}, ${id}, 'cashback', ${cashbackAmount}, ${`Cashback ${isPremiumBuyer ? '0.5%' : '2%'} - Compra #${order.order_number}`})
      `;

      // Incrementar total de vendas do vendedor
      await sql`
        UPDATE users SET total_sales = total_sales + 1 WHERE id = ${order.seller_id}
      `;
    }

    const updated = await sql`
      UPDATE orders
      SET
        status = ${status},
        shipping_code = COALESCE(${shipping_code}, shipping_code),
        shipping_carrier = COALESCE(${shipping_carrier}, shipping_carrier),
        shipped_at = COALESCE(${status === 'shipped' ? new Date() : null}, shipped_at),
        delivered_at = COALESCE(${status === 'delivered' ? new Date() : null}, delivered_at)
      WHERE id = ${id}
      RETURNING *
    `;

    res.json({ success: true, order: updated[0] });
  } catch (error) {
    next(error);
  }
});

// Estatísticas de vendas
router.get('/stats/sales', authenticate, async (req, res, next) => {
  try {
    // Total vendido este mês
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const stats = await sql`
      SELECT
        COALESCE(SUM(seller_receives), 0) as total_revenue,
        COUNT(*) as total_orders
      FROM orders
      WHERE seller_id = ${req.user.id}
        AND status IN ('completed', 'delivered', 'shipped', 'in_transit', 'pending_shipment')
        AND created_at >= ${monthStart}
    `;

    // Pendentes de envio
    const pending = await sql`
      SELECT COUNT(*) as count FROM orders
      WHERE seller_id = ${req.user.id} AND status = 'pending_shipment'
    `;

    // Em trânsito
    const transit = await sql`
      SELECT COUNT(*) as count FROM orders
      WHERE seller_id = ${req.user.id} AND status IN ('shipped', 'in_transit')
    `;

    res.json({
      success: true,
      stats: {
        totalRevenue: parseFloat(stats[0].total_revenue),
        totalOrders: parseInt(stats[0].total_orders),
        pendingShipment: parseInt(pending[0].count),
        inTransit: parseInt(transit[0].count)
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
