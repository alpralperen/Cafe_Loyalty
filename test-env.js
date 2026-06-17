async function run() {
  try {
    const res = await fetch('http://localhost:3000/')
    const html = await res.text()
    
    // Look for VITE_API_BASE in the HTML or linked JS
    console.log('HTML contains VITE_API_BASE?', html.includes('VITE_API_BASE'))
    console.log('HTML contains vercel.app?', html.includes('vercel.app'))
    
    // Check vite config/env
    const res2 = await fetch('http://localhost:3000/src/api/client.js')
    if (res2.ok) {
      const js = await res2.text()
      console.log('client.js API_BASE line:', js.split('\n')[0])
    }
  } catch (e) {
    console.error(e)
  }
  process.exit(0)
}
run()
