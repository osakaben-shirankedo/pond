import { sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  user_id: text('user_id').notNull().unique(),
  nickname: text('nickname').notNull(),
  email: text('email').notNull().unique(),
  encrypted_password: text('encrypted_password').notNull(),
  belonging_pond_ids: text('belonging_pond_ids').notNull().default('[]'),
  created_at: text('created_at').notNull(),
  updated_at: text('updated_at').notNull(),
})

export const profiles = sqliteTable('profiles', {
  id: text('id').primaryKey(),
  user_id: text('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  bio: text('bio').notNull().default(''),
  avatar: text('avatar').notNull().default(''),
  created_at: text('created_at').notNull(),
  updated_at: text('updated_at').notNull(),
})

export const chatRooms = sqliteTable('chat_rooms', {
  id: text('id').primaryKey(),
  created_at: text('created_at').notNull(),
  updated_at: text('updated_at').notNull(),
})

export const ponds = sqliteTable('ponds', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  member_ids: text('member_ids').notNull().default('[]'),
  chat_room_id: text('chat_room_id').notNull().references(() => chatRooms.id),
  created_at: text('created_at').notNull(),
  updated_at: text('updated_at').notNull(),
})

export const messages = sqliteTable('messages', {
  id: text('id').primaryKey(),
  chat_room_id: text('chat_room_id').notNull().references(() => chatRooms.id),
  user_id: text('user_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  reply_to_id: text('reply_to_id'),
  public_range: text('public_range').notNull().default('all'),
  created_at: text('created_at').notNull(),
  updated_at: text('updated_at').notNull(),
})

export const timelinePosts = sqliteTable('timeline_posts', {
  id: text('id').primaryKey(),
  user_id: text('user_id').notNull().references(() => users.id),
  pond_id: text('pond_id').notNull(),
  pond_category: text('pond_category').notNull(),
  content: text('content').notNull(),
  reply_to_id: text('reply_to_id'),
  created_at: text('created_at').notNull(),
  updated_at: text('updated_at').notNull(),
})

export const timelineLikes = sqliteTable('timeline_likes', {
  id: text('id').primaryKey(),
  post_id: text('post_id').notNull().references(() => timelinePosts.id),
  user_id: text('user_id').notNull().references(() => users.id),
  created_at: text('created_at').notNull(),
})

export const prompts = sqliteTable('prompts', {
  id: text('id').primaryKey(),
  model: text('model').notNull(),
  purpose: text('purpose').notNull(),
  content: text('content').notNull(),
  created_at: text('created_at').notNull(),
  updated_at: text('updated_at').notNull(),
})
