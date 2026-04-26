import { Hono } from 'hono'
import { cors } from 'hono/cors'
import authRouter from './presentation/router/auth'
import ikeRouter from './presentation/router/ike'
import profileRouter from './presentation/router/profile'
import timelineRouter from './presentation/router/timeline'
import challengeRouter from './presentation/router/challenge'

export type Env = {
  Bindings: {
    POND_DB: D1Database
    JWT_SECRET: string
    CLAUDE_API_KEY: string
  }
  Variables: {
    userId: string
  }
}

const app = new Hono<Env>()

app.use('*', cors())

app.get('/health', (c) => c.json({ status: 'ok' }))

app.route('/', authRouter)
app.route('/ike', ikeRouter)
app.route('/profile', profileRouter)
app.route('/timeline', timelineRouter)
app.route('/challenge', challengeRouter)

export type AppType = typeof app

export default app
