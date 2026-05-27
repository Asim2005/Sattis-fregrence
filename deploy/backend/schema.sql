-- ============================================================
-- SATISH PERFUME E-COMMERCE — DATABASE SCHEMA
-- ============================================================
-- HOW TO USE ON HOSTINGER / cPanel:
--   1. Create the database & user via cPanel → MySQL Databases
--   2. Open phpMyAdmin, SELECT your database from the left panel
--   3. Click Import → choose this file → Go
--   Do NOT run CREATE DATABASE here — cPanel handles that.
-- ============================================================

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    email         VARCHAR(150) NOT NULL UNIQUE,
    password      VARCHAR(255) NOT NULL,
    role          ENUM('customer','admin') DEFAULT 'customer',
    avatar        VARCHAR(255) DEFAULT NULL,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    slug        VARCHAR(100) NOT NULL UNIQUE,
    description TEXT DEFAULT NULL,
    image       VARCHAR(255) DEFAULT NULL,
    sort_order  INT DEFAULT 0,
    is_active   TINYINT(1) DEFAULT 1,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
    id                INT AUTO_INCREMENT PRIMARY KEY,
    category_id       INT NOT NULL,
    name              VARCHAR(200) NOT NULL,
    slug              VARCHAR(200) NOT NULL UNIQUE,
    short_description TEXT DEFAULT NULL,
    description       LONGTEXT DEFAULT NULL,
    price             DECIMAL(10,2) NOT NULL,
    sale_price        DECIMAL(10,2) DEFAULT NULL,
    size              VARCHAR(50) DEFAULT NULL,
    shipping_fee      INT NOT NULL DEFAULT 0,
    stock             INT DEFAULT 0,
    sku               VARCHAR(100) DEFAULT NULL UNIQUE,
    is_featured       TINYINT(1) DEFAULT 0,
    is_best_seller    TINYINT(1) DEFAULT 0,
    is_active         TINYINT(1) DEFAULT 1,
    scent_notes       TEXT DEFAULT NULL,
    fragrance_family  VARCHAR(100) DEFAULT NULL,
    longevity         VARCHAR(100) DEFAULT NULL,
    meta_title        VARCHAR(255) DEFAULT NULL,
    meta_description  TEXT DEFAULT NULL,
    meta_keywords     VARCHAR(255) DEFAULT NULL,
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- ============================================================
-- PRODUCT IMAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS product_images (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    product_id  INT NOT NULL,
    image_path  VARCHAR(255) NOT NULL,
    is_primary  TINYINT(1) DEFAULT 0,
    sort_order  INT DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ============================================================
-- HERO CAROUSEL
-- ============================================================
CREATE TABLE IF NOT EXISTS hero_slides (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    image_path  VARCHAR(255) NOT NULL,
    heading     VARCHAR(200) DEFAULT NULL,
    subheading  VARCHAR(300) DEFAULT NULL,
    cta_text    VARCHAR(100) DEFAULT 'Shop Now',
    cta_link    VARCHAR(255) DEFAULT '/products',
    sort_order  INT DEFAULT 0,
    is_active   TINYINT(1) DEFAULT 1,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- COUPONS
-- ============================================================
CREATE TABLE IF NOT EXISTS coupons (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    code           VARCHAR(50) NOT NULL UNIQUE,
    discount_type  ENUM('percentage','fixed','shipping') DEFAULT 'percentage',
    discount_value DECIMAL(10,2) NOT NULL DEFAULT 0,
    usage_limit    INT DEFAULT 0,
    used_count     INT DEFAULT 0,
    expiry_date    DATE DEFAULT NULL,
    is_active      TINYINT(1) DEFAULT 1,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    user_id             INT DEFAULT NULL,
    guest_email         VARCHAR(150) DEFAULT NULL,
    full_name           VARCHAR(150) NOT NULL,
    phone               VARCHAR(30) NOT NULL,
    address             TEXT NOT NULL,
    city                VARCHAR(100) NOT NULL,
    country             VARCHAR(100) DEFAULT 'Pakistan',
    total_amount        DECIMAL(10,2) NOT NULL,
    discount_amount     DECIMAL(10,2) NOT NULL DEFAULT 0,
    coupon_id           INT DEFAULT NULL,
    status              ENUM('pending','processing','shipped','delivered','cancelled','refunded') DEFAULT 'pending',
    payment_method      VARCHAR(50) DEFAULT 'COD',
    payment_status      ENUM('unpaid','paid','refunded') DEFAULT 'unpaid',
    notes               TEXT DEFAULT NULL,
    cancellation_reason TEXT DEFAULT NULL,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================
-- ORDER ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    order_id     INT NOT NULL,
    product_id   INT NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    quantity     INT NOT NULL,
    unit_price   DECIMAL(10,2) NOT NULL,
    total_price  DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ============================================================
-- REVIEWS
-- ============================================================
CREATE TABLE IF NOT EXISTS reviews (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    product_id     INT NOT NULL,
    user_id        INT DEFAULT NULL,
    reviewer_name  VARCHAR(100) NOT NULL,
    reviewer_email VARCHAR(150) DEFAULT NULL,
    rating         TINYINT(1) NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title          VARCHAR(200) DEFAULT NULL,
    body           TEXT DEFAULT NULL,
    images         JSON DEFAULT NULL,
    is_approved    TINYINT(1) DEFAULT 0,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================
-- NEWSLETTER SUBSCRIBERS
-- ============================================================
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    email         VARCHAR(150) NOT NULL UNIQUE,
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- SITE SETTINGS  (key-value CMS store)
-- ============================================================
CREATE TABLE IF NOT EXISTS site_settings (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    setting_key   VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT DEFAULT NULL,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- DISCOVER BOXES  (4 homepage feature slots)
-- ============================================================
CREATE TABLE IF NOT EXISTS discover_boxes (
    slot_id    INT PRIMARY KEY,
    product_id INT DEFAULT NULL,
    bg_image   VARCHAR(255) DEFAULT NULL,
    title      VARCHAR(200) DEFAULT NULL,
    subtitle   VARCHAR(300) DEFAULT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- ============================================================
-- SEEDS
-- ============================================================

-- Admin user  (password: admin123 — change after first login)
INSERT INTO users (name, email, password, role) VALUES
('Admin', 'admin@satish.com', '$2y$10$ayakFgFRWYJ4RoLuwWtOweIIGsywnFbQUyK7RA0kqJfPhO.aVWkqq', 'admin')
ON DUPLICATE KEY UPDATE id = id;

-- Default categories
INSERT INTO categories (name, slug, sort_order) VALUES
('Men',     'men',     1),
('Women',   'women',   2),
('Unisex',  'unisex',  3),
('Bundles', 'bundles', 4)
ON DUPLICATE KEY UPDATE id = id;

-- Default discover box slots
INSERT INTO discover_boxes (slot_id) VALUES (1),(2),(3),(4)
ON DUPLICATE KEY UPDATE slot_id = slot_id;

-- Default site settings
INSERT INTO site_settings (setting_key, setting_value) VALUES
('site_name',              'Satish Fragrances'),
('site_tagline',           'A curation of masterfully composed scents where artistry meets the olfactory.'),
('contact_email',          'info@satish.com'),
('contact_phone',          '+92 300 0000000'),
('facebook_url',           '#'),
('instagram_url',          '#'),
('whatsapp_number',        '+92 300 0000000'),
('shipping_type',          'flat'),
('shipping_fee',           '250'),
('free_shipping_threshold','3000'),
('smtp_host',            'smtp.gmail.com'),
('smtp_port',            '587'),
('smtp_username',        ''),
('smtp_password',        ''),
('smtp_encryption',      'tls'),
('smtp_from_email',      'info@sattis.store'),
('smtp_from_name',       'SATTIS Fragrances'),
('admin_notify_email',   'info@sattis.store')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);
