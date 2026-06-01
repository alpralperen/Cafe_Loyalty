import bcrypt from 'bcryptjs'
import { getDb } from '../db.js'
import { signUserToken } from '../auth.js'
import { json, readBody, methodNotAllowed } from '../http.js'

export async function authRegister(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res)

  const { name_surname, phone, email, password } = await readBody(req)
  if (!name_surname?.trim() || !password || password.length < 6) {
    return json(res, 400, { error: 'Ad soyad ve en az 6 karakterli şifre gerekli' })
  }
  if (!phone?.trim() && !email?.trim()) {
    return json(res, 400, { error: 'Telefon veya e-posta gerekli' })
  }

  const sql = getDb()
  const password_hash = await bcrypt.hash(password, 10)

  try {
    const rows = await sql`
      INSERT INTO users (name_surname, phone, email, password_hash)
      VALUES (
        ${name_surname.trim()},
        ${phone?.trim() || null},
        ${email?.trim() || null},
        ${password_hash}
      )
      RETURNING id, name_surname, phone, email, beans_count, free_coffees, created_at
    `
    const user = rows[0]
    const token = signUserToken(user)
    return json(res, 201, { token, user })
  } catch (e) {
    if (e.code === '23505') {
      return json(res, 409, { error: 'Bu telefon veya e-posta zaten kayıtlı' })
    }
    console.error(e)
    return json(res, 500, { error: 'Kayıt sırasında hata oluştu' })
  }
}
