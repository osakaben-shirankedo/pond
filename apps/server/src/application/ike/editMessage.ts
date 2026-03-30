import type { IMessageRepository } from '../../domain/message/repository'
import type { Message } from '../../domain/message/entity'

export class EditMessageUseCase {
  constructor(private readonly messageRepo: IMessageRepository) {}

  async execute(messageId: string, userId: string, content: string): Promise<Message> {
    const message = await this.messageRepo.findById(messageId)
    if (!message) throw new Error('MESSAGE_NOT_FOUND')
    if (message.user_id !== userId) throw new Error('FORBIDDEN')

    const updated: Message = { ...message, content, updated_at: new Date().toISOString() }
    await this.messageRepo.update(updated)
    return updated
  }
}
