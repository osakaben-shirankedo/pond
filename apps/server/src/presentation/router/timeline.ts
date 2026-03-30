import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import type { Env } from '../../index'

// Timeline feature is not yet implemented
const router = new Hono<Env>()

router.use('*', authMiddleware)

router.get('/', (c) => c.json({ error: 'NOT_IMPLEMENTED' }, 501))
router.post('/post', (c) => c.json({ error: 'NOT_IMPLEMENTED' }, 501))
router.post('/like/:message_id', (c) => c.json({ error: 'NOT_IMPLEMENTED' }, 501))
router.post('/unlike/:message_id', (c) => c.json({ error: 'NOT_IMPLEMENTED' }, 501))
router.post('/reply/:message_id', (c) => c.json({ error: 'NOT_IMPLEMENTED' }, 501))
router.post('/unreply/:message_id', (c) => c.json({ error: 'NOT_IMPLEMENTED' }, 501))

export default router
