import * as v from 'valibot'
import { api } from '@/services/api'
import { ChallengeEvaluateResponseSchema, type ChallengeEvaluateResponse } from '../schemas'

function parseOrThrow<T>(schema: v.GenericSchema<unknown, T>, data: unknown, label: string): T {
  const result = v.safeParse(schema, data)
  if (!result.success) {
    console.warn(`[API] schema mismatch: ${label}`, v.summarize(result.issues))
    throw new Error(`SCHEMA_MISMATCH:${label}`)
  }
  return result.output
}

// /challenge/evaluate は認証不要
export async function evaluateChallenge(body: {
  field: string
  challengeTitle: string
  challengeDescription: string
  answer: string
  isSubjective: boolean
}): Promise<ChallengeEvaluateResponse> {
  const { data, error } = await api.post('/challenge/evaluate', body)
  if (error) throw new Error(error)
  return parseOrThrow(ChallengeEvaluateResponseSchema, data, 'evaluateChallenge')
}
