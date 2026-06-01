import bcrypt from 'bcryptjs'
import { getDb } from './_lib/db.js'
import { json, readBody, handleOptions, methodNotAllowed } from './_lib/http.js'

/** İlk kurulum: SETUP_SECRET ile şema + varsayılan admin oluşturur */
export default async function handler(req, res) {
  if (handleOptions(req, res)) return
  if (req.method !== 'POST') return methodNotAllowed(res)

  const secret = process.env.SETUP_SECRET
  if (!secret) return json(res, 403, { error: 'Kurulum devre dışı' })

  const { setup_secret, admin_password } = await readBody(req)
  if (setup_secret !== secret) return json(res, 403, { error: 'Geçersiz kurulum anahtarı' })

  const sql = getDb()
  const password = admin_password || 'admin123'
  const hash = await bcrypt.hash(password, 10)

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name_surname VARCHAR(100) NOT NULL,
      phone VARCHAR(20) UNIQUE,
      email VARCHAR(100) UNIQUE,
      password_hash VARCHAR(255),
      beans_count INT NOT NULL DEFAULT 0,
      free_coffees INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS admins (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      display_name VARCHAR(100) NOT NULL DEFAULT 'Kasiyer',
      role VARCHAR(20) NOT NULL DEFAULT 'cashier',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS qr_codes (
      id UUID PRIMARY KEY,
      beans_amount INT NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'active',
      created_by INT REFERENCES admins(id),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      expires_at TIMESTAMPTZ NOT NULL
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS redeem_tokens (
      id UUID PRIMARY KEY,
      user_id INT NOT NULL REFERENCES users(id),
      status VARCHAR(20) NOT NULL DEFAULT 'active',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      expires_at TIMESTAMPTZ NOT NULL
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS history_logs (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES users(id),
      action_type VARCHAR(50) NOT NULL,
      amount INT NOT NULL DEFAULT 1,
      description TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS announcements (
      id SERIAL PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      content TEXT NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS cashier_audit (
      id SERIAL PRIMARY KEY,
      admin_id INT NOT NULL REFERENCES admins(id),
      action VARCHAR(50) NOT NULL,
      beans_total INT NOT NULL DEFAULT 0,
      meta JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  await sql`
    INSERT INTO admins (username, password_hash, display_name, role)
    VALUES ('admin', ${hash}, 'Yönetici', 'owner')
    ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash
  `

  await sql`
    INSERT INTO announcements (title, content, is_active)
    SELECT 'Hoş geldiniz!', 'Her 10 çekirdekte 1 ücretsiz kahve. Kasadaki QR''ı tarayın.', true
    WHERE NOT EXISTS (SELECT 1 FROM announcements LIMIT 1)
  `

  return json(res, 200, {
    ok: true,
    message: 'Veritabanı hazır',
    admin_username: 'admin'
  })
}
