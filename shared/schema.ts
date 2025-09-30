import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  displayName: text("display_name").notNull(),
  avatar: text("avatar"),
  bio: text("bio"),
  role: text("role").default("member"), // member, moderator, admin
  badges: text("badges").array().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const posts = pgTable("posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // discussion, book_club, workshop, art_gallery
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category"),
  tags: text("tags").array().default([]),
  likes: integer("likes").default(0),
  replies: integer("replies").default(0),
  images: text("images").array().default([]),
  metadata: jsonb("metadata"), // for type-specific data
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bookClubs = pgTable("book_clubs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  currentBook: text("current_book"),
  progress: integer("progress").default(0),
  memberCount: integer("member_count").default(0),
  isPrivate: boolean("is_private").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const workshops = pgTable("workshops", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  genre: text("genre"),
  targetWords: integer("target_words"),
  currentWriters: integer("current_writers").default(0),
  maxWriters: integer("max_writers").default(5),
  timeline: text("timeline"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  displayName: true,
  avatar: true,
  bio: true,
});

export const insertPostSchema = createInsertSchema(posts).pick({
  type: true,
  title: true,
  content: true,
  category: true,
  tags: true,
  images: true,
  metadata: true,
});

export const insertBookClubSchema = createInsertSchema(bookClubs).pick({
  name: true,
  description: true,
  currentBook: true,
  isPrivate: true,
});

export const insertWorkshopSchema = createInsertSchema(workshops).pick({
  title: true,
  description: true,
  genre: true,
  targetWords: true,
  maxWriters: true,
  timeline: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;
export type InsertBookClub = z.infer<typeof insertBookClubSchema>;
export type BookClub = typeof bookClubs.$inferSelect;
export type InsertWorkshop = z.infer<typeof insertWorkshopSchema>;
export type Workshop = typeof workshops.$inferSelect;

// ---------- Community Discussion ----------
export const threads = pgTable("threads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category"),
  tags: text("tags").array().default([]),
  images: text("images").array().default([]),
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  threadId: varchar("thread_id").references(() => threads.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  parentId: varchar("parent_id"), // nullable for top-level
  content: text("content").notNull(),
  likes: integer("likes").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertThreadSchema = createInsertSchema(threads).pick({
  title: true,
  content: true,
  category: true,
  tags: true,
  images: true,
});

export const insertCommentSchema = createInsertSchema(comments).pick({
  threadId: true,
  parentId: true,
  content: true,
});

export type InsertThread = z.infer<typeof insertThreadSchema>;
export type Thread = typeof threads.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;

// Workshop Comments
export const workshopComments = pgTable("workshop_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").references(() => posts.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  likes: integer("likes").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertWorkshopCommentSchema = createInsertSchema(workshopComments).pick({
  postId: true,
  content: true,
});

export type InsertWorkshopComment = z.infer<typeof insertWorkshopCommentSchema>;
export type WorkshopComment = typeof workshopComments.$inferSelect;
