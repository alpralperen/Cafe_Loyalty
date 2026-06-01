/**
 * Veritabanı tabloları + admin hesabı (bir kez çalıştırın)
 * npm run setup:db -- "Sifreniz"
 */
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import bcrypt from 'bcryptjs'
import { neon } from '@neondatabase/serverless'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

function loadEnv() {
  for (const name of ['.env', '.env.local']) {
    try {
      const raw = readFileSync(resolve(root, name), 'utf8')
      for (const line of raw.split(/\r?\n/)) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) continue
        const eq = trimmed.indexOf('=')
        if (eq < 1) continue
        const key = trimmed.slice(0, eq)
        const val = trimmed.slice(eq + 1).replace(/^["']|["']$/g, '')
        if (!process.env[key]) process.env[key] = val
      }
    } catch {
      /* ignore */
    }
  }
}

loadEnv()

const url = process.env.DATABASE_URL
if (!url) {
  console.error('DATABASE_URL bulunamadı. Proje kökünde .env oluşturun.')
  process.exit(1)
}

const sql = neon(url)
const adminPassword = process.argv[2] || 'admin123'
const hash = await bcrypt.hash(adminPassword, 10)

console.log('Tablolar kontrol ediliyor...')

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

console.log('Kurulum tamam.')
console.log('Kasiyer girişi → kullanıcı: admin')
