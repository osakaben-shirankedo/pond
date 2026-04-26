/**
 * サーバーが返すレスポンスの valibot スキーマ定義
 * 変更があった場合はここを修正するだけで型エラーとして検出できる
 */
import * as v from 'valibot'

// ─────────────────────────────────────────
// Auth
// ─────────────────────────────────────────

export const LoginResponseSchema = v.object({
  token: v.string(),
  userId: v.string(),
})
export type LoginResponse = v.InferOutput<typeof LoginResponseSchema>

export const RegisterResponseSchema = v.object({
  id: v.string(),
  user_id: v.string(),
  email: v.string(),
  nickname: v.string(),
})
export type RegisterResponse = v.InferOutput<typeof RegisterResponseSchema>

// ─────────────────────────────────────────
// Profile
// ─────────────────────────────────────────

export const ServerProfileSchema = v.object({
  id: v.string(),
  user_id: v.string(),
  handle: v.string(),
  name: v.string(),
  bio: v.optional(v.string(), ''),
  avatar: v.optional(v.string(), ''),
})
export type ServerProfile = v.InferOutput<typeof ServerProfileSchema>

// ─────────────────────────────────────────
// Timeline
// ─────────────────────────────────────────

// リプライは1段階のみ（再帰なし）
export const TimelineReplySchema = v.object({
  id: v.string(),
  user_id: v.string(),
  pond_id: v.string(),
  pond_category: v.string(),
  content: v.string(),
  reply_to_id: v.nullable(v.string()),
  likes_count: v.number(),
  liked_by_me: v.boolean(),
  replies: v.array(v.unknown()), // 深いネストは扱わない
  created_at: v.string(),
  updated_at: v.string(),
})
export type TimelineReply = v.InferOutput<typeof TimelineReplySchema>

export const TimelinePostViewSchema = v.object({
  id: v.string(),
  user_id: v.string(),
  pond_id: v.string(),
  pond_category: v.string(),
  content: v.string(),
  reply_to_id: v.nullable(v.string()),
  likes_count: v.number(),
  liked_by_me: v.boolean(),
  replies: v.array(TimelineReplySchema),
  created_at: v.string(),
  updated_at: v.string(),
})
export type TimelinePostView = v.InferOutput<typeof TimelinePostViewSchema>

export const TimelinePostViewListSchema = v.array(TimelinePostViewSchema)

export const ReplyResponseSchema = v.object({
  id: v.string(),
  content: v.string(),
  created_at: v.string(),
})
export type ReplyResponse = v.InferOutput<typeof ReplyResponseSchema>

// ─────────────────────────────────────────
// Pond (池)
// ─────────────────────────────────────────

export const ServerPondSchema = v.object({
  id: v.string(),
  name: v.string(),
  description: v.string(),
  member_ids: v.array(v.string()),
  chat_room_id: v.string(),
  created_at: v.string(),
  updated_at: v.string(),
})
export type ServerPond = v.InferOutput<typeof ServerPondSchema>

export const ServerPondListSchema = v.array(ServerPondSchema)

export const MemberProfileSchema = v.object({
  user_id: v.string(),
  name: v.string(),
  avatar: v.string(),
})
export type MemberProfile = v.InferOutput<typeof MemberProfileSchema>

export const MemberProfileListSchema = v.array(MemberProfileSchema)

// ─────────────────────────────────────────
// Chat Message
// ─────────────────────────────────────────

export const ServerMessageSchema = v.object({
  id: v.string(),
  chat_room_id: v.optional(v.string()),
  user_id: v.string(),
  content: v.string(),
  reply_to_id: v.nullish(v.string()),
  public_range: v.optional(v.picklist(['all', 'ike', 'profile']), 'all'),
  created_at: v.string(),
  updated_at: v.string(),
})
export type ServerMessage = v.InferOutput<typeof ServerMessageSchema>

export const ServerMessageListSchema = v.array(ServerMessageSchema)

// ─────────────────────────────────────────
// Misc
// ─────────────────────────────────────────

export const AiFishResponseSchema = v.object({
  message: v.string(),
})
export type AiFishResponse = v.InferOutput<typeof AiFishResponseSchema>

// ─────────────────────────────────────────
// Challenge
// ─────────────────────────────────────────

export const ChallengeEvaluateResponseSchema = v.object({
  pass: v.boolean(),
  score: v.optional(v.number()),
  comment: v.string(),
})
export type ChallengeEvaluateResponse = v.InferOutput<typeof ChallengeEvaluateResponseSchema>
