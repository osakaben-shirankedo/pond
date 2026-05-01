import * as v from 'valibot'
import { idSchema } from '../shared/id'

export const PurposeSchema = v.picklist(['analyze_pond', 'assign_pond', 'create_pond'])
export type Purpose = v.InferOutput<typeof PurposeSchema>

export const Prompt = v.object({
  id: idSchema,
  model: v.string(),
  purpose: PurposeSchema,
  content: v.string(),
  created_at: v.string(),
  updated_at: v.string(),
})
export type Prompt = v.InferOutput<typeof Prompt>
