import { z } from 'zod'

export const TimelinePostSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  ike_id: z.string(),
  ike_category: z.string(),
  content: z.string(),
  reply_to_id: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
})
export type TimelinePost = z.infer<typeof TimelinePostSchema>

export const TimelinePostInputSchema = z.object({
  ike_id: z.string().min(1),
  ike_category: z.string().min(1),
  content: z.string().min(1).max(300),
})
export type TimelinePostInput = z.infer<typeof TimelinePostInputSchema>

export const ReplyPostInputSchema = z.object({
  content: z.string().min(1).max(300),
})
export type ReplyPostInput = z.infer<typeof ReplyPostInputSchema>

// タイムラインのレスポンス形式（いいね数・リプライ・ユーザーのいいね状態付き）
export type TimelinePostView = TimelinePost & {
  likes_count: number
  liked_by_me: boolean
  replies: TimelinePostView[]
}
