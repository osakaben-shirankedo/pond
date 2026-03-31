import type { ITimelineRepository } from '../../domain/timeline/repository'
import type { TimelinePostInput, TimelinePost } from '../../domain/timeline/entity'

export class PostTimelineUseCase {
  constructor(private readonly timelineRepo: ITimelineRepository) {}

  async execute(userId: string, input: TimelinePostInput): Promise<TimelinePost> {
    const now = new Date().toISOString()
    const post: TimelinePost = {
      id: crypto.randomUUID(),
      user_id: userId,
      ike_id: input.ike_id,
      ike_category: input.ike_category,
      content: input.content,
      reply_to_id: null,
      created_at: now,
      updated_at: now,
    }
    await this.timelineRepo.create(post)
    return post
  }
}
