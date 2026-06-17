const fs = require('fs')

const file = fs.readFileSync('./api/_lib/handlers/admin-qr-create.js', 'utf8')
if (file.includes('QR_CREATED')) {
  console.log('FILE CONTAINS QR_CREATED!')
} else {
  console.log('FILE DOES NOT CONTAIN QR_CREATED!')
}
