import type { IPondRepository } from '../../domain/pond/repository'
import type { Pond } from '../../domain/pond/entity'

export class GetPondStatusUseCase {
  constructor(private readonly pondRepo: IPondRepository) {}

  async execute(pondId: string): Promise<Pond> {
    const pond = await this.pondRepo.findById(pondId)
    if (!pond) throw new Error('POND_NOT_FOUND')
    return pond
  }
}
