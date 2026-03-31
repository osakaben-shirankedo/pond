import type { IIkeRepository } from '../../domain/ike/repository'
import type { IUserRepository } from '../../domain/user/repository'
import type { Ike } from '../../domain/ike/entity'

export class JoinIkeUseCase {
  constructor(
    private readonly ikeRepo: IIkeRepository,
    private readonly userRepo: IUserRepository,
  ) {}

  async execute(ikeId: string, userId: string): Promise<Ike> {
    const ike = await this.ikeRepo.findById(ikeId)
    if (!ike) throw new Error('IKE_NOT_FOUND')
    if (ike.member_ids.includes(userId)) throw new Error('ALREADY_A_MEMBER')

    const user = await this.userRepo.findById(userId)
    if (!user) throw new Error('USER_NOT_FOUND')

    const now = new Date().toISOString()
    const updatedIke = { ...ike, member_ids: [...ike.member_ids, userId], updated_at: now }
    const updatedUser = { ...user, belonging_ike_ids: [...user.belonging_ike_ids, ikeId], updated_at: now }

    await Promise.all([
      this.ikeRepo.update(updatedIke),
      this.userRepo.update(updatedUser),
    ])
    return updatedIke
  }
}
