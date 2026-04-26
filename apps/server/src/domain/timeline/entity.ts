import * as v from 'valibot'
import { idSchema } from '../shared/id'

export const TimelinePost = v.object({
  id: idSchema,
  user_id: idSchema,
  pond_id: idSchema,
  pond_category: v.string(),
  content: v.string(),
  reply_to_id: v.nullable(v.string()),
  created_at: v.string(),
  updated_at: v.string(),
})
export type TimelinePost = v.InferOutput<typeof TimelinePost>

export type TimelinePostView = TimelinePost & {
  likes_count: number
  liked_by_me: boolean
  replies: TimelinePostView[]
}
