const API_BASE = import.meta.env.VITE_API_BASE || '/api'

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data.error || 'İstek başarısız')
    err.status = res.status
    err.data = data
    throw err
  }
  return data
}

export const api = {
  health: () => request('/health'),
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: (token) =>
    request('/customer/me', { headers: { Authorization: `Bearer ${token}` } }),
  history: (token) =>
    request('/customer/history', { headers: { Authorization: `Bearer ${token}` } }),
  scanEarn: (token, qrToken) =>
    request('/customer/scan-earn', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ token: qrToken })
    }),
  redeemRequest: (token) =>
    request('/customer/redeem-request', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    }),
  publicAnnouncements: () => request('/announcements/public'),
  adminLogin: (body) => request('/admin/login', { method: 'POST', body: JSON.stringify(body) }),
  adminStats: (token) =>
    request('/admin/stats', { headers: { Authorization: `Bearer ${token}` } }),
  adminQrCreate: (token, beans_amount) =>
    request('/admin/qr-create', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ beans_amount })
    }),
  adminRedeemScan: (token, qrToken) =>
    request('/admin/redeem-scan', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ token: qrToken })
    }),
  adminAnnouncements: (token, method = 'GET', body) =>
    request('/admin/announcements', {
      method,
      headers: { Authorization: `Bearer ${token}` },
      body: body ? JSON.stringify(body) : undefined
    })
}
