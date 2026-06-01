import { getDb } from '../_lib/db.js'
import { requireUser } from '../_lib/auth.js'
import { BEANS_PER_FREE_COFFEE } from '../_lib/config.js'
import { json, handleOptions, methodNotAllowed } from '../_lib/http.js'

export default async function handler(req, res) {
  if (handleOptions(req, res)) return
  if (req.method !== 'GET') return methodNotAllowed(res)

  const auth = requireUser(req)
  if (!auth) return json(res, 401, { error: 'Oturum gerekli' })

  const sql = getDb()
  const rows = await sql`
    SELECT id, name_surname, phone, email, beans_count, free_coffees, created_at
    FROM users WHERE id = ${auth.sub}
  `
  const user = rows[0]
  if (!user) return json(res, 404, { error: 'Kullanıcı bulunamadı' })

  const remainder = user.beans_count % BEANS_PER_FREE_COFFEE
  const beans_until_free = remainder === 0 ? BEANS_PER_FREE_COFFEE : BEANS_PER_FREE_COFFEE - remainder

  return json(res, 200, { user, beans_until_free })
}
