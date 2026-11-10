-- Initial schema for LEADWAY POWDERS.
-- Safe to apply more than once. Existing tables and data are not dropped.

CREATE TABLE IF NOT EXISTS admins (
  id BIGSERIAL PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(254) NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'admin',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS admins_email_lower_idx
  ON admins (LOWER(email));

CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(254) NOT NULL,
  phone VARCHAR(30),
  city VARCHAR(150),
  province VARCHAR(100),
  street TEXT,
  password_hash TEXT NOT NULL,
  sms_email_consent BOOLEAN NOT NULL DEFAULT FALSE,
  member_tier VARCHAR(50) NOT NULL DEFAULT 'standard',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_idx
  ON users (LOWER(email));

CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  admin_id BIGINT REFERENCES admins(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  eyebrow VARCHAR(255),
  category VARCHAR(100) NOT NULL,
  price NUMERIC(12, 2) NOT NULL,
  compare_price NUMERIC(12, 2),
  cost_price NUMERIC(12, 2),
  stock INTEGER NOT NULL DEFAULT 0,
  stock_status VARCHAR(50) NOT NULL DEFAULT 'in_stock',
  sizes TEXT,
  colors TEXT,
  fit VARCHAR(255),
  image_url TEXT,
  image_2_url TEXT,
  image_3_url TEXT,
  description TEXT,
  details TEXT,
  care TEXT,
  delivery TEXT,
  rating NUMERIC(3, 2) NOT NULL DEFAULT 0,
  reviews INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS products_created_at_idx
  ON products (created_at DESC);

CREATE TABLE IF NOT EXISTS drivers (
  id BIGSERIAL PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(254) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  province VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS drivers_email_lower_idx
  ON drivers (LOWER(email));

CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  order_number VARCHAR(80) NOT NULL UNIQUE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  status VARCHAR(24) NOT NULL DEFAULT 'pending',
  payment_status VARCHAR(24) NOT NULL DEFAULT 'pending',
  subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
  discount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  delivery_fee NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total NUMERIC(12, 2) NOT NULL DEFAULT 0,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(254) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  street TEXT NOT NULL,
  apartment TEXT,
  city VARCHAR(150) NOT NULL,
  postal_code VARCHAR(30) NOT NULL DEFAULT '',
  province VARCHAR(100) NOT NULL,
  delivery_method VARCHAR(50) NOT NULL DEFAULT 'express',
  tracking_number VARCHAR(100),
  driver_id BIGINT REFERENCES drivers(id) ON DELETE SET NULL,
  driver_assigned_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT orders_status_check CHECK (
    status IN (
      'pending', 'processing', 'accepted', 'in-transit',
      'delivered', 'cancelled', 'refunded', 'shipped', 'transit'
    )
  ),
  CONSTRAINT orders_payment_status_check CHECK (
    payment_status IN (
      'pending', 'processing', 'paid', 'failed', 'refunded', 'cancelled'
    )
  )
);

CREATE INDEX IF NOT EXISTS orders_user_created_at_idx
  ON orders (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS orders_driver_status_idx
  ON orders (driver_id, status);

CREATE TABLE IF NOT EXISTS order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id VARCHAR(255) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(12, 2) NOT NULL,
  size VARCHAR(100),
  image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS order_items_order_id_idx
  ON order_items (order_id);

CREATE TABLE IF NOT EXISTS payments (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  amount NUMERIC(12, 2) NOT NULL,
  payment_method VARCHAR(80) NOT NULL,
  payment_status VARCHAR(24) NOT NULL DEFAULT 'pending',
  transaction_reference VARCHAR(150) UNIQUE,
  gateway_reference VARCHAR(150),
  net_amount NUMERIC(12, 2),
  fee NUMERIC(12, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT payments_payment_status_check CHECK (
    payment_status IN (
      'pending', 'processing', 'paid', 'failed', 'refunded', 'cancelled'
    )
  )
);

CREATE INDEX IF NOT EXISTS payments_order_created_at_idx
  ON payments (order_id, created_at DESC);

CREATE TABLE IF NOT EXISTS order_returns (
  id BIGSERIAL PRIMARY KEY,
  order_id TEXT NOT NULL,
  order_number TEXT NOT NULL,
  user_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  reason TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  status VARCHAR(24) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT order_returns_status_check CHECK (
    status IN ('pending', 'approved', 'rejected', 'refunded')
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS order_returns_active_order_idx
  ON order_returns (order_number, user_id)
  WHERE status IN ('pending', 'approved');

CREATE TABLE IF NOT EXISTS admin_notifications (
  id BIGSERIAL PRIMARY KEY,
  type VARCHAR(80) NOT NULL,
  category VARCHAR(80) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL DEFAULT '',
  entity_type VARCHAR(50),
  entity_id TEXT,
  action_url TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  is_cleared BOOLEAN NOT NULL DEFAULT FALSE,
  is_actionable BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMPTZ,
  cleared_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS admin_notifications_feed_idx
  ON admin_notifications (created_at DESC)
  WHERE is_cleared = FALSE;

CREATE TABLE IF NOT EXISTS user_notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  type VARCHAR(80) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL DEFAULT '',
  entity_type VARCHAR(50),
  entity_id TEXT,
  order_number TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  is_cleared BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMPTZ,
  cleared_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS user_notifications_feed_idx
  ON user_notifications (user_id, created_at DESC)
  WHERE is_cleared = FALSE;

CREATE UNIQUE INDEX IF NOT EXISTS user_notifications_event_idx
  ON user_notifications (user_id, type, entity_type, entity_id)
  WHERE entity_id IS NOT NULL;

-- Ensure older installations have columns added by the driver/return services.
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS driver_id BIGINT REFERENCES drivers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS driver_assigned_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ;

ALTER TABLE order_returns
  ADD COLUMN IF NOT EXISTS amount NUMERIC(12, 2) NOT NULL DEFAULT 0;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS street TEXT;
