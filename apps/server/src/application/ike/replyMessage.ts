import type { IIkeRepository } from '../../domain/ike/repository'
import type { IMessageRepository } from '../../domain/message/repository'
import type { PostMessageInput } from '../../domain/message/entity'
import type { Message } from '../../domain/message/entity'

export class ReplyMessageUseCase {
  constructor(
    private readonly ikeRepo: IIkeRepository,
    private readonly messageRepo: IMessageRepository,
  ) {}

  async execute(ikeId: string, replyToId: string, userId: string, input: PostMessageInput): Promise<Message> {
    const ike = await this.ikeRepo.findById(ikeId)
    if (!ike) throw new Error('IKE_NOT_FOUND')
    if (!ike.member_ids.includes(userId)) throw new Error('NOT_A_MEMBER')

    const original = await this.messageRepo.findById(replyToId)
    if (!original) throw new Error('MESSAGE_NOT_FOUND')

    const now = new Date().toISOString()
    const message: Message = {
      id: crypto.randomUUID(),
      chat_room_id: ike.chat_room_id,
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
