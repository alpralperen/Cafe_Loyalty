import { getDb } from './api/_lib/db.js'
import { v4 as uuidv4 } from 'uuid'

async function run() {
  try {
    const sql = getDb()
    
    // Create a dummy user
    const users = await sql`
      INSERT INTO users (name_surname, phone, email, beans_count, free_coffees)
      VALUES ('Test User', '5551234567', 'test@test.com', 0, 1)
      ON CONFLICT (email) DO UPDATE SET free_coffees = 1
      RETURNING id
    `
    const userId = users[0].id
    
    // Generate a JWT for this user
    const jwt = (await import('jsonwebtoken')).default
    const token = jwt.sign({ sub: userId, type: 'user' }, process.env.JWT_SECRET || 'M79SJPZ3oKyTfxeWE5Gq0d1ah4sYUujbgnCFHcO2BmXpLAIr')

    // Hit the redeem request API locally (assuming server is running, but let's just test DB first)
    // Actually let's just insert a redeem token and test the handler directly
    const tokenId = uuidv4()
    await sql`
      INSERT INTO redeem_tokens (id, user_id, status, expires_at)
      VALUES (${tokenId}, ${userId}, 'used', NOW() + INTERVAL '1 hour')
    `
    
    console.log(`Inserted token: ${tokenId}`)
    
    // Now simulate calling the handler
    const { customerQrStatus } = await import('./api/_lib/handlers/customer-qr-status.js')
    
    const req = {
      method: 'GET',
      headers: { authorization: `Bearer ${token}` },
      url: `http://localhost/api/customer/qr-status?id=${tokenId}`
    }
    
    const res = {
      statusCode: 200,
      body: '',
      setHeader: (k,v) => {},
      end: (data) => { res.body = data }
    }
    
    await customerQrStatus(req, res)
    console.log('Response Status:', res.statusCode)
    console.log('Response Body:', res.body)

  } catch (e) {
    console.error(e)
  }
  process.exit(0)
}
run()
