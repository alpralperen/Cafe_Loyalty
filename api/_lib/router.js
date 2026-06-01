import { health } from './handlers/health.js'
import { setup } from './handlers/setup.js'
import { authRegister } from './handlers/auth-register.js'
import { authLogin } from './handlers/auth-login.js'
import { customerMe } from './handlers/customer-me.js'
import { customerHistory } from './handlers/customer-history.js'
import { customerScanEarn } from './handlers/customer-scan-earn.js'
import { customerRedeemRequest } from './handlers/customer-redeem-request.js'
import { adminLogin } from './handlers/admin-login.js'
import { adminQrCreate } from './handlers/admin-qr-create.js'
import { adminRedeemScan } from './handlers/admin-redeem-scan.js'
import { adminAnnouncements } from './handlers/admin-announcements.js'
import { adminStats } from './handlers/admin-stats.js'
import { announcementsPublic } from './handlers/announcements-public.js'
import { json } from './http.js'

/** method + path → handler (Hobby: tek serverless function) */
const routes = {
  'GET health': health,
  'POST setup': setup,
  'POST auth/register': authRegister,
  'POST auth/login': authLogin,
  'GET customer/me': customerMe,
  'GET customer/history': customerHistory,
  'POST customer/scan-earn': customerScanEarn,
  'POST customer/redeem-request': customerRedeemRequest,
  'POST admin/login': adminLogin,
  'POST admin/qr-create': adminQrCreate,
  'POST admin/redeem-scan': adminRedeemScan,
  'GET admin/announcements': adminAnnouncements,
  'POST admin/announcements': adminAnnouncements,
  'PUT admin/announcements': adminAnnouncements,
  'GET admin/stats': adminStats,
  'GET announcements/public': announcementsPublic
}

export function resolvePath(req) {
  const q = req.query?.path
  if (Array.isArray(q)) return q.join('/')
  if (typeof q === 'string' && q) return q

  try {
    const pathname = new URL(req.url || '/', 'http://localhost').pathname
    return pathname.replace(/^\/api\/?/, '').replace(/\/$/, '')
  } catch {
    return ''
  }
}

export async function dispatch(req, res) {
  const path = resolvePath(req) || 'health'
  const key = `${req.method} ${path}`
  const handler = routes[key]

  if (!handler) {
    return json(res, 404, { error: 'Endpoint bulunamadı', path, method: req.method })
  }

  return handler(req, res)
}
