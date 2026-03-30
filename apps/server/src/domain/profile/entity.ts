import { z } from 'zod'

export const ProfileSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  name: z.string(),
  bio: z.string().default(''),
  avatar: z.string().default(''),
  created_at: z.string(),
  updated_at: z.string(),
})
export type Profile = z.infer<typeof ProfileSchema>

export const CreateProfileInputSchema = z.object({
  name: z.string().min(1),
  bio: z.string().optional().default(''),
  avatar: z.string().optional().default(''),
})
export type CreateProfileInput = z.infer<typeof CreateProfileInputSchema>

export const UpdateProfileInputSchema = z.object({
  name: z.string().min(1).optional(),
  bio: z.string().optional(),
  avatar: z.string().optional(),
})
export type UpdateProfileInput = z.infer<typeof UpdateProfileInputSchema>
