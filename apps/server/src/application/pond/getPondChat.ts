import type { IPondRepository } from '../../domain/pond/repository'
import type { IMessageRepository } from '../../domain/message/repository'
import type { Message } from '../../domain/message/entity'

export class GetPondChatUseCase {
  constructor(
    private readonly pondRepo: IPondRepository,
    private readonly messageRepo: IMessageRepository,
  ) {}

  async execute(pondId: string): Promise<Message[]> {
    const pond = await this.pondRepo.findById(pondId)
    if (!pond) throw new Error('POND_NOT_FOUND')
    return this.messageRepo.findByChatRoomId(pond.chat_room_id)
  }
}
