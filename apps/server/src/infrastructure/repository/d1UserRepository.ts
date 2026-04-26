import { eq } from 'drizzle-orm'
import type { DrizzleD1Database } from 'drizzle-orm/d1'
import type { IUserRepository } from '../../domain/user/repository'
import type { User } from '../../domain/user/entity'
import { users } from '../db/schema'

type UserRow = {
  id: string
  user_id: string
  nickname: string
  email: string
  encrypted_password: string
  belonging_pond_ids: string
  created_at: string
  updated_at: string
}

function rowToUser(row: UserRow): User {
  return { ...row, belonging_pond_ids: JSON.parse(row.belonging_pond_ids) }
}

export class D1UserRepository implements IUserRepository {
  constructor(private readonly db: DrizzleD1Database) {}

  async findById(id: string): Promise<User | null> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).get()
    return result ? rowToUser(result as UserRow) : null
  }

  async findByUserId(userId: string): Promise<User | null> {
    const result = await this.db.select().from(users).where(eq(users.user_id, userId)).get()
    return result ? rowToUser(result as UserRow) : null
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.db.select().from(users).where(eq(users.email, email)).get()
    return result ? rowToUser(result as UserRow) : null
  }

  async create(user: User): Promise<void> {
    await this.db.insert(users).values({ ...user, belonging_pond_ids: JSON.stringify(user.belonging_pond_ids) })
  }

  async update(user: User): Promise<void> {
    await this.db.update(users).set({ ...user, belonging_pond_ids: JSON.stringify(user.belonging_pond_ids) }).where(eq(users.id, user.id))
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(users).where(eq(users.id, id))
  }
}
