import { getDb } from '../_lib/db.js'
import { requireUser } from '../_lib/auth.js'
import { json, handleOptions, methodNotAllowed } from '../_lib/http.js'

export default async function handler(req, res) {
  if (handleOptions(req, res)) return
  if (req.method !== 'GET') return methodNotAllowed(res)

  const auth = requireUser(req)
  if (!auth) return json(res, 401, { error: 'Oturum gerekli' })

  const sql = getDb()
  const logs = await sql`
    SELECT id, action_type, amount, description, created_at
    FROM history_logs
    WHERE user_id = ${auth.sub}
    ORDER BY created_at DESC
    LIMIT 50
  `
  return json(res, 200, { logs })
}
