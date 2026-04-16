import * as v from 'valibot'

export const ChatRoomSchema = v.object({
  id: v.string(),
  created_at: v.string(),
  updated_at: v.string(),
})
export type ChatRoom = v.InferOutput<typeof ChatRoomSchema>
