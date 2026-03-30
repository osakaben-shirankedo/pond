import { z } from 'zod'

export const ChatRoomSchema = z.object({
  id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
})
export type ChatRoom = z.infer<typeof ChatRoomSchema>
