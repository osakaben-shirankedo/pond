import type { IIkeRepository } from '../../domain/ike/repository'
import type { IUserRepository } from '../../domain/user/repository'
import type { Ike } from '../../domain/ike/entity'

export class GetIkeListUseCase {
  constructor(
    private readonly ikeRepo: IIkeRepository,
    private readonly userRepo: IUserRepository,
  ) {}

  async execute(userId: string): Promise<Ike[]> {
    const user = await this.userRepo.findById(userId)

    // belonging_ike_ids と member_ids の両方から取得してマージ（移行期の互換性確保）
    const [byBelonging, byMember] = await Promise.all([
      user && user.belonging_ike_ids.length > 0
        ? this.ikeRepo.findByIds(user.belonging_ike_ids)
        : Promise.resolve([] as Ike[]),
      this.ikeRepo.findByMemberId(userId),
    ])

    const seen = new Set<string>()
    const merged: Ike[] = []
    for (const ike of [...byBelonging, ...byMember]) {
      if (!seen.has(ike.id)) {
        seen.add(ike.id)
        merged.push(ike)
      }
    }
    return merged
  }
}
