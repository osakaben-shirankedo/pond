import * as v from 'valibot'
import type { User } from './entity'

export const CreateUserInput = v.object({
  user_id: v.pipe(v.string(), v.minLength(4), v.maxLength(20), v.regex(/^[a-zA-Z0-9_]+$/, 'IDは半角英数字とアンダースコアのみ使用できます')),
  nickname: v.pipe(v.string(), v.minLength(1)),
  email: v.pipe(v.string(), v.email()),
  password: v.pipe(v.string(), v.minLength(8)),
})
export type CreateUserInput = v.InferOutput<typeof CreateUserInput>

export interface IUserRepository {
  findById(id: string): Promise<User | null>
  findByUserId(userId: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  create(user: User): Promise<void>
  update(user: User): Promise<void>
  delete(id: string): Promise<void>
}
