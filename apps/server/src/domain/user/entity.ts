import { z } from 'zod'

export const PublicRangeSchema = z.enum(['all', 'ike', 'profile'])
export type PublicRange = z.infer<typeof PublicRangeSchema>

export const UserSchema = z.object({
  id: z.string(),
  nickname: z.string().min(1),
  email: z.string().email(),
  encrypted_password: z.string(),
  belonging_ike_ids: z.array(z.string()).default([]),
  created_at: z.string(),
  updated_at: z.string(),
})
export type User = z.infer<typeof UserSchema>

export const CreateUserInputSchema = z.object({
  nickname: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
})
export type CreateUserInput = z.infer<typeof CreateUserInputSchema>
