import { getDb } from './api/_lib/db.js'
import { v4 as uuidv4 } from 'uuid'

async function run() {
  try {
    const sql = getDb()
    
    // 1. Create a QR code in the DB
    const qrId = uuidv4()
    await sql`
      INSERT INTO qr_codes (id, beans_amount, created_by, expires_at)
      VALUES (${qrId}, 3, 2, NOW() + INTERVAL '5 minute')
    `
    console.log('Created test QR:', qrId)
    
    // 2. Login to get a valid token
    const loginRes = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: '5551234567', password: 'password123' })
    })
    const loginData = await loginRes.json()
    const token = loginData.token
    if (!token) throw new Error('Login failed: ' + JSON.stringify(loginData))
    console.log('Logged in! Token:', token.substring(0, 10) + '...')
    
    // 3. Make HTTP request to local API!
    console.log('Making POST request to local API...')
    const res = await fetch('http://localhost:3000/api/customer/scan-earn', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ token: qrId })
    })
    
    const data = await res.json()
    console.log('API RESPONSE:', res.status, data)
    
    // 4. Check cashier_audit
    const ca = await sql`SELECT * FROM cashier_audit ORDER BY created_at DESC LIMIT 3`
    console.log('CASHIER AUDIT LATEST:', ca[0])
    
  } catch (e) {
    console.error('ERROR:', e)
  }
  process.exit(0)
}
run()
