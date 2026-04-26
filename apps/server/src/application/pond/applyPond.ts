import type { IPondRepository } from '../../domain/pond/repository'
import type { IUserRepository } from '../../domain/user/repository'
import type { Pond } from '../../domain/pond/entity'

export class ApplyPondUseCase {
  constructor(
    private readonly pondRepo: IPondRepository,
    private readonly userRepo: IUserRepository,
    private readonly claudeApiKey: string,
  ) {}

  async execute(userId: string, field: string, level: string, purpose: string): Promise<Pond> {
    const user = await this.userRepo.findById(userId)
    if (!user) throw new Error('USER_NOT_FOUND')

    const available = await this.pondRepo.findAvailable(userId)
    const candidates = available.filter(pond => pond.name === field)
    if (candidates.length === 0) throw new Error('NO_POND_AVAILABLE')

    const assignedPond = await this.assignWithAI(candidates, field, level, purpose)

    const now = new Date().toISOString()
    const updatedPond = {
      ...assignedPond,
      member_ids: [...assignedPond.member_ids, userId],
      updated_at: now,
    }
    const updatedUser = {
      ...user,
      belonging_pond_ids: [...user.belonging_pond_ids, assignedPond.id],
      updated_at: now,
    }

    await Promise.all([
      this.pondRepo.update(updatedPond),
      this.userRepo.update(updatedUser),
    ])
    return updatedPond
  }

  private async assignWithAI(candidates: Pond[], field: string, level: string, purpose: string): Promise<Pond> {
    if (!this.claudeApiKey || candidates.length === 1) return candidates[0]

    try {
      const pondList = candidates.map(pond => `${pond.id}(${pond.member_ids.length}人)`).join(', ')
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': this.claudeApiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 50,
          messages: [{
            role: 'user',
            content: `分野: ${field}, レベル: ${level}, 目的: ${purpose}\n利用可能な池: ${pondList}\n最も適した池のIDを1つだけ答えてください。IDのみ出力してください。`,
          }],
        }),
      })
      const data = await res.json() as { content: { text: string }[] }
      const assignedId = data.content[0]?.text?.trim()
      const matched = candidates.find(pond => pond.id === assignedId)
      return matched ?? candidates[0]
    } catch {
      return candidates[0]
    }
  }
}
