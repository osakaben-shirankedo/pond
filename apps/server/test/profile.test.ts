import { describe, it, expect, beforeEach } from 'bun:test'
import { createTestEnv, authHeader, registerUser } from './helpers/setup'

describe('Profile endpoints', () => {
  let fetch: ReturnType<typeof createTestEnv>['fetch']
  let sqliteDb: ReturnType<typeof createTestEnv>['sqliteDb']
  let token: string
  let userId: string

  beforeEach(async () => {
    ;({ fetch, sqliteDb } = createTestEnv())
    token = await registerUser(fetch)
    const row = sqliteDb.prepare('SELECT id FROM users LIMIT 1').get() as { id: string }
    userId = row.id
  })

  function seedProfile(targetUserId = userId) {
    const profileId = crypto.randomUUID()
    const now = new Date().toISOString()
    sqliteDb
      .prepare(
        'INSERT INTO profiles (id, user_id, name, bio, avatar, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      )
      .run(profileId, targetUserId, 'Alice', 'Hello', '', now, now)
    return profileId
  }

  // ──────────────────────────────────────────
  // GET /profile
  // ──────────────────────────────────────────
  describe('GET /profile', () => {
    it('200: returns own profile', async () => {
      seedProfile()
      const res = await fetch('/profile', { headers: authHeader(token) })
      expect(res.status).toBe(200)
      const body = (await res.json()) as any
      expect(body.name).toBe('Alice')
    })

    it('404: no profile yet', async () => {
      const res = await fetch('/profile', { headers: authHeader(token) })
      expect(res.status).toBe(404)
    })

    it('401: no token', async () => {
      const res = await fetch('/profile')
      expect(res.status).toBe(401)
    })
  })

  // ──────────────────────────────────────────
  // POST /profile/edit
  // ──────────────────────────────────────────
  describe('POST /profile/edit', () => {
    it('200: updates profile', async () => {
      seedProfile()
      const res = await fetch('/profile/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader(token) },
        body: JSON.stringify({ name: 'Bob', bio: 'Updated' }),
      })
      expect(res.status).toBe(200)
      const body = (await res.json()) as any
      expect(body.name).toBe('Bob')
      expect(body.bio).toBe('Updated')
    })

    it('404: no profile to edit', async () => {
      const res = await fetch('/profile/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader(token) },
        body: JSON.stringify({ name: 'Bob' }),
      })
      expect(res.status).toBe(404)
    })

    it('401: no token', async () => {
      const res = await fetch('/profile/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Bob' }),
      })
      expect(res.status).toBe(401)
    })
  })

  // ──────────────────────────────────────────
  // GET /profile/:user_id
  // ──────────────────────────────────────────
  describe('GET /profile/:user_id', () => {
    it('200: returns profile by user_id', async () => {
      seedProfile()
      const res = await fetch(`/profile/${userId}`, { headers: authHeader(token) })
      expect(res.status).toBe(200)
      const body = (await res.json()) as any
      expect(body.user_id).toBe(userId)
    })

    it('404: user has no profile', async () => {
      const res = await fetch('/profile/nonexistent-user', { headers: authHeader(token) })
      expect(res.status).toBe(404)
    })

    it('401: no token', async () => {
      const res = await fetch(`/profile/${userId}`)
      expect(res.status).toBe(401)
    })
  })

  // ──────────────────────────────────────────
  // POST /profile/:user_id/edit
  // ──────────────────────────────────────────
  describe('POST /profile/:user_id/edit', () => {
    it('200: edits profile by user_id', async () => {
      seedProfile()
      const res = await fetch(`/profile/${userId}/edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader(token) },
        body: JSON.stringify({ bio: 'New bio' }),
      })
      expect(res.status).toBe(200)
      const body = (await res.json()) as any
      expect(body.bio).toBe('New bio')
    })

    it('404: no profile', async () => {
      const res = await fetch('/profile/nonexistent-user/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader(token) },
        body: JSON.stringify({ bio: 'x' }),
      })
      expect(res.status).toBe(404)
    })

    it('401: no token', async () => {
      const res = await fetch(`/profile/${userId}/edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio: 'x' }),
      })
      expect(res.status).toBe(401)
    })
  })
})
