import type { ITimelineRepository } from '../../domain/timeline/repository'
import type { TimelinePostInput } from '../../domain/timeline/repository'
import type { TimelinePost } from '../../domain/timeline/entity'

export class PostTimelineUseCase {
  constructor(private readonly timelineRepo: ITimelineRepository) {}

  async execute(userId: string, input: TimelinePostInput): Promise<TimelinePost> {
    const now = new Date().toISOString()
    const post: TimelinePost = {
      id: crypto.randomUUID(),
      user_id: userId,
      pond_id: input.pond_id,
      pond_category: input.pond_category,
      content: input.content,
      reply_to_id: null,
      created_at: now,
      updated_at: now,
    }
    await this.timelineRepo.create(post)
    return post
  }
}
