import { eq, inArray } from 'drizzle-orm'
import type { DrizzleD1Database } from 'drizzle-orm/d1'
import type { IProfileRepository } from '../../domain/profile/repository'
import type { Profile } from '../../domain/profile/entity'
import { profiles } from '../db/schema'

export class D1ProfileRepository implements IProfileRepository {
  constructor(private readonly db: DrizzleD1Database) {}

  async findById(id: string): Promise<Profile | null> {
    const result = await this.db.select().from(profiles).where(eq(profiles.id, id)).get()
    return result ?? null
  }

  async findByUserId(userId: string): Promise<Profile | null> {
    const result = await this.db.select().from(profiles).where(eq(profiles.user_id, userId)).get()
    return result ?? null
  }

  async findByUserIds(userIds: string[]): Promise<Profile[]> {
    if (userIds.length === 0) return []
    const results = await this.db.select().from(profiles).where(inArray(profiles.user_id, userIds)).all()
    return results as Profile[]
  }

  async create(profile: Profile): Promise<void> {
    await this.db.insert(profiles).values(profile)
  }

  async update(profile: Profile): Promise<void> {
    await this.db.update(profiles).set(profile).where(eq(profiles.id, profile.id))
  }
}
