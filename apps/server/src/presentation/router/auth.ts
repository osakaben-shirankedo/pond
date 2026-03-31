import { Hono } from 'hono'
import { sign } from 'hono/jwt'
import { drizzle } from 'drizzle-orm/d1'
import { z } from 'zod'
import { D1UserRepository } from '../../infrastructure/repository/d1UserRepository'
import { D1ProfileRepository } from '../../infrastructure/repository/d1ProfileRepository'
import { RegisterUseCase } from '../../application/auth/register'
import { RegisterProfileUseCase } from '../../application/auth/registerProfile'
import { LoginUseCase } from '../../application/auth/login'
import { LogoutUseCase } from '../../application/auth/logout'
import { CreateUserInputSchema } from '../../domain/user/entity'
import { CreateProfileInputSchema } from '../../domain/profile/entity'
import { authMiddleware } from '../middleware/auth'
import type { Env } from '../../index'

const router = new Hono<Env>()

router.post('/register', async (c) => {
  const body = await c.req.json()
  const parsed = CreateUserInputSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)

  const db = drizzle(c.env.POND_DB)
  const userRepo = new D1UserRepository(db)
  const useCase = new RegisterUseCase(userRepo)

  try {
    const user = await useCase.execute(parsed.data)
    return c.json({ id: user.id, user_id: user.user_id, email: user.email, nickname: user.nickname }, 201)
  } catch (e) {
    if (e instanceof Error && e.message === 'EMAIL_ALREADY_EXISTS') return c.json({ error: 'EMAIL_ALREADY_EXISTS' }, 409)
    if (e instanceof Error && e.message === 'USER_ID_ALREADY_EXISTS') return c.json({ error: 'USER_ID_ALREADY_EXISTS' }, 409)
    throw e
  }
})

router.post('/register/profile', authMiddleware, async (c) => {
  const body = await c.req.json()
  const parsed = CreateProfileInputSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)

  const db = drizzle(c.env.POND_DB)
  const profileRepo = new D1ProfileRepository(db)
  const useCase = new RegisterProfileUseCase(profileRepo)
  const userId = c.get('userId')

  const profile = await useCase.execute(userId, parsed.data)
  return c.json(profile, 201)
})

router.post('/login', async (c) => {
  const body = await c.req.json()
  const parsed = z.object({ email: z.string().email(), password: z.string() }).safeParse(body)
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)

  const db = drizzle(c.env.POND_DB)
  const userRepo = new D1UserRepository(db)
  const useCase = new LoginUseCase(userRepo)

  try {
    const { userId } = await useCase.execute(parsed.data.email, parsed.data.password)
    const token = await sign(
      { sub: userId, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 },
      c.env.JWT_SECRET
    )
    return c.json({ token })
  } catch (e) {
    if (e instanceof Error && e.message === 'INVALID_CREDENTIALS') return c.json({ error: 'INVALID_CREDENTIALS' }, 401)
    throw e
  }
})

router.post('/logout', authMiddleware, async (c) => {
  const useCase = new LogoutUseCase()
  await useCase.execute(c.get('userId'))
  return c.json({ success: true })
})

export default router
