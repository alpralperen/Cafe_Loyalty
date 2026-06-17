import { getDb } from './api/_lib/db.js'

async function run() {
  const sql = getDb()
  const users = await sql`SELECT * FROM users WHERE id = 1`
  console.log('USER 1:', users[0])
  process.exit(0)
}
run()
