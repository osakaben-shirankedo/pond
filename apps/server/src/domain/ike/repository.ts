import type { Ike } from './entity'

export interface IIkeRepository {
  findById(id: string): Promise<Ike | null>
  findByIds(ids: string[]): Promise<Ike[]>
  findByChatRoomId(chatRoomId: string): Promise<Ike | null>
  findByMemberId(userId: string): Promise<Ike[]>
  findAvailable(userId: string): Promise<Ike[]>
  findAll(): Promise<Ike[]>
  create(ike: Ike): Promise<void>
  update(ike: Ike): Promise<void>
  delete(id: string): Promise<void>
}
