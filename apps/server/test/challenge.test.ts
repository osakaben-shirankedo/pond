import { describe, it, expect, beforeEach } from 'bun:test'
import { createTestEnv, authHeader, registerUser } from './helpers/setup'

describe('Challenge endpoints (not implemented)', () => {
  let fetch: ReturnType<typeof createTestEnv>['fetch']
  let token: string

  beforeEach(async () => {
    ;({ fetch } = createTestEnv())
    token = await registerUser(fetch)
  })

  it('GET /challenge/list → 501', async () => {
    const res = await fetch('/challenge/list', { headers: authHeader(token) })
    expect(res.status).toBe(501)
  })

  it('GET /challenge/:id/status → 501', async () => {
    const res = await fetch('/challenge/some-id/status', { headers: authHeader(token) })
    expect(res.status).toBe(501)
  })

  it('GET /challenge/:id/chat → 501', async () => {
    const res = await fetch('/challenge/some-id/chat', { headers: authHeader(token) })
    expect(res.status).toBe(501)
  })

  it('401: unauthenticated requests rejected', async () => {
    const res = await fetch('/challenge/list')
    expect(res.status).toBe(401)
  })
})
