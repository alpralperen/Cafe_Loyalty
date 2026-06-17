import { getDb } from '../db.js'
import { requireAdmin } from '../auth.js'
import { json, methodNotAllowed } from '../http.js'

export async function adminQrStatus(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res)

  const auth = requireAdmin(req)
  if (!auth) return json(res, 401, { error: 'Yetki gerekli' })

  const url = new URL(req.url, 'http://localhost')
  const id = url.searchParams.get('id')

  if (!id) {
    return json(res, 400, { error: 'QR ID gerekli' })
  }

  const sql = getDb()

  const result = await sql`
    SELECT status, beans_amount FROM qr_codes 
    WHERE id = ${id} AND created_by = ${auth.sub}
  `

  if (result.length === 0) {
    return json(res, 404, { error: 'QR kod bulunamadı' })
  }

  return json(res, 200, {
    id: id,
    status: result[0].status,
    beans_amount: result[0].beans_amount
  })
}
