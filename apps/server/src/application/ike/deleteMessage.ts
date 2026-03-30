import type { IMessageRepository } from '../../domain/message/repository'

export class DeleteMessageUseCase {
  constructor(private readonly messageRepo: IMessageRepository) {}

  async execute(messageId: string, userId: string): Promise<void> {
    const message = await this.messageRepo.findById(messageId)
    if (!message) throw new Error('MESSAGE_NOT_FOUND')
    if (message.user_id !== userId) throw new Error('FORBIDDEN')
    await this.messageRepo.delete(messageId)
  }
}
