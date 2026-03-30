import { Hono } from 'hono'
import { drizzle } from 'drizzle-orm/d1'
import { D1ProfileRepository } from '../../infrastructure/repository/d1ProfileRepository'
import { GetProfileUseCase } from '../../application/profile/getProfile'
import { EditProfileUseCase } from '../../application/profile/editProfile'
import { UpdateProfileInputSchema } from '../../domain/profile/entity'
import { authMiddleware } from '../middleware/auth'
import type { Env } from '../../index'

const router = new Hono<Env>()

router.use('*', authMiddleware)

router.get('/', async (c) => {
  const db = drizzle(c.env.POND_DB)
  const profileRepo = new D1ProfileRepository(db)
  try {
    const profile = await new GetProfileUseCase(profileRepo).execute(c.get('userId'))
    return c.json(profile)
  } catch (e) {
    if (e instanceof Error && e.message === 'PROFILE_NOT_FOUND') return c.json({ error: 'PROFILE_NOT_FOUND' }, 404)
    throw e
  }
})

router.post('/edit', async (c) => {
  const body = await c.req.json()
  const parsed = UpdateProfileInputSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)

  const db = drizzle(c.env.POND_DB)
  const profileRepo = new D1ProfileRepository(db)
  try {
    const profile = await new EditProfileUseCase(profileRepo).execute(c.get('userId'), parsed.data)
    return c.json(profile)
  } catch (e) {
    if (e instanceof Error && e.message === 'PROFILE_NOT_FOUND') return c.json({ error: 'PROFILE_NOT_FOUND' }, 404)
    throw e
  }
})

router.get('/:user_id', async (c) => {
  const db = drizzle(c.env.POND_DB)
  const profileRepo = new D1ProfileRepository(db)
  try {
    const profile = await new GetProfileUseCase(profileRepo).execute(c.req.param('user_id'))
    return c.json(profile)
  } catch (e) {
    if (e instanceof Error && e.message === 'PROFILE_NOT_FOUND') return c.json({ error: 'PROFILE_NOT_FOUND' }, 404)
    throw e
  }
})

router.post('/:user_id/edit', async (c) => {
  const body = await c.req.json()
  const parsed = UpdateProfileInputSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)

  const db = drizzle(c.env.POND_DB)
  const profileRepo = new D1ProfileRepository(db)
  try {
    const profile = await new EditProfileUseCase(profileRepo).execute(c.req.param('user_id'), parsed.data)
    return c.json(profile)
  } catch (e) {
    if (e instanceof Error && e.message === 'PROFILE_NOT_FOUND') return c.json({ error: 'PROFILE_NOT_FOUND' }, 404)
    throw e
  }
})

export default router
