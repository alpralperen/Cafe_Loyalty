import { json, handleOptions } from './_lib/http.js'

export default async function handler(req, res) {
  if (handleOptions(req, res)) return
  json(res, 200, { ok: true, service: 'cafe-sadakat', version: '1.0.0' })
}
