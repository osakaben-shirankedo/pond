import * as v from 'valibot'
import { PublicRangeSchema } from '../user/entity'

export const MessageSchema = v.object({
  id: v.string(),
  chat_room_id: v.string(),
  user_id: v.string(),
  content: v.string(),
  reply_to_id: v.nullish(v.string()),
  public_range: v.optional(PublicRangeSchema, 'all'),
  created_at: v.string(),
  updated_at: v.string(),
})
export type Message = v.InferOutput<typeof MessageSchema>

export const PostMessageInputSchema = v.object({
  content: v.pipe(v.string(), v.minLength(1)),
  public_range: v.optional(PublicRangeSchema, 'all'),
})
export type PostMessageInput = v.InferOutput<typeof PostMessageInputSchema>
