import type { Profile } from './entity'

export interface IProfileRepository {
  findById(id: string): Promise<Profile | null>
  findByUserId(userId: string): Promise<Profile | null>
  create(profile: Profile): Promise<void>
  update(profile: Profile): Promise<void>
}
