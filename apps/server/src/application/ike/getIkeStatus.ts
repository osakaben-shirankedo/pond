import type { IIkeRepository } from '../../domain/ike/repository'
import type { Ike } from '../../domain/ike/entity'

export class GetIkeStatusUseCase {
  constructor(private readonly ikeRepo: IIkeRepository) {}

  async execute(ikeId: string): Promise<Ike> {
    const ike = await this.ikeRepo.findById(ikeId)
    if (!ike) throw new Error('IKE_NOT_FOUND')
    return ike
  }
}
