import { handleOptions } from './_lib/http.js'
import { dispatch } from './_lib/router.js'

/** Tüm /api/* istekleri — Vercel Hobby (max 12 function) için tek giriş noktası */
export default async function handler(req, res) {
  if (handleOptions(req, res)) return
  try {
    await dispatch(req, res)
  } catch (e) {
    console.error(e)
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify({ error: 'Sunucu hatası' }))
  }
}
