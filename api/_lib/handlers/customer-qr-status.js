import { getDb } from '../db.js'
import { requireUser } from '../auth.js'
import { json, methodNotAllowed } from '../http.js'

export async function customerQrStatus(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res)

  const auth = requireUser(req)
  if (!auth) return json(res, 401, { error: 'Oturum gerekli' })

  const url = new URL(req.url, 'http://localhost')
  const id = url.searchParams.get('id')
  if (!id) return json(res, 400, { error: 'ID gerekli' })

  const sql = getDb()

  const rows = await sql`
    SELECT status
    FROM redeem_tokens
    WHERE id = ${id} AND user_id = ${auth.sub}
  `

  if (rows.length === 0) {
    return json(res, 404, { error: 'Token bulunamadı' })
  }

  return json(res, 200, { status: rows[0].status })
}
