import { Hono } from 'hono'
import { drizzle } from 'drizzle-orm/d1'
import { z } from 'zod'
import { D1IkeRepository } from '../../infrastructure/repository/d1IkeRepository'
import { D1MessageRepository } from '../../infrastructure/repository/d1MessageRepository'
import { GetIkeListUseCase } from '../../application/ike/getIkeList'
import { GetIkeStatusUseCase } from '../../application/ike/getIkeStatus'
import { GetIkeChatUseCase } from '../../application/ike/getIkeChat'
import { PostMessageUseCase } from '../../application/ike/postMessage'
import { EditMessageUseCase } from '../../application/ike/editMessage'
import { DeleteMessageUseCase } from '../../application/ike/deleteMessage'
import { ReplyMessageUseCase } from '../../application/ike/replyMessage'
import { PostMessageInputSchema } from '../../domain/message/entity'
import { authMiddleware } from '../middleware/auth'
import type { Env } from '../../index'

const router = new Hono<Env>()

router.use('*', authMiddleware)

router.get('/list', async (c) => {
  const db = drizzle(c.env.POND_DB)
  const ikeRepo = new D1IkeRepository(db)
  const ikes = await new GetIkeListUseCase(ikeRepo).execute(c.get('userId'))
  return c.json(ikes)
})

router.get('/:ike_id/status', async (c) => {
  const db = drizzle(c.env.POND_DB)
  const ikeRepo = new D1IkeRepository(db)
  try {
    const ike = await new GetIkeStatusUseCase(ikeRepo).execute(c.req.param('ike_id'))
    return c.json(ike)
  } catch (e) {
    if (e instanceof Error && e.message === 'IKE_NOT_FOUND') return c.json({ error: 'IKE_NOT_FOUND' }, 404)
    throw e
  }
})

router.get('/:ike_id/chat', async (c) => {
  const db = drizzle(c.env.POND_DB)
  const ikeRepo = new D1IkeRepository(db)
  const messageRepo = new D1MessageRepository(db)
  try {
    const messages = await new GetIkeChatUseCase(ikeRepo, messageRepo).execute(c.req.param('ike_id'))
    return c.json(messages)
  } catch (e) {
    if (e instanceof Error && e.message === 'IKE_NOT_FOUND') return c.json({ error: 'IKE_NOT_FOUND' }, 404)
    throw e
  }
})

router.post('/:ike_id/chat/message', async (c) => {
  const body = await c.req.json()
  const parsed = PostMessageInputSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)

  const db = drizzle(c.env.POND_DB)
  const ikeRepo = new D1IkeRepository(db)
  const messageRepo = new D1MessageRepository(db)
  try {
    const message = await new PostMessageUseCase(ikeRepo, messageRepo).execute(c.req.param('ike_id'), c.get('userId'), parsed.data)
    return c.json(message, 201)
  } catch (e) {
    if (e instanceof Error && e.message === 'IKE_NOT_FOUND') return c.json({ error: 'IKE_NOT_FOUND' }, 404)
    if (e instanceof Error && e.message === 'NOT_A_MEMBER') return c.json({ error: 'NOT_A_MEMBER' }, 403)
    throw e
  }
})

router.post('/:ike_id/chat/:message_id/edit', async (c) => {
  const body = await c.req.json()
  const parsed = z.object({ content: z.string().min(1) }).safeParse(body)
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)

  const db = drizzle(c.env.POND_DB)
  const messageRepo = new D1MessageRepository(db)
  try {
    const message = await new EditMessageUseCase(messageRepo).execute(c.req.param('message_id'), c.get('userId'), parsed.data.content)
    return c.json(message)
  } catch (e) {
    if (e instanceof Error && e.message === 'MESSAGE_NOT_FOUND') return c.json({ error: 'MESSAGE_NOT_FOUND' }, 404)
    if (e instanceof Error && e.message === 'FORBIDDEN') return c.json({ error: 'FORBIDDEN' }, 403)
    throw e
  }
})

router.post('/:ike_id/chat/:message_id/delete', async (c) => {
  const db = drizzle(c.env.POND_DB)
  const messageRepo = new D1MessageRepository(db)
  try {
    await new DeleteMessageUseCase(messageRepo).execute(c.req.param('message_id'), c.get('userId'))
    return c.json({ success: true })
  } catch (e) {
    if (e instanceof Error && e.message === 'MESSAGE_NOT_FOUND') return c.json({ error: 'MESSAGE_NOT_FOUND' }, 404)
    if (e instanceof Error && e.message === 'FORBIDDEN') return c.json({ error: 'FORBIDDEN' }, 403)
    throw e
  }
})

router.post('/:ike_id/chat/:message_id/reply', async (c) => {
  const body = await c.req.json()
  const parsed = PostMessageInputSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)

  const db = drizzle(c.env.POND_DB)
  const ikeRepo = new D1IkeRepository(db)
  const messageRepo = new D1MessageRepository(db)
  try {
    const message = await new ReplyMessageUseCase(ikeRepo, messageRepo).execute(c.req.param('ike_id'), c.req.param('message_id'), c.get('userId'), parsed.data)
    return c.json(message, 201)
  } catch (e) {
    if (e instanceof Error && e.message === 'IKE_NOT_FOUND') return c.json({ error: 'IKE_NOT_FOUND' }, 404)
    if (e instanceof Error && e.message === 'NOT_A_MEMBER') return c.json({ error: 'NOT_A_MEMBER' }, 403)
    if (e instanceof Error && e.message === 'MESSAGE_NOT_FOUND') return c.json({ error: 'MESSAGE_NOT_FOUND' }, 404)
    throw e
  }
})

export default router
