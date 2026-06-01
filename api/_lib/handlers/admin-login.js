import bcrypt from 'bcryptjs'
import { getDb } from '../db.js'
import { signAdminToken } from '../auth.js'
import { json, readBody, methodNotAllowed } from '../http.js'

export async function adminLogin(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res)

  const { username, password } = await readBody(req)
  if (!username || !password) {
    return json(res, 400, { error: 'Kullanıcı adı ve şifre gerekli' })
  }

  const sql = getDb()
  const rows = await sql`SELECT * FROM admins WHERE username = ${username.trim()}`
  const admin = rows[0]
  if (!admin) return json(res, 401, { error: 'Geçersiz giriş' })

  const ok = await bcrypt.compare(password, admin.password_hash)
  if (!ok) return json(res, 401, { error: 'Geçersiz giriş' })

  const token = signAdminToken(admin)
  const { password_hash, ...safe } = admin
  return json(res, 200, { token, admin: safe })
}
