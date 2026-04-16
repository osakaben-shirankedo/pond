import * as v from 'valibot'

export const PublicRangeSchema = v.picklist(['all', 'ike', 'profile'])
export type PublicRange = v.InferOutput<typeof PublicRangeSchema>

export const UserSchema = v.object({
  id: v.string(),
  user_id: v.string(),
  nickname: v.pipe(v.string(), v.minLength(1)),
  email: v.pipe(v.string(), v.email()),
  encrypted_password: v.string(),
  belonging_ike_ids: v.optional(v.array(v.string()), []),
  created_at: v.string(),
  updated_at: v.string(),
})
export type User = v.InferOutput<typeof UserSchema>

export const CreateUserInputSchema = v.object({
  user_id: v.pipe(v.string(), v.minLength(4), v.maxLength(20), v.regex(/^[a-zA-Z0-9_]+$/, 'IDは半角英数字とアンダースコアのみ使用できます')),
  nickname: v.pipe(v.string(), v.minLength(1)),
  email: v.pipe(v.string(), v.email()),
  password: v.pipe(v.string(), v.minLength(8)),
})
export type CreateUserInput = v.InferOutput<typeof CreateUserInputSchema>
