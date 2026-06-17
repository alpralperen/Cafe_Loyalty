import bcrypt from 'bcryptjs'
import { getDb } from '../db.js'
import { signUserToken, signAdminToken } from '../auth.js'
import { json, readBody, methodNotAllowed } from '../http.js'

export async function authLogin(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res)

  const { identifier, password } = await readBody(req)
  if (!password || !identifier) return json(res, 400, { error: 'Giriş bilgileri eksik' })

  const ident = identifier.trim()
  const sql = getDb()

  // 1. Kasiyer / Yönetici Kontrolü
  const adminRows = await sql`SELECT * FROM admins WHERE username = ${ident}`
  if (adminRows.length > 0) {
    const admin = adminRows[0]
    const ok = await bcrypt.compare(password, admin.password_hash)
    if (!ok) return json(res, 401, { error: 'Geçersiz giriş bilgileri' })

    const token = signAdminToken(admin)
    const { password_hash, ...safe } = admin
    return json(res, 200, { role: admin.role, token, user: safe })
  }

  // 2. Müşteri Kontrolü
  const rows = await sql`SELECT * FROM users WHERE phone = ${ident} OR email = ${ident}`
  const user = rows[0]
  if (!user?.password_hash) {
    return json(res, 401, { error: 'Geçersiz giriş bilgileri' })
  }

  const ok = await bcrypt.compare(password, user.password_hash)
  if (!ok) return json(res, 401, { error: 'Geçersiz giriş bilgileri' })

  const token = signUserToken(user)
  const { password_hash, ...safe } = user
  return json(res, 200, { role: 'customer', token, user: safe })
}
