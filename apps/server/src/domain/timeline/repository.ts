import * as v from 'valibot'
import type { TimelinePost } from './entity'

export const TimelinePostInput = v.object({
  pond_id: v.pipe(v.string(), v.minLength(1)),
  pond_category: v.pipe(v.string(), v.minLength(1)),
  content: v.pipe(v.string(), v.minLength(1), v.maxLength(300)),
})
export type TimelinePostInput = v.InferOutput<typeof TimelinePostInput>

export const ReplyPostInput = v.object({
  content: v.pipe(v.string(), v.minLength(1), v.maxLength(300)),
})
export type ReplyPostInput = v.InferOutput<typeof ReplyPostInput>

export interface ITimelineRepository {
  findByCategories(categories: string[]): Promise<TimelinePost[]>
  findById(id: string): Promise<TimelinePost | null>
  findReplies(postId: string): Promise<TimelinePost[]>
  create(post: TimelinePost): Promise<void>
  delete(id: string): Promise<void>
  getLikesCount(postId: string): Promise<number>
  hasLiked(postId: string, userId: string): Promise<boolean>
  addLike(id: string, postId: string, userId: string, createdAt: string): Promise<void>
  removeLike(postId: string, userId: string): Promise<void>
}
