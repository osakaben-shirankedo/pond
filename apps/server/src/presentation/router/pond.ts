import { Hono } from 'hono'
import { drizzle } from 'drizzle-orm/d1'
import * as v from 'valibot'
import { D1PondRepository } from '../../infrastructure/repository/d1PondRepository'
import { D1MessageRepository } from '../../infrastructure/repository/d1MessageRepository'
import { D1UserRepository } from '../../infrastructure/repository/d1UserRepository'
import { D1ProfileRepository } from '../../infrastructure/repository/d1ProfileRepository'
import { GetPondListUseCase } from '../../application/pond/getPondList'
import { GetPondStatusUseCase } from '../../application/pond/getPondStatus'
import { GetPondChatUseCase } from '../../application/pond/getPondChat'
import { PostMessageUseCase } from '../../application/pond/postMessage'
import { EditMessageUseCase } from '../../application/pond/editMessage'
import { DeleteMessageUseCase } from '../../application/pond/deleteMessage'
import { ReplyMessageUseCase } from '../../application/pond/replyMessage'
import { JoinPondUseCase } from '../../application/pond/joinPond'
import { ApplyPondUseCase } from '../../application/pond/applyPond'
import { PostMessageInput } from '../../domain/message/repository'
import { authMiddleware } from '../middleware/auth'
import type { Env } from '../../index'

const router = new Hono<Env>()

router.post('/assign', async (c) => {
  const body = await c.req.json()
  const parsed = v.safeParse(v.object({
    field: v.string(),
    level: v.string(),
    purpose: v.string(),
    pondIds: v.pipe(v.array(v.string()), v.minLength(1)),
  }), body)
  if (!parsed.success) return c.json({ error: v.flatten(parsed.issues) }, 400)

  const { field, level, purpose, pondIds } = parsed.output

  if (!c.env.CLAUDE_API_KEY) {
    return c.json({ pondId: pondIds[0] })
  }

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': c.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 50,
        messages: [{
          role: 'user',
          content: `あなたは学習コミュニティのマッチングAIです。
ユーザー情報:
- 分野: ${field}
- レベル: ${level}
- 目的・やり方: ${purpose}

利用可能なグループ: ${pondIds.join(', ')}

このユーザーに最も適したグループIDを1つだけ回答してください。グループIDのみ、余計な文字なしで答えてください。`,
        }],
      }),
    })

    const data = await res.json() as { content: { text: string }[] }
    const assignedId = data.content[0]?.text?.trim()
    if (assignedId && pondIds.includes(assignedId)) {
      return c.json({ pondId: assignedId })
    }
    return c.json({ pondId: pondIds[0] })
  } catch {
    return c.json({ pondId: pondIds[0] })
  }
})

router.post('/ai-fish', async (c) => {
  const body = await c.req.json()
  const parsed = v.safeParse(v.object({
    field: v.string(),
    level: v.string(),
    recentMessages: v.optional(v.array(v.string()), []),
    memberCount: v.optional(v.number(), 10),
    userMessageCount: v.optional(v.number(), 0),
  }), body)
  if (!parsed.success) return c.json({ error: 'BAD_REQUEST' }, 400)

  const { field, level, recentMessages, memberCount, userMessageCount } = parsed.output

  if (!c.env.CLAUDE_API_KEY) {
    const fallbacks = [
      `みんな！${field}で最近気になったこと、シェアしてみよう🐟`,
      `停滞中かな？一言でいいので今日の学びを教えて！🐠`,
      `仲間がいるよ〜！気軽に話しかけてね🐡`,
    ]
    return c.json({ message: fallbacks[Math.floor(Math.random() * fallbacks.length)] })
  }

  const situation = userMessageCount === 0
    ? '池の中でまだ誰も発言していない静かな状況です。'
    : `最近のメッセージは ${recentMessages.length} 件あり、あなたは ${userMessageCount} 件送りました。`

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': c.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 120,
        messages: [{
          role: 'user',
          content: `あなたは「${field}」分野の学習池に住むフレンドリーなAI魚キャラクターです。
レベル帯: ${level} / メンバー数: ${memberCount}人
状況: ${situation}
最近のトーク(最新3件):
${recentMessages.slice(-3).map((m, i) => `${i + 1}. ${m}`).join('\n') || '(まだメッセージなし)'}

池のトークを活性化させる発言を1つ生成してください。
- 停滞していれば${field}に関する学習の話題を提案する
- 参加していない人がいれば参加を促す
- 絵文字を使い魚キャラとして話す
- 60文字以内で、質問形式が望ましい
- キャラクター名や「AI魚:」などのプレフィックスは不要、本文のみ`,
        }],
      }),
    })
    const data = await res.json() as { content: { text: string }[] }
    const message = data.content[0]?.text?.trim()
    if (message) return c.json({ message })
    return c.json({ message: `${field}の池、みんな元気？今日も一緒に頑張ろう！🐟` })
  } catch {
    return c.json({ message: `${field}について、最近どんな発見があった？🐠` })
  }
})

router.use('*', authMiddleware)

router.get('/list', async (c) => {
  const db = drizzle(c.env.POND_DB)
  const pondRepo = new D1PondRepository(db)
  const userRepo = new D1UserRepository(db)
  const ponds = await new GetPondListUseCase(pondRepo, userRepo).execute(c.get('userId'))
  return c.json(ponds)
})

router.get('/available', async (c) => {
  const db = drizzle(c.env.POND_DB)
  const pondRepo = new D1PondRepository(db)
  const ponds = await pondRepo.findAvailable(c.get('userId'))
  return c.json(ponds)
})

router.post('/apply', async (c) => {
  const body = await c.req.json()
  const parsed = v.safeParse(v.object({
    field: v.string(),
    level: v.string(),
    purpose: v.string(),
  }), body)
  if (!parsed.success) return c.json({ error: v.flatten(parsed.issues) }, 400)

  const db = drizzle(c.env.POND_DB)
  const pondRepo = new D1PondRepository(db)
  const userRepo = new D1UserRepository(db)
  try {
    const pond = await new ApplyPondUseCase(pondRepo, userRepo, c.env.CLAUDE_API_KEY ?? '').execute(
      c.get('userId'),
      parsed.output.field,
      parsed.output.level,
      parsed.output.purpose,
    )
    return c.json(pond, 201)
  } catch (e) {
    if (e instanceof Error && e.message === 'NO_POND_AVAILABLE') return c.json({ error: 'NO_POND_AVAILABLE' }, 404)
    if (e instanceof Error && e.message === 'USER_NOT_FOUND') return c.json({ error: 'USER_NOT_FOUND' }, 404)
    throw e
  }
})

router.get('/:pond_id/members', async (c) => {
  const db = drizzle(c.env.POND_DB)
  const pondRepo = new D1PondRepository(db)
  const profileRepo = new D1ProfileRepository(db)
  const pond = await pondRepo.findById(c.req.param('pond_id'))
  if (!pond) return c.json({ error: 'POND_NOT_FOUND' }, 404)
  const profiles = await profileRepo.findByUserIds(pond.member_ids)
  return c.json(profiles.map((p) => ({ user_id: p.user_id, name: p.name, avatar: p.avatar })))
})

router.get('/:pond_id/status', async (c) => {
  const db = drizzle(c.env.POND_DB)
  const pondRepo = new D1PondRepository(db)
  try {
    const pond = await new GetPondStatusUseCase(pondRepo).execute(c.req.param('pond_id'))
    return c.json(pond)
  } catch (e) {
    if (e instanceof Error && e.message === 'POND_NOT_FOUND') return c.json({ error: 'POND_NOT_FOUND' }, 404)
    throw e
  }
})

router.get('/:pond_id/chat', async (c) => {
  const db = drizzle(c.env.POND_DB)
  const pondRepo = new D1PondRepository(db)
  const messageRepo = new D1MessageRepository(db)
  try {
    const messages = await new GetPondChatUseCase(pondRepo, messageRepo).execute(c.req.param('pond_id'))
    return c.json(messages)
  } catch (e) {
    if (e instanceof Error && e.message === 'POND_NOT_FOUND') return c.json({ error: 'POND_NOT_FOUND' }, 404)
    throw e
  }
})

router.post('/:pond_id/chat/message', async (c) => {
  const body = await c.req.json()
  const parsed = v.safeParse(PostMessageInput, body)
  if (!parsed.success) return c.json({ error: v.flatten(parsed.issues) }, 400)

  const db = drizzle(c.env.POND_DB)
  const pondRepo = new D1PondRepository(db)
  const messageRepo = new D1MessageRepository(db)
  try {
    const message = await new PostMessageUseCase(pondRepo, messageRepo).execute(c.req.param('pond_id'), c.get('userId'), parsed.output)
    return c.json(message, 201)
  } catch (e) {
    if (e instanceof Error && e.message === 'POND_NOT_FOUND') return c.json({ error: 'POND_NOT_FOUND' }, 404)
    if (e instanceof Error && e.message === 'NOT_A_MEMBER') return c.json({ error: 'NOT_A_MEMBER' }, 403)
    throw e
  }
})

router.post('/:pond_id/chat/:message_id/edit', async (c) => {
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

router.post('/:pond_id/chat/:message_id/delete', async (c) => {
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

router.post('/:pond_id/join', async (c) => {
  const db = drizzle(c.env.POND_DB)
  const pondRepo = new D1PondRepository(db)
  const userRepo = new D1UserRepository(db)
  try {
    const pond = await new JoinPondUseCase(pondRepo, userRepo).execute(c.req.param('pond_id'), c.get('userId'))
    return c.json(pond, 201)
  } catch (e) {
    if (e instanceof Error && e.message === 'POND_NOT_FOUND') return c.json({ error: 'POND_NOT_FOUND' }, 404)
    if (e instanceof Error && e.message === 'ALREADY_A_MEMBER') return c.json({ error: 'ALREADY_A_MEMBER' }, 409)
    throw e
  }
})

router.post('/:pond_id/leave', async (c) => {
  const db = drizzle(c.env.POND_DB)
  const pondRepo = new D1PondRepository(db)
  const userRepo = new D1UserRepository(db)
  const pondId = c.req.param('pond_id')
  const userId = c.get('userId')

  const [pond, user] = await Promise.all([pondRepo.findById(pondId), userRepo.findById(userId)])
  if (!pond) return c.json({ error: 'POND_NOT_FOUND' }, 404)
  if (!pond.member_ids.includes(userId)) return c.json({ error: 'NOT_A_MEMBER' }, 403)
  if (!user) return c.json({ error: 'USER_NOT_FOUND' }, 404)

  const now = new Date().toISOString()
  await Promise.all([
    pondRepo.update({ ...pond, member_ids: pond.member_ids.filter((id) => id !== userId), updated_at: now }),
    userRepo.update({ ...user, belonging_pond_ids: user.belonging_pond_ids.filter((id) => id !== pondId), updated_at: now }),
  ])
  return c.json({ success: true })
})

router.post('/:pond_id/chat/:message_id/reply', async (c) => {
  const body = await c.req.json()
  const parsed = v.safeParse(PostMessageInput, body)
  if (!parsed.success) return c.json({ error: v.flatten(parsed.issues) }, 400)

  const db = drizzle(c.env.POND_DB)
  const pondRepo = new D1PondRepository(db)
  const messageRepo = new D1MessageRepository(db)
  try {
    const message = await new ReplyMessageUseCase(pondRepo, messageRepo).execute(c.req.param('pond_id'), c.req.param('message_id'), c.get('userId'), parsed.output)
    return c.json(message, 201)
  } catch (e) {
    if (e instanceof Error && e.message === 'POND_NOT_FOUND') return c.json({ error: 'POND_NOT_FOUND' }, 404)
    if (e instanceof Error && e.message === 'NOT_A_MEMBER') return c.json({ error: 'NOT_A_MEMBER' }, 403)
    if (e instanceof Error && e.message === 'MESSAGE_NOT_FOUND') return c.json({ error: 'MESSAGE_NOT_FOUND' }, 404)
    throw e
  }
})

export default router
