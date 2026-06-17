import bcrypt from 'bcryptjs'
import { getDb } from '../db.js'
import { requireAdmin } from '../auth.js'
import { json, readBody, methodNotAllowed } from '../http.js'

export async function managerCashiers(req, res) {
  const auth = requireAdmin(req)
  if (!auth || auth.role !== 'owner') {
    return json(res, 403, { error: 'Bu işlem için işletme yöneticisi yetkisi gereklidir' })
  }

  const sql = getDb()

  if (req.method === 'GET') {
    const cashiers = await sql`
      SELECT 
        a.id, a.username, a.display_name, a.created_at,
        COALESCE(SUM(CASE WHEN c.action = 'QR_SCANNED' THEN c.beans_total ELSE 0 END), 0)::int AS successful_qr_scans,
        COALESCE(SUM(CASE WHEN c.action = 'REDEEMED_COFFEE' THEN 1 ELSE 0 END), 0)::int AS successful_redeems
      FROM admins a
      LEFT JOIN cashier_audit c ON a.id = c.admin_id AND c.created_at >= CURRENT_DATE
      WHERE a.role = 'cashier'
      GROUP BY a.id
      ORDER BY a.created_at DESC
    `
    return json(res, 200, { cashiers })
  }

  if (req.method === 'POST') {
    const { username, password, display_name } = await readBody(req)
    if (!username || !password || !display_name) {
      return json(res, 400, { error: 'Tüm alanları doldurun' })
    }

    try {
      const hash = await bcrypt.hash(password, 10)
      const rows = await sql`
        INSERT INTO admins (username, password_hash, display_name, role)
        VALUES (${username.trim()}, ${hash}, ${display_name.trim()}, 'cashier')
        RETURNING id, username, display_name, created_at
      `
      return json(res, 201, { message: 'Kasiyer başarıyla oluşturuldu', cashier: { ...rows[0], successful_qr_scans: 0, successful_redeems: 0 } })
    } catch (e) {
      if (e.code === '23505') {
        return json(res, 400, { error: 'Bu kullanıcı adı (kasiyer ismi) zaten kullanımda' })
      }
      return json(res, 500, { error: 'Kasiyer eklenirken hata oluştu' })
    }
  }

  return methodNotAllowed(res)
}
