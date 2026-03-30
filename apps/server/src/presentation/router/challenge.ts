import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import type { Env } from '../../index'

// Challenge feature is not yet implemented
const router = new Hono<Env>()

router.use('*', authMiddleware)

router.get('/list', (c) => c.json({ error: 'NOT_IMPLEMENTED' }, 501))
router.get('/:challenge_id/status', (c) => c.json({ error: 'NOT_IMPLEMENTED' }, 501))
router.get('/:challenge_id/chat', (c) => c.json({ error: 'NOT_IMPLEMENTED' }, 501))

export default router
