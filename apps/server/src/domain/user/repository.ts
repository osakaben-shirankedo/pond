import type { User } from './entity'

export interface IUserRepository {
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  create(user: User): Promise<void>
  update(user: User): Promise<void>
  delete(id: string): Promise<void>
}
