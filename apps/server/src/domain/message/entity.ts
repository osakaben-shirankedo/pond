import { z } from 'zod'
import { PublicRangeSchema } from '../user/entity'

export const MessageSchema = z.object({
  id: z.string(),
  chat_room_id: z.string(),
  user_id: z.string(),
  content: z.string(),
  reply_to_id: z.string().nullable().optional(),
  public_range: PublicRangeSchema.default('all'),
  created_at: z.string(),
  updated_at: z.string(),
})
export type Message = z.infer<typeof MessageSchema>

export const PostMessageInputSchema = z.object({
  content: z.string().min(1),
  public_range: PublicRangeSchema.optional().default('all'),
})
export type PostMessageInput = z.infer<typeof PostMessageInputSchema>
