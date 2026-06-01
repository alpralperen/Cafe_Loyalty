import { getDb } from '../_lib/db.js'
import { json, handleOptions, methodNotAllowed } from '../_lib/http.js'

export default async function handler(req, res) {
  if (handleOptions(req, res)) return
  if (req.method !== 'GET') return methodNotAllowed(res)

  const sql = getDb()
  const rows = await sql`
    SELECT id, title, content, created_at, updated_at
    FROM announcements
    WHERE is_active = true
    ORDER BY updated_at DESC
    LIMIT 10
  `
  return json(res, 200, { announcements: rows })
}
