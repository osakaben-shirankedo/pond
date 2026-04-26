import * as v from 'valibot'
import { api } from '@/services/api'
import {
  TimelinePostViewListSchema,
  TimelinePostViewSchema,
  ReplyResponseSchema,
  type TimelinePostView,
  type ReplyResponse,
} from '../schemas'

function parseOrThrow<T>(schema: v.GenericSchema<unknown, T>, data: unknown, label: string): T {
  const result = v.safeParse(schema, data)
  if (!result.success) {
    console.warn(`[API] schema mismatch: ${label}`, v.summarize(result.issues))
    throw new Error(`SCHEMA_MISMATCH:${label}`)
  }
  return result.output
}

export async function fetchTimeline(
  categories: string,
  token: string,
): Promise<TimelinePostView[]> {
  const path = `/timeline${categories ? `?categories=${encodeURIComponent(categories)}` : ''}`
  const { data, error } = await api.get(path, token)
  if (error) throw new Error(error)
  return parseOrThrow(TimelinePostViewListSchema, data, 'fetchTimeline')
}

export async function postTimelinePost(
  body: { pond_id: string; pond_category: string; content: string },
  token: string,
): Promise<TimelinePostView> {
  const { data, error } = await api.post('/timeline/post', body, token)
  if (error) throw new Error(error)
  return parseOrThrow(TimelinePostViewSchema, data, 'postTimelinePost')
}

export async function likePost(postId: string, token: string): Promise<void> {
  const { error } = await api.post(`/timeline/like/${postId}`, {}, token)
  if (error) throw new Error(error)
}

export async function unlikePost(postId: string, token: string): Promise<void> {
  const { error } = await api.post(`/timeline/unlike/${postId}`, {}, token)
  if (error) throw new Error(error)
}

export async function replyToPost(
  postId: string,
  content: string,
  token: string,
): Promise<ReplyResponse> {
  const { data, error } = await api.post(`/timeline/reply/${postId}`, { content }, token)
  if (error) throw new Error(error)
  return parseOrThrow(ReplyResponseSchema, data, 'replyToPost')
}
