import type { ITimelineRepository } from '../../domain/timeline/repository'

export class LikePostUseCase {
  constructor(private readonly timelineRepo: ITimelineRepository) {}

  async execute(postId: string, userId: string): Promise<{ likes_count: number }> {
    const post = await this.timelineRepo.findById(postId)
    if (!post) throw new Error('POST_NOT_FOUND')

    const already = await this.timelineRepo.hasLiked(postId, userId)
    if (!already) {
      await this.timelineRepo.addLike(crypto.randomUUID(), postId, userId, new Date().toISOString())
    }

    const count = await this.timelineRepo.getLikesCount(postId)
    return { likes_count: count }
  }
}
