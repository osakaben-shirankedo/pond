import { z } from 'zod'

export const IkeSchema = z.object({
  id: z.string(),
  ike_name: z.string(),
  description: z.string(),
  member_ids: z.array(z.string()),
  chat_room_id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
})
export type Ike = z.infer<typeof IkeSchema>
