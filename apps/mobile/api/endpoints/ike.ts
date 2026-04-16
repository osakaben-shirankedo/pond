import * as v from 'valibot'
import { api } from '@/services/api'
import {
  ServerIkeListSchema,
  ServerIkeSchema,
  MemberProfileListSchema,
  ServerMessageListSchema,
  ServerMessageSchema,
  AiFishResponseSchema,
  type ServerIke,
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

export async function fetchIkeList(token: string): Promise<ServerIke[]> {
  const { data, error } = await api.get('/ike/list', token)
  if (error) throw new Error(error)
  return parseOrThrow(ServerIkeListSchema, data, 'fetchIkeList')
}

export async function fetchIkeMembers(ikeId: string, token: string): Promise<MemberProfile[]> {
  const { data, error } = await api.get(`/ike/${ikeId}/members`, token)
  if (error) throw new Error(error)
  return parseOrThrow(MemberProfileListSchema, data, 'fetchIkeMembers')
}

export async function fetchIkeChat(ikeId: string, token: string): Promise<ServerMessage[]> {
  const { data, error } = await api.get(`/ike/${ikeId}/chat`, token)
  if (error) throw new Error(error)
  return parseOrThrow(ServerMessageListSchema, data, 'fetchIkeChat')
}

export async function sendMessage(
  ikeId: string,
  content: string,
  token: string,
  publicRange = 'all',
): Promise<ServerMessage> {
  const { data, error } = await api.post(`/ike/${ikeId}/chat/message`, { content, public_range: publicRange }, token)
  if (error) throw new Error(error)
  return parseOrThrow(ServerMessageSchema, data, 'sendMessage')
}

export async function editMessage(
  ikeId: string,
  messageId: string,
  content: string,
  token: string,
): Promise<ServerMessage> {
  const { data, error } = await api.post(`/ike/${ikeId}/chat/${messageId}/edit`, { content }, token)
  if (error) throw new Error(error)
  return parseOrThrow(ServerMessageSchema, data, 'editMessage')
}

export async function replyToMessage(
  ikeId: string,
  messageId: string,
  content: string,
  token: string,
): Promise<ServerMessage> {
  const { data, error } = await api.post(`/ike/${ikeId}/chat/${messageId}/reply`, { content }, token)
  if (error) throw new Error(error)
  return parseOrThrow(ServerMessageSchema, data, 'replyToMessage')
}

export async function deleteMessage(
  ikeId: string,
  messageId: string,
  token: string,
): Promise<void> {
  const { error } = await api.post(`/ike/${ikeId}/chat/${messageId}/delete`, {}, token)
  if (error) throw new Error(error)
}

export async function joinIke(ikeId: string, token: string): Promise<ServerIke> {
  const { data, error } = await api.post(`/ike/${ikeId}/join`, {}, token)
  if (error) throw new Error(error)
  return parseOrThrow(ServerIkeSchema, data, 'joinIke')
}

export async function leaveIke(ikeId: string, token: string): Promise<void> {
  const { error } = await api.post(`/ike/${ikeId}/leave`, {}, token)
  if (error) throw new Error(error)
}

export async function applyIke(
  field: string,
  level: string,
  purpose: string,
  token: string,
): Promise<ServerIke> {
  const { data, error } = await api.post('/ike/apply', { field, level, purpose }, token)
  if (error) throw new Error(error)
  return parseOrThrow(ServerIkeSchema, data, 'applyIke')
}

export async function callAiFish(params: {
  field: string
  level: string
  recentMessages?: string[]
  memberCount?: number
  userMessageCount?: number
}): Promise<AiFishResponse> {
  const { data, error } = await api.post('/ike/ai-fish', params)
  if (error) throw new Error(error)
  return parseOrThrow(AiFishResponseSchema, data, 'callAiFish')
}
