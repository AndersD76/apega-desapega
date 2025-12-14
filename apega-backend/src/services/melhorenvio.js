/**
 * Serviço de integração com Melhor Envio
 * Documentação: https://docs.melhorenvio.com.br/
 *
 * O Melhor Envio conecta com: Correios, Jadlog, Azul Cargo, LATAM Cargo, Via Brasil, etc.
 */

const axios = require('axios');

// Configuração da API
const API_URL = process.env.MELHORENVIO_SANDBOX === 'true'
  ? 'https://sandbox.melhorenvio.com.br/api/v2'
  : 'https://melhorenvio.com.br/api/v2';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.MELHORENVIO_TOKEN}`,
    'User-Agent': 'ApegaDesapega (contato@apegadesapega.com.br)'
  }
});

// CEP de origem padrão (Passo Fundo - RS)
const DEFAULT_ORIGIN_ZIPCODE = '99010000';

/**
 * Calcular frete para um produto
 * @param {Object} data - Dados para cálculo
 * @param {string} data.toZipcode - CEP de destino
 * @param {string} data.fromZipcode - CEP de origem (opcional)
 * @param {Object} data.product - Dados do produto
 */
async function calculateShipping(data) {
  const { toZipcode, fromZipcode, product } = data;

  try {
    // Dimensões padrão para roupas (em cm e kg)
    const dimensions = product.dimensions || {
      width: 20,
      height: 5,
      length: 30,
      weight: 0.3
    };

    const response = await api.post('/me/shipment/calculate', {
      from: {
        postal_code: fromZipcode?.replace(/\D/g, '') || DEFAULT_ORIGIN_ZIPCODE
      },
      to: {
        postal_code: toZipcode.replace(/\D/g, '')
      },
      products: [{
        id: product.id || '1',
        width: dimensions.width,
        height: dimensions.height,
        length: dimensions.length,
        weight: dimensions.weight,
        insurance_value: product.price || 50,
        quantity: 1
      }],
      options: {
        insurance_value: product.price || 50,
        receipt: false,
        own_hand: false
      },
      services: '' // Retorna todos os serviços disponíveis
    });

    // Filtrar e formatar resultados
    const shippingOptions = response.data
      .filter(option => !option.error)
      .map(option => ({
        id: option.id,
        name: option.name,
        company: option.company?.name || option.name,
        companyLogo: option.company?.picture || null,
        price: parseFloat(option.custom_price || option.price),
        deliveryTime: option.custom_delivery_time || option.delivery_time,
        deliveryRange: {
          min: option.delivery_range?.min || option.delivery_time,
          max: option.delivery_range?.max || option.delivery_time + 3
        },
        packageFormat: option.packages?.[0]?.format || 'box',
        dimensions: option.packages?.[0]?.dimensions || dimensions
      }))
      .sort((a, b) => a.price - b.price);

    return {
      success: true,
      options: shippingOptions,
      cheapest: shippingOptions[0] || null,
      fastest: [...shippingOptions].sort((a, b) => a.deliveryTime - b.deliveryTime)[0] || null
    };
  } catch (error) {
    console.error('Erro ao calcular frete:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Erro ao calcular frete');
  }
}

/**
 * Adicionar envio ao carrinho do Melhor Envio
 */
async function addToCart(data) {
  const {
    serviceId,
    fromAddress,
    toAddress,
    product,
    orderId,
    invoice
  } = data;

  try {
    const response = await api.post('/me/cart', {
      service: serviceId,
      agency: null, // Coleta em casa
      from: {
        name: fromAddress.name,
        phone: fromAddress.phone?.replace(/\D/g, ''),
        email: fromAddress.email,
        document: fromAddress.cpf?.replace(/\D/g, ''),
        company_document: null,
        state_register: null,
        address: fromAddress.street,
        complement: fromAddress.complement || '',
        number: fromAddress.number,
        district: fromAddress.neighborhood,
        city: fromAddress.city,
        country_id: 'BR',
        postal_code: fromAddress.zipcode?.replace(/\D/g, ''),
        note: ''
      },
      to: {
        name: toAddress.name,
        phone: toAddress.phone?.replace(/\D/g, ''),
        email: toAddress.email,
        document: toAddress.cpf?.replace(/\D/g, ''),
        company_document: null,
        state_register: null,
        address: toAddress.street,
        complement: toAddress.complement || '',
        number: toAddress.number,
        district: toAddress.neighborhood,
        city: toAddress.city,
        country_id: 'BR',
        postal_code: toAddress.zipcode?.replace(/\D/g, ''),
        note: ''
      },
      products: [{
        name: product.title,
        quantity: 1,
        unitary_value: product.price
      }],
      volumes: [{
        width: product.dimensions?.width || 20,
        height: product.dimensions?.height || 5,
        length: product.dimensions?.length || 30,
        weight: product.dimensions?.weight || 0.3
      }],
      options: {
        insurance_value: product.price,
        receipt: false,
        own_hand: false,
        reverse: false,
        non_commercial: true,
        invoice: invoice || null,
        platform: 'ApegaDesapega',
        tags: [{
          tag: `Pedido #${orderId}`,
          url: null
        }]
      }
    });

    return {
      success: true,
      cartId: response.data.id,
      protocol: response.data.protocol,
      price: response.data.price
    };
  } catch (error) {
    console.error('Erro ao adicionar ao carrinho:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Erro ao adicionar envio');
  }
}

/**
 * Finalizar compra e gerar etiqueta
 */
async function checkout(cartIds) {
  try {
    const response = await api.post('/me/shipment/checkout', {
      orders: cartIds
    });

    return {
      success: true,
      purchases: response.data.purchase?.map(p => ({
        id: p.id,
        protocol: p.protocol,
        status: p.status,
        price: p.price
      })) || []
    };
  } catch (error) {
    console.error('Erro no checkout:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Erro ao finalizar compra');
  }
}

/**
 * Gerar etiqueta de envio
 */
async function generateLabel(shipmentIds) {
  try {
    const response = await api.post('/me/shipment/generate', {
      orders: shipmentIds
    });

    return {
      success: true,
      message: 'Etiquetas sendo geradas'
    };
  } catch (error) {
    console.error('Erro ao gerar etiqueta:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Erro ao gerar etiqueta');
  }
}

/**
 * Imprimir etiqueta (obter PDF)
 */
async function printLabel(shipmentIds) {
  try {
    const response = await api.post('/me/shipment/print', {
      mode: 'public', // 'public' retorna URL, 'private' retorna base64
      orders: shipmentIds
    });

    return {
      success: true,
      url: response.data.url
    };
  } catch (error) {
    console.error('Erro ao imprimir etiqueta:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Erro ao imprimir etiqueta');
  }
}

/**
 * Rastrear envio
 */
async function trackShipment(trackingCode) {
  try {
    const response = await api.get(`/me/shipment/tracking`, {
      params: {
        orders: trackingCode
      }
    });

    const tracking = response.data[trackingCode];

    return {
      success: true,
      trackingCode,
      events: tracking?.tracking?.map(event => ({
        status: event.status,
        message: event.message,
        date: event.date,
        location: event.city ? `${event.city}/${event.state}` : null
      })) || [],
      currentStatus: tracking?.status || 'unknown',
      deliveredAt: tracking?.delivered_at || null
    };
  } catch (error) {
    console.error('Erro ao rastrear:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Erro ao rastrear envio');
  }
}

/**
 * Cancelar envio
 */
async function cancelShipment(shipmentIds) {
  try {
    const response = await api.post('/me/shipment/cancel', {
      orders: shipmentIds
    });

    return {
      success: true,
      cancelled: response.data
    };
  } catch (error) {
    console.error('Erro ao cancelar:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Erro ao cancelar envio');
  }
}

/**
 * Consultar saldo na carteira
 */
async function getBalance() {
  try {
    const response = await api.get('/me/balance');

    return {
      success: true,
      balance: parseFloat(response.data.balance)
    };
  } catch (error) {
    console.error('Erro ao consultar saldo:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Erro ao consultar saldo');
  }
}

/**
 * Listar agências para postagem
 */
async function listAgencies(zipcode, companyId = null) {
  try {
    const params = {
      postal_code: zipcode.replace(/\D/g, '')
    };

    if (companyId) {
      params.company = companyId;
    }

    const response = await api.get('/me/shipment/agencies', { params });

    return {
      success: true,
      agencies: response.data.map(agency => ({
        id: agency.id,
        name: agency.name,
        company: agency.company?.name,
        address: agency.address,
        city: agency.city,
        state: agency.state,
        zipcode: agency.postal_code,
        phone: agency.phone
      }))
    };
  } catch (error) {
    console.error('Erro ao listar agências:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Erro ao listar agências');
  }
}

module.exports = {
  calculateShipping,
  addToCart,
  checkout,
  generateLabel,
  printLabel,
  trackShipment,
  cancelShipment,
  getBalance,
  listAgencies
};
