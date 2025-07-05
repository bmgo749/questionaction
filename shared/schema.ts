import { pgTable, text, serial, integer, boolean, timestamp, varchar, jsonb, index, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Updated users table for OAuth and email authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(), // OAuth provider ID or email-based UUID
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  provider: varchar("provider").notNull(), // 'google', 'discord', or 'email'
  password: varchar("password"), // For email/password authentication
  isVerified: boolean("is_verified").default(false),
  verificationCode: varchar("verification_code"),
  verificationCodeExpiry: timestamp("verification_code_expiry"),
  // New profile fields
  aliasName: varchar("alias_name"),
  description: text("description"),
  fame: integer("fame").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  categories: text("categories").array().notNull(), // Multiple categories
  thumbnail: text("thumbnail"), // Optional thumbnail URL
  language: text("language").notNull().default("en"),
  author: varchar("author"), // Author user ID
  likes: integer("likes").default(0).notNull(),
  dislikes: integer("dislikes").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  articleCount: integer("article_count").default(0).notNull(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  articleId: integer("article_id").notNull(),
  author: text("author").notNull(), // User ID
  authorName: text("author_name"), // Display name
  authorAlias: text("author_alias"), // Alias name
  authorFame: integer("author_fame").default(0), // Fame at time of comment
  authorProfileUrl: text("author_profile_url"), // Profile image URL
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const articleLikes = pgTable("article_likes", {
  id: serial("id").primaryKey(),
  articleId: integer("article_id").notNull(),
  userIp: text("user_ip").notNull(),
  isLike: boolean("is_like").notNull(), // true for like, false for dislike
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  uniqueUserArticle: unique("unique_user_article").on(table.articleId, table.userIp),
}));

export const articleFavorites = pgTable("article_favorites", {
  id: serial("id").primaryKey(),
  articleId: integer("article_id").notNull(),
  userIp: text("user_ip").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  uniqueUserArticleFav: unique("unique_user_article_fav").on(table.articleId, table.userIp),
}));

export const upsertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertArticleSchema = createInsertSchema(articles).pick({
  title: true,
  content: true,
  categories: true,
  thumbnail: true,
  language: true,
  author: true,
});

export const insertCommentSchema = createInsertSchema(comments).pick({
  articleId: true,
  author: true,
  authorName: true,
  authorAlias: true,
  authorFame: true,
  authorProfileUrl: true,
  content: true,
});

export const insertArticleLikeSchema = createInsertSchema(articleLikes).pick({
  articleId: true,
  userIp: true,
  isLike: true,
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  slug: true,
  description: true,
  icon: true,
  color: true,
});

export const insertArticleFavoriteSchema = createInsertSchema(articleFavorites).pick({
  articleId: true,
  userIp: true,
});

// Authentication schemas
export const signUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const verifyEmailSchema = z.object({
  code: z.string().length(6, "Verification code must be 6 digits"),
});

export const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// Profile update schema
export const updateProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
  aliasName: z.string().max(50, "Alias name too long").optional(),
  description: z.string().max(500, "Description too long").optional(),
  profileImageUrl: z.string().url("Invalid image URL").optional(),
});

export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type SignUp = z.infer<typeof signUpSchema>;
export type SignIn = z.infer<typeof signInSchema>;
export type VerifyEmail = z.infer<typeof verifyEmailSchema>;
export type ResetPassword = z.infer<typeof resetPasswordSchema>;
export type UpdateProfile = z.infer<typeof updateProfileSchema>;
export type User = typeof users.$inferSelect;
export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type Article = typeof articles.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;
export type InsertArticleLike = z.infer<typeof insertArticleLikeSchema>;
export type ArticleLike = typeof articleLikes.$inferSelect;
export type InsertArticleFavorite = z.infer<typeof insertArticleFavoriteSchema>;
export type ArticleFavorite = typeof articleFavorites.$inferSelect;
