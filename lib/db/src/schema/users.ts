import { pgTable, serial, text, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["admin", "administration", "teacher", "student"]);

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").notNull(),
  linkedEntityId: serial("linked_entity_id"),
  telegramChatId: text("telegram_chat_id").unique(),
  telegramLinkToken: text("telegram_link_token").unique(),
  telegramLinkExpires: timestamp("telegram_link_expires"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

