import * as v from 'valibot'

export const TimelinePostSchema = v.object({
  id: v.string(),
  user_id: v.string(),
  ike_id: v.string(),
  ike_category: v.string(),
  content: v.string(),
  reply_to_id: v.nullable(v.string()),
  created_at: v.string(),
  updated_at: v.string(),
})
export type TimelinePost = v.InferOutput<typeof TimelinePostSchema>

export const TimelinePostInputSchema = v.object({
  ike_id: v.pipe(v.string(), v.minLength(1)),
  ike_category: v.pipe(v.string(), v.minLength(1)),
  content: v.pipe(v.string(), v.minLength(1), v.maxLength(300)),
})
export type TimelinePostInput = v.InferOutput<typeof TimelinePostInputSchema>

export const ReplyPostInputSchema = v.object({
  content: v.pipe(v.string(), v.minLength(1), v.maxLength(300)),
})
export type ReplyPostInput = v.InferOutput<typeof ReplyPostInputSchema>

// タイムラインのレスポンス形式（いいね数・リプライ・ユーザーのいいね状態付き）
export type TimelinePostView = TimelinePost & {
  likes_count: number
  liked_by_me: boolean
  replies: TimelinePostView[]
}
