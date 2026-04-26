import * as v from 'valibot'
import { PublicRangeSchema } from '../user/entity'
import type { Message } from './entity'

export const PostMessageInput = v.object({
  content: v.pipe(v.string(), v.minLength(1)),
  public_range: v.optional(PublicRangeSchema, 'all'),
})
export type PostMessageInput = v.InferOutput<typeof PostMessageInput>

export interface IMessageRepository {
  findById(id: string): Promise<Message | null>
  findByChatRoomId(chatRoomId: string): Promise<Message[]>
  create(message: Message): Promise<void>
  update(message: Message): Promise<void>
  delete(id: string): Promise<void>
}
