import type { IPondRepository } from '../../domain/pond/repository'
import type { IUserRepository } from '../../domain/user/repository'
import type { Pond } from '../../domain/pond/entity'

export class GetPondListUseCase {
  constructor(
    private readonly pondRepo: IPondRepository,
    private readonly userRepo: IUserRepository,
  ) {}

  async execute(userId: string): Promise<Pond[]> {
    const user = await this.userRepo.findById(userId)

    const [byBelonging, byMember] = await Promise.all([
      user && user.belonging_pond_ids.length > 0
        ? this.pondRepo.findByIds(user.belonging_pond_ids)
        : Promise.resolve([] as Pond[]),
      this.pondRepo.findByMemberId(userId),
    ])

    const seen = new Set<string>()
    const merged: Pond[] = []
    for (const pond of [...byBelonging, ...byMember]) {
      if (!seen.has(pond.id)) {
        seen.add(pond.id)
        merged.push(pond)
      }
    }
    return merged
  }
}
