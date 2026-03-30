import { eq } from 'drizzle-orm'
import type { DrizzleD1Database } from 'drizzle-orm/d1'
import type { IUserRepository } from '../../domain/user/repository'
import type { User } from '../../domain/user/entity'
import { users } from '../db/schema'

export class D1UserRepository implements IUserRepository {
  constructor(private readonly db: DrizzleD1Database) {}

  async findById(id: string): Promise<User | null> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).get()
    return result ?? null
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.db.select().from(users).where(eq(users.email, email)).get()
    return result ?? null
  }

  async create(user: User): Promise<void> {
    await this.db.insert(users).values(user)
  }

  async update(user: User): Promise<void> {
    await this.db.update(users).set(user).where(eq(users.id, user.id))
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(users).where(eq(users.id, id))
  }
}
