// @ts-ignore - bun:sqlite is available in Bun test runtime
import { Database } from 'bun:sqlite'

function makeBound(stmt: any, params: unknown[]) {
  return {
    async first<T>(): Promise<T | null> {
      const row = stmt.get(...params)
      return (row as T) ?? null
    },
    async all<T>(): Promise<{ results: T[]; success: boolean }> {
      const results = stmt.all(...params)
      return { results: results as T[], success: true }
    },
    async run(): Promise<{ success: boolean; meta: object }> {
      stmt.run(...params)
      return { success: true, meta: { changes: 1, last_row_id: 0, duration: 0 } }
    },
    // drizzle-orm/d1 uses .raw() to get rows as value arrays for SELECT queries
    async raw<T>(): Promise<T[]> {
      const results = stmt.values(...params)
      return results as T[]
    },
  }
}

export function createD1Mock(db: Database) {
  return {
    prepare(query: string) {
      const stmt = db.prepare(query)
      return {
        bind(...params: unknown[]) {
          return makeBound(stmt, params)
        },
        ...makeBound(stmt, []),
      }
    },
    async exec(query: string) {
      db.exec(query)
      return { count: 1, duration: 0 }
    },
    async batch<T>(statements: ReturnType<typeof makeBound>[]) {
      return Promise.all(statements.map((s) => s.all<T>()))
    },
    async dump() {
      return new ArrayBuffer(0)
    },
  }
}
