import type { IIkeRepository } from '../../domain/ike/repository'
import type { IMessageRepository } from '../../domain/message/repository'
import type { Message } from '../../domain/message/entity'

export class GetIkeChatUseCase {
  constructor(
    private readonly ikeRepo: IIkeRepository,
    private readonly messageRepo: IMessageRepository,
  ) {}

  async execute(ikeId: string): Promise<Message[]> {
    const ike = await this.ikeRepo.findById(ikeId)
    if (!ike) throw new Error('IKE_NOT_FOUND')
    return this.messageRepo.findByChatRoomId(ike.chat_room_id)
  }
}
