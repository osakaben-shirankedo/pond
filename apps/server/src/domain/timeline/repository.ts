import type { TimelinePost } from './entity'

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
