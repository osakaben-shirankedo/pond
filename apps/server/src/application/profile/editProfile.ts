import type { IProfileRepository } from '../../domain/profile/repository'
import type { UpdateProfileInput } from '../../domain/profile/repository'
import type { Profile } from '../../domain/profile/entity'

export class EditProfileUseCase {
  constructor(private readonly profileRepo: IProfileRepository) {}

  async execute(userId: string, input: UpdateProfileInput): Promise<Profile> {
    const profile = await this.profileRepo.findByUserId(userId)
    if (!profile) throw new Error('PROFILE_NOT_FOUND')

    const updated: Profile = {
      ...profile,
      ...(input.name !== undefined && { name: input.name }),
      ...(input.bio !== undefined && { bio: input.bio }),
      ...(input.avatar !== undefined && { avatar: input.avatar }),
      updated_at: new Date().toISOString(),
    }
    await this.profileRepo.update(updated)
    return updated
  }
}
