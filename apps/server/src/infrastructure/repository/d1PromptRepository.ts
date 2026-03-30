import { eq } from 'drizzle-orm'
import type { DrizzleD1Database } from 'drizzle-orm/d1'
import type { IPromptRepository } from '../../domain/prompt/repository'
import type { Prompt } from '../../domain/prompt/entity'
import type { Purpose } from '../../domain/prompt/entity'
import { prompts } from '../db/schema'

export class D1PromptRepository implements IPromptRepository {
  constructor(private readonly db: DrizzleD1Database) {}

  async findById(id: string): Promise<Prompt | null> {
    const result = await this.db.select().from(prompts).where(eq(prompts.id, id)).get()
    return (result as Prompt | undefined) ?? null
  }

  async findByPurpose(purpose: Purpose): Promise<Prompt | null> {
    const result = await this.db.select().from(prompts).where(eq(prompts.purpose, purpose)).get()
    return (result as Prompt | undefined) ?? null
  }

  async findAll(): Promise<Prompt[]> {
    return this.db.select().from(prompts).all() as Promise<Prompt[]>
  }

  async create(prompt: Prompt): Promise<void> {
    await this.db.insert(prompts).values(prompt)
  }

  async update(prompt: Prompt): Promise<void> {
    await this.db.update(prompts).set(prompt).where(eq(prompts.id, prompt.id))
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(prompts).where(eq(prompts.id, id))
  }
}
