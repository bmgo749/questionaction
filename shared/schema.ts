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
  isVerifiedCheckmark: boolean("is_verified_checkmark").default(false), // Blue checkmark for 500+ honour
  iqScore: integer("iq_score"),
  iqTestTaken: boolean("iq_test_taken").default(false),
  iqTestDate: timestamp("iq_test_date"),
  allowNsfw: boolean("allow_nsfw").default(false), // User NSFW preference
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  categories: text("categories").array().notNull(), // Multiple categories
  hashtags: text("hashtags").array(), // Optional hashtags
  thumbnail: text("thumbnail"), // Optional thumbnail URL
  language: text("language").notNull().default("en"),
  author: varchar("author"), // Author user ID
  enableForum: boolean("enable_forum").default(false), // Forum discussion toggle
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
  authorFame: integer("author_fame").default(0), // Honor at time of comment
  authorProfileUrl: text("author_profile_url"), // Profile image URL
  content: text("content").notNull(),
  userIp: text("user_ip").notNull(), // IP address for tracking
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

export const visitors = pgTable("visitors", {
  id: serial("id").primaryKey(),
  ipAddress: text("ip_address").notNull(),
  userAgent: text("user_agent"),
  firstVisit: timestamp("first_visit").defaultNow().notNull(),
  lastVisit: timestamp("last_visit").defaultNow().notNull(),
  visitCount: integer("visit_count").default(1).notNull(),
  iqScore: integer("iq_score"),
  iqTestTaken: boolean("iq_test_taken").default(false),
  iqTestDate: timestamp("iq_test_date"),
  allowNsfw: boolean("allow_nsfw").default(false), // Anonymous user NSFW preference
  anonymousNumber: integer("anonymous_number"), // Unique number for anonymous display
}, (table) => ({
  uniqueVisitor: unique("unique_visitor").on(table.ipAddress),
}));

// Global IQ test tracking table for persistent IQ button visibility
export const iqTestTracking = pgTable("iq_test_tracking", {
  id: serial("id").primaryKey(),
  identifier: varchar("identifier").notNull().unique(), // IP address for anonymous, user ID for logged in users
  identifierType: varchar("identifier_type").notNull(), // 'ip' or 'user'
  iqTestCompleted: boolean("iq_test_completed").default(false),
  iqScore: integer("iq_score"),
  testDate: timestamp("test_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const videoPosts = pgTable("video_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  videoUrl: text("video_url").notNull(),
  caption: text("caption"),
  description: text("description"),
  authorId: text("author_id"),
  authorIp: text("author_ip").notNull(),
  authorName: text("author_name").notNull(),
  likes: integer("likes").default(0).notNull(),
  dislikes: integer("dislikes").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const videoComments = pgTable("video_comments", {
  id: serial("id").primaryKey(),
  videoPostId: integer("video_post_id").references(() => videoPosts.id, { onDelete: "cascade" }).notNull(),
  authorId: text("author_id"),
  authorIp: text("author_ip").notNull(),
  authorName: text("author_name").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const videoLikes = pgTable("video_likes", {
  id: serial("id").primaryKey(),
  videoPostId: integer("video_post_id").references(() => videoPosts.id, { onDelete: "cascade" }).notNull(),
  userIp: text("user_ip").notNull(),
  type: text("type", { enum: ["like", "dislike"] }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  uniqueVideoLike: unique().on(table.videoPostId, table.userIp),
}));

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  channel: text("channel").notNull().default("general"),
  authorId: text("author_id"),
  authorIp: text("author_ip").notNull(),
  authorName: text("author_name").notNull(),
  content: text("content").notNull(),
  messageType: text("message_type", { enum: ["text", "image", "file"] }).default("text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Social media posts table
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'image' or 'discussion'
  title: text("title").notNull(),
  content: text("content"),
  imageUrl: text("image_url"),
  authorId: text("author_id"), // nullable for anonymous posts
  authorName: text("author_name").notNull(),
  authorIp: text("author_ip").notNull(),
  likes: integer("likes").notNull().default(0),
  dislikes: integer("dislikes").notNull().default(0),
  comments: integer("comments").notNull().default(0),
  downloads: integer("downloads").notNull().default(0),
  reposts: integer("reposts").notNull().default(0),
  originalPostId: integer("original_post_id"), // for reposts
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Post likes/dislikes table
export const postLikes = pgTable("post_likes", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  userIp: text("user_ip").notNull(),
  userId: text("user_id"), // nullable for anonymous users
  isLike: boolean("is_like").notNull(), // true for like, false for dislike
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  uniqueUserPost: unique().on(table.postId, table.userIp),
}));

// Post comments table
export const postComments = pgTable("post_comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  authorId: text("author_id"), // nullable for anonymous comments
  authorName: text("author_name").notNull(),
  authorIp: text("author_ip").notNull(),
  authorIq: integer("author_iq"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Post downloads tracking
export const postDownloads = pgTable("post_downloads", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  userIp: text("user_ip").notNull(),
  userId: text("user_id"), // nullable for anonymous users
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Page Posts - Social media style posts
export const pagePosts = pgTable("page_posts", {
  id: serial("id").primaryKey(),
  authorId: text("author_id"), // User ID if registered
  authorIp: text("author_ip").notNull(), // Always track IP
  authorName: text("author_name").notNull(),
  authorAlias: text("author_alias"),
  authorProfileUrl: text("author_profile_url"),
  type: text("type").notNull(), // 'photo', 'discussion', 'video'
  title: text("title"), // Optional title
  content: text("content").notNull(),
  mediaUrl: text("media_url"), // For photos/videos
  mediaType: text("media_type"), // 'image', 'video'
  likes: integer("likes").default(0).notNull(),
  dislikes: integer("dislikes").default(0).notNull(),
  comments: integer("comments").default(0).notNull(),
  isVotingEnabled: boolean("is_voting_enabled").default(false),
  votingQuestion: text("voting_question"),
  votingOptions: text("voting_options").array(), // Array of voting options
  votes: jsonb("votes").default('{}'), // Store vote counts as JSON
  hashtags: text("hashtags").array().default(['#pagefeed']), // Array of hashtags
  isNsfw: boolean("is_nsfw").default(false), // NSFW content flag
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Page Post Likes/Dislikes
export const pagePostLikes = pgTable("page_post_likes", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  userIp: text("user_ip").notNull(),
  userId: text("user_id"), // Only for registered users
  isLike: boolean("is_like").notNull(), // true for like, false for dislike
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  unique().on(table.postId, table.userIp),
]);

// Page Post Comments
export const pagePostComments = pgTable("page_post_comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  authorId: text("author_id"), // User ID if registered
  authorIp: text("author_ip").notNull(), // Always track IP
  authorName: text("author_name").notNull(),
  authorAlias: text("author_alias"),
  authorProfileUrl: text("author_profile_url"),
  authorIq: integer("author_iq"),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Page Post Votes
export const pagePostVotes = pgTable("page_post_votes", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  userIp: text("user_ip").notNull(),
  userId: text("user_id"), // nullable for anonymous users
  option: text("option").notNull(), // The selected voting option
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  unique().on(table.postId, table.userIp),
]);

export const upsertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertArticleSchema = createInsertSchema(articles).pick({
  title: true,
  content: true,
  categories: true,
  hashtags: true,
  thumbnail: true,
  language: true,
  author: true,
  enableForum: true,
});

export const insertCommentSchema = createInsertSchema(comments).pick({
  articleId: true,
  author: true,
  authorName: true,
  authorAlias: true,
  authorFame: true,
  authorProfileUrl: true,
  content: true,
  userIp: true,
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

export const insertVisitorSchema = createInsertSchema(visitors).pick({
  ipAddress: true,
  userAgent: true,
});

export const insertVideoPostSchema = createInsertSchema(videoPosts).pick({
  title: true,
  videoUrl: true,
  caption: true,
  description: true,
  authorId: true,
  authorIp: true,
  authorName: true,
});

export const insertVideoCommentSchema = createInsertSchema(videoComments).pick({
  videoPostId: true,
  authorId: true,
  authorIp: true,
  authorName: true,
  content: true,
});

export const insertVideoLikeSchema = createInsertSchema(videoLikes).pick({
  videoPostId: true,
  userIp: true,
  type: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  channel: true,
  authorId: true,
  authorIp: true,
  authorName: true,
  content: true,
  messageType: true,
});

export const insertPostSchema = createInsertSchema(posts).pick({
  type: true,
  title: true,
  content: true,
  imageUrl: true,
  authorId: true,
  authorName: true,
  authorIp: true,
  originalPostId: true,
}).extend({
  author: z.string().optional(),
  userIp: z.string().optional(),
});

export const insertPostLikeSchema = createInsertSchema(postLikes).pick({
  postId: true,
  userIp: true,
  userId: true,
  isLike: true,
});

export const insertPostCommentSchema = createInsertSchema(postComments).pick({
  postId: true,
  content: true,
  authorId: true,
  authorName: true,
  authorIp: true,
  authorIq: true,
}).extend({
  author: z.string().optional(),
  userIp: z.string().optional(),
});

export const insertPostDownloadSchema = createInsertSchema(postDownloads).pick({
  postId: true,
  userIp: true,
  userId: true,
});

// Page Post schemas
export const insertPagePostSchema = createInsertSchema(pagePosts).pick({
  authorId: true,
  authorIp: true,
  authorName: true,
  authorAlias: true,
  authorProfileUrl: true,
  type: true,
  title: true,
  content: true,
  mediaUrl: true,
  mediaType: true,
  isVotingEnabled: true,
  votingQuestion: true,
  votingOptions: true,
  hashtags: true,
  isNsfw: true,
});

export const insertPagePostLikeSchema = createInsertSchema(pagePostLikes).pick({
  postId: true,
  userIp: true,
  userId: true,
  isLike: true,
});

export const insertPagePostCommentSchema = createInsertSchema(pagePostComments).pick({
  postId: true,
  authorId: true,
  authorIp: true,
  authorName: true,
  authorAlias: true,
  authorProfileUrl: true,
  authorIq: true,
  content: true,
}).extend({
  userIp: z.string(), // Add userIp for MongoDB compatibility
});

export const insertPagePostVoteSchema = createInsertSchema(pagePostVotes).pick({
  postId: true,
  userIp: true,
  userId: true,
  option: true,
});

export const iqTestSchema = z.object({
  answers: z.array(z.number()).length(10),
  timeSpent: z.number().min(0),
});

export const updateIqScoreSchema = z.object({
  iqScore: z.number().min(0).max(200),
  iqTestTaken: z.boolean(),
  iqTestDate: z.date().optional(),
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
  username: z.string().max(50, "Username too long").optional(),
  aliasName: z.string().max(50, "Alias name too long").optional(),
  description: z.string().max(500, "Description too long").optional(),
  profileImageUrl: z.string().optional(),
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
export type Comment = typeof comments.$inferSelect & {
  authorIq?: number | null;
};
export type InsertArticleLike = z.infer<typeof insertArticleLikeSchema>;
export type ArticleLike = typeof articleLikes.$inferSelect;
export type InsertArticleFavorite = z.infer<typeof insertArticleFavoriteSchema>;
export type ArticleFavorite = typeof articleFavorites.$inferSelect;
export type InsertVisitor = z.infer<typeof insertVisitorSchema>;
export type Visitor = typeof visitors.$inferSelect;
export type InsertVideoPost = z.infer<typeof insertVideoPostSchema>;
export type VideoPost = typeof videoPosts.$inferSelect;
export type InsertVideoComment = z.infer<typeof insertVideoCommentSchema>;
export type VideoComment = typeof videoComments.$inferSelect & {
  authorIq?: number | null;
};
export type InsertVideoLike = z.infer<typeof insertVideoLikeSchema>;
export type VideoLike = typeof videoLikes.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;
export type InsertPostLike = z.infer<typeof insertPostLikeSchema>;
export type PostLike = typeof postLikes.$inferSelect;
export type InsertPostComment = z.infer<typeof insertPostCommentSchema>;
export type PostComment = typeof postComments.$inferSelect & {
  authorIq?: number | null;
};
export type InsertPostDownload = z.infer<typeof insertPostDownloadSchema>;
export type PostDownload = typeof postDownloads.$inferSelect;

// Page Post types
export type InsertPagePost = z.infer<typeof insertPagePostSchema>;
export type PagePost = typeof pagePosts.$inferSelect;
export type InsertPagePostLike = z.infer<typeof insertPagePostLikeSchema>;
export type PagePostLike = typeof pagePostLikes.$inferSelect;
export type InsertPagePostComment = z.infer<typeof insertPagePostCommentSchema>;
export type PagePostComment = typeof pagePostComments.$inferSelect & {
  authorIq?: number | null;
};
export type InsertPagePostVote = z.infer<typeof insertPagePostVoteSchema>;
export type PagePostVote = typeof pagePostVotes.$inferSelect;

export type IqTest = z.infer<typeof iqTestSchema>;
export type UpdateIqScore = z.infer<typeof updateIqScoreSchema>;

// Hashtags table for tracking popular hashtags
export const hashtags = pgTable("hashtags", {
  id: serial("id").primaryKey(),
  tag: text("tag").notNull().unique(),
  usageCount: integer("usage_count").default(1).notNull(),
  isNsfw: boolean("is_nsfw").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Forum Articles table for articles that can be converted to forums
export const forumArticles = pgTable("forum_articles", {
  id: serial("id").primaryKey(),
  articleId: integer("article_id").notNull().references(() => articles.id, { onDelete: "cascade" }),
  hashtag: text("hashtag").notNull().unique(),
  isForum: boolean("is_forum").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// IQ Test Tracking types
export const insertIqTestTrackingSchema = createInsertSchema(iqTestTracking);
export type InsertIqTestTracking = z.infer<typeof insertIqTestTrackingSchema>;
export type IqTestTracking = typeof iqTestTracking.$inferSelect;

// Hashtag types
export const insertHashtagSchema = createInsertSchema(hashtags).pick({
  tag: true,
  usageCount: true,
  isNsfw: true,
});
export type InsertHashtag = z.infer<typeof insertHashtagSchema>;
export type Hashtag = typeof hashtags.$inferSelect;

// Forum Article types
export const insertForumArticleSchema = createInsertSchema(forumArticles).pick({
  articleId: true,
  hashtag: true,
  isForum: true,
});
export type InsertForumArticle = z.infer<typeof insertForumArticleSchema>;
export type ForumArticle = typeof forumArticles.$inferSelect;
