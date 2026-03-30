import { describe, it, expect, beforeEach } from 'bun:test'
import { createTestEnv, json, authHeader, registerUser } from './helpers/setup'

describe('Auth endpoints', () => {
  let fetch: ReturnType<typeof createTestEnv>['fetch']

  beforeEach(() => {
    ;({ fetch } = createTestEnv())
  })

  // ──────────────────────────────────────────
  // POST /register
  // ──────────────────────────────────────────
  describe('POST /register', () => {
    it('201: valid input', async () => {
      const res = await fetch('/register', {
        method: 'POST',
        ...json({ email: 'a@test.com', password: 'password123', nickname: 'Alice' }),
      })
      expect(res.status).toBe(201)
      const body = (await res.json()) as any
      expect(body.email).toBe('a@test.com')
      expect(body.nickname).toBe('Alice')
      expect(body.id).toBeString()
    })

    it('400: missing required fields', async () => {
      const res = await fetch('/register', {
        method: 'POST',
        ...json({ email: 'a@test.com' }),
      })
      expect(res.status).toBe(400)
    })

    it('400: invalid email', async () => {
      const res = await fetch('/register', {
        method: 'POST',
        ...json({ email: 'not-an-email', password: 'password123', nickname: 'Alice' }),
      })
      expect(res.status).toBe(400)
    })

    it('400: password too short', async () => {
      const res = await fetch('/register', {
        method: 'POST',
        ...json({ email: 'a@test.com', password: 'short', nickname: 'Alice' }),
      })
      expect(res.status).toBe(400)
    })

    it('409: duplicate email', async () => {
      const payload = { email: 'dup@test.com', password: 'password123', nickname: 'Bob' }
      await fetch('/register', { method: 'POST', ...json(payload) })
      const res = await fetch('/register', { method: 'POST', ...json(payload) })
      expect(res.status).toBe(409)
      const body = (await res.json()) as any
      expect(body.error).toBe('EMAIL_ALREADY_EXISTS')
    })
  })

  // ──────────────────────────────────────────
  // POST /login
  // ──────────────────────────────────────────
  describe('POST /login', () => {
    beforeEach(async () => {
      await fetch('/register', {
        method: 'POST',
        ...json({ email: 'user@test.com', password: 'password123', nickname: 'User' }),
      })
    })

    it('200: valid credentials returns token', async () => {
      const res = await fetch('/login', {
        method: 'POST',
        ...json({ email: 'user@test.com', password: 'password123' }),
      })
      expect(res.status).toBe(200)
      const body = (await res.json()) as any
      expect(body.token).toBeString()
    })

    it('401: wrong password', async () => {
      const res = await fetch('/login', {
        method: 'POST',
        ...json({ email: 'user@test.com', password: 'wrongpassword' }),
      })
      expect(res.status).toBe(401)
      const body = (await res.json()) as any
      expect(body.error).toBe('INVALID_CREDENTIALS')
    })

    it('401: unknown email', async () => {
      const res = await fetch('/login', {
        method: 'POST',
        ...json({ email: 'nobody@test.com', password: 'password123' }),
      })
      expect(res.status).toBe(401)
    })

    it('400: invalid body', async () => {
      const res = await fetch('/login', {
        method: 'POST',
        ...json({ email: 'not-an-email', password: 'password123' }),
      })
      expect(res.status).toBe(400)
    })
  })

  // ──────────────────────────────────────────
  // POST /register/profile
  // ──────────────────────────────────────────
  describe('POST /register/profile', () => {
    it('201: creates profile with valid token', async () => {
      const token = await registerUser(fetch)
      const res = await fetch('/register/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader(token) },
        body: JSON.stringify({ name: 'Alice', bio: 'Hello', avatar: '' }),
      })
      expect(res.status).toBe(201)
      const body = (await res.json()) as any
      expect(body.name).toBe('Alice')
    })

    it('401: no token', async () => {
      const res = await fetch('/register/profile', {
        method: 'POST',
        ...json({ name: 'Alice' }),
      })
      expect(res.status).toBe(401)
    })

    it('400: missing name', async () => {
      const token = await registerUser(fetch)
      const res = await fetch('/register/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader(token) },
        body: JSON.stringify({ bio: 'Hello' }),
      })
      expect(res.status).toBe(400)
    })
  })

  // ──────────────────────────────────────────
  // POST /logout
  // ──────────────────────────────────────────
  describe('POST /logout', () => {
    it('200: valid token', async () => {
      const token = await registerUser(fetch)
      const res = await fetch('/logout', {
        method: 'POST',
        headers: authHeader(token),
      })
      expect(res.status).toBe(200)
      const body = (await res.json()) as any
      expect(body.success).toBe(true)
    })

    it('401: no token', async () => {
      const res = await fetch('/logout', { method: 'POST' })
      expect(res.status).toBe(401)
    })
  })
})
