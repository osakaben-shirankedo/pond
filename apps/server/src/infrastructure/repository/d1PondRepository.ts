import { eq, inArray } from 'drizzle-orm'
import type { DrizzleD1Database } from 'drizzle-orm/d1'
import type { IPondRepository } from '../../domain/pond/repository'
import type { Pond } from '../../domain/pond/entity'
import { ponds } from '../db/schema'

type PondRow = {
  id: string
  name: string
  description: string
  member_ids: string
  chat_room_id: string
  created_at: string
  updated_at: string
}

function rowToPond(row: PondRow): Pond {
  return { ...row, member_ids: JSON.parse(row.member_ids) }
}

export class D1PondRepository implements IPondRepository {
  constructor(private readonly db: DrizzleD1Database) {}

  async findById(id: string): Promise<Pond | null> {
    const result = await this.db.select().from(ponds).where(eq(ponds.id, id)).get()
    return result ? rowToPond(result as PondRow) : null
  }

  async findByChatRoomId(chatRoomId: string): Promise<Pond | null> {
    const result = await this.db.select().from(ponds).where(eq(ponds.chat_room_id, chatRoomId)).get()
    return result ? rowToPond(result as PondRow) : null
  }

  async findByIds(ids: string[]): Promise<Pond[]> {
    if (ids.length === 0) return []
    const results = await this.db.select().from(ponds).where(inArray(ponds.id, ids)).all()
    return (results as PondRow[]).map(rowToPond)
  }

  async findByMemberId(userId: string): Promise<Pond[]> {
    const results = await this.db.select().from(ponds).all()
    return (results as PondRow[]).map(rowToPond).filter(pond => pond.member_ids.includes(userId))
  }

  async findAvailable(userId: string): Promise<Pond[]> {
    const results = await this.db.select().from(ponds).all()
    return (results as PondRow[]).map(rowToPond).filter(pond => !pond.member_ids.includes(userId))
  }

  async findAll(): Promise<Pond[]> {
    const results = await this.db.select().from(ponds).all()
    return (results as PondRow[]).map(rowToPond)
  }

  async create(pond: Pond): Promise<void> {
    await this.db.insert(ponds).values({ ...pond, member_ids: JSON.stringify(pond.member_ids) })
  }

  async update(pond: Pond): Promise<void> {
    await this.db.update(ponds).set({ ...pond, member_ids: JSON.stringify(pond.member_ids) }).where(eq(ponds.id, pond.id))
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(ponds).where(eq(ponds.id, id))
  }
}
