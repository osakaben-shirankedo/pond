import { describe, it, expect, beforeAll } from 'bun:test'
import { createTestEnv } from './helpers/setup'

describe('GET /health', () => {
  let fetch: ReturnType<typeof createTestEnv>['fetch']

  beforeAll(() => {
    ;({ fetch } = createTestEnv())
  })

  it('returns 200 with status ok', async () => {
    const res = await fetch('/health')
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({ status: 'ok' })
  })
})
