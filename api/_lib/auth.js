import jwt from 'jsonwebtoken'
import { getJwtSecret } from './config.js'

export function signUserToken(user) {
  return jwt.sign(
    { sub: user.id, type: 'user', phone: user.phone, email: user.email },
    getJwtSecret(),
    { expiresIn: '30d' }
  )
}

export function signAdminToken(admin) {
  return jwt.sign(
    { sub: admin.id, type: 'admin', role: admin.role, username: admin.username },
    getJwtSecret(),
    { expiresIn: '12h' }
  )
}

export function verifyToken(req) {
  const header = req.headers.authorization || req.headers.Authorization
  if (!header?.startsWith('Bearer ')) return null
  try {
    return jwt.verify(header.slice(7), getJwtSecret())
  } catch {
    return null
  }
}

export function requireUser(req) {
  const payload = verifyToken(req)
  if (!payload || payload.type !== 'user') return null
  return payload
}

export function requireAdmin(req) {
  const payload = verifyToken(req)
  if (!payload || payload.type !== 'admin') return null
  return payload
}
