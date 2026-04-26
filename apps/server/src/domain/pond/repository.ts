import type { Pond } from './entity'

export interface IPondRepository {
  findById(id: string): Promise<Pond | null>
  findByIds(ids: string[]): Promise<Pond[]>
  findByChatRoomId(chatRoomId: string): Promise<Pond | null>
  findByMemberId(userId: string): Promise<Pond[]>
  findAvailable(userId: string): Promise<Pond[]>
  findAll(): Promise<Pond[]>
  create(pond: Pond): Promise<void>
  update(pond: Pond): Promise<void>
  delete(id: string): Promise<void>
}
