import { getDb } from './api/_lib/db.js'

async function run() {
  const sql = getDb()
  const qr = await sql`SELECT * FROM qr_codes ORDER BY created_at DESC LIMIT 3`
  const hl = await sql`SELECT * FROM history_logs ORDER BY created_at DESC LIMIT 3`
  const ca = await sql`SELECT * FROM cashier_audit ORDER BY created_at DESC LIMIT 3`
  console.log('QR CODES:', qr)
  console.log('HISTORY LOGS:', hl)
  console.log('CASHIER AUDIT:', ca)
  process.exit(0)
}
run()
