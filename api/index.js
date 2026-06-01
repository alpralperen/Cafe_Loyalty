import { handleOptions } from './_lib/http.js'
import { dispatch } from './_lib/router.js'

/** Tek serverless function — tüm /api/* (vercel.json rewrite ile) */
export default async function handler(req, res) {
  if (handleOptions(req, res)) return
  try {
    await dispatch(req, res)
  } catch (e) {
    console.error(e)
    const message =
      e.message?.includes('DATABASE_URL') || e.message?.includes('JWT_SECRET')
        ? 'Sunucu yapılandırması eksik (Vercel ortam değişkenleri)'
        : 'Sunucu hatası'
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.end(JSON.stringify({ error: message }))
  }
}
