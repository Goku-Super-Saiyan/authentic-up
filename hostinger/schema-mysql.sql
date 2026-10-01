-- Authentic UP database for Hostinger (MySQL / MariaDB).
-- hPanel > Databases > phpMyAdmin > select the database > Import this file (or paste it in the SQL tab).
-- Same tables as supabase/schema.sql. Only the server (api/enquiry.php) writes to it.

CREATE TABLE IF NOT EXISTS makers (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  district VARCHAR(60) NOT NULL,
  craft VARCHAR(80) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(160),
  gi_tag BOOLEAN NOT NULL DEFAULT FALSE,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS products (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(160) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  maker_id INT UNSIGNED NULL,
  district VARCHAR(60) NOT NULL,
  category VARCHAR(80) NOT NULL,
  price_inr INT UNSIGNED NOT NULL,
  stock INT UNSIGNED NOT NULL DEFAULT 1,
  spec TEXT,
  story TEXT,
  details JSON,
  tags JSON,
  photos JSON,              -- paths under public_html/photos/
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY products_category_idx (category, active),
  KEY products_district_idx (district, active),
  CONSTRAINT products_maker_fk FOREIGN KEY (maker_id) REFERENCES makers(id) ON DELETE SET NULL
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS enquiries (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  reference VARCHAR(20) NOT NULL UNIQUE,   -- IUP-123456, shown to the buyer
  kind VARCHAR(60) NOT NULL,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL,
  phone VARCHAR(20),
  craft VARCHAR(80),
  district VARCHAR(60),
  quantity VARCHAR(120),
  budget VARCHAR(40),
  message TEXT NOT NULL,
  status ENUM('new', 'in_progress', 'closed') NOT NULL DEFAULT 'new',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS orders (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  reference VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(160),
  address TEXT NOT NULL,
  pincode VARCHAR(6) NOT NULL,
  total_inr INT UNSIGNED NOT NULL,
  status ENUM('pending', 'paid', 'packed', 'shipped', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending',
  payment_ref VARCHAR(80),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_items (
  order_id INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NOT NULL,
  qty INT UNSIGNED NOT NULL,
  price_inr INT UNSIGNED NOT NULL,
  PRIMARY KEY (order_id, product_id),
  CONSTRAINT order_items_order_fk FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT order_items_product_fk FOREIGN KEY (product_id) REFERENCES products(id)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
