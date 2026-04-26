import { Hono } from 'hono'
import { drizzle } from 'drizzle-orm/d1'
import * as v from 'valibot'
import { authMiddleware } from '../middleware/auth'
import { D1TimelineRepository } from '../../infrastructure/repository/d1TimelineRepository'
import { D1UserRepository } from '../../infrastructure/repository/d1UserRepository'
import { GetTimelineUseCase } from '../../application/timeline/getTimeline'
import { PostTimelineUseCase } from '../../application/timeline/postTimeline'
import { LikePostUseCase } from '../../application/timeline/likePost'
import { UnlikePostUseCase } from '../../application/timeline/unlikePost'
import { ReplyPostUseCase } from '../../application/timeline/replyPost'
import { UnreplyPostUseCase } from '../../application/timeline/unreplyPost'
import { TimelinePostInput, ReplyPostInput } from '../../domain/timeline/repository'
import type { Env } from '../../index'

const router = new Hono<Env>()

router.use('*', authMiddleware)

// タイムライン取得（自分が所属する池と同カテゴリの投稿）
router.get('/', async (c) => {
  const db = drizzle(c.env.POND_DB)
  const userId = c.get('userId')
  const userRepo = new D1UserRepository(db)
  const timelineRepo = new D1TimelineRepository(db)

  // ユーザーの池からカテゴリ一覧を取得
  const user = await userRepo.findById(userId)
  // belonging_pond_ids は文字列化された配列なので parse
  let categories: string[] = []
  if (user) {
    const ikeIds: string[] = typeof user.belonging_pond_ids === 'string'
      ? JSON.parse(user.belonging_pond_ids)
      : user.belonging_pond_ids
    // カテゴリはクエリパラメータで渡す設計にする（クライアントが知っている）
    const qCategories = c.req.query('categories')
    if (qCategories) {
      categories = qCategories.split(',').filter(Boolean)
    } else {
      // フォールバック: 全表示
      categories = []
    }
    void ikeIds
  }

  const posts = await new GetTimelineUseCase(timelineRepo).execute(categories, userId)
  return c.json(posts)
})

// 投稿
router.post('/post', async (c) => {
  const body = await c.req.json()
  const parsed = v.safeParse(TimelinePostInput, body)
  if (!parsed.success) return c.json({ error: v.flatten(parsed.issues) }, 400)

  const db = drizzle(c.env.POND_DB)
  const timelineRepo = new D1TimelineRepository(db)

  const post = await new PostTimelineUseCase(timelineRepo).execute(c.get('userId'), parsed.output)
  return c.json(post, 201)
})

// いいね
router.post('/like/:post_id', async (c) => {
  const db = drizzle(c.env.POND_DB)
  const timelineRepo = new D1TimelineRepository(db)

  try {
    const result = await new LikePostUseCase(timelineRepo).execute(c.req.param('post_id'), c.get('userId'))
    return c.json(result)
  } catch (e) {
    if (e instanceof Error && e.message === 'POST_NOT_FOUND') return c.json({ error: 'POST_NOT_FOUND' }, 404)
    throw e
  }
})

// いいね解除
router.post('/unlike/:post_id', async (c) => {
  const db = drizzle(c.env.POND_DB)
  const timelineRepo = new D1TimelineRepository(db)

  try {
    const result = await new UnlikePostUseCase(timelineRepo).execute(c.req.param('post_id'), c.get('userId'))
    return c.json(result)
  } catch (e) {
    if (e instanceof Error && e.message === 'POST_NOT_FOUND') return c.json({ error: 'POST_NOT_FOUND' }, 404)
    throw e
  }
})

// リプライ
router.post('/reply/:post_id', async (c) => {
  const body = await c.req.json()
  const parsed = v.safeParse(ReplyPostInput, body)
  if (!parsed.success) return c.json({ error: v.flatten(parsed.issues) }, 400)

  const db = drizzle(c.env.POND_DB)
  const timelineRepo = new D1TimelineRepository(db)

  try {
    const reply = await new ReplyPostUseCase(timelineRepo).execute(c.req.param('post_id'), c.get('userId'), parsed.output.content)
    return c.json(reply, 201)
  } catch (e) {
    if (e instanceof Error && e.message === 'POST_NOT_FOUND') return c.json({ error: 'POST_NOT_FOUND' }, 404)
    throw e
  }
})

// リプライ削除（自分のリプライのみ）
router.post('/unreply/:reply_id', async (c) => {
  const db = drizzle(c.env.POND_DB)
  const timelineRepo = new D1TimelineRepository(db)

  try {
    await new UnreplyPostUseCase(timelineRepo).execute(c.req.param('reply_id'), c.get('userId'))
    return c.json({ success: true })
  } catch (e) {
    if (e instanceof Error && e.message === 'POST_NOT_FOUND') return c.json({ error: 'POST_NOT_FOUND' }, 404)
    if (e instanceof Error && e.message === 'FORBIDDEN') return c.json({ error: 'FORBIDDEN' }, 403)
    if (e instanceof Error && e.message === 'NOT_A_REPLY') return c.json({ error: 'NOT_A_REPLY' }, 400)
    throw e
  }
})

export default router
