import type { Message } from './entity'

export interface IMessageRepository {
  findById(id: string): Promise<Message | null>
  findByChatRoomId(chatRoomId: string): Promise<Message[]>
  create(message: Message): Promise<void>
  update(message: Message): Promise<void>
  delete(id: string): Promise<void>
}
