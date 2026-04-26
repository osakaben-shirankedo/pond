import * as v from 'valibot'
import { idSchema } from '../shared/id'

export const ChatRoom = v.object({
  id: idSchema,
  created_at: v.string(),
  updated_at: v.string(),
})
export type ChatRoom = v.InferOutput<typeof ChatRoom>
