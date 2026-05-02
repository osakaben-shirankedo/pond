import * as v from 'valibot'
import { idSchema } from '../shared/id'
import { nameSchema } from '../shared/name'
import { descriptionSchema } from '../shared/description'

export const PondMembershipSchema = v.pipe(v.array(idSchema), v.length(5, "max membership of Pond is 5."));

export const PondSchema = v.object({
  id: idSchema,
  name: nameSchema,
  description: descriptionSchema,
  member_ids: v.array(idSchema),
  chat_room_id: idSchema,
  created_at: v.string(),
  updated_at: v.string(),
})
export type PondSchema = v.InferOutput<typeof PondSchema>

// TODO : add domain logic
export class Pond {

  public static assertCapacity(pond: PondSchema) {
    // FIXME: magic number
    v.assert(PondMembershipSchema, pond)
  }
}