import { getDb } from '../db.js'
import { requireUser } from '../auth.js'
import { applyBeans } from '../beans.js'
import { json, readBody, methodNotAllowed } from '../http.js'

export async function customerScanEarn(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res)

  const auth = requireUser(req)
  if (!auth) return json(res, 401, { error: 'Oturum gerekli' })

  const { token } = await readBody(req)
  if (!token) return json(res, 400, { error: 'QR kod gerekli' })

  const sql = getDb()

  const claimed = await sql`
    UPDATE qr_codes
    SET status = 'used'
    WHERE id = ${token}
      AND status = 'active'
      AND expires_at > NOW()
    RETURNING id, beans_amount
  `
  const qr = claimed[0]
  if (!qr) {
    return json(res, 400, { error: 'QR kod geçersiz, süresi dolmuş veya daha önce kullanılmış' })
  }

  const users = await sql`SELECT beans_count, free_coffees FROM users WHERE id = ${auth.sub}`
  const current = users[0]
  if (!current) return json(res, 404, { error: 'Kullanıcı bulunamadı' })

  const next = applyBeans(current.beans_count, current.free_coffees, qr.beans_amount)

  await sql`
    UPDATE users
    SET beans_count = ${next.beans_count}, free_coffees = ${next.free_coffees}
    WHERE id = ${auth.sub}
  `

  const desc = `${qr.beans_amount} Adet Kahve — ${new Date().toLocaleDateString('tr-TR')}`
  await sql`
    INSERT INTO history_logs (user_id, action_type, amount, description)
    VALUES (${auth.sub}, 'EARNED_BEAN', ${qr.beans_amount}, ${desc})
  `

  const updated = await sql`
    SELECT id, name_surname, beans_count, free_coffees FROM users WHERE id = ${auth.sub}
  `

  return json(res, 200, {
    message: `${qr.beans_amount} çekirdek eklendi`,
    earned_beans: qr.beans_amount,
    new_free_coffees: next.coffees_earned,
    user: updated[0]
  })
}
