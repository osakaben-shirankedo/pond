import type { IPondRepository } from '../../domain/pond/repository'
import type { IMessageRepository } from '../../domain/message/repository'
import type { PostMessageInput } from '../../domain/message/repository'
import type { Message } from '../../domain/message/entity'

export class ReplyMessageUseCase {
  constructor(
    private readonly pondRepo: IPondRepository,
    private readonly messageRepo: IMessageRepository,
  ) {}

  async execute(pondId: string, replyToId: string, userId: string, input: PostMessageInput): Promise<Message> {
    const pond = await this.pondRepo.findById(pondId)
    if (!pond) throw new Error('POND_NOT_FOUND')
    if (!pond.member_ids.includes(userId)) throw new Error('NOT_A_MEMBER')

    const original = await this.messageRepo.findById(replyToId)
    if (!original) throw new Error('MESSAGE_NOT_FOUND')

    const now = new Date().toISOString()
    const message: Message = {
      id: crypto.randomUUID(),
      chat_room_id: pond.chat_room_id,
      user_id: userId,
      content: input.content,
      reply_to_id: replyToId,
      public_range: input.public_range,
      created_at: now,
      updated_at: now,
    }
    await this.messageRepo.create(message)
    return message
  }
}
