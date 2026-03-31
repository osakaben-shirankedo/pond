import type { ITimelineRepository } from '../../domain/timeline/repository'
import type { TimelinePost } from '../../domain/timeline/entity'

export class ReplyPostUseCase {
  constructor(private readonly timelineRepo: ITimelineRepository) {}

  async execute(postId: string, userId: string, content: string): Promise<TimelinePost> {
    const parent = await this.timelineRepo.findById(postId)
    if (!parent) throw new Error('POST_NOT_FOUND')

    const now = new Date().toISOString()
    const reply: TimelinePost = {
      id: crypto.randomUUID(),
      user_id: userId,
      ike_id: parent.ike_id,
      ike_category: parent.ike_category,
      content,
      reply_to_id: postId,
      created_at: now,
      updated_at: now,
    }
    await this.timelineRepo.create(reply)
    return reply
  }
}
