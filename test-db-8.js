import { getDb } from './api/_lib/db.js'

async function run() {
  try {
    const sql = getDb()
    const triggers = await sql`
      SELECT trigger_name, event_manipulation, event_object_table, action_statement
      FROM information_schema.triggers
      WHERE event_object_table = 'cashier_audit'
    `
    console.log('TRIGGERS:', triggers)
  } catch (e) {
    console.error(e)
  }
  process.exit(0)
}
run()
