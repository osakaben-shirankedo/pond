import type { IProfileRepository } from '../../domain/profile/repository'
import type { Profile } from '../../domain/profile/entity'

export class GetProfileUseCase {
  constructor(private readonly profileRepo: IProfileRepository) {}

  async execute(userId: string): Promise<Profile> {
    const profile = await this.profileRepo.findByUserId(userId)
    if (!profile) throw new Error('PROFILE_NOT_FOUND')
    return profile
  }
}
