import { z } from 'zod'

export const PurposeSchema = z.enum(['analyze_ike', 'asign_ike', 'create_ike'])
export type Purpose = z.infer<typeof PurposeSchema>

export const PromptSchema = z.object({
  id: z.string(),
  model: z.string(),
  purpose: PurposeSchema,
  content: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
})
export type Prompt = z.infer<typeof PromptSchema>
