import type { ITimelineRepository } from '../../domain/timeline/repository'

export class UnreplyPostUseCase {
  constructor(private readonly timelineRepo: ITimelineRepository) {}

  async execute(replyId: string, userId: string): Promise<void> {
    const post = await this.timelineRepo.findById(replyId)
    if (!post) throw new Error('POST_NOT_FOUND')
    if (post.user_id !== userId) throw new Error('FORBIDDEN')
    if (!post.reply_to_id) throw new Error('NOT_A_REPLY')
    await this.timelineRepo.delete(replyId)
  }
}
