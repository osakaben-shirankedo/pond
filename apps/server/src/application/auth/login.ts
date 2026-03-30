import type { IUserRepository } from '../../domain/user/repository'

async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [saltHex, hashHex] = storedHash.split(':')
  const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map(b => parseInt(b, 16)))
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits'])
  const hashBuffer = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, keyMaterial, 256)
  const computedHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')
  return computedHex === hashHex
}

export class LoginUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(email: string, password: string): Promise<{ userId: string }> {
    const user = await this.userRepo.findByEmail(email)
    if (!user) throw new Error('INVALID_CREDENTIALS')

    const valid = await verifyPassword(password, user.encrypted_password)
    if (!valid) throw new Error('INVALID_CREDENTIALS')

    return { userId: user.id }
  }
}
