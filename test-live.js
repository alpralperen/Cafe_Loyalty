const jwt = require('jsonwebtoken')

async function run() {
  try {
    const token = jwt.sign({ sub: 1, type: 'user' }, process.env.JWT_SECRET || 'M79SJPZ3oKyTfxeWE5Gq0d1ah4sYUujbgnCFHcO2BmXpLAIr')
    
    const id = '00000000-0000-0000-0000-000000000000' // fake id, just to see the HTTP response
    
    console.log('Testing LIVE endpoint...')
    const res = await fetch(`https://cafe-sadakat.vercel.app/api/customer/qr-status?id=${id}`, {
      headers: { authorization: `Bearer ${token}` }
    })
    
    console.log('Status:', res.status)
    const text = await res.text()
    console.log('Body:', text)
  } catch (e) {
    console.error(e)
  }
}
run()
