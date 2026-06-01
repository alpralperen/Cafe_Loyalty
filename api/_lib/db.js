import { neon } from '@neondatabase/serverless'
import { getDatabaseUrl } from './config.js'

let sql

export function getDb() {
  if (!sql) sql = neon(getDatabaseUrl())
  return sql
}
