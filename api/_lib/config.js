export const BEANS_PER_FREE_COFFEE = 10
export const EARN_QR_TTL_MINUTES = 5
export const REDEEM_QR_TTL_MINUTES = 2
export const DAILY_QR_WARNING_THRESHOLD = 50
export const ANOMALY_BEANS_SINGLE_QR = 20

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET ortam değişkeni tanımlı değil')
  return secret
}

export function getDatabaseUrl() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL ortam değişkeni tanımlı değil')
  return url
}
