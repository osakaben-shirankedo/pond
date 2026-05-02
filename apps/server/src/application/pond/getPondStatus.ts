import type { IPondRepository } from '../../domain/pond/repository'
import type { PondSchema } from '../../domain/pond/entity'

export class GetPondStatusUseCase {
  constructor(private readonly pondRepo: IPondRepository) { }

  async execute(pondId: string): Promise<PondSchema> {
    const pond = await this.pondRepo.findById(pondId)
    if (!pond) throw new Error('POND_NOT_FOUND')
    return pond
  }
}
