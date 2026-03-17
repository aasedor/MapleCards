import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  plan: text('plan').default('free'),
  createdAt: timestamp('created_at').defaultNow(),
})

export const cards = pgTable('cards', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  template: text('template').notNull(),
  message: text('message').notNull(),
  fromName: text('from_name'),
  province: text('province'),
  bilingual: boolean('bilingual').default(false),
  stickers: text('stickers'),
  recipientEmail: text('recipient_email'),
  recipientName: text('recipient_name'),
  imageUrl: text('image_url'),
  sentAt: timestamp('sent_at'),
  createdAt: timestamp('created_at').defaultNow(),
})
