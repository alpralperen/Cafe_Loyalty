import { getDb } from './api/_lib/db.js'

async function run() {
  const sql = getDb()
  const rows = await sql`SELECT * FROM cashier_audit WHERE action = 'QR_SCANNED' ORDER BY created_at DESC LIMIT 10`
  console.log('QR_SCANNED rows:', rows)
  process.exit(0)
}
run()
