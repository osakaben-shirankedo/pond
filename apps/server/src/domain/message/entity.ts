import * as v from 'valibot'
import { idSchema } from '../shared/id'
import { PublicRangeSchema } from '../user/entity'

export const Message = v.object({
  id: idSchema,
  chat_room_id: idSchema,
  user_id: idSchema,
  content: v.string(),
  reply_to_id: v.nullish(v.string()),
  public_range: v.optional(PublicRangeSchema, 'all'),
  created_at: v.string(),
  updated_at: v.string(),
})
export type Message = v.InferOutput<typeof Message>
