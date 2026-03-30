import { describe, it, expect, beforeEach } from 'bun:test'
import { createTestEnv, json, authHeader, registerUser } from './helpers/setup'

describe('Ike endpoints', () => {
  let fetch: ReturnType<typeof createTestEnv>['fetch']
  let sqliteDb: ReturnType<typeof createTestEnv>['sqliteDb']
  let token: string
  let userId: string

  beforeEach(async () => {
    ;({ fetch, sqliteDb } = createTestEnv())
    token = await registerUser(fetch)

    // Fetch userId from DB
    const row = sqliteDb.prepare('SELECT id FROM users LIMIT 1').get() as { id: string }
    userId = row.id
  })

  function seedIke(ikeId: string, memberIds: string[] = []) {
    const now = new Date().toISOString()
    const chatRoomId = crypto.randomUUID()
    sqliteDb
      .prepare(
        'INSERT INTO chat_rooms (id, created_at, updated_at) VALUES (?, ?, ?)',
      )
      .run(chatRoomId, now, now)
    sqliteDb
      .prepare(
        'INSERT INTO ikes (id, ike_name, description, member_ids, chat_room_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      )
      .run(ikeId, 'Test Ike', 'desc', JSON.stringify(memberIds), chatRoomId, now, now)
    return { ikeId, chatRoomId }
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
  // GET /ike/list
  // ──────────────────────────────────────────
  describe('GET /ike/list', () => {
    it('200: returns empty array when not in any ike', async () => {
      const res = await fetch('/ike/list', { headers: authHeader(token) })
      expect(res.status).toBe(200)
      expect(await res.json()).toEqual([])
    })

    it('200: returns ikes user is member of', async () => {
      const ikeId = crypto.randomUUID()
      seedIke(ikeId, [userId])
      const res = await fetch('/ike/list', { headers: authHeader(token) })
      expect(res.status).toBe(200)
      const body = (await res.json()) as any[]
      expect(body.length).toBe(1)
      expect(body[0].id).toBe(ikeId)
    })

    it('401: no token', async () => {
      const res = await fetch('/ike/list')
      expect(res.status).toBe(401)
    })
  })

  // ──────────────────────────────────────────
  // GET /ike/:ike_id/status
  // ──────────────────────────────────────────
  describe('GET /ike/:ike_id/status', () => {
    it('200: returns ike', async () => {
      const ikeId = crypto.randomUUID()
      seedIke(ikeId, [userId])
      const res = await fetch(`/ike/${ikeId}/status`, { headers: authHeader(token) })
      expect(res.status).toBe(200)
      const body = (await res.json()) as any
      expect(body.id).toBe(ikeId)
    })

    it('404: ike not found', async () => {
      const res = await fetch('/ike/nonexistent/status', { headers: authHeader(token) })
      expect(res.status).toBe(404)
    })

    it('401: no token', async () => {
      const res = await fetch('/ike/some-id/status')
      expect(res.status).toBe(401)
    })
  })

  // ──────────────────────────────────────────
  // GET /ike/:ike_id/chat
  // ──────────────────────────────────────────
  describe('GET /ike/:ike_id/chat', () => {
    it('200: returns messages', async () => {
      const ikeId = crypto.randomUUID()
      const { chatRoomId } = seedIke(ikeId, [userId])
      seedMessage(chatRoomId, userId)

      const res = await fetch(`/ike/${ikeId}/chat`, { headers: authHeader(token) })
      expect(res.status).toBe(200)
      const body = (await res.json()) as any[]
      expect(body.length).toBe(1)
      expect(body[0].content).toBe('Hello')
    })

    it('404: ike not found', async () => {
      const res = await fetch('/ike/nonexistent/chat', { headers: authHeader(token) })
      expect(res.status).toBe(404)
    })

    it('401: no token', async () => {
      const res = await fetch('/ike/some-id/chat')
      expect(res.status).toBe(401)
    })
  })

  // ──────────────────────────────────────────
  // POST /ike/:ike_id/chat/message
  // ──────────────────────────────────────────
  describe('POST /ike/:ike_id/chat/message', () => {
    it('201: member can post message', async () => {
      const ikeId = crypto.randomUUID()
      seedIke(ikeId, [userId])
      const res = await fetch(`/ike/${ikeId}/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader(token) },
        body: JSON.stringify({ content: 'Hi!' }),
      })
      expect(res.status).toBe(201)
      const body = (await res.json()) as any
      expect(body.content).toBe('Hi!')
    })

    it('403: non-member cannot post', async () => {
      const ikeId = crypto.randomUUID()
      seedIke(ikeId, []) // no members
      const res = await fetch(`/ike/${ikeId}/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader(token) },
        body: JSON.stringify({ content: 'Hi!' }),
      })
      expect(res.status).toBe(403)
    })

    it('404: ike not found', async () => {
      const res = await fetch('/ike/nonexistent/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader(token) },
        body: JSON.stringify({ content: 'Hi!' }),
      })
      expect(res.status).toBe(404)
    })

    it('400: empty content', async () => {
      const ikeId = crypto.randomUUID()
      seedIke(ikeId, [userId])
      const res = await fetch(`/ike/${ikeId}/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader(token) },
        body: JSON.stringify({ content: '' }),
      })
      expect(res.status).toBe(400)
    })

    it('401: no token', async () => {
      const res = await fetch('/ike/some-id/chat/message', {
        method: 'POST',
        ...json({ content: 'Hi!' }),
      })
      expect(res.status).toBe(401)
    })
  })

  // ──────────────────────────────────────────
  // POST /ike/:ike_id/chat/:message_id/edit
  // ──────────────────────────────────────────
  describe('POST /ike/:ike_id/chat/:message_id/edit', () => {
    it('200: owner can edit', async () => {
      const ikeId = crypto.randomUUID()
      const { chatRoomId } = seedIke(ikeId, [userId])
      const msgId = seedMessage(chatRoomId, userId)

      const res = await fetch(`/ike/${ikeId}/chat/${msgId}/edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader(token) },
        body: JSON.stringify({ content: 'Edited!' }),
      })
      expect(res.status).toBe(200)
      const body = (await res.json()) as any
      expect(body.content).toBe('Edited!')
    })

    it('403: cannot edit others message', async () => {
      const ikeId = crypto.randomUUID()
      const { chatRoomId } = seedIke(ikeId, [userId])
      const otherId = crypto.randomUUID()
      const msgId = seedMessage(chatRoomId, otherId) // message by another user

      const res = await fetch(`/ike/${ikeId}/chat/${msgId}/edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader(token) },
        body: JSON.stringify({ content: 'Hacked!' }),
      })
      expect(res.status).toBe(403)
    })

    it('404: message not found', async () => {
      const ikeId = crypto.randomUUID()
      seedIke(ikeId, [userId])
      const res = await fetch(`/ike/${ikeId}/chat/nonexistent/edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader(token) },
        body: JSON.stringify({ content: 'x' }),
      })
      expect(res.status).toBe(404)
    })

    it('401: no token', async () => {
      const res = await fetch('/ike/x/chat/y/edit', {
        method: 'POST',
        ...json({ content: 'x' }),
      })
      expect(res.status).toBe(401)
    })
  })

  // ──────────────────────────────────────────
  // POST /ike/:ike_id/chat/:message_id/delete
  // ──────────────────────────────────────────
  describe('POST /ike/:ike_id/chat/:message_id/delete', () => {
    it('200: owner can delete', async () => {
      const ikeId = crypto.randomUUID()
      const { chatRoomId } = seedIke(ikeId, [userId])
      const msgId = seedMessage(chatRoomId, userId)

      const res = await fetch(`/ike/${ikeId}/chat/${msgId}/delete`, {
        method: 'POST',
        headers: authHeader(token),
      })
      expect(res.status).toBe(200)
      const body = (await res.json()) as any
      expect(body.success).toBe(true)
    })

    it('403: cannot delete others message', async () => {
      const ikeId = crypto.randomUUID()
      const { chatRoomId } = seedIke(ikeId, [userId])
      const otherId = crypto.randomUUID()
      const msgId = seedMessage(chatRoomId, otherId)

      const res = await fetch(`/ike/${ikeId}/chat/${msgId}/delete`, {
        method: 'POST',
        headers: authHeader(token),
      })
      expect(res.status).toBe(403)
    })

    it('404: message not found', async () => {
      const ikeId = crypto.randomUUID()
      seedIke(ikeId, [userId])
      const res = await fetch(`/ike/${ikeId}/chat/nonexistent/delete`, {
        method: 'POST',
        headers: authHeader(token),
      })
      expect(res.status).toBe(404)
    })

    it('401: no token', async () => {
      const res = await fetch('/ike/x/chat/y/delete', { method: 'POST' })
      expect(res.status).toBe(401)
    })
  })

  // ──────────────────────────────────────────
  // POST /ike/:ike_id/chat/:message_id/reply
  // ──────────────────────────────────────────
  describe('POST /ike/:ike_id/chat/:message_id/reply', () => {
    it('201: member can reply', async () => {
      const ikeId = crypto.randomUUID()
      const { chatRoomId } = seedIke(ikeId, [userId])
      const msgId = seedMessage(chatRoomId, userId)

      const res = await fetch(`/ike/${ikeId}/chat/${msgId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader(token) },
        body: JSON.stringify({ content: 'Reply!' }),
      })
      expect(res.status).toBe(201)
      const body = (await res.json()) as any
      expect(body.reply_to_id).toBe(msgId)
    })

    it('403: non-member cannot reply', async () => {
      const ikeId = crypto.randomUUID()
      const { chatRoomId } = seedIke(ikeId, []) // user is not a member
      const otherId = crypto.randomUUID()
      const msgId = seedMessage(chatRoomId, otherId)

      const res = await fetch(`/ike/${ikeId}/chat/${msgId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader(token) },
        body: JSON.stringify({ content: 'Reply!' }),
      })
      expect(res.status).toBe(403)
    })

    it('404: ike not found', async () => {
      const res = await fetch('/ike/nonexistent/chat/some-msg/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader(token) },
        body: JSON.stringify({ content: 'Reply!' }),
      })
      expect(res.status).toBe(404)
    })

    it('401: no token', async () => {
      const res = await fetch('/ike/x/chat/y/reply', {
        method: 'POST',
        ...json({ content: 'Reply!' }),
      })
      expect(res.status).toBe(401)
    })
  })
})
