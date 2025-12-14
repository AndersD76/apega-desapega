-- Migração: Adicionar campos de pagamento e envio
-- Data: 2024-12-13

-- Adicionar campo CPF na tabela users
ALTER TABLE users ADD COLUMN IF NOT EXISTS cpf VARCHAR(14);

-- Adicionar campos de envio na tabela orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_melhorenvio_id VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_service_id INTEGER;

-- Adicionar campo name na tabela addresses (label)
ALTER TABLE addresses ADD COLUMN IF NOT EXISTS name VARCHAR(50);

-- Criar índice para shipping_melhorenvio_id
CREATE INDEX IF NOT EXISTS idx_orders_shipping_melhorenvio ON orders(shipping_melhorenvio_id);

-- Comentários
COMMENT ON COLUMN users.cpf IS 'CPF do usuário para envios';
COMMENT ON COLUMN orders.shipping_melhorenvio_id IS 'ID do envio no Melhor Envio';
COMMENT ON COLUMN orders.shipping_service_id IS 'ID do serviço de frete selecionado';
