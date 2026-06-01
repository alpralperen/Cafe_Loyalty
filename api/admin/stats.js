import { getDb } from '../_lib/db.js'
import { requireAdmin } from '../_lib/auth.js'
import { json, handleOptions, methodNotAllowed } from '../_lib/http.js'

export default async function handler(req, res) {
  if (handleOptions(req, res)) return
  if (req.method !== 'GET') return methodNotAllowed(res)

  const auth = requireAdmin(req)
  if (!auth) return json(res, 401, { error: 'Yetki gerekli' })

  const sql = getDb()

  const today = await sql`
    SELECT
      COUNT(*) FILTER (WHERE action = 'QR_CREATED')::int AS qr_today,
      COALESCE(SUM(beans_total) FILTER (WHERE action = 'QR_CREATED'), 0)::int AS beans_today,
      COUNT(*) FILTER (WHERE action = 'REDEEMED_COFFEE')::int AS redeems_today
    FROM cashier_audit
    WHERE admin_id = ${auth.sub} AND created_at >= CURRENT_DATE
  `

  const customers = await sql`SELECT COUNT(*)::int AS total FROM users`

  return json(res, 200, {
    today: today[0],
    customers: customers[0].total
  })
}
