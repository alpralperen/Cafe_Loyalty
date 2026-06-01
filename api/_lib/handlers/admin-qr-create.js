import { v4 as uuidv4 } from 'uuid'
import { getDb } from '../db.js'
import { requireAdmin } from '../auth.js'
import {
  EARN_QR_TTL_MINUTES,
  DAILY_QR_WARNING_THRESHOLD,
  ANOMALY_BEANS_SINGLE_QR
} from '../config.js'
import { json, readBody, methodNotAllowed } from '../http.js'

export async function adminQrCreate(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res)

  const auth = requireAdmin(req)
  if (!auth) return json(res, 401, { error: 'Kasiyer oturumu gerekli' })

  const { beans_amount } = await readBody(req)
  const amount = parseInt(beans_amount, 10)
  if (!amount || amount < 1 || amount > 20) {
    return json(res, 400, { error: 'Kahve adedi 1–20 arasında olmalı' })
  }

  const sql = getDb()
  const id = uuidv4()
  const ttl = EARN_QR_TTL_MINUTES

  await sql`
    INSERT INTO qr_codes (id, beans_amount, created_by, expires_at)
    VALUES (${id}, ${amount}, ${auth.sub}, NOW() + ${ttl} * INTERVAL '1 minute')
  `

  await sql`
    INSERT INTO cashier_audit (admin_id, action, beans_total, meta)
    VALUES (${auth.sub}, 'QR_CREATED', ${amount}, ${JSON.stringify({ qr_id: id })})
  `

  const today = await sql`
    SELECT COUNT(*)::int AS qr_count, COALESCE(SUM(beans_total), 0)::int AS beans_today
    FROM cashier_audit
    WHERE admin_id = ${auth.sub}
      AND action = 'QR_CREATED'
      AND created_at >= CURRENT_DATE
  `
  const stats = today[0]
  const warnings = []
  if (amount >= ANOMALY_BEANS_SINGLE_QR) {
    warnings.push(`Tek seferde yüksek çekirdek (${amount})`)
  }
  if (stats.qr_count > DAILY_QR_WARNING_THRESHOLD) {
    warnings.push(`Günlük QR limiti aşıldı (${stats.qr_count})`)
  }

  return json(res, 200, {
    token: id,
    beans_amount: amount,
    expires_in_seconds: ttl * 60,
    type: 'earn',
    warnings,
    daily_stats: stats
  })
}
