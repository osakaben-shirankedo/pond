import type { IUserRepository } from '../../domain/user/repository'
import type { CreateUserInput } from '../../domain/user/entity'
import type { User } from '../../domain/user/entity'

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits'])
  const hashBuffer = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, keyMaterial, 256)
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('')
  const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')
  return `${saltHex}:${hashHex}`
}

export class RegisterUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(input: CreateUserInput): Promise<User> {
    const existing = await this.userRepo.findByEmail(input.email)
    if (existing) throw new Error('EMAIL_ALREADY_EXISTS')

    const existingUserId = await this.userRepo.findByUserId(input.user_id)
    if (existingUserId) throw new Error('USER_ID_ALREADY_EXISTS')

    const now = new Date().toISOString()
    const user: User = {
      id: crypto.randomUUID(),
      user_id: input.user_id,
      nickname: input.nickname,
      email: input.email,
      encrypted_password: await hashPassword(input.password),
      belonging_ike_ids: [],
      created_at: now,
      updated_at: now,
    }
    await this.userRepo.create(user)
    return user
  }
}
