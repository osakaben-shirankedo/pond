import * as v from 'valibot'

export const IkeSchema = v.object({
  id: v.string(),
  ike_name: v.string(),
  description: v.string(),
  member_ids: v.array(v.string()),
  chat_room_id: v.string(),
  created_at: v.string(),
  updated_at: v.string(),
})
export type Ike = v.InferOutput<typeof IkeSchema>
