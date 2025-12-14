# Documentação da API - Marketplace Brechó

Base URL: `http://localhost:3001/api`

## Autenticação

A maioria das rotas requer autenticação via JWT Bearer Token.

```
Authorization: Bearer SEU_TOKEN_AQUI
```

## Índice

1. [Autenticação](#autenticação)
2. [Peças](#peças)
3. [Vendas](#vendas)
4. [Consignadores](#consignadores)
5. [Admin](#admin)

---

## 1. Autenticação

### POST /auth/register
Criar novo usuário

**Body:**
```json
{
  "email": "usuario@email.com",
  "password": "senha123",
  "name": "Nome Completo",
  "phone": "(99) 99999-9999",
  "cpf": "999.999.999-99",
  "role": "CLIENTE" // ou "CONSIGNADOR", "ADMIN"
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Usuário criado com sucesso",
  "user": {
    "id": "uuid",
    "email": "usuario@email.com",
    "name": "Nome Completo",
    "role": "CLIENTE",
    "createdAt": "2025-10-30T..."
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### POST /auth/login
Fazer login

**Body:**
```json
{
  "email": "usuario@email.com",
  "password": "senha123"
}
```

**Response 200:**
```json
{
  "success": true,
  "user": { ... },
  "token": "...",
  "refreshToken": "..."
}
```

### POST /auth/refresh-token
Renovar token expirado

**Body:**
```json
{
  "refreshToken": "seu_refresh_token"
}
```

### POST /auth/forgot-password
Solicitar recuperação de senha

**Body:**
```json
{
  "email": "usuario@email.com"
}
```

### POST /auth/reset-password
Redefinir senha

**Body:**
```json
{
  "token": "token_recebido_por_email",
  "newPassword": "nova_senha_123"
}
```

---

## 2. Peças

### GET /pecas
Listar peças aprovadas (marketplace público)

**Query Params:**
```
?categoria=Vestidos
&marca=Zara
&tamanho=M
&genero=Feminino
&estado=USADO_EXCELENTE
&precoMin=50
&precoMax=200
&search=azul
&page=1
&limit=20
&sortBy=createdAt
&sortOrder=desc
```

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "titulo": "Vestido Longo Azul",
      "descricao": "Lindo vestido...",
      "marca": "Zara",
      "categoria": "Vestidos",
      "tamanho": "M",
      "genero": "Feminino",
      "estado": "USADO_EXCELENTE",
      "preco": "89.90",
      "precoOriginal": "199.90",
      "fotos": ["url1.jpg", "url2.jpg"],
      "medidas": {
        "busto": 90,
        "cintura": 70,
        "comprimento": 120
      },
      "consignador": {
        "user": {
          "name": "Maria Silva"
        }
      },
      "createdAt": "2025-10-30T..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### GET /pecas/:id
Obter detalhes de uma peça

**Response 200:**
```json
{
  "success": true,
  "data": { ... }
}
```

### GET /pecas/categoria/:categoria
Listar peças por categoria

### GET /pecas/marca/:marca
Listar peças por marca

### POST /pecas 🔒
Criar nova peça (requer autenticação)

**Headers:**
```
Authorization: Bearer TOKEN
Content-Type: multipart/form-data
```

**Body (form-data):**
```
images: [arquivo1.jpg, arquivo2.jpg, arquivo3.jpg]
titulo: Vestido Longo Azul
descricao: Vestido azul marinho, usado apenas uma vez
marca: Zara
categoria: Vestidos
tamanho: M
genero: Feminino
estado: USADO_EXCELENTE
preco: 89.90
precoOriginal: 199.90
medidas: {"busto": 90, "cintura": 70, "quadril": 95}
autenticidadeVerificada: false
```

**Response 201:**
```json
{
  "success": true,
  "message": "Peça criada e aguardando aprovação",
  "data": { ... }
}
```

**Nota:**
- Admin: peça é aprovada automaticamente
- Consignador: peça vai para aprovação

### PUT /pecas/:id 🔒
Atualizar peça (apenas dono ou admin)

**Body:**
```json
{
  "titulo": "Novo título",
  "preco": 79.90
}
```

### DELETE /pecas/:id 🔒
Deletar peça (apenas dono ou admin)

**Response 200:**
```json
{
  "success": true,
  "message": "Peça removida com sucesso"
}
```

### GET /pecas/minhas/pecas 🔒
Listar minhas peças (consignador)

**Response 200:**
```json
{
  "success": true,
  "data": [...]
}
```

### PATCH /pecas/:id/aprovar 🔒 (Admin)
Aprovar peça pendente

**Response 200:**
```json
{
  "success": true,
  "message": "Peça aprovada com sucesso",
  "data": { ... }
}
```

### PATCH /pecas/:id/rejeitar 🔒 (Admin)
Rejeitar peça

**Body:**
```json
{
  "motivo": "Fotos com baixa qualidade. Por favor, refazer."
}
```

### GET /pecas/admin/pendentes 🔒 (Admin)
Listar peças pendentes de aprovação

---

## 3. Vendas

### POST /vendas 🔒
Criar nova venda (checkout)

**Status:** Em desenvolvimento

### GET /vendas/minhas-compras 🔒
Listar minhas compras

**Status:** Em desenvolvimento

### GET /vendas/:id 🔒
Detalhes de uma venda

**Status:** Em desenvolvimento

---

## 4. Consignadores

### GET /consignadores/dashboard 🔒
Dashboard do consignador

**Response:**
```json
{
  "saldoDisponivel": 450.00,
  "pecasAtivas": 12,
  "pecasVendidas": 8,
  "vendasPendentes": 2,
  "totalVendido": 1200.00
}
```

**Status:** Em desenvolvimento

### GET /consignadores/saldo 🔒
Saldo e extrato

**Status:** Em desenvolvimento

### POST /consignadores/saques 🔒
Solicitar saque

**Body:**
```json
{
  "valor": 450.00,
  "pixKey": "email@exemplo.com"
}
```

**Status:** Em desenvolvimento

### GET /consignadores/saques 🔒
Listar meus saques

**Status:** Em desenvolvimento

### GET /consignadores/vendas 🔒
Histórico de vendas

**Status:** Em desenvolvimento

---

## 5. Admin

### GET /admin/dashboard 🔒
Dashboard administrativo

**Response:**
```json
{
  "vendasHoje": 15,
  "faturamentoMes": 12500.00,
  "pecasPendentes": 8,
  "consignadoresAtivos": 25,
  "saquesPendentes": 3
}
```

**Status:** Em desenvolvimento

### PATCH /admin/consignadores/:id/aprovar 🔒
Aprovar consignador novo

**Status:** Em desenvolvimento

### GET /admin/saques 🔒
Gerenciar saques

**Status:** Em desenvolvimento

### GET /admin/relatorios/vendas 🔒
Relatório de vendas

**Status:** Em desenvolvimento

---

## Códigos de Status HTTP

- `200` - OK
- `201` - Created
- `400` - Bad Request (validação falhou)
- `401` - Unauthorized (não autenticado)
- `403` - Forbidden (sem permissão)
- `404` - Not Found
- `500` - Internal Server Error
- `501` - Not Implemented (em desenvolvimento)

## Erros

Formato padrão de erro:

```json
{
  "error": true,
  "message": "Descrição do erro"
}
```

## Estados de Peça

- `PENDENTE_APROVACAO` - Aguardando aprovação do admin
- `APROVADA` - Peça disponível no marketplace
- `VENDIDA` - Peça já foi vendida
- `REJEITADA` - Peça rejeitada pelo admin
- `REMOVIDA` - Peça removida pelo dono

## Estados da Peça (Condição)

- `NOVO_COM_ETIQUETA` - Nunca usado, com etiqueta
- `NOVO_SEM_ETIQUETA` - Nunca usado, sem etiqueta
- `USADO_EXCELENTE` - Usado, estado excelente
- `USADO_BOM` - Usado, estado bom
- `USADO_MARCAS` - Usado com marcas de uso

## Roles de Usuário

- `ADMIN` - Administrador (controle total)
- `CONSIGNADOR` - Pode cadastrar peças para venda
- `CLIENTE` - Pode comprar

## Testando a API

### Usando cURL

```bash
# Registro
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@email.com","password":"123456","name":"Teste"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@email.com","password":"123456"}'

# Listar peças
curl http://localhost:3001/api/pecas
```

### Usando Postman/Insomnia

1. Importe a coleção (criar arquivo JSON com todas as rotas)
2. Configure o ambiente com a `baseURL`
3. Teste cada endpoint

### Usando Thunder Client (VSCode)

1. Instale a extensão Thunder Client
2. Crie um novo request
3. Configure headers e body
4. Envie!
