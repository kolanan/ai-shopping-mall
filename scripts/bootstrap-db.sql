CREATE DATABASE IF NOT EXISTS ai_shopping_mall
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE ai_shopping_mall;

CREATE TABLE IF NOT EXISTS categories (
  id BIGINT NOT NULL AUTO_INCREMENT,
  name VARCHAR(80) NOT NULL,
  slug VARCHAR(80) NOT NULL,
  display_order INT NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_categories_name (name),
  UNIQUE KEY uk_categories_slug (slug)
);

CREATE TABLE IF NOT EXISTS products (
  id BIGINT NOT NULL AUTO_INCREMENT,
  category_id BIGINT NOT NULL,
  name VARCHAR(140) NOT NULL,
  slug VARCHAR(160) NOT NULL,
  description VARCHAR(1000) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  rating DECIMAL(2,1) NOT NULL,
  badge VARCHAR(40) DEFAULT NULL,
  image_url VARCHAR(255) DEFAULT NULL,
  featured BIT(1) NOT NULL,
  stock_quantity INT NOT NULL,
  display_order INT NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_products_slug (slug),
  KEY idx_products_featured_display (featured, display_order, id),
  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories (id)
);

INSERT INTO categories (name, slug, display_order)
SELECT seed.name, seed.slug, seed.display_order
FROM (
  SELECT 'Electronics' AS name, 'electronics' AS slug, 1 AS display_order
  UNION ALL SELECT 'Kitchen', 'kitchen', 2
  UNION ALL SELECT 'Furniture', 'furniture', 3
  UNION ALL SELECT 'Home', 'home', 4
) AS seed
LEFT JOIN categories existing ON existing.slug = seed.slug
WHERE existing.id IS NULL;

INSERT INTO products (
  category_id, name, slug, description, price, rating, badge, image_url, featured, stock_quantity, display_order
)
SELECT
  seed.category_id,
  seed.name,
  seed.slug,
  seed.description,
  seed.price,
  seed.rating,
  seed.badge,
  seed.image_url,
  seed.featured,
  seed.stock_quantity,
  seed.display_order
FROM (
  SELECT
    (SELECT id FROM categories WHERE slug = 'electronics') AS category_id,
    'Aurora Wireless Headphones' AS name,
    'aurora-wireless-headphones' AS slug,
    'Noise-cancelling over-ear headphones with 40-hour battery life.' AS description,
    129.99 AS price,
    4.7 AS rating,
    'Best Seller' AS badge,
    'https://placehold.co/640x640?text=Headphones' AS image_url,
    b'1' AS featured,
    35 AS stock_quantity,
    1 AS display_order
  UNION ALL
  SELECT
    (SELECT id FROM categories WHERE slug = 'electronics'),
    'Nova Smart Display',
    'nova-smart-display',
    'A compact smart display for recipes, video calls, and bedroom automation.',
    99.00,
    4.4,
    'New Arrival',
    'https://placehold.co/640x640?text=Display',
    b'1',
    18,
    2
  UNION ALL
  SELECT
    (SELECT id FROM categories WHERE slug = 'electronics'),
    'PulseFit Sport Earbuds',
    'pulsefit-sport-earbuds',
    'Sweat-resistant wireless earbuds tuned for commuting and workouts.',
    59.90,
    4.3,
    'Hot Pick',
    'https://placehold.co/640x640?text=Earbuds',
    b'1',
    48,
    3
  UNION ALL
  SELECT
    (SELECT id FROM categories WHERE slug = 'kitchen'),
    'HomeBar Espresso Machine',
    'homebar-espresso-machine',
    'Compact coffee machine with one-touch cappuccino and latte presets.',
    249.00,
    4.6,
    'Limited Deal',
    'https://placehold.co/640x640?text=Espresso',
    b'1',
    12,
    4
  UNION ALL
  SELECT
    (SELECT id FROM categories WHERE slug = 'kitchen'),
    'CrispAir Digital Air Fryer',
    'crispair-digital-air-fryer',
    'Six-liter air fryer with quick presets for fries, wings, and vegetables.',
    139.00,
    4.5,
    'Top Rated',
    'https://placehold.co/640x640?text=Air+Fryer',
    b'1',
    22,
    5
  UNION ALL
  SELECT
    (SELECT id FROM categories WHERE slug = 'kitchen'),
    'StoneCraft Cookware Set',
    'stonecraft-cookware-set',
    'Ten-piece nonstick cookware set for induction and gas stoves.',
    179.00,
    4.4,
    'Bundle',
    'https://placehold.co/640x640?text=Cookware',
    b'0',
    16,
    6
  UNION ALL
  SELECT
    (SELECT id FROM categories WHERE slug = 'furniture'),
    'Nimbus Office Chair',
    'nimbus-office-chair',
    'Ergonomic mesh chair built for long work sessions and lumbar support.',
    189.50,
    4.5,
    'Popular Choice',
    'https://placehold.co/640x640?text=Chair',
    b'1',
    20,
    7
  UNION ALL
  SELECT
    (SELECT id FROM categories WHERE slug = 'furniture'),
    'Harbor Oak Desk',
    'harbor-oak-desk',
    'Wide work desk with cable routing, drawer storage, and oak finish.',
    299.00,
    4.6,
    'Staff Pick',
    'https://placehold.co/640x640?text=Desk',
    b'1',
    9,
    8
  UNION ALL
  SELECT
    (SELECT id FROM categories WHERE slug = 'furniture'),
    'Loft Nest Bookshelf',
    'loft-nest-bookshelf',
    'Five-tier bookshelf for living rooms, studies, and compact apartments.',
    129.00,
    4.2,
    'Value Buy',
    'https://placehold.co/640x640?text=Bookshelf',
    b'0',
    14,
    9
  UNION ALL
  SELECT
    (SELECT id FROM categories WHERE slug = 'home'),
    'GlowSoft Bedding Set',
    'glowsoft-bedding-set',
    'Four-piece breathable bedding set designed for all-season comfort.',
    79.90,
    4.8,
    'Top Rated',
    'https://placehold.co/640x640?text=Bedding',
    b'1',
    42,
    10
  UNION ALL
  SELECT
    (SELECT id FROM categories WHERE slug = 'home'),
    'Luma Floor Lamp',
    'luma-floor-lamp',
    'Warm ambient floor lamp with fabric shade and three brightness modes.',
    69.00,
    4.3,
    'Easy Match',
    'https://placehold.co/640x640?text=Lamp',
    b'0',
    31,
    11
  UNION ALL
  SELECT
    (SELECT id FROM categories WHERE slug = 'home'),
    'PureMist Aroma Diffuser',
    'puremist-aroma-diffuser',
    'Quiet essential-oil diffuser with auto shutoff and soft night lighting.',
    39.90,
    4.4,
    'Gift Idea',
    'https://placehold.co/640x640?text=Diffuser',
    b'0',
    57,
    12
) AS seed
LEFT JOIN products existing ON existing.slug = seed.slug
WHERE existing.id IS NULL;
