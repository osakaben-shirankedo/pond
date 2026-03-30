import { describe, it, expect, beforeEach } from 'bun:test'
import { createTestEnv, json, authHeader, registerUser } from './helpers/setup'

describe('Timeline endpoints (not implemented)', () => {
  let fetch: ReturnType<typeof createTestEnv>['fetch']
  let token: string

  beforeEach(async () => {
    ;({ fetch } = createTestEnv())
    token = await registerUser(fetch)
  })

  it('GET /timeline → 501', async () => {
    const res = await fetch('/timeline', { headers: authHeader(token) })
    expect(res.status).toBe(501)
  })

  it('POST /timeline/post → 501', async () => {
    const res = await fetch('/timeline/post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader(token) },
      body: JSON.stringify({ content: 'Hello' }),
    })
    expect(res.status).toBe(501)
  })

  it('POST /timeline/like/:id → 501', async () => {
    const res = await fetch('/timeline/like/some-id', {
      method: 'POST',
      headers: authHeader(token),
    })
    expect(res.status).toBe(501)
  })

  it('POST /timeline/unlike/:id → 501', async () => {
    const res = await fetch('/timeline/unlike/some-id', {
      method: 'POST',
      headers: authHeader(token),
    })
    expect(res.status).toBe(501)
  })

  it('POST /timeline/reply/:id → 501', async () => {
    const res = await fetch('/timeline/reply/some-id', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader(token) },
      body: JSON.stringify({ content: 'Reply' }),
    })
    expect(res.status).toBe(501)
  })

  it('POST /timeline/unreply/:id → 501', async () => {
    const res = await fetch('/timeline/unreply/some-id', {
      method: 'POST',
      headers: authHeader(token),
    })
    expect(res.status).toBe(501)
  })

  it('401: unauthenticated requests rejected', async () => {
    const res = await fetch('/timeline')
    expect(res.status).toBe(401)
  })
})
