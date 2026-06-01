import { getDb } from '../db.js'
import { requireAdmin } from '../auth.js'
import { json, readBody, methodNotAllowed } from '../http.js'

export async function adminRedeemScan(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res)

  const auth = requireAdmin(req)
  if (!auth) return json(res, 401, { error: 'Kasiyer oturumu gerekli' })

  const { token } = await readBody(req)
  if (!token) return json(res, 400, { error: 'QR kod gerekli' })

  const sql = getDb()

  const claimed = await sql`
    UPDATE redeem_tokens
    SET status = 'used'
    WHERE id = ${token}
      AND status = 'active'
      AND expires_at > NOW()
    RETURNING user_id
  `
  const redeem = claimed[0]
  if (!redeem) {
    return json(res, 400, { error: 'QR geçersiz, süresi dolmuş veya kullanılmış' })
  }

  const users = await sql`
    UPDATE users
    SET free_coffees = free_coffees - 1
    WHERE id = ${redeem.user_id} AND free_coffees >= 1
    RETURNING id, name_surname, free_coffees, beans_count
  `
  const user = users[0]
  if (!user) {
    return json(res, 400, { error: 'Müşterinin ücretsiz kahve hakkı kalmamış' })
  }

  const desc = `Ücretsiz kahve kullanıldı — ${new Date().toLocaleDateString('tr-TR')}`
  await sql`
    INSERT INTO history_logs (user_id, action_type, amount, description)
    VALUES (${redeem.user_id}, 'REDEEMED_COFFEE', 1, ${desc})
  `

  await sql`
    INSERT INTO cashier_audit (admin_id, action, beans_total, meta)
    VALUES (${auth.sub}, 'REDEEMED_COFFEE', 0, ${JSON.stringify({ user_id: user.id })})
  `

  return json(res, 200, {
    message: 'Ücretsiz kahve onaylandı',
    user
  })
}
