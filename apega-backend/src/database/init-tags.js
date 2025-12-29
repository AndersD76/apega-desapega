/**
 * Script para criar sistema de tags de produtos
 * Tags: Ano (2024, 2023...), Estilo (Vintage, Retro), Colecao (Premium, Exclusivo)
 */

const { sql } = require('../config/database');

async function initTags() {
  console.log('Criando sistema de tags...');

  try {
    // Verificar se a tabela product_tags ja existe
    const tagsExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'product_tags'
      )
    `;

    if (!tagsExists[0].exists) {
      console.log('Criando tabela product_tags...');

      // Tabela de tags
      await sql`
        CREATE TABLE product_tags (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          slug VARCHAR(50) UNIQUE NOT NULL,
          name VARCHAR(100) NOT NULL,
          category VARCHAR(30) NOT NULL,
          color VARCHAR(7) DEFAULT '#5D8A7D',
          icon VARCHAR(50),
          description TEXT,
          sort_order INT DEFAULT 0,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `;

      // Tabela de relacionamento produto-tags
      await sql`
        CREATE TABLE product_tag_relations (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          product_id UUID REFERENCES products(id) ON DELETE CASCADE,
          tag_id UUID REFERENCES product_tags(id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(product_id, tag_id)
        )
      `;

      // Indices
      await sql`CREATE INDEX idx_product_tags_category ON product_tags(category)`;
      await sql`CREATE INDEX idx_product_tags_slug ON product_tags(slug)`;
      await sql`CREATE INDEX idx_tag_relations_product ON product_tag_relations(product_id)`;
      await sql`CREATE INDEX idx_tag_relations_tag ON product_tag_relations(tag_id)`;

      console.log('Tabelas de tags criadas!');

      // Inserir tags padrao
      console.log('Inserindo tags padrao...');

      // Tags de Ano
      const years = [2024, 2023, 2022, 2021, 2020];
      for (const year of years) {
        await sql`
          INSERT INTO product_tags (slug, name, category, color, icon, sort_order)
          VALUES (${`ano-${year}`}, ${`${year}`}, 'ano', '#3B82F6', 'calendar-outline', ${2024 - year})
        `;
      }

      // Tags de Estilo
      const styles = [
        { slug: 'vintage', name: 'Vintage', color: '#8B5CF6', icon: 'time-outline' },
        { slug: 'retro', name: 'Retrô', color: '#EC4899', icon: 'musical-notes-outline' },
        { slug: 'classico', name: 'Clássico', color: '#6366F1', icon: 'ribbon-outline' },
        { slug: 'moderno', name: 'Moderno', color: '#14B8A6', icon: 'flash-outline' },
        { slug: 'streetwear', name: 'Streetwear', color: '#F97316', icon: 'footsteps-outline' },
      ];
      for (let i = 0; i < styles.length; i++) {
        const s = styles[i];
        await sql`
          INSERT INTO product_tags (slug, name, category, color, icon, sort_order)
          VALUES (${s.slug}, ${s.name}, 'estilo', ${s.color}, ${s.icon}, ${i})
        `;
      }

      // Tags de Colecao
      const collections = [
        { slug: 'premium', name: 'Premium', color: '#EAB308', icon: 'star' },
        { slug: 'exclusivo', name: 'Exclusivo', color: '#DC2626', icon: 'diamond-outline' },
        { slug: 'limitado', name: 'Edição Limitada', color: '#7C3AED', icon: 'trophy-outline' },
        { slug: 'colecionavel', name: 'Colecionável', color: '#059669', icon: 'gift-outline' },
        { slug: 'destaque', name: 'Destaque', color: '#0EA5E9', icon: 'flame-outline' },
      ];
      for (let i = 0; i < collections.length; i++) {
        const c = collections[i];
        await sql`
          INSERT INTO product_tags (slug, name, category, color, icon, sort_order)
          VALUES (${c.slug}, ${c.name}, 'colecao', ${c.color}, ${c.icon}, ${i})
        `;
      }

      // Tags de Condicao Especial
      const specials = [
        { slug: 'nunca-usado', name: 'Nunca Usado', color: '#22C55E', icon: 'checkmark-circle' },
        { slug: 'com-etiqueta', name: 'Com Etiqueta', color: '#10B981', icon: 'pricetag-outline' },
        { slug: 'pecaunica', name: 'Peça Única', color: '#F59E0B', icon: 'finger-print-outline' },
      ];
      for (let i = 0; i < specials.length; i++) {
        const sp = specials[i];
        await sql`
          INSERT INTO product_tags (slug, name, category, color, icon, sort_order)
          VALUES (${sp.slug}, ${sp.name}, 'especial', ${sp.color}, ${sp.icon}, ${i})
        `;
      }

      console.log('Tags padrao inseridas!');
    } else {
      console.log('Tabelas de tags ja existem.');
    }

    console.log('Sistema de tags pronto!');

  } catch (error) {
    console.error('Erro ao criar sistema de tags:', error);
    throw error;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  initTags()
    .then(() => {
      console.log('Tags inicializadas!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Falha ao inicializar tags:', error);
      process.exit(1);
    });
}

module.exports = { initTags };
