import { getDb } from './api/_lib/db.js'

async function run() {
  try {
    const sql = getDb()
    const qr_created_by = 2;
    const qr_beans_amount = 3;
    const qr_id = 'test-id';
    const auth_sub = 1;
    
    console.log('Inserting into cashier_audit...')
    await sql`
      INSERT INTO cashier_audit (admin_id, action, beans_total, meta)
      VALUES (${qr_created_by}, 'QR_SCANNED', ${qr_beans_amount}, ${JSON.stringify({ qr_id: qr_id, user_id: auth_sub })})
    `
    console.log('Insert success!')
    
    const rows = await sql`SELECT * FROM cashier_audit ORDER BY created_at DESC LIMIT 1`
    console.log('LATEST ROW:', rows)
  } catch (e) {
    console.error('ERROR:', e)
  }
  process.exit(0)
}
run()
