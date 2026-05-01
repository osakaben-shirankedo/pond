import { Hono } from 'hono'
import * as v from 'valibot'
import { authMiddleware } from '../middleware/auth'
import type { Env } from '../../index'

const router = new Hono<Env>()

//TODO : challengeを分離

router.post('/evaluate', async (c) => {
  const body = await c.req.json()
  const parsed = v.safeParse(v.object({
    field: v.string(),
    challengeTitle: v.string(),
    challengeDescription: v.string(),
    answer: v.string(),
    isSubjective: v.boolean(),
  }), body)
  if (!parsed.success) return c.json({ error: 'INVALID_INPUT' }, 400)

  const { field, challengeTitle, challengeDescription, answer, isSubjective } = parsed.output

  if (!c.env.CLAUDE_API_KEY) {
    return c.json({ pass: true, comment: 'よく頑張りました！（AI評価は未設定）' })
  }

  try {
    const prompt = isSubjective
      ? `あなたはクリエイティブな課題の採点者です。
課題タイトル: ${challengeTitle}
課題説明: ${challengeDescription}
分野: ${field}

提出物:
${answer}

0〜100点で採点し、以下のJSONのみ返してください（他の文字不要）:
{"score": 数値, "comment": "日本語で1〜2文のフィードバック"}`
      : `あなたは学習課題の採点者です。
課題タイトル: ${challengeTitle}
課題説明: ${challengeDescription}
分野: ${field}

提出物:
${answer}

課題の要件を満たしているか判定し、以下のJSONのみ返してください（他の文字不要）:
{"pass": true/false, "comment": "日本語で1〜2文のフィードバック"}`

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': c.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 200,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const data = await res.json() as { content: { text: string }[] }
    const text = data.content[0]?.text?.trim() ?? '{}'
    // JSON部分だけ抽出
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : {}

    if (isSubjective) {
      const score: number = typeof result.score === 'number' ? result.score : 50
      return c.json({
        pass: score >= 60,
        score,
        comment: result.comment ?? (score >= 60 ? '素晴らしい作品です！' : 'もう少し工夫してみましょう'),
      })
    } else {
      const pass: boolean = result.pass === true
      return c.json({
        pass,
        comment: result.comment ?? (pass ? '正解です！よく頑張りました！' : 'もう一度考えてみましょう'),
      })
    }
  } catch {
    return c.json({ pass: false, comment: '評価中にエラーが発生しました。再度お試しください。' })
  }
})

router.use('*', authMiddleware)

router.get('/list', (c) => c.json({ error: 'NOT_IMPLEMENTED' }, 501))

export default router
