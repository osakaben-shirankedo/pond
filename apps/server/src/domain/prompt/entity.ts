import * as v from 'valibot'

export const PurposeSchema = v.picklist(['analyze_ike', 'asign_ike', 'create_ike'])
export type Purpose = v.InferOutput<typeof PurposeSchema>

export const PromptSchema = v.object({
  id: v.string(),
  model: v.string(),
  purpose: PurposeSchema,
  content: v.string(),
  created_at: v.string(),
  updated_at: v.string(),
})
export type Prompt = v.InferOutput<typeof PromptSchema>
