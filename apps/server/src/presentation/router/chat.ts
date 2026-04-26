import { Hono } from 'hono'
import { drizzle } from 'drizzle-orm/d1'
import * as v from 'valibot'
import { D1PondRepository } from '../../infrastructure/repository/d1PondRepository'
import { D1MessageRepository } from '../../infrastructure/repository/d1MessageRepository'
import { PostMessageUseCase } from '../../application/pond/postMessage'
import { EditMessageUseCase } from '../../application/pond/editMessage'
import { DeleteMessageUseCase } from '../../application/pond/deleteMessage'
import { ReplyMessageUseCase } from '../../application/pond/replyMessage'
import { PostMessageInput } from '../../domain/message/repository'
import { authMiddleware } from '../middleware/auth'
import type { Env } from '../../index'

const router = new Hono<Env>()

router.use('*', authMiddleware)

// チャットルームIDでメッセージ一覧取得
router.get('/:chat_room_id', async (c) => {
  const db = drizzle(c.env.POND_DB)
  const pondRepo = new D1PondRepository(db)
  const messageRepo = new D1MessageRepository(db)

  const pond = await pondRepo.findByChatRoomId(c.req.param('chat_room_id'))
  if (!pond) return c.json({ error: 'NOT_FOUND' }, 404)
  if (!pond.member_ids.includes(c.get('userId'))) return c.json({ error: 'NOT_A_MEMBER' }, 403)

  const messages = await messageRepo.findByChatRoomId(c.req.param('chat_room_id'))
  return c.json(messages)
})

// メッセージ送信
router.post('/:chat_room_id/message', async (c) => {
  const body = await c.req.json()
  const parsed = v.safeParse(PostMessageInput, body)
  if (!parsed.success) return c.json({ error: v.flatten(parsed.issues) }, 400)

  const db = drizzle(c.env.POND_DB)
  const pondRepo = new D1PondRepository(db)
  const messageRepo = new D1MessageRepository(db)

  const pond = await pondRepo.findByChatRoomId(c.req.param('chat_room_id'))
  if (!pond) return c.json({ error: 'NOT_FOUND' }, 404)

  try {
    const message = await new PostMessageUseCase(pondRepo, messageRepo).execute(pond.id, c.get('userId'), parsed.output)
    return c.json(message, 201)
  } catch (e) {
    if (e instanceof Error && e.message === 'NOT_A_MEMBER') return c.json({ error: 'NOT_A_MEMBER' }, 403)
    throw e
  }
})

// メッセージ編集
router.post('/:chat_room_id/:message_id/edit', async (c) => {
  const body = await c.req.json()
  const parsed = v.safeParse(v.object({ content: v.pipe(v.string(), v.minLength(1)) }), body)
  if (!parsed.success) return c.json({ error: v.flatten(parsed.issues) }, 400)

  const db = drizzle(c.env.POND_DB)
  const messageRepo = new D1MessageRepository(db)

  try {
    const message = await new EditMessageUseCase(messageRepo).execute(c.req.param('message_id'), c.get('userId'), parsed.output.content)
    return c.json(message)
  } catch (e) {
    if (e instanceof Error && e.message === 'MESSAGE_NOT_FOUND') return c.json({ error: 'MESSAGE_NOT_FOUND' }, 404)
    if (e instanceof Error && e.message === 'FORBIDDEN') return c.json({ error: 'FORBIDDEN' }, 403)
    throw e
  }
})

// メッセージ削除
router.post('/:chat_room_id/:message_id/delete', async (c) => {
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

// リプライ
router.post('/:chat_room_id/:message_id/reply', async (c) => {
  const body = await c.req.json()
  const parsed = v.safeParse(PostMessageInput, body)
  if (!parsed.success) return c.json({ error: v.flatten(parsed.issues) }, 400)

  const db = drizzle(c.env.POND_DB)
  const pondRepo = new D1PondRepository(db)
  const messageRepo = new D1MessageRepository(db)

  const pond = await pondRepo.findByChatRoomId(c.req.param('chat_room_id'))
  if (!pond) return c.json({ error: 'NOT_FOUND' }, 404)

  try {
    const message = await new ReplyMessageUseCase(pondRepo, messageRepo).execute(pond.id, c.req.param('message_id'), c.get('userId'), parsed.output)
    return c.json(message, 201)
  } catch (e) {
    if (e instanceof Error && e.message === 'NOT_A_MEMBER') return c.json({ error: 'NOT_A_MEMBER' }, 403)
    if (e instanceof Error && e.message === 'MESSAGE_NOT_FOUND') return c.json({ error: 'MESSAGE_NOT_FOUND' }, 404)
    throw e
  }
})

export default router
