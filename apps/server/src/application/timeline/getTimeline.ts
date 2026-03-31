import type { ITimelineRepository } from '../../domain/timeline/repository'
import type { TimelinePostView } from '../../domain/timeline/entity'

export class GetTimelineUseCase {
  constructor(private readonly timelineRepo: ITimelineRepository) {}

  async execute(categories: string[], userId: string): Promise<TimelinePostView[]> {
    const posts = await this.timelineRepo.findByCategories(categories)

    const views: TimelinePostView[] = await Promise.all(
      posts.map(async (post) => {
        const [likesCount, likedByMe, replies] = await Promise.all([
          this.timelineRepo.getLikesCount(post.id),
          this.timelineRepo.hasLiked(post.id, userId),
          this.timelineRepo.findReplies(post.id),
        ])

        const replyViews: TimelinePostView[] = await Promise.all(
          replies.map(async (r) => ({
            ...r,
            likes_count: await this.timelineRepo.getLikesCount(r.id),
            liked_by_me: await this.timelineRepo.hasLiked(r.id, userId),
            replies: [],
          }))
        )

        return {
          ...post,
          likes_count: likesCount,
          liked_by_me: likedByMe,
          replies: replyViews,
        }
      })
    )

    // 新しい順
    return views.sort((a, b) => b.created_at.localeCompare(a.created_at))
  }
}
