import { json } from '../http.js'

export async function health(req, res) {
  json(res, 200, { ok: true, service: 'cafe-sadakat', version: '1.0.0' })
}
