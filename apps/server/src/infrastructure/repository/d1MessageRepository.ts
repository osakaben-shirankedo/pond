import { eq } from 'drizzle-orm'
import type { DrizzleD1Database } from 'drizzle-orm/d1'
import type { IMessageRepository } from '../../domain/message/repository'
import type { Message } from '../../domain/message/entity'
import { messages } from '../db/schema'

export class D1MessageRepository implements IMessageRepository {
  constructor(private readonly db: DrizzleD1Database) {}

  async findById(id: string): Promise<Message | null> {
    const result = await this.db.select().from(messages).where(eq(messages.id, id)).get()
    return (result as Message | undefined) ?? null
  }

  async findByChatRoomId(chatRoomId: string): Promise<Message[]> {
    return this.db.select().from(messages).where(eq(messages.chat_room_id, chatRoomId)).all() as Promise<Message[]>
  }

  async create(message: Message): Promise<void> {
    await this.db.insert(messages).values(message)
  }

  async update(message: Message): Promise<void> {
    await this.db.update(messages).set(message).where(eq(messages.id, message.id))
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(messages).where(eq(messages.id, id))
  }
}
