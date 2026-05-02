import type { PondSchema } from './entity'

export interface IPondRepository {
  findById(id: string): Promise<PondSchema | null>
  findByIds(ids: string[]): Promise<PondSchema[]>
  findByChatRoomId(chatRoomId: string): Promise<PondSchema | null>
  findByMemberId(userId: string): Promise<PondSchema[]>
  findAvailable(userId: string): Promise<PondSchema[]>
  findAll(): Promise<PondSchema[]>
  create(pond: PondSchema): Promise<void>
  update(pond: PondSchema): Promise<void>
  delete(id: string): Promise<void>
}
