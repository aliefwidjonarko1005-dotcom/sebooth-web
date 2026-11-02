// Read-only check of _harness/sql/queue-privacy.sql, as the public anon key sees the database.
// HEAD requests only: just status codes and row counts come back, never any values.
//
// Usage: node scripts/verify_queue_privacy.mjs
// Exits 1 while private columns are still readable, so it fails until the SQL has been applied.
import fs from 'node:fs'

const env = Object.fromEntries(
  fs
    .readFileSync('.env.local', 'utf8')
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith('#') && line.includes('='))
    .map((line) => {
      const i = line.indexOf('=')
      return [line.slice(0, i).trim(), line.slice(i + 1).trim().replace(/^["']|["']$/g, '')]
    })
)

const url = env.NEXT_PUBLIC_SUPABASE_URL
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const headers = { apikey: key, Authorization: `Bearer ${key}`, Prefer: 'count=exact', Range: '0-0' }

const statusOf = async (table, select) => {
  const res = await fetch(`${url}/rest/v1/${table}?select=${select}`, { method: 'HEAD', headers })
  return res.status
}

const checks = [
  ['queue_tickets.phone_number', 'queue_tickets', 'phone_number', 'refused'],
  ['queue_tickets.user_id', 'queue_tickets', 'user_id', 'refused'],
  ['queue_tickets.session_id', 'queue_tickets', 'session_id', 'refused'],
  ['queue_tickets.id', 'queue_tickets', 'id', 'refused'],
  ['queue_tickets, all columns', 'queue_tickets', '*', 'refused'],
  ['push_subscriptions', 'push_subscriptions', '*', 'refused'],
  ['queue_tickets, venue screen columns', 'queue_tickets', 'event_id,queue_number,display_name,status,called_at,completed_at,is_checked_in', 'allowed'],
  ['queue_events', 'queue_events', '*', 'allowed'],
]

let failed = 0
for (const [label, table, select, expected] of checks) {
  const status = await statusOf(table, select)
  const actual = status >= 200 && status < 300 ? 'allowed' : status === 401 || status === 403 ? 'refused' : `HTTP ${status}`
  const ok = actual === expected
  if (!ok) failed += 1
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}: ${actual} (expected ${expected})`)
}

console.log(failed ? `\n${failed} check(s) failed` : '\nAll checks passed')
process.exit(failed ? 1 : 0)
