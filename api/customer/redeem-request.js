import { v4 as uuidv4 } from 'uuid'
import { getDb } from '../_lib/db.js'
import { requireUser } from '../_lib/auth.js'
import { REDEEM_QR_TTL_MINUTES } from '../_lib/config.js'
import { json, handleOptions, methodNotAllowed } from '../_lib/http.js'

export default async function handler(req, res) {
  if (handleOptions(req, res)) return
  if (req.method !== 'POST') return methodNotAllowed(res)

  const auth = requireUser(req)
  if (!auth) return json(res, 401, { error: 'Oturum gerekli' })

  const sql = getDb()
  const users = await sql`SELECT free_coffees FROM users WHERE id = ${auth.sub}`
  const user = users[0]
  if (!user?.free_coffees || user.free_coffees < 1) {
    return json(res, 400, { error: 'Kullanılabilir ücretsiz kahve hakkınız yok' })
  }

  const id = uuidv4()
  const ttl = REDEEM_QR_TTL_MINUTES

  await sql`
    INSERT INTO redeem_tokens (id, user_id, expires_at)
    VALUES (${id}, ${auth.sub}, NOW() + ${ttl} * INTERVAL '1 minute')
  `

  return json(res, 200, {
    token: id,
    expires_in_seconds: ttl * 60,
    type: 'redeem'
  })
}
