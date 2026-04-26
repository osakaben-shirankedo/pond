import * as v from 'valibot'
import type { Profile } from './entity'

export const CreateProfileInput = v.object({
  name: v.pipe(v.string(), v.minLength(1)),
  bio: v.optional(v.string(), ''),
  avatar: v.optional(v.string(), ''),
})
export type CreateProfileInput = v.InferOutput<typeof CreateProfileInput>

export const UpdateProfileInput = v.object({
  name: v.optional(v.pipe(v.string(), v.minLength(1))),
  bio: v.optional(v.string()),
  avatar: v.optional(v.string()),
})
export type UpdateProfileInput = v.InferOutput<typeof UpdateProfileInput>

export interface IProfileRepository {
  findById(id: string): Promise<Profile | null>
  findByUserId(userId: string): Promise<Profile | null>
  findByUserIds(userIds: string[]): Promise<Profile[]>
  create(profile: Profile): Promise<void>
  update(profile: Profile): Promise<void>
}
