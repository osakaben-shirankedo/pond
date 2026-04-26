// @ts-ignore - bun:sqlite is available in Bun test runtime
import { Database } from 'bun:sqlite'
import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { sign } from 'hono/jwt'
import app from '../../src/index'
import { createD1Mock } from './d1Mock'

const MIGRATIONS_DIR = resolve(import.meta.dir, '../../migrations')
const JWT_SECRET = 'test-secret'

function applyMigrations(sqliteDb: InstanceType<typeof Database>) {
  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => /^\d{4}_.*\.sql$/.test(f))
    .sort()
  for (const file of files) {
    const sql = readFileSync(resolve(MIGRATIONS_DIR, file), 'utf-8')
    const statements = sql
      .split(/;|-->\s*statement-breakpoint/)
      .map((s) => s.trim())
      .filter(Boolean)
    for (const stmt of statements) {
      try {
        sqliteDb.exec(stmt)
      } catch {
        // ignore errors from already-applied or no-op statements
      }
    }
  }
}

export function createTestEnv() {
  // @ts-ignore
  const sqliteDb = new Database(':memory:')
  applyMigrations(sqliteDb)

  const mockD1 = createD1Mock(sqliteDb)
  const bindings = { POND_DB: mockD1 as unknown, JWT_SECRET }

  const fetch = (path: string, init?: RequestInit) =>
    app.request(path, init, bindings as any)

  return { fetch, sqliteDb, bindings }
}

export function json(body: unknown): RequestInit {
  return {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }
}

export async function registerUser(
  fetch: ReturnType<typeof createTestEnv>['fetch'],
  email = 'user@test.com',
  password = 'password123',
  nickname = 'TestUser',
) {
  await fetch('/register', {
    method: 'POST',
    ...json({ email, password, nickname }),
  })
  const res = await fetch('/login', {
    method: 'POST',
    ...json({ email, password }),
  })
  const data = (await res.json()) as { token: string }
  return data.token
}

export function authHeader(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` }
}

export async function makeToken(userId: string): Promise<string> {
  return sign(
    { sub: userId, exp: Math.floor(Date.now() / 1000) + 60 * 60 },
    JWT_SECRET,
  )
}
