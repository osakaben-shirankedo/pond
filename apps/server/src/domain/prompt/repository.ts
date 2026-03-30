import type { Prompt } from './entity'
import type { Purpose } from './entity'

export interface IPromptRepository {
  findById(id: string): Promise<Prompt | null>
  findByPurpose(purpose: Purpose): Promise<Prompt | null>
  findAll(): Promise<Prompt[]>
  create(prompt: Prompt): Promise<void>
  update(prompt: Prompt): Promise<void>
  delete(id: string): Promise<void>
}
