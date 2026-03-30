import type { IIkeRepository } from '../../domain/ike/repository'
import type { Ike } from '../../domain/ike/entity'

export class GetIkeListUseCase {
  constructor(private readonly ikeRepo: IIkeRepository) {}

  async execute(userId: string): Promise<Ike[]> {
    return this.ikeRepo.findByMemberId(userId)
  }
}
