import * as v from 'valibot'
import { api } from '@/services/api'
import {
  LoginResponseSchema,
  RegisterResponseSchema,
  ServerProfileSchema,
  type LoginResponse,
  type RegisterResponse,
  type ServerProfile,
} from '../schemas'

function parseOrThrow<T>(schema: v.GenericSchema<unknown, T>, data: unknown, label: string): T {
  const result = v.safeParse(schema, data)
  if (!result.success) {
    console.warn(`[API] schema mismatch: ${label}`, v.summarize(result.issues))
    throw new Error(`SCHEMA_MISMATCH:${label}`)
  }
  return result.output
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const { data, error } = await api.post('/login', { email, password })
  if (error) throw new Error(error)
  return parseOrThrow(LoginResponseSchema, data, 'login')
}

export async function register(body: {
  user_id: string
  nickname: string
  email: string
  password: string
}): Promise<RegisterResponse> {
  const { data, error } = await api.post('/register', body)
  if (error) throw new Error(error)
  return parseOrThrow(RegisterResponseSchema, data, 'register')
}

export async function registerProfile(
  body: { name: string; bio?: string; avatar?: string },
  token: string,
): Promise<ServerProfile> {
  const { data, error } = await api.post('/register/profile', body, token)
  if (error) throw new Error(error)
  return parseOrThrow(ServerProfileSchema, data, 'registerProfile')
}

export async function logout(token: string): Promise<void> {
  await api.post('/logout', {}, token)
}
