import * as v from 'valibot'

export const ProfileSchema = v.object({
  id: v.string(),
  user_id: v.string(),
  name: v.string(),
  bio: v.optional(v.string(), ''),
  avatar: v.optional(v.string(), ''),
  created_at: v.string(),
  updated_at: v.string(),
})
export type Profile = v.InferOutput<typeof ProfileSchema>

export const CreateProfileInputSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1)),
  bio: v.optional(v.string(), ''),
  avatar: v.optional(v.string(), ''),
})
export type CreateProfileInput = v.InferOutput<typeof CreateProfileInputSchema>

export const UpdateProfileInputSchema = v.object({
  name: v.optional(v.pipe(v.string(), v.minLength(1))),
  bio: v.optional(v.string()),
  avatar: v.optional(v.string()),
})
export type UpdateProfileInput = v.InferOutput<typeof UpdateProfileInputSchema>
