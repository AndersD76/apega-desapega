/**
 * Serviço de integração com Mercado Pago
 * Documentação: https://www.mercadopago.com.br/developers/pt/docs
 */

const { MercadoPagoConfig, Payment, Preference } = require('mercadopago');

// Configuração do cliente
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
  options: { timeout: 5000 }
});

const payment = new Payment(client);
const preference = new Preference(client);

/**
 * Criar pagamento via PIX
 */
async function createPixPayment(data) {
  const { orderId, orderNumber, amount, description, payerEmail, payerCpf, payerName } = data;

  try {
    const paymentData = {
      transaction_amount: amount,
      description: description || `Pedido #${orderNumber} - Apega Desapega`,
      payment_method_id: 'pix',
      payer: {
        email: payerEmail,
        first_name: payerName?.split(' ')[0] || 'Cliente',
        last_name: payerName?.split(' ').slice(1).join(' ') || '',
        identification: {
          type: 'CPF',
          number: payerCpf?.replace(/\D/g, '') || ''
        }
      },
      external_reference: orderId.toString(),
      notification_url: `${process.env.API_URL}/api/checkout/webhook`,
    };

    const result = await payment.create({ body: paymentData });

    return {
      success: true,
      paymentId: result.id,
      status: result.status,
      statusDetail: result.status_detail,
      qrCode: result.point_of_interaction?.transaction_data?.qr_code,
      qrCodeBase64: result.point_of_interaction?.transaction_data?.qr_code_base64,
      ticketUrl: result.point_of_interaction?.transaction_data?.ticket_url,
      expirationDate: result.date_of_expiration,
    };
  } catch (error) {
    console.error('Erro ao criar pagamento PIX:', error);
    throw new Error(error.message || 'Erro ao processar pagamento PIX');
  }
}

/**
 * Criar pagamento via Cartão de Crédito
 */
async function createCardPayment(data) {
  const {
    orderId,
    orderNumber,
    amount,
    description,
    payerEmail,
    payerCpf,
    payerName,
    token, // Token do cartão gerado pelo SDK frontend
    installments,
    paymentMethodId,
    issuerId
  } = data;

  try {
    const paymentData = {
      transaction_amount: amount,
      token: token,
      description: description || `Pedido #${orderNumber} - Apega Desapega`,
      installments: installments || 1,
      payment_method_id: paymentMethodId,
      issuer_id: issuerId,
      payer: {
        email: payerEmail,
        identification: {
          type: 'CPF',
          number: payerCpf?.replace(/\D/g, '') || ''
        }
      },
      external_reference: orderId.toString(),
      notification_url: `${process.env.API_URL}/api/checkout/webhook`,
    };

    const result = await payment.create({ body: paymentData });

    return {
      success: true,
      paymentId: result.id,
      status: result.status,
      statusDetail: result.status_detail,
      authorizationCode: result.authorization_code,
      lastFourDigits: result.card?.last_four_digits,
    };
  } catch (error) {
    console.error('Erro ao criar pagamento cartão:', error);
    throw new Error(error.message || 'Erro ao processar pagamento com cartão');
  }
}

/**
 * Criar pagamento via Boleto
 */
async function createBoletoPayment(data) {
  const { orderId, orderNumber, amount, description, payerEmail, payerCpf, payerName, payerAddress } = data;

  try {
    const paymentData = {
      transaction_amount: amount,
      description: description || `Pedido #${orderNumber} - Apega Desapega`,
      payment_method_id: 'bolbradesco', // Boleto Bradesco
      payer: {
        email: payerEmail,
        first_name: payerName?.split(' ')[0] || 'Cliente',
        last_name: payerName?.split(' ').slice(1).join(' ') || '',
        identification: {
          type: 'CPF',
          number: payerCpf?.replace(/\D/g, '') || ''
        },
        address: payerAddress ? {
          zip_code: payerAddress.zipcode?.replace(/\D/g, ''),
          street_name: payerAddress.street,
          street_number: payerAddress.number,
          neighborhood: payerAddress.neighborhood,
          city: payerAddress.city,
          federal_unit: payerAddress.state
        } : undefined
      },
      external_reference: orderId.toString(),
      notification_url: `${process.env.API_URL}/api/checkout/webhook`,
    };

    const result = await payment.create({ body: paymentData });

    return {
      success: true,
      paymentId: result.id,
      status: result.status,
      statusDetail: result.status_detail,
      boletoUrl: result.transaction_details?.external_resource_url,
      barcode: result.barcode?.content,
      expirationDate: result.date_of_expiration,
    };
  } catch (error) {
    console.error('Erro ao criar boleto:', error);
    throw new Error(error.message || 'Erro ao gerar boleto');
  }
}

/**
 * Consultar status do pagamento
 */
async function getPaymentStatus(paymentId) {
  try {
    const result = await payment.get({ id: paymentId });

    return {
      success: true,
      paymentId: result.id,
      status: result.status,
      statusDetail: result.status_detail,
      amount: result.transaction_amount,
      paidAmount: result.transaction_details?.total_paid_amount,
      netAmount: result.transaction_details?.net_received_amount,
    };
  } catch (error) {
    console.error('Erro ao consultar pagamento:', error);
    throw new Error(error.message || 'Erro ao consultar pagamento');
  }
}

/**
 * Criar preferência de pagamento (Checkout Pro - redirect)
 */
async function createPreference(data) {
  const { orderId, orderNumber, items, payerEmail, backUrls } = data;

  try {
    const preferenceData = {
      items: items.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        picture_url: item.imageUrl,
        quantity: 1,
        unit_price: item.price,
        currency_id: 'BRL'
      })),
      payer: {
        email: payerEmail
      },
      external_reference: orderId.toString(),
      back_urls: backUrls || {
        success: `${process.env.APP_URL}/checkout/success`,
        failure: `${process.env.APP_URL}/checkout/failure`,
        pending: `${process.env.APP_URL}/checkout/pending`
      },
      auto_return: 'approved',
      notification_url: `${process.env.API_URL}/api/checkout/webhook`,
      statement_descriptor: 'APEGADESAPEGA',
    };

    const result = await preference.create({ body: preferenceData });

    return {
      success: true,
      preferenceId: result.id,
      initPoint: result.init_point, // URL para checkout
      sandboxInitPoint: result.sandbox_init_point,
    };
  } catch (error) {
    console.error('Erro ao criar preferência:', error);
    throw new Error(error.message || 'Erro ao criar preferência de pagamento');
  }
}

/**
 * Processar webhook de notificação
 */
async function processWebhook(body) {
  const { type, data } = body;

  if (type === 'payment') {
    const paymentInfo = await getPaymentStatus(data.id);
    return {
      type: 'payment',
      paymentId: data.id,
      ...paymentInfo
    };
  }

  return { type, data };
}

/**
 * Mapear status do Mercado Pago para status interno
 */
function mapPaymentStatus(mpStatus) {
  const statusMap = {
    'approved': 'paid',
    'pending': 'pending_payment',
    'in_process': 'processing',
    'rejected': 'payment_failed',
    'refunded': 'refunded',
    'cancelled': 'cancelled',
    'charged_back': 'chargeback'
  };

  return statusMap[mpStatus] || 'unknown';
}

module.exports = {
  createPixPayment,
  createCardPayment,
  createBoletoPayment,
  getPaymentStatus,
  createPreference,
  processWebhook,
  mapPaymentStatus
};
