const express = require('express');
const multer = require('multer');
const { sql } = require('../config/database');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { uploadToCloudinary, generateImageVariations } = require('../config/cloudinary');
const { trackEvent, EventTypes, EventCategories } = require('../services/analytics');

const router = express.Router();

const resolveCategoryId = async (categoryId, categoryValue) => {
  if (categoryId) {
    return categoryId;
  }
  if (!categoryValue) {
    return null;
  }
  const categories = await sql`
    SELECT id
    FROM categories
    WHERE (slug = ${categoryValue} OR name = ${categoryValue})
      AND is_active = true
    LIMIT 1
  `;
  return categories[0]?.id || null;
};


// ConfiguraÃ§Ã£o do multer para upload em memÃ³ria (para Cloudinary)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo nÃ£o permitido. Use JPG, PNG ou WEBP.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Listar produtos (com filtros)
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      condition,
      size,
      brand,
      city,
      sort = 'recent',
      page = 1,
      limit = 20
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);
    const userId = req.user?.id || null;

    // Construir query base
    let products;

    // Query simples sem filtros dinâmicos complexos
    // Premium products appear first (destaque nos resultados)
    if (userId) {
      products = await sql`
        SELECT
          p.*,
          u.name as seller_name,
          u.avatar_url as seller_avatar,
          u.rating as seller_rating,
          u.city as seller_city,
          u.subscription_type as seller_subscription_type,
          CASE WHEN u.subscription_type IN ('premium', 'premium_plus') THEN true ELSE false END as seller_is_premium,
          c.name as category_name,
          (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as image_url,
          EXISTS(SELECT 1 FROM favorites WHERE user_id = ${userId} AND product_id = p.id) as is_favorited
        FROM products p
        JOIN users u ON p.seller_id = u.id
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.status = 'active'
        ORDER BY
          CASE WHEN u.subscription_type IN ('premium', 'premium_plus') THEN 0 ELSE 1 END,
          p.created_at DESC
        LIMIT ${limitNum}
        OFFSET ${offset}
      `;
    } else {
      products = await sql`
        SELECT
          p.*,
          u.name as seller_name,
          u.avatar_url as seller_avatar,
          u.rating as seller_rating,
          u.city as seller_city,
          u.subscription_type as seller_subscription_type,
          CASE WHEN u.subscription_type IN ('premium', 'premium_plus') THEN true ELSE false END as seller_is_premium,
          c.name as category_name,
          (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as image_url,
          false as is_favorited
        FROM products p
        JOIN users u ON p.seller_id = u.id
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.status = 'active'
        ORDER BY
          CASE WHEN u.subscription_type IN ('premium', 'premium_plus') THEN 0 ELSE 1 END,
          p.created_at DESC
        LIMIT ${limitNum}
        OFFSET ${offset}
      `;
    }

    // Aplicar filtros em JavaScript se necessário
    let filteredProducts = products;

    if (category && category !== 'all') {
      filteredProducts = filteredProducts.filter(p => p.category_name?.toLowerCase() === category.toLowerCase() || p.category_id === category);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredProducts = filteredProducts.filter(p =>
        p.title?.toLowerCase().includes(searchLower) ||
        p.brand?.toLowerCase().includes(searchLower)
      );
    }

    if (condition && condition !== 'all') {
      filteredProducts = filteredProducts.filter(p => p.condition === condition);
    }

    if (minPrice) {
      filteredProducts = filteredProducts.filter(p => p.price >= parseFloat(minPrice));
    }

    if (maxPrice) {
      filteredProducts = filteredProducts.filter(p => p.price <= parseFloat(maxPrice));
    }

    // Ordenar
    if (sort === 'price_asc') {
      filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sort === 'price_desc') {
      filteredProducts.sort((a, b) => b.price - a.price);
    } else if (sort === 'popular') {
      filteredProducts.sort((a, b) => (b.views || 0) - (a.views || 0));
    }

    // Contar total
    const countResult = await sql`
      SELECT COUNT(*) as total
      FROM products p
      WHERE p.status = 'active'
    `;

    res.json({
      success: true,
      products: filteredProducts,
      pagination: {
        page: parseInt(page),
        limit: limitNum,
        total: parseInt(countResult[0]?.total || 0),
        pages: Math.ceil((countResult[0]?.total || 0) / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Meus produtos (deve vir antes de /:id)
router.get('/my', authenticate, async (req, res, next) => {
  try {
    const { status } = req.query;

    let products;

    if (status) {
      products = await sql`
        SELECT p.*,
          (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as image_url,
          (SELECT COUNT(*) FROM favorites WHERE product_id = p.id)::int as favorites,
          COALESCE(p.views, 0) as views
        FROM products p
        WHERE p.seller_id = ${req.user.id} AND p.status = ${status}
        ORDER BY p.created_at DESC
      `;
    } else {
      products = await sql`
        SELECT p.*,
          (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as image_url,
          (SELECT COUNT(*) FROM favorites WHERE product_id = p.id)::int as favorites,
          COALESCE(p.views, 0) as views
        FROM products p
        WHERE p.seller_id = ${req.user.id} AND p.status != 'deleted'
        ORDER BY p.created_at DESC
      `;
    }

    res.json({ success: true, products });
  } catch (error) {
    next(error);
  }
});

// Upload Ãºnico de imagem (deve vir antes de /:id)
router.post('/upload', authenticate, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: true, message: 'Nenhuma imagem enviada' });
    }

    // Upload para Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, 'products');

    res.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id
    });
  } catch (error) {
    next(error);
  }
});

// Obter produto por ID
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Incrementar visualizacoes
    await sql`UPDATE products SET views = views + 1 WHERE id = ${id}`;

    // Track visualizacao
    trackEvent({
      eventType: EventTypes.PRODUCT_VIEW,
      eventCategory: EventCategories.PRODUCT,
      userId: req.user?.id || null,
      productId: id,
      req,
    });

    const products = await sql`
      SELECT
        p.*,
        u.id as seller_id,
        u.name as seller_name,
        u.avatar_url as seller_avatar,
        u.rating as seller_rating,
        u.total_reviews as seller_reviews,
        u.total_sales as seller_sales,
        u.city as seller_city,
        u.store_name,
        c.name as category_name,
        ${req.user ? sql`EXISTS(SELECT 1 FROM favorites WHERE user_id = ${req.user.id} AND product_id = p.id)` : sql`false`} as is_favorited
      FROM products p
      JOIN users u ON p.seller_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ${id}
    `;

    if (products.length === 0) {
      return res.status(404).json({ error: true, message: 'Produto nÃ£o encontrado' });
    }

    // Buscar todas as imagens
    const images = await sql`
      SELECT * FROM product_images WHERE product_id = ${id} ORDER BY sort_order
    `;

    const product = {
      ...products[0],
      images
    };

    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
});

// Criar produto
// O vendedor informa o preÃ§o que deseja receber
// O preÃ§o exibido para compradores inclui a comissÃ£o (5%)
router.post('/', authenticate, async (req, res, next) => {
  try {
    const {
      title,
      description,
      brand,
      size,
      color,
      condition,
      price, // PreÃ§o que o vendedor quer receber
      original_price,
      category_id,
      category,
      is_premium
    } = req.body;

    // ValidaÃ§Ãµes
    if (!title || !condition || !price) {
      return res.status(400).json({
        error: true,
        message: 'TÃ­tulo, condiÃ§Ã£o e preÃ§o sÃ£o obrigatÃ³rios'
      });
    }

    // Verificar limite de produtos para usuÃ¡rio free
    if (req.user.subscription_type === 'free') {
      const count = await sql`
        SELECT COUNT(*) as total FROM products
        WHERE seller_id = ${req.user.id} AND status = 'active'
      `;

      if (parseInt(count[0].total) >= 5) {
        return res.status(403).json({
          error: true,
          message: 'Limite de 5 produtos atingido. Assine o Premium para anÃºncios ilimitados.'
        });
      }
    }

    // Buscar cidade do usuÃ¡rio e tipo de assinatura
    const userData = await sql`SELECT city, state, subscription_type FROM users WHERE id = ${req.user.id}`;

    // Calcular preço com comissão
    // Taxa: 10% para Premium, 20% para Free
    const sellerPrice = parseFloat(price);
    const isPremiumUser = userData[0]?.subscription_type === 'premium' || userData[0]?.subscription_type === 'premium_plus';
    const commissionRate = isPremiumUser ? 0.10 : 0.20; // 10% premium, 20% free
    const displayPrice = Math.ceil(sellerPrice * (1 + commissionRate) * 100) / 100; // Preço final = valor do vendedor + taxa

    const resolvedCategoryId = await resolveCategoryId(category_id, category);
    if (category && !resolvedCategoryId) {
      return res.status(400).json({
        error: true,
        message: 'Categoria invalida'
      });
    }

    const newProduct = await sql`
      INSERT INTO products (
        seller_id, category_id, title, description, brand, size, color,
        condition, price, original_price, is_premium, city, state
      )
      VALUES (
        ${req.user.id},
        ${resolvedCategoryId || null},
        ${title},
        ${description || null},
        ${brand || null},
        ${size || null},
        ${color || null},
        ${condition},
        ${displayPrice},
        ${original_price ? parseFloat(original_price) : null},
        ${is_premium || false},
        ${userData[0]?.city || null},
        ${userData[0]?.state || null}
      )
      RETURNING *
    `;

    // Track criacao de produto
    trackEvent({
      eventType: EventTypes.PRODUCT_CREATE,
      eventCategory: EventCategories.PRODUCT,
      userId: req.user.id,
      productId: newProduct[0].id,
      metadata: { title, price: displayPrice, category },
      req,
    });

    res.status(201).json({
      success: true,
      message: 'Produto criado com sucesso',
      product: newProduct[0],
      seller_receives: sellerPrice,
      commission_rate: commissionRate * 100
    });
  } catch (error) {
    next(error);
  }
});

// Atualizar produto
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      brand,
      size,
      color,
      condition,
      price,
      original_price,
      category_id,
      category,
      status
    } = req.body;

    // Verificar se o produto pertence ao usuario
    const existing = await sql`
      SELECT seller_id FROM products WHERE id = ${id}
    `;

    if (existing.length === 0) {
      return res.status(404).json({ error: true, message: 'Produto nao encontrado' });
    }

    if (existing[0].seller_id !== req.user.id) {
      return res.status(403).json({ error: true, message: 'Sem permissao para editar este produto' });
    }

    const resolvedCategoryId = await resolveCategoryId(category_id, category);
    if (category && !resolvedCategoryId) {
      return res.status(400).json({ error: true, message: 'Categoria invalida' });
    }

    // Se o preco foi informado, aplicar comissao
    let displayPrice = null;
    if (price) {
      const userData = await sql`SELECT subscription_type FROM users WHERE id = ${req.user.id}`;
      const isPremiumUser = userData[0]?.subscription_type === 'premium' || userData[0]?.subscription_type === 'premium_plus';
      const commissionRate = isPremiumUser ? 0.10 : 0.20; // 10% premium, 20% free
      displayPrice = Math.ceil(parseFloat(price) * (1 + commissionRate) * 100) / 100;
    }

    const updated = await sql`
      UPDATE products
      SET
        title = COALESCE(${title}, title),
        description = COALESCE(${description}, description),
        brand = COALESCE(${brand}, brand),
        size = COALESCE(${size}, size),
        color = COALESCE(${color}, color),
        condition = COALESCE(${condition}, condition),
        price = COALESCE(${displayPrice}, price),
        original_price = COALESCE(${original_price ? parseFloat(original_price) : null}, original_price),
        category_id = COALESCE(${resolvedCategoryId}, category_id),
        status = COALESCE(${status}, status),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    res.json({ success: true, product: updated[0] });
  } catch (error) {
    next(error);
  }
});

// Deletar produto
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await sql`
      SELECT seller_id FROM products WHERE id = ${id}
    `;

    if (existing.length === 0) {
      return res.status(404).json({ error: true, message: 'Produto nÃ£o encontrado' });
    }

    if (existing[0].seller_id !== req.user.id) {
      return res.status(403).json({ error: true, message: 'Sem permissÃ£o' });
    }

    await sql`UPDATE products SET status = 'deleted' WHERE id = ${id}`;

    res.json({ success: true, message: 'Produto removido' });
  } catch (error) {
    next(error);
  }
});

// Upload de imagens do produto
router.post('/:id/images', authenticate, upload.array('images', 10), async (req, res, next) => {
  try {
    const { id } = req.params;
    const autoGenerate = req.query.autoGenerate !== 'false'; // Por padrão, gera variações

    // Verificar se o produto pertence ao usuario
    const existing = await sql`
      SELECT seller_id FROM products WHERE id = ${id}
    `;

    if (existing.length === 0) {
      return res.status(404).json({ error: true, message: 'Produto nao encontrado' });
    }

    if (existing[0].seller_id !== req.user.id) {
      return res.status(403).json({ error: true, message: 'Sem permissao' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: true, message: 'Nenhuma imagem enviada' });
    }

    // Verificar quantas imagens ja existem
    const existingImages = await sql`
      SELECT COUNT(*) as count FROM product_images WHERE product_id = ${id}
    `;
    const existingCount = parseInt(existingImages[0].count);

    // Upload para Cloudinary e inserir no banco
    const uploadedImages = [];
    let sortOrder = existingCount;

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];

      // Upload para Cloudinary
      const cloudinaryResult = await uploadToCloudinary(file.buffer, 'products');
      const imageUrl = cloudinaryResult.secure_url;
      const isPrimary = existingCount === 0 && i === 0;

      const result = await sql`
        INSERT INTO product_images (product_id, image_url, sort_order, is_primary)
        VALUES (${id}, ${imageUrl}, ${sortOrder}, ${isPrimary})
        RETURNING *
      `;
      uploadedImages.push(result[0]);
      sortOrder++;

      // Para a primeira imagem do produto, gerar 2 variacoes automaticamente
      if (existingCount === 0 && i === 0 && autoGenerate) {
        try {
          const variations = generateImageVariations(cloudinaryResult.public_id);

          // Salvar apenas 2 variacoes (fundo removido e zoom central)
          for (let v = 0; v < 2; v++) {
            const varResult = await sql`
              INSERT INTO product_images (product_id, image_url, sort_order, is_primary)
              VALUES (${id}, ${variations[v]}, ${sortOrder}, false)
              RETURNING *
            `;
            uploadedImages.push(varResult[0]);
            sortOrder++;
          }

          console.log(`[AI] Auto-geradas 2 variacoes para produto ${id}`);
        } catch (varError) {
          console.error('Erro ao gerar variacoes:', varError);
          // Continua mesmo se falhar as variacoes
        }
      }
    }

    res.json({
      success: true,
      message: `${uploadedImages.length} imagem(s) enviada(s) com sucesso`,
      images: uploadedImages,
      autoGenerated: autoGenerate && existingCount === 0 ? 2 : 0
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;


