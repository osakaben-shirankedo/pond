import { eq, inArray, and } from 'drizzle-orm'
import type { DrizzleD1Database } from 'drizzle-orm/d1'
import type { ITimelineRepository } from '../../domain/timeline/repository'
import type { TimelinePost } from '../../domain/timeline/entity'
import { timelinePosts, timelineLikes } from '../db/schema'

export class D1TimelineRepository implements ITimelineRepository {
  constructor(private readonly db: DrizzleD1Database) {}

  async findByCategories(categories: string[]): Promise<TimelinePost[]> {
    if (categories.length === 0) {
      return this.db
        .select()
        .from(timelinePosts)
        .where(eq(timelinePosts.reply_to_id, null as unknown as string))
        .all() as Promise<TimelinePost[]>
    }
    return this.db
      .select()
      .from(timelinePosts)
      .where(
        and(
          inArray(timelinePosts.ike_category, categories),
          eq(timelinePosts.reply_to_id, null as unknown as string),
        )
      )
      .all() as Promise<TimelinePost[]>
  }

  async findById(id: string): Promise<TimelinePost | null> {
    const result = await this.db
      .select()
      .from(timelinePosts)
      .where(eq(timelinePosts.id, id))
      .get()
    return (result as TimelinePost | undefined) ?? null
  }

  async findReplies(postId: string): Promise<TimelinePost[]> {
    return this.db
      .select()
      .from(timelinePosts)
      .where(eq(timelinePosts.reply_to_id, postId))
      .all() as Promise<TimelinePost[]>
  }

  async create(post: TimelinePost): Promise<void> {
    await this.db.insert(timelinePosts).values(post)
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(timelinePosts).where(eq(timelinePosts.id, id))
  }

  async getLikesCount(postId: string): Promise<number> {
    const rows = await this.db
      .select()
      .from(timelineLikes)
      .where(eq(timelineLikes.post_id, postId))
      .all()
    return rows.length
  }

  async hasLiked(postId: string, userId: string): Promise<boolean> {
    const row = await this.db
      .select()
      .from(timelineLikes)
      .where(and(eq(timelineLikes.post_id, postId), eq(timelineLikes.user_id, userId)))
      .get()
    return !!row
  }

  async addLike(id: string, postId: string, userId: string, createdAt: string): Promise<void> {
    await this.db.insert(timelineLikes).values({ id, post_id: postId, user_id: userId, created_at: createdAt })
  }

  async removeLike(postId: string, userId: string): Promise<void> {
    await this.db
      .delete(timelineLikes)
      .where(and(eq(timelineLikes.post_id, postId), eq(timelineLikes.user_id, userId)))
  }
}
