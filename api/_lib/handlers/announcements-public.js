import { getDb } from '../db.js'
import { json, methodNotAllowed } from '../http.js'

export async function announcementsPublic(req, res) {
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
