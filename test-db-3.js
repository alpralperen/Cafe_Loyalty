import { getDb } from './api/_lib/db.js'

async function run() {
  const sql = getDb()
  const rows = await sql`SELECT * FROM cashier_audit ORDER BY created_at DESC LIMIT 10`
  console.log('ALL AUDIT:', rows)
  process.exit(0)
}
run()
