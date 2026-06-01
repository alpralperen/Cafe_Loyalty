-- Kafe Sadakat V1 — Neon PostgreSQL şeması
-- Çalıştırma: Neon konsolunda veya psql ile bu dosyayı uygulayın

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name_surname VARCHAR(100) NOT NULL,
  phone VARCHAR(20) UNIQUE,
  email VARCHAR(100) UNIQUE,
  password_hash VARCHAR(255),
  beans_count INT NOT NULL DEFAULT 0,
  free_coffees INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100) NOT NULL DEFAULT 'Kasiyer',
  role VARCHAR(20) NOT NULL DEFAULT 'cashier',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS qr_codes (
  id UUID PRIMARY KEY,
  beans_amount INT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_by INT REFERENCES admins(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS redeem_tokens (
  id UUID PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id),
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS history_logs (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id),
  action_type VARCHAR(50) NOT NULL,
  amount INT NOT NULL DEFAULT 1,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS announcements (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cashier_audit (
  id SERIAL PRIMARY KEY,
  admin_id INT NOT NULL REFERENCES admins(id),
  action VARCHAR(50) NOT NULL,
  beans_total INT NOT NULL DEFAULT 0,
  meta JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_qr_status ON qr_codes(status, expires_at);
CREATE INDEX IF NOT EXISTS idx_redeem_status ON redeem_tokens(status, expires_at);
CREATE INDEX IF NOT EXISTS idx_history_user ON history_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_admin_day ON cashier_audit(admin_id, created_at);

-- Admin hesabı: POST /api/setup ile oluşturun veya README'deki kurulum adımlarını izleyin
