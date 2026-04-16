import * as v from 'valibot'
import { api } from '@/services/api'
import { ServerProfileSchema, type ServerProfile } from '../schemas'

function parseOrThrow<T>(schema: v.GenericSchema<unknown, T>, data: unknown, label: string): T {
  const result = v.safeParse(schema, data)
  if (!result.success) {
    console.warn(`[API] schema mismatch: ${label}`, v.summarize(result.issues))
    throw new Error(`SCHEMA_MISMATCH:${label}`)
  }
  return result.output
}

export async function fetchProfile(token: string): Promise<ServerProfile> {
  const { data, error } = await api.get('/profile', token)
  if (error) throw new Error(error)
  return parseOrThrow(ServerProfileSchema, data, 'fetchProfile')
}

export async function editProfile(
  body: { name?: string; bio?: string; avatar?: string },
  token: string,
): Promise<ServerProfile> {
  const { data, error } = await api.post('/profile/edit', body, token)
  if (error) throw new Error(error)
  return parseOrThrow(ServerProfileSchema, data, 'editProfile')
}
