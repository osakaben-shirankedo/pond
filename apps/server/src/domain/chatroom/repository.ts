import type { ChatRoom } from './entity'

export interface IChatRoomRepository {
  findById(id: string): Promise<ChatRoom | null>
  create(chatRoom: ChatRoom): Promise<void>
  delete(id: string): Promise<void>
}
