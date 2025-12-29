/**
 * Rotas de Frete - Integração com Melhor Envio
 */

const express = require('express');
const { sql } = require('../config/database');
const { authenticate } = require('../middleware/auth');
const melhorenvio = require('../services/melhorenvio');

const router = express.Router();

/**
 * Gerar opcoes de frete simuladas (fallback)
 */
function getMockShippingOptions(productPrice) {
  const basePrice = Math.max(15, productPrice * 0.1);
  return {
    options: [
      {
        id: 1,
        name: 'PAC',
        company: { id: 1, name: 'Correios', picture: 'https://www.melhorenvio.com.br/images/shipping-companies/correios.png' },
        price: Math.round(basePrice * 100) / 100,
        currency: 'BRL',
        delivery_time: 8,
        delivery_range: { min: 6, max: 10 },
        packages: []
      },
      {
        id: 2,
        name: 'SEDEX',
        company: { id: 1, name: 'Correios', picture: 'https://www.melhorenvio.com.br/images/shipping-companies/correios.png' },
        price: Math.round(basePrice * 1.8 * 100) / 100,
        currency: 'BRL',
        delivery_time: 3,
        delivery_range: { min: 2, max: 4 },
        packages: []
      },
      {
        id: 3,
        name: '.Package',
        company: { id: 2, name: 'Jadlog', picture: 'https://www.melhorenvio.com.br/images/shipping-companies/jadlog.png' },
        price: Math.round(basePrice * 1.2 * 100) / 100,
        currency: 'BRL',
        delivery_time: 6,
        delivery_range: { min: 4, max: 8 },
        packages: []
      }
    ],
    cheapest: null,
    fastest: null
  };
}

/**
 * POST /api/shipping/calculate
 * Calcular opções de frete
 */
router.post('/calculate', async (req, res, next) => {
  try {
    const { product_id, to_zipcode, from_zipcode } = req.body;

    if (!to_zipcode) {
      return res.status(400).json({ error: true, message: 'CEP de destino é obrigatório' });
    }

    // Buscar produto se informado
    let product = { price: 50 };
    let originZipcode = from_zipcode;

    if (product_id) {
      const products = await sql`
        SELECT p.*, a.zipcode as seller_zipcode
        FROM products p
        LEFT JOIN users u ON p.seller_id = u.id
        LEFT JOIN addresses a ON a.user_id = u.id AND a.is_default = true
        WHERE p.id = ${product_id}
      `;

      if (products.length > 0) {
        product = products[0];
        originZipcode = originZipcode || product.seller_zipcode;
      }
    }

    let shippingOptions;

    try {
      // Tentar calcular frete real com Melhor Envio
      shippingOptions = await melhorenvio.calculateShipping({
        toZipcode: to_zipcode,
        fromZipcode: originZipcode,
        product: {
          id: product_id,
          price: parseFloat(product.price),
          dimensions: product.dimensions || undefined
        }
      });
    } catch (melhorEnvioError) {
      console.warn('Melhor Envio falhou, usando frete simulado:', melhorEnvioError.message);
      // Usar opcoes simuladas como fallback
      shippingOptions = getMockShippingOptions(parseFloat(product.price));
    }

    // Garantir que cheapest e fastest estejam definidos
    if (shippingOptions.options && shippingOptions.options.length > 0) {
      if (!shippingOptions.cheapest) {
        shippingOptions.cheapest = [...shippingOptions.options].sort((a, b) => a.price - b.price)[0];
      }
      if (!shippingOptions.fastest) {
        shippingOptions.fastest = [...shippingOptions.options].sort((a, b) => a.deliveryTime - b.deliveryTime)[0];
      }
    }

    res.json({
      success: true,
      ...shippingOptions
    });
  } catch (error) {
    console.error('Erro ao calcular frete:', error);
    // Mesmo em caso de erro grave, retornar opcoes simuladas
    const mockOptions = getMockShippingOptions(50);
    res.json({
      success: true,
      ...mockOptions,
      cheapest: mockOptions.options[0],
      fastest: mockOptions.options[1]
    });
  }
});

/**
 * POST /api/shipping/create
 * Criar envio (adicionar ao carrinho do Melhor Envio)
 */
router.post('/create', authenticate, async (req, res, next) => {
  try {
    const { order_id, service_id } = req.body;

    // Buscar pedido
    const orders = await sql`
      SELECT
        o.*,
        p.title as product_title,
        p.price as product_price,
        seller.name as seller_name,
        seller.email as seller_email,
        seller.phone as seller_phone,
        seller.cpf as seller_cpf,
        buyer.name as buyer_name,
        buyer.email as buyer_email,
        buyer.phone as buyer_phone,
        buyer.cpf as buyer_cpf,
        sa.street as seller_street,
        sa.number as seller_number,
        sa.complement as seller_complement,
        sa.neighborhood as seller_neighborhood,
        sa.city as seller_city,
        sa.state as seller_state,
        sa.zipcode as seller_zipcode,
        ba.recipient_name as buyer_recipient,
        ba.street as buyer_street,
        ba.number as buyer_number,
        ba.complement as buyer_complement,
        ba.neighborhood as buyer_neighborhood,
        ba.city as buyer_city,
        ba.state as buyer_state,
        ba.zipcode as buyer_zipcode
      FROM orders o
      JOIN products p ON o.product_id = p.id
      JOIN users seller ON o.seller_id = seller.id
      JOIN users buyer ON o.buyer_id = buyer.id
      LEFT JOIN addresses sa ON sa.user_id = seller.id AND sa.is_default = true
      LEFT JOIN addresses ba ON o.shipping_address_id = ba.id
      WHERE o.id = ${order_id}
        AND o.seller_id = ${req.user.id}
        AND o.status = 'pending_shipment'
    `;

    if (orders.length === 0) {
      return res.status(404).json({ error: true, message: 'Pedido não encontrado ou não autorizado' });
    }

    const order = orders[0];

    // Criar envio no Melhor Envio
    const shipping = await melhorenvio.addToCart({
      serviceId: service_id,
      fromAddress: {
        name: order.seller_name,
        email: order.seller_email,
        phone: order.seller_phone,
        cpf: order.seller_cpf,
        street: order.seller_street,
        number: order.seller_number,
        complement: order.seller_complement,
        neighborhood: order.seller_neighborhood,
        city: order.seller_city,
        state: order.seller_state,
        zipcode: order.seller_zipcode
      },
      toAddress: {
        name: order.buyer_recipient || order.buyer_name,
        email: order.buyer_email,
        phone: order.buyer_phone,
        cpf: order.buyer_cpf,
        street: order.buyer_street,
        number: order.buyer_number,
        complement: order.buyer_complement,
        neighborhood: order.buyer_neighborhood,
        city: order.buyer_city,
        state: order.buyer_state,
        zipcode: order.buyer_zipcode
      },
      product: {
        title: order.product_title,
        price: parseFloat(order.product_price)
      },
      orderId: order.order_number
    });

    // Salvar ID do envio no pedido
    await sql`
      UPDATE orders
      SET shipping_melhorenvio_id = ${shipping.cartId}
      WHERE id = ${order_id}
    `;

    res.json({
      success: true,
      shipping
    });
  } catch (error) {
    console.error('Erro ao criar envio:', error);
    next(error);
  }
});

/**
 * POST /api/shipping/checkout
 * Finalizar compra do frete e gerar etiqueta
 */
router.post('/checkout', authenticate, async (req, res, next) => {
  try {
    const { order_id } = req.body;

    // Buscar pedido
    const orders = await sql`
      SELECT * FROM orders
      WHERE id = ${order_id}
        AND seller_id = ${req.user.id}
        AND shipping_melhorenvio_id IS NOT NULL
    `;

    if (orders.length === 0) {
      return res.status(404).json({ error: true, message: 'Pedido não encontrado ou envio não criado' });
    }

    const order = orders[0];

    // Finalizar compra no Melhor Envio
    const checkout = await melhorenvio.checkout([order.shipping_melhorenvio_id]);

    // Gerar etiqueta
    await melhorenvio.generateLabel([order.shipping_melhorenvio_id]);

    res.json({
      success: true,
      checkout,
      message: 'Etiqueta sendo gerada. Aguarde alguns segundos.'
    });
  } catch (error) {
    console.error('Erro ao finalizar envio:', error);
    next(error);
  }
});

/**
 * GET /api/shipping/label/:orderId
 * Obter etiqueta para impressão
 */
router.get('/label/:orderId', authenticate, async (req, res, next) => {
  try {
    const { orderId } = req.params;

    // Buscar pedido
    const orders = await sql`
      SELECT * FROM orders
      WHERE id = ${orderId}
        AND seller_id = ${req.user.id}
        AND shipping_melhorenvio_id IS NOT NULL
    `;

    if (orders.length === 0) {
      return res.status(404).json({ error: true, message: 'Pedido não encontrado' });
    }

    const order = orders[0];

    // Obter URL da etiqueta
    const label = await melhorenvio.printLabel([order.shipping_melhorenvio_id]);

    res.json({
      success: true,
      labelUrl: label.url
    });
  } catch (error) {
    console.error('Erro ao obter etiqueta:', error);
    next(error);
  }
});

/**
 * POST /api/shipping/mark-shipped
 * Marcar pedido como enviado (após postar)
 */
router.post('/mark-shipped', authenticate, async (req, res, next) => {
  try {
    const { order_id, tracking_code } = req.body;

    // Atualizar pedido
    const updated = await sql`
      UPDATE orders
      SET
        status = 'shipped',
        shipping_code = ${tracking_code},
        shipped_at = NOW()
      WHERE id = ${order_id}
        AND seller_id = ${req.user.id}
        AND status = 'pending_shipment'
      RETURNING *
    `;

    if (updated.length === 0) {
      return res.status(404).json({ error: true, message: 'Pedido não encontrado' });
    }

    // Notificar comprador
    await sql`
      INSERT INTO notifications (user_id, type, title, message, data)
      VALUES (
        ${updated[0].buyer_id},
        'shipping',
        'Pedido enviado!',
        ${`Seu pedido ${updated[0].order_number} foi enviado. Código: ${tracking_code}`},
        ${JSON.stringify({ orderId: updated[0].id, trackingCode: tracking_code })}
      )
    `;

    res.json({
      success: true,
      order: updated[0]
    });
  } catch (error) {
    console.error('Erro ao marcar como enviado:', error);
    next(error);
  }
});

/**
 * GET /api/shipping/track/:trackingCode
 * Rastrear envio
 */
router.get('/track/:trackingCode', async (req, res, next) => {
  try {
    const { trackingCode } = req.params;

    const tracking = await melhorenvio.trackShipment(trackingCode);

    res.json({
      success: true,
      ...tracking
    });
  } catch (error) {
    console.error('Erro ao rastrear:', error);
    next(error);
  }
});

/**
 * GET /api/shipping/agencies
 * Listar agências de postagem próximas
 */
router.get('/agencies', async (req, res, next) => {
  try {
    const { zipcode, company } = req.query;

    if (!zipcode) {
      return res.status(400).json({ error: true, message: 'CEP é obrigatório' });
    }

    const agencies = await melhorenvio.listAgencies(zipcode, company);

    res.json({
      success: true,
      ...agencies
    });
  } catch (error) {
    console.error('Erro ao listar agências:', error);
    next(error);
  }
});

/**
 * POST /api/shipping/cancel
 * Cancelar envio
 */
router.post('/cancel', authenticate, async (req, res, next) => {
  try {
    const { order_id } = req.body;

    // Buscar pedido
    const orders = await sql`
      SELECT * FROM orders
      WHERE id = ${order_id}
        AND seller_id = ${req.user.id}
        AND shipping_melhorenvio_id IS NOT NULL
        AND status != 'shipped'
    `;

    if (orders.length === 0) {
      return res.status(404).json({ error: true, message: 'Pedido não encontrado ou já enviado' });
    }

    const order = orders[0];

    // Cancelar no Melhor Envio
    await melhorenvio.cancelShipment([order.shipping_melhorenvio_id]);

    // Limpar ID do envio
    await sql`
      UPDATE orders
      SET shipping_melhorenvio_id = NULL
      WHERE id = ${order_id}
    `;

    res.json({
      success: true,
      message: 'Envio cancelado'
    });
  } catch (error) {
    console.error('Erro ao cancelar envio:', error);
    next(error);
  }
});

module.exports = router;
