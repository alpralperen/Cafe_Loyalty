import { getDb } from './api/_lib/db.js'

async function run() {
  const sql = getDb()
  const rows = await sql`SELECT * FROM history_logs ORDER BY created_at DESC LIMIT 5`
  console.log('HISTORY LOGS:', rows)
  process.exit(0)
}
run()
