import { Hono } from 'hono'
import { drizzle } from 'drizzle-orm/d1'
import * as v from 'valibot'
import { D1ProfileRepository } from '../../infrastructure/repository/d1ProfileRepository'
import { D1UserRepository } from '../../infrastructure/repository/d1UserRepository'
import { GetProfileUseCase } from '../../application/profile/getProfile'
import { EditProfileUseCase } from '../../application/profile/editProfile'
import { UpdateProfileInput } from '../../domain/profile/repository'
import { authMiddleware } from '../middleware/auth'
import type { Env } from '../../index'

const router = new Hono<Env>()

router.use('*', authMiddleware)

router.get('/', async (c) => {
  const db = drizzle(c.env.POND_DB)
  const profileRepo = new D1ProfileRepository(db)
  const userRepo = new D1UserRepository(db)
  try {
    const [profile, user] = await Promise.all([
      new GetProfileUseCase(profileRepo).execute(c.get('userId')),
      userRepo.findById(c.get('userId')),
    ])
    return c.json({ ...profile, handle: user?.user_id ?? '' })
  } catch (e) {
    if (e instanceof Error && e.message === 'PROFILE_NOT_FOUND') return c.json({ error: 'PROFILE_NOT_FOUND' }, 404)
    throw e
  }
})

router.post('/edit', async (c) => {
  const body = await c.req.json()
  const parsed = v.safeParse(UpdateProfileInput, body)
  if (!parsed.success) return c.json({ error: v.flatten(parsed.issues) }, 400)

  const db = drizzle(c.env.POND_DB)
  const profileRepo = new D1ProfileRepository(db)
  try {
    const profile = await new EditProfileUseCase(profileRepo).execute(c.get('userId'), parsed.output)
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
  const parsed = v.safeParse(UpdateProfileInput, body)
  if (!parsed.success) return c.json({ error: v.flatten(parsed.issues) }, 400)

  const db = drizzle(c.env.POND_DB)
  const profileRepo = new D1ProfileRepository(db)
  try {
    const profile = await new EditProfileUseCase(profileRepo).execute(c.req.param('user_id'), parsed.output)
    return c.json(profile)
  } catch (e) {
    if (e instanceof Error && e.message === 'PROFILE_NOT_FOUND') return c.json({ error: 'PROFILE_NOT_FOUND' }, 404)
    throw e
  }
})

export default router
