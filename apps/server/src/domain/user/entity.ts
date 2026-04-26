import * as v from 'valibot'
import { idSchema } from '../shared/id'

export const PublicRangeSchema = v.picklist(['all', 'ike', 'profile'])
export type PublicRange = v.InferOutput<typeof PublicRangeSchema>

export const User = v.object({
  id: idSchema,
  user_id: v.string(),
  nickname: v.pipe(v.string(), v.minLength(1)),
  email: v.pipe(v.string(), v.email()),
  encrypted_password: v.string(),
  belonging_pond_ids: v.optional(v.array(idSchema), []),
  created_at: v.string(),
  updated_at: v.string(),
})
export type User = v.InferOutput<typeof User>
