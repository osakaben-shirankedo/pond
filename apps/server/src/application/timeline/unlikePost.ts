import type { ITimelineRepository } from '../../domain/timeline/repository'

export class UnlikePostUseCase {
  constructor(private readonly timelineRepo: ITimelineRepository) {}

  async execute(postId: string, userId: string): Promise<{ likes_count: number }> {
    const post = await this.timelineRepo.findById(postId)
    if (!post) throw new Error('POST_NOT_FOUND')

    await this.timelineRepo.removeLike(postId, userId)
    const count = await this.timelineRepo.getLikesCount(postId)
    return { likes_count: count }
  }
}
