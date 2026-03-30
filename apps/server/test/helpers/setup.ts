// @ts-ignore - bun:sqlite is available in Bun test runtime
import { Database } from 'bun:sqlite'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { sign } from 'hono/jwt'
import app from '../../src/index'
import { createD1Mock } from './d1Mock'

const MIGRATION_PATH = resolve(import.meta.dir, '../../migrations/0000_third_eternals.sql')
const JWT_SECRET = 'test-secret'

export function createTestEnv() {
  // @ts-ignore
  const sqliteDb = new Database(':memory:')
  const migration = readFileSync(MIGRATION_PATH, 'utf-8')
  sqliteDb.exec(migration)

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
