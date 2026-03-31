import type { IIkeRepository } from '../../domain/ike/repository'
import type { IUserRepository } from '../../domain/user/repository'
import type { Ike } from '../../domain/ike/entity'

export class ApplyIkeUseCase {
  constructor(
    private readonly ikeRepo: IIkeRepository,
    private readonly userRepo: IUserRepository,
    private readonly claudeApiKey: string,
  ) {}

  async execute(userId: string, field: string, level: string, purpose: string): Promise<Ike> {
    const user = await this.userRepo.findById(userId)
    if (!user) throw new Error('USER_NOT_FOUND')

    // field(ike_name)で絞り込んだ参加可能な池を取得
    const available = await this.ikeRepo.findAvailable(userId)
    const candidates = available.filter(ike => ike.ike_name === field)
    if (candidates.length === 0) throw new Error('NO_IKE_AVAILABLE')

    // AIで最適な池を選択
    const assignedIke = await this.assignWithAI(candidates, field, level, purpose)

    // ike と user の両方を更新
    const now = new Date().toISOString()
    const updatedIke = {
      ...assignedIke,
      member_ids: [...assignedIke.member_ids, userId],
      updated_at: now,
    }
    const updatedUser = {
      ...user,
      belonging_ike_ids: [...user.belonging_ike_ids, assignedIke.id],
      updated_at: now,
    }

    await Promise.all([
      this.ikeRepo.update(updatedIke),
      this.userRepo.update(updatedUser),
    ])
    return updatedIke
  }

  private async assignWithAI(candidates: Ike[], field: string, level: string, purpose: string): Promise<Ike> {
    if (!this.claudeApiKey || candidates.length === 1) return candidates[0]

    try {
      const pondList = candidates.map(ike => `${ike.id}(${ike.member_ids.length}人)`).join(', ')
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
      const matched = candidates.find(ike => ike.id === assignedId)
      return matched ?? candidates[0]
    } catch {
      return candidates[0]
    }
  }
}
