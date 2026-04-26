import type { IPondRepository } from '../../domain/pond/repository'
import type { IUserRepository } from '../../domain/user/repository'
import type { Pond } from '../../domain/pond/entity'

export class JoinPondUseCase {
  constructor(
    private readonly pondRepo: IPondRepository,
    private readonly userRepo: IUserRepository,
  ) {}

  async execute(pondId: string, userId: string): Promise<Pond> {
    const pond = await this.pondRepo.findById(pondId)
    if (!pond) throw new Error('POND_NOT_FOUND')
    if (pond.member_ids.includes(userId)) throw new Error('ALREADY_A_MEMBER')

    const user = await this.userRepo.findById(userId)
    if (!user) throw new Error('USER_NOT_FOUND')

    const now = new Date().toISOString()
    const updatedPond = { ...pond, member_ids: [...pond.member_ids, userId], updated_at: now }
    const updatedUser = { ...user, belonging_pond_ids: [...user.belonging_pond_ids, pondId], updated_at: now }

    await Promise.all([
      this.pondRepo.update(updatedPond),
      this.userRepo.update(updatedUser),
    ])
    return updatedPond
  }
}
