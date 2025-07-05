import { 
  users,
  articles,
  comments, 
  articleLikes,
  articleFavorites,
  type User, 
  type UpsertUser,
  type UpdateProfile,
  type Article,
  type InsertArticle,
  type Comment,
  type InsertComment,
  type ArticleLike,
  type InsertArticleLike,
  type ArticleFavorite,
  type InsertArticleFavorite
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations for OAuth and email authentication
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  createUser(userData: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    provider: string;
    verificationCode: string;
    verificationCodeExpiry: Date;
  }): Promise<User>;
  verifyUser(email: string, code: string): Promise<boolean>;
  updateUserPassword(email: string, newPassword: string): Promise<boolean>;
  updateUserVerification(userId: string, verificationCode: string, expiryDate: Date): Promise<void>;
  updateUserProfile(userId: string, profileData: UpdateProfile): Promise<User>;
  updateUserFame(userId: string, fameIncrement: number): Promise<User>;
  
  // Article methods
  createArticle(article: InsertArticle): Promise<Article>;
  getArticle(id: number): Promise<Article | undefined>;
  getArticlesByCategory(category: string): Promise<Article[]>;
  getAllArticles(): Promise<Article[]>;
  updateArticleStats(id: number, likes: number, dislikes: number): Promise<void>;
  
  // Comment methods
  createComment(comment: InsertComment): Promise<Comment>;
  getCommentsByArticle(articleId: number): Promise<Comment[]>;
  
  // Like/Dislike methods
  createOrUpdateLike(like: InsertArticleLike): Promise<ArticleLike>;
  getUserLike(articleId: number, userIp: string): Promise<ArticleLike | undefined>;
  getArticleLikeCounts(articleId: number): Promise<{ likes: number; dislikes: number }>;
  removeLike(articleId: number, userIp: string): Promise<void>;
  
  // Favorite methods
  createOrRemoveFavorite(favorite: InsertArticleFavorite): Promise<ArticleFavorite | null>;
  getUserFavorite(articleId: number, userIp: string): Promise<ArticleFavorite | undefined>;
  getUserFavorites(userIp: string): Promise<ArticleFavorite[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations for OAuth authentication
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async createUser(userData: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    provider: string;
    verificationCode: string;
    verificationCodeExpiry: Date;
  }): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return user;
  }

  async verifyUser(email: string, code: string): Promise<boolean> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    
    if (!user || !user.verificationCode || !user.verificationCodeExpiry) {
      return false;
    }

    if (user.verificationCode !== code || new Date() > user.verificationCodeExpiry) {
      return false;
    }

    await db
      .update(users)
      .set({
        isVerified: true,
        verificationCode: null,
        verificationCodeExpiry: null,
        updatedAt: new Date(),
      })
      .where(eq(users.email, email));

    return true;
  }

  async updateUserPassword(email: string, newPassword: string): Promise<boolean> {
    const result = await db
      .update(users)
      .set({
        password: newPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.email, email));

    return (result.rowCount || 0) > 0;
  }

  async updateUserVerification(userId: string, verificationCode: string, expiryDate: Date): Promise<void> {
    await db
      .update(users)
      .set({ 
        verificationCode: verificationCode,
        verificationCodeExpiry: expiryDate,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  async updateUserProfile(userId: string, profileData: UpdateProfile): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({
        ...profileData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  async updateUserFame(userId: string, fameIncrement: number): Promise<User> {
    // First get the current user
    const [currentUser] = await db.select().from(users).where(eq(users.id, userId));
    if (!currentUser) {
      throw new Error("User not found");
    }
    
    const [updatedUser] = await db
      .update(users)
      .set({
        fame: (currentUser.fame || 0) + fameIncrement,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  // Article methods
  async createArticle(insertArticle: InsertArticle): Promise<Article> {
    const [article] = await db
      .insert(articles)
      .values(insertArticle)
      .returning();
    return article;
  }

  async getArticle(id: number): Promise<Article | undefined> {
    const [article] = await db
      .select()
      .from(articles)
      .where(eq(articles.id, id));
    return article;
  }

  async getArticlesByCategory(category: string): Promise<Article[]> {
    // Get all articles and filter them in JavaScript for now
    const allArticles = await db.select().from(articles);
    const result = allArticles.filter(article => 
      article.categories && article.categories.includes(category)
    );
    return result;
  }

  async getAllArticles(): Promise<Article[]> {
    const result = await db.select().from(articles);
    return result;
  }

  async updateArticleStats(id: number, likes: number, dislikes: number): Promise<void> {
    await db
      .update(articles)
      .set({ likes, dislikes })
      .where(eq(articles.id, id));
  }

  // Comment methods
  async createComment(insertComment: InsertComment): Promise<Comment> {
    const [comment] = await db
      .insert(comments)
      .values(insertComment)
      .returning();
    return comment;
  }

  async getCommentsByArticle(articleId: number): Promise<Comment[]> {
    const result = await db
      .select()
      .from(comments)
      .where(eq(comments.articleId, articleId));
    return result;
  }

  // Like/Dislike methods
  async createOrUpdateLike(insertLike: InsertArticleLike): Promise<ArticleLike> {
    const [like] = await db
      .insert(articleLikes)
      .values(insertLike)
      .onConflictDoUpdate({
        target: [articleLikes.articleId, articleLikes.userIp],
        set: { 
          isLike: insertLike.isLike
        }
      })
      .returning();
    return like;
  }

  async getUserLike(articleId: number, userIp: string): Promise<ArticleLike | undefined> {
    const [like] = await db
      .select()
      .from(articleLikes)
      .where(and(eq(articleLikes.articleId, articleId), eq(articleLikes.userIp, userIp)));
    return like;
  }

  async getArticleLikeCounts(articleId: number): Promise<{ likes: number; dislikes: number }> {
    const likes = await db
      .select()
      .from(articleLikes)
      .where(and(eq(articleLikes.articleId, articleId), eq(articleLikes.isLike, true)));
    
    const dislikes = await db
      .select()
      .from(articleLikes)
      .where(and(eq(articleLikes.articleId, articleId), eq(articleLikes.isLike, false)));
    
    return { likes: likes.length, dislikes: dislikes.length };
  }

  async removeLike(articleId: number, userIp: string): Promise<void> {
    await db
      .delete(articleLikes)
      .where(and(eq(articleLikes.articleId, articleId), eq(articleLikes.userIp, userIp)));
  }

  // Favorite methods
  async createOrRemoveFavorite(insertFavorite: InsertArticleFavorite): Promise<ArticleFavorite | null> {
    const existing = await this.getUserFavorite(insertFavorite.articleId, insertFavorite.userIp);
    
    if (existing) {
      await db
        .delete(articleFavorites)
        .where(and(eq(articleFavorites.articleId, insertFavorite.articleId), eq(articleFavorites.userIp, insertFavorite.userIp)));
      return null;
    }
    
    const [favorite] = await db
      .insert(articleFavorites)
      .values(insertFavorite)
      .returning();
    return favorite;
  }

  async getUserFavorite(articleId: number, userIp: string): Promise<ArticleFavorite | undefined> {
    const [favorite] = await db
      .select()
      .from(articleFavorites)
      .where(and(eq(articleFavorites.articleId, articleId), eq(articleFavorites.userIp, userIp)));
    return favorite;
  }

  async getUserFavorites(userIp: string): Promise<ArticleFavorite[]> {
    const result = await db
      .select()
      .from(articleFavorites)
      .where(eq(articleFavorites.userIp, userIp));
    return result;
  }
}

export const storage = new DatabaseStorage();