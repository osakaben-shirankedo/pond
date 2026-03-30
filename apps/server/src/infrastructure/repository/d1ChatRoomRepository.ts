import { eq } from 'drizzle-orm'
import type { DrizzleD1Database } from 'drizzle-orm/d1'
import type { IChatRoomRepository } from '../../domain/chatroom/repository'
import type { ChatRoom } from '../../domain/chatroom/entity'
import { chatRooms } from '../db/schema'

export class D1ChatRoomRepository implements IChatRoomRepository {
  constructor(private readonly db: DrizzleD1Database) {}

  async findById(id: string): Promise<ChatRoom | null> {
    const result = await this.db.select().from(chatRooms).where(eq(chatRooms.id, id)).get()
    return result ?? null
  }

  async create(chatRoom: ChatRoom): Promise<void> {
    await this.db.insert(chatRooms).values(chatRoom)
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(chatRooms).where(eq(chatRooms.id, id))
  }
}
