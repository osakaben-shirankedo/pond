import { createMiddleware } from 'hono/factory'
import { verify } from 'hono/jwt'
import type { Env } from '../../index'

export const authMiddleware = createMiddleware<Env>(async (c, next) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'UNAUTHORIZED' }, 401)
  }
  const token = authHeader.slice(7)
  try {
    const payload = await verify(token, c.env.JWT_SECRET, 'HS256')
    c.set('userId', payload.sub as string)
    await next()
  } catch {
    return c.json({ error: 'UNAUTHORIZED' }, 401)
  }
})
