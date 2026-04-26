import * as v from 'valibot'
import { idSchema } from '../shared/id'
import { nameSchema } from '../shared/name'
import { descriptionSchema } from '../shared/description'

export const Pond = v.object({
  id: idSchema,
  name: nameSchema,
  description: descriptionSchema,
  member_ids: v.array(idSchema),
  chat_room_id: idSchema,
  created_at: v.string(),
  updated_at: v.string(),
})
export type Pond = v.InferOutput<typeof Pond>
