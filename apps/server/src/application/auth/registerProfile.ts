import type { IProfileRepository } from '../../domain/profile/repository'
import type { CreateProfileInput } from '../../domain/profile/entity'
import type { Profile } from '../../domain/profile/entity'

export class RegisterProfileUseCase {
  constructor(private readonly profileRepo: IProfileRepository) {}

  async execute(userId: string, input: CreateProfileInput): Promise<Profile> {
    const now = new Date().toISOString()
    const profile: Profile = {
      id: crypto.randomUUID(),
      user_id: userId,
      name: input.name,
      bio: input.bio ?? '',
      avatar: input.avatar ?? '',
      created_at: now,
      updated_at: now,
    }
    await this.profileRepo.create(profile)
    return profile
  }
}
