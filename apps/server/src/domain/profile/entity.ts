import * as v from 'valibot'
import { idSchema } from '../shared/id'
import { nameSchema } from '../shared/name'

export const Profile = v.object({
  id: idSchema,
  user_id: idSchema,
  name: nameSchema,
  bio: v.optional(v.string(), ''),
  avatar: v.optional(v.string(), ''),
  created_at: v.string(),
  updated_at: v.string(),
})
export type Profile = v.InferOutput<typeof Profile>
