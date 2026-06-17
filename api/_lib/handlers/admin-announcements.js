import { getDb } from '../db.js'
import { requireAdmin } from '../auth.js'
import { json, readBody, methodNotAllowed } from '../http.js'

export async function adminAnnouncements(req, res) {
  const auth = requireAdmin(req)
  if (!auth) return json(res, 401, { error: 'Yetki gerekli' })

  const sql = getDb()

  if (req.method === 'GET') {
    const rows = await sql`
      SELECT id, title, content, is_active, created_at, updated_at
      FROM announcements ORDER BY created_at DESC
    `
    return json(res, 200, { announcements: rows })
  }

  if (req.method === 'POST') {
    const { title, content, is_active = true } = await readBody(req)
    if (!title?.trim() || !content?.trim()) {
      return json(res, 400, { error: 'Başlık ve içerik gerekli' })
    }
    const rows = await sql`
      INSERT INTO announcements (title, content, is_active)
      VALUES (${title.trim()}, ${content.trim()}, ${!!is_active})
      RETURNING *
    `
    return json(res, 201, { announcement: rows[0] })
  }

  if (req.method === 'PUT') {
    const { id, title, content, is_active } = await readBody(req)
    if (!id) return json(res, 400, { error: 'ID gerekli' })
    const rows = await sql`
      UPDATE announcements
      SET
        title = COALESCE(${title?.trim() ?? null}, title),
        content = COALESCE(${content?.trim() ?? null}, content),
        is_active = COALESCE(${is_active ?? null}, is_active),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `
    if (!rows[0]) return json(res, 404, { error: 'Duyuru bulunamadı' })
    return json(res, 200, { announcement: rows[0] })
  }

  if (req.method === 'DELETE') {
    const { id } = await readBody(req)
    if (!id) return json(res, 400, { error: 'ID gerekli' })
    const rows = await sql`
      DELETE FROM announcements
      WHERE id = ${id}
      RETURNING id
    `
    if (!rows[0]) return json(res, 404, { error: 'Duyuru bulunamadı' })
    return json(res, 200, { message: 'Duyuru silindi', id: rows[0].id })
  }

  return methodNotAllowed(res)
}
