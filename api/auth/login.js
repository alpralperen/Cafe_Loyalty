import bcrypt from 'bcryptjs'
import { getDb } from '../_lib/db.js'
import { signUserToken } from '../_lib/auth.js'
import { json, readBody, handleOptions, methodNotAllowed } from '../_lib/http.js'

export default async function handler(req, res) {
  if (handleOptions(req, res)) return
  if (req.method !== 'POST') return methodNotAllowed(res)

  const { phone, email, password } = await readBody(req)
  if (!password) return json(res, 400, { error: 'Şifre gerekli' })

  const sql = getDb()
  let rows
  if (phone) {
    rows = await sql`SELECT * FROM users WHERE phone = ${phone.trim()}`
  } else if (email) {
    rows = await sql`SELECT * FROM users WHERE email = ${email.trim()}`
  } else {
    return json(res, 400, { error: 'Telefon veya e-posta girin' })
  }

  const user = rows[0]
  if (!user?.password_hash) {
    return json(res, 401, { error: 'Geçersiz giriş bilgileri' })
  }

  const ok = await bcrypt.compare(password, user.password_hash)
  if (!ok) return json(res, 401, { error: 'Geçersiz giriş bilgileri' })

  const token = signUserToken(user)
  const { password_hash, ...safe } = user
  return json(res, 200, { token, user: safe })
}
