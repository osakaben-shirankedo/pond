import * as v from 'valibot'
import { api } from '@/services/api'
import {
  ServerPondListSchema,
  ServerPondSchema,
  MemberProfileListSchema,
  ServerMessageListSchema,
  ServerMessageSchema,
  AiFishResponseSchema,
  type ServerPond,
  type MemberProfile,
  type ServerMessage,
  type AiFishResponse,
} from '../schemas'

function parseOrThrow<T>(schema: v.GenericSchema<unknown, T>, data: unknown, label: string): T {
  const result = v.safeParse(schema, data)
  if (!result.success) {
    console.warn(`[API] schema mismatch: ${label}`, v.summarize(result.issues))
    throw new Error(`SCHEMA_MISMATCH:${label}`)
  }
  return result.output
}

export async function fetchPondList(token: string): Promise<ServerPond[]> {
  const { data, error } = await api.get('/pond/list', token)
  if (error) throw new Error(error)
  return parseOrThrow(ServerPondListSchema, data, 'fetchPondList')
}

export async function fetchPondMembers(pondId: string, token: string): Promise<MemberProfile[]> {
  const { data, error } = await api.get(`/pond/${pondId}/members`, token)
  if (error) throw new Error(error)
  return parseOrThrow(MemberProfileListSchema, data, 'fetchPondMembers')
}

export async function fetchPondChat(pondId: string, token: string): Promise<ServerMessage[]> {
  const { data, error } = await api.get(`/pond/${pondId}/chat`, token)
  if (error) throw new Error(error)
  return parseOrThrow(ServerMessageListSchema, data, 'fetchPondChat')
}

export async function sendMessage(
  pondId: string,
  content: string,
  token: string,
  publicRange = 'all',
): Promise<ServerMessage> {
  const { data, error } = await api.post(`/pond/${pondId}/chat/message`, { content, public_range: publicRange }, token)
  if (error) throw new Error(error)
  return parseOrThrow(ServerMessageSchema, data, 'sendMessage')
}

export async function editMessage(
  pondId: string,
  messageId: string,
  content: string,
  token: string,
): Promise<ServerMessage> {
  const { data, error } = await api.post(`/pond/${pondId}/chat/${messageId}/edit`, { content }, token)
  if (error) throw new Error(error)
  return parseOrThrow(ServerMessageSchema, data, 'editMessage')
}

export async function replyToMessage(
  pondId: string,
  messageId: string,
  content: string,
  token: string,
): Promise<ServerMessage> {
  const { data, error } = await api.post(`/pond/${pondId}/chat/${messageId}/reply`, { content }, token)
  if (error) throw new Error(error)
  return parseOrThrow(ServerMessageSchema, data, 'replyToMessage')
}

export async function deleteMessage(
  pondId: string,
  messageId: string,
  token: string,
): Promise<void> {
  const { error } = await api.post(`/pond/${pondId}/chat/${messageId}/delete`, {}, token)
  if (error) throw new Error(error)
}

export async function joinPond(pondId: string, token: string): Promise<ServerPond> {
  const { data, error } = await api.post(`/pond/${pondId}/join`, {}, token)
  if (error) throw new Error(error)
  return parseOrThrow(ServerPondSchema, data, 'joinPond')
}

export async function leavePond(pondId: string, token: string): Promise<void> {
  const { error } = await api.post(`/pond/${pondId}/leave`, {}, token)
  if (error) throw new Error(error)
}

export async function applyPond(
  field: string,
  level: string,
  purpose: string,
  token: string,
): Promise<ServerPond> {
  const { data, error } = await api.post('/pond/apply', { field, level, purpose }, token)
  if (error) throw new Error(error)
  return parseOrThrow(ServerPondSchema, data, 'applyPond')
}

export async function callAiFish(params: {
  field: string
  level: string
  recentMessages?: string[]
  memberCount?: number
  userMessageCount?: number
}): Promise<AiFishResponse> {
  const { data, error } = await api.post('/pond/ai-fish', params)
  if (error) throw new Error(error)
  return parseOrThrow(AiFishResponseSchema, data, 'callAiFish')
}
