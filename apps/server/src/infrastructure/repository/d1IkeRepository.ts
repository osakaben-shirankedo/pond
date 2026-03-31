import { eq, inArray } from 'drizzle-orm'
import type { DrizzleD1Database } from 'drizzle-orm/d1'
import type { IIkeRepository } from '../../domain/ike/repository'
import type { Ike } from '../../domain/ike/entity'
import { ikes } from '../db/schema'

type IkeRow = {
  id: string
  ike_name: string
  description: string
  member_ids: string
  chat_room_id: string
  created_at: string
  updated_at: string
}

function rowToIke(row: IkeRow): Ike {
  return { ...row, member_ids: JSON.parse(row.member_ids) }
}

export class D1IkeRepository implements IIkeRepository {
  constructor(private readonly db: DrizzleD1Database) {}

  async findById(id: string): Promise<Ike | null> {
    const result = await this.db.select().from(ikes).where(eq(ikes.id, id)).get()
    return result ? rowToIke(result as IkeRow) : null
  }

  async findByIds(ids: string[]): Promise<Ike[]> {
    if (ids.length === 0) return []
    const results = await this.db.select().from(ikes).where(inArray(ikes.id, ids)).all()
    return (results as IkeRow[]).map(rowToIke)
  }

  async findByMemberId(userId: string): Promise<Ike[]> {
    const results = await this.db.select().from(ikes).all()
    return (results as IkeRow[]).map(rowToIke).filter(ike => ike.member_ids.includes(userId))
  }

  async findAvailable(userId: string): Promise<Ike[]> {
    const results = await this.db.select().from(ikes).all()
    return (results as IkeRow[]).map(rowToIke).filter(ike => !ike.member_ids.includes(userId))
  }

  async findAll(): Promise<Ike[]> {
    const results = await this.db.select().from(ikes).all()
    return (results as IkeRow[]).map(rowToIke)
  }

  async create(ike: Ike): Promise<void> {
    await this.db.insert(ikes).values({ ...ike, member_ids: JSON.stringify(ike.member_ids) })
  }

  async update(ike: Ike): Promise<void> {
    await this.db.update(ikes).set({ ...ike, member_ids: JSON.stringify(ike.member_ids) }).where(eq(ikes.id, ike.id))
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(ikes).where(eq(ikes.id, id))
  }
}
