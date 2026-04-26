import { describe, it, expect, beforeEach } from 'bun:test'
import { createTestEnv, json, authHeader, registerUser } from './helpers/setup'

describe('Pond endpoints', () => {
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

  function seedPond(pondId: string, memberIds: string[] = []) {
    const now = new Date().toISOString()
    const chatRoomId = crypto.randomUUID()
    sqliteDb
      .prepare(
        'INSERT INTO chat_rooms (id, created_at, updated_at) VALUES (?, ?, ?)',
      )
      .run(chatRoomId, now, now)
    sqliteDb
      .prepare(
        'INSERT INTO ponds (id, name, description, member_ids, chat_room_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      )
      .run(pondId, 'Test Pond', 'desc', JSON.stringify(memberIds), chatRoomId, now, now)
    return { pondId, chatRoomId }
  }

  function seedMessage(chatRoomId: string, msgUserId: string) {
    const msgId = crypto.randomUUID()
    const now = new Date().toISOString()
    sqliteDb
      .prepare(
        'INSERT INTO messages (id, chat_room_id, user_id, content, reply_to_id, public_range, created_at, updated_at) VALUES (?, ?, ?, ?, NULL, ?, ?, ?)',
      )
      .run(msgId, chatRoomId, msgUserId, 'Hello', 'all', now, now)
    return msgId
  }

  // ──────────────────────────────────────────
  // GET /pond/list
  // ──────────────────────────────────────────
  describe('GET /pond/list', () => {
    it('200: returns empty array when not in any pond', async () => {
      const res = await fetch('/pond/list', { headers: authHeader(token) })
      expect(res.status).toBe(200)
      expect(await res.json()).toEqual([])
    })

    it('200: returns ponds user is member of', async () => {
      const pondId = crypto.randomUUID()
      seedPond(pondId, [userId])
      const res = await fetch('/pond/list', { headers: authHeader(token) })
      expect(res.status).toBe(200)
      const body = (await res.json()) as any[]
      expect(body.length).toBe(1)
      expect(body[0].id).toBe(pondId)
    })

    it('401: no token', async () => {
      const res = await fetch('/pond/list')
      expect(res.status).toBe(401)
    })
  })

  // ──────────────────────────────────────────
  // GET /pond/:pond_id/status
  // ──────────────────────────────────────────
  describe('GET /pond/:pond_id/status', () => {
    it('200: returns pond', async () => {
      const pondId = crypto.randomUUID()
      seedPond(pondId, [userId])
      const res = await fetch(`/pond/${pondId}/status`, { headers: authHeader(token) })
      expect(res.status).toBe(200)
      const body = (await res.json()) as any
      expect(body.id).toBe(pondId)
    })

    it('404: pond not found', async () => {
      const res = await fetch('/pond/nonexistent/status', { headers: authHeader(token) })
      expect(res.status).toBe(404)
    })

    it('401: no token', async () => {
      const res = await fetch('/pond/some-id/status')
      expect(res.status).toBe(401)
    })
  })

  // ──────────────────────────────────────────
  // GET /pond/:pond_id/chat
  // ──────────────────────────────────────────
  describe('GET /pond/:pond_id/chat', () => {
    it('200: returns messages', async () => {
      const pondId = crypto.randomUUID()
      const { chatRoomId } = seedPond(pondId, [userId])
      seedMessage(chatRoomId, userId)

      const res = await fetch(`/pond/${pondId}/chat`, { headers: authHeader(token) })
      expect(res.status).toBe(200)
      const body = (await res.json()) as any[]
      expect(body.length).toBe(1)
      expect(body[0].content).toBe('Hello')
    })

    it('404: pond not found', async () => {
      const res = await fetch('/pond/nonexistent/chat', { headers: authHeader(token) })
      expect(res.status).toBe(404)
    })

    it('401: no token', async () => {
      const res = await fetch('/pond/some-id/chat')
      expect(res.status).toBe(401)
    })
  })

  // ──────────────────────────────────────────
  // POST /pond/:pond_id/chat/message
  // ──────────────────────────────────────────
  describe('POST /pond/:pond_id/chat/message', () => {
    it('201: member can post message', async () => {
      const pondId = crypto.randomUUID()
      seedPond(pondId, [userId])
      const res = await fetch(`/pond/${pondId}/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader(token) },
        body: JSON.stringify({ content: 'Hi!' }),
      })
      expect(res.status).toBe(201)
      const body = (await res.json()) as any
      expect(body.content).toBe('Hi!')
    })

    it('403: non-member cannot post', async () => {
      const pondId = crypto.randomUUID()
      seedPond(pondId, []) // no members
      const res = await fetch(`/pond/${pondId}/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader(token) },
        body: JSON.stringify({ content: 'Hi!' }),
      })
      expect(res.status).toBe(403)
    })

    it('404: pond not found', async () => {
      const res = await fetch('/pond/nonexistent/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader(token) },
        body: JSON.stringify({ content: 'Hi!' }),
      })
      expect(res.status).toBe(404)
    })

    it('400: empty content', async () => {
      const pondId = crypto.randomUUID()
      seedPond(pondId, [userId])
      const res = await fetch(`/pond/${pondId}/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader(token) },
        body: JSON.stringify({ content: '' }),
      })
      expect(res.status).toBe(400)
    })

    it('401: no token', async () => {
      const res = await fetch('/pond/some-id/chat/message', {
        method: 'POST',
        ...json({ content: 'Hi!' }),
      })
      expect(res.status).toBe(401)
    })
  })

  // ──────────────────────────────────────────
  // POST /pond/:pond_id/chat/:message_id/edit
  // ──────────────────────────────────────────
  describe('POST /pond/:pond_id/chat/:message_id/edit', () => {
    it('200: owner can edit', async () => {
      const pondId = crypto.randomUUID()
      const { chatRoomId } = seedPond(pondId, [userId])
      const msgId = seedMessage(chatRoomId, userId)

      const res = await fetch(`/pond/${pondId}/chat/${msgId}/edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader(token) },
        body: JSON.stringify({ content: 'Edited!' }),
      })
      expect(res.status).toBe(200)
      const body = (await res.json()) as any
      expect(body.content).toBe('Edited!')
    })

    it('403: cannot edit others message', async () => {
      const pondId = crypto.randomUUID()
      const { chatRoomId } = seedPond(pondId, [userId])
      const otherId = crypto.randomUUID()
      const msgId = seedMessage(chatRoomId, otherId)

      const res = await fetch(`/pond/${pondId}/chat/${msgId}/edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader(token) },
        body: JSON.stringify({ content: 'Hacked!' }),
      })
      expect(res.status).toBe(403)
    })

    it('404: message not found', async () => {
      const pondId = crypto.randomUUID()
      seedPond(pondId, [userId])
      const res = await fetch(`/pond/${pondId}/chat/nonexistent/edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader(token) },
        body: JSON.stringify({ content: 'x' }),
      })
      expect(res.status).toBe(404)
    })

    it('401: no token', async () => {
      const res = await fetch('/pond/x/chat/y/edit', {
        method: 'POST',
        ...json({ content: 'x' }),
      })
      expect(res.status).toBe(401)
    })
  })

  // ──────────────────────────────────────────
  // POST /pond/:pond_id/chat/:message_id/delete
  // ──────────────────────────────────────────
  describe('POST /pond/:pond_id/chat/:message_id/delete', () => {
    it('200: owner can delete', async () => {
      const pondId = crypto.randomUUID()
      const { chatRoomId } = seedPond(pondId, [userId])
      const msgId = seedMessage(chatRoomId, userId)

      const res = await fetch(`/pond/${pondId}/chat/${msgId}/delete`, {
        method: 'POST',
        headers: authHeader(token),
      })
      expect(res.status).toBe(200)
      const body = (await res.json()) as any
      expect(body.success).toBe(true)
    })

    it('403: cannot delete others message', async () => {
      const pondId = crypto.randomUUID()
      const { chatRoomId } = seedPond(pondId, [userId])
      const otherId = crypto.randomUUID()
      const msgId = seedMessage(chatRoomId, otherId)

      const res = await fetch(`/pond/${pondId}/chat/${msgId}/delete`, {
        method: 'POST',
        headers: authHeader(token),
      })
      expect(res.status).toBe(403)
    })

    it('404: message not found', async () => {
      const pondId = crypto.randomUUID()
      seedPond(pondId, [userId])
      const res = await fetch(`/pond/${pondId}/chat/nonexistent/delete`, {
        method: 'POST',
        headers: authHeader(token),
      })
      expect(res.status).toBe(404)
    })

    it('401: no token', async () => {
      const res = await fetch('/pond/x/chat/y/delete', { method: 'POST' })
      expect(res.status).toBe(401)
    })
  })

  // ──────────────────────────────────────────
  // POST /pond/:pond_id/chat/:message_id/reply
  // ──────────────────────────────────────────
  describe('POST /pond/:pond_id/chat/:message_id/reply', () => {
    it('201: member can reply', async () => {
      const pondId = crypto.randomUUID()
      const { chatRoomId } = seedPond(pondId, [userId])
      const msgId = seedMessage(chatRoomId, userId)

      const res = await fetch(`/pond/${pondId}/chat/${msgId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader(token) },
        body: JSON.stringify({ content: 'Reply!' }),
      })
      expect(res.status).toBe(201)
      const body = (await res.json()) as any
      expect(body.reply_to_id).toBe(msgId)
    })

    it('403: non-member cannot reply', async () => {
      const pondId = crypto.randomUUID()
      const { chatRoomId } = seedPond(pondId, [])
      const otherId = crypto.randomUUID()
      const msgId = seedMessage(chatRoomId, otherId)

      const res = await fetch(`/pond/${pondId}/chat/${msgId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader(token) },
        body: JSON.stringify({ content: 'Reply!' }),
      })
      expect(res.status).toBe(403)
    })

    it('404: pond not found', async () => {
      const res = await fetch('/pond/nonexistent/chat/some-msg/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader(token) },
        body: JSON.stringify({ content: 'Reply!' }),
      })
      expect(res.status).toBe(404)
    })

    it('401: no token', async () => {
      const res = await fetch('/pond/x/chat/y/reply', {
        method: 'POST',
        ...json({ content: 'Reply!' }),
      })
      expect(res.status).toBe(401)
    })
  })
})
