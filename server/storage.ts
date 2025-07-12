import { 
  users,
  articles,
  comments, 
  articleLikes,
  articleFavorites,
  visitors,
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
  type InsertArticleFavorite,
  type Visitor,
  type InsertVisitor,
  posts,
  postLikes,
  postComments,
  postDownloads,
  type Post,
  type InsertPost,
  type PostLike,
  type InsertPostLike,
  type PostComment,
  type InsertPostComment,
  type PostDownload,
  type InsertPostDownload,
  // Page feature imports
  pagePosts,
  pagePostLikes,
  pagePostComments,
  pagePostVotes,
  type PagePost,
  type InsertPagePost,
  type PagePostLike,
  type InsertPagePostLike,
  type PagePostComment,
  type InsertPagePostComment,
  type PagePostVote,
  type InsertPagePostVote,
  // IQ Test Tracking imports
  iqTestTracking,
  type IqTestTracking,
  type InsertIqTestTracking,
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
  updateUserHonour(userId: string, honourIncrement: number): Promise<User>;
  updateUserMembership(userId: string, membershipType: 'free' | 'topaz' | 'agate' | 'aqua'): Promise<User>;
  updateUserTheme(userId: string, theme: string): Promise<User>;
  
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
  
  // Visitor tracking methods
  trackVisitor(visitorData: InsertVisitor): Promise<Visitor>;
  getTotalVisitors(): Promise<number>;
  
  // Category counting methods
  getCategoryCounts(): Promise<Record<string, number>>;
  
  // IQ Test methods
  updateUserIqScore(userId: string, iqScore: number): Promise<User>;
  updateVisitorIqScore(ipAddress: string, iqScore: number): Promise<Visitor>;
  getUserIqStatus(userId: string): Promise<{ iqScore: number | null; iqTestTaken: boolean }>;
  getVisitorIqStatus(ipAddress: string): Promise<{ iqScore: number | null; iqTestTaken: boolean }>;
  
  // Post methods
  createPost(post: InsertPost): Promise<Post>;
  getPost(id: number): Promise<Post | undefined>;
  getAllPosts(): Promise<Post[]>;
  deletePost(id: number): Promise<void>;
  updatePostStats(id: number, likes: number, dislikes: number, comments: number, downloads: number, reposts: number): Promise<void>;
  
  // Post Like/Dislike methods
  createOrUpdatePostLike(like: InsertPostLike): Promise<PostLike>;
  getUserPostLike(postId: number, userIp: string): Promise<PostLike | undefined>;
  getPostLikeCounts(postId: number): Promise<{ likes: number; dislikes: number }>;
  removePostLike(postId: number, userIp: string): Promise<void>;
  
  // Post Comment methods
  createPostComment(comment: InsertPostComment): Promise<PostComment>;
  getCommentsByPost(postId: number): Promise<PostComment[]>;
  
  // Post Download methods
  trackPostDownload(download: InsertPostDownload): Promise<PostDownload>;
  getPostDownloadCount(postId: number): Promise<number>;
  
  // Page Post methods
  createPagePost(post: InsertPagePost): Promise<PagePost>;
  getPagePost(id: number): Promise<PagePost | undefined>;
  getAllPagePosts(): Promise<PagePost[]>;
  deletePagePost(id: number): Promise<void>;
  updatePagePostStats(id: number, likes: number, dislikes: number, comments: number): Promise<void>;
  
  // Page Post Like/Dislike methods
  createOrUpdatePagePostLike(like: InsertPagePostLike): Promise<PagePostLike>;
  getUserPagePostLike(postId: number, userIp: string): Promise<PagePostLike | undefined>;
  getPagePostLikeCounts(postId: number): Promise<{ likes: number; dislikes: number }>;
  removePagePostLike(postId: number, userIp: string): Promise<void>;
  
  // Page Post Comment methods
  createPagePostComment(comment: InsertPagePostComment): Promise<PagePostComment>;
  getCommentsByPagePost(postId: number): Promise<PagePostComment[]>;
  
  // Page Post Vote methods
  createPagePostVote(vote: InsertPagePostVote): Promise<PagePostVote>;
  getUserPagePostVote(postId: number, userIp: string): Promise<PagePostVote | undefined>;
  getPagePostVoteCounts(postId: number): Promise<Record<string, number>>;
  removePagePostVote(postId: number, userIp: string): Promise<void>;
  
  // User honour and verification methods
  checkAndUpdateUserVerification(userId: string): Promise<User>;
  
  // Anonymous user management methods
  getNextAnonymousNumber(): Promise<number>;
  updateVisitorAnonymousNumber(ipAddress: string, anonymousNumber: number): Promise<void>;
  
  // IQ Test Tracking methods for persistent button visibility
  getIqTestStatus(identifier: string, identifierType: 'ip' | 'user'): Promise<IqTestTracking | undefined>;
  markIqTestCompleted(identifier: string, identifierType: 'ip' | 'user', iqScore: number): Promise<IqTestTracking>;
  checkIqTestButtonVisibility(identifier: string, identifierType: 'ip' | 'user'): Promise<boolean>;
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

  async updateUserHonour(userId: string, honourIncrement: number): Promise<User> {
    // First get the current user
    const [currentUser] = await db.select().from(users).where(eq(users.id, userId));
    if (!currentUser) {
      throw new Error("User not found");
    }
    
    const [updatedUser] = await db
      .update(users)
      .set({
        fame: (currentUser.fame || 0) + honourIncrement,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  async updateUserMembership(userId: string, membershipType: 'free' | 'topaz' | 'agate' | 'aqua'): Promise<User> {
    // This is a stub implementation for DatabaseStorage (PostgreSQL version)
    // Since we're using MongoDB, this method will not be called in production
    throw new Error("This method is not implemented for PostgreSQL. Use MongoStorage instead.");
  }

  async updateUserTheme(userId: string, theme: string): Promise<User> {
    // This is a stub implementation for DatabaseStorage (PostgreSQL version)
    // Since we're using MongoDB, this method will not be called in production
    throw new Error("This method is not implemented for PostgreSQL. Use MongoStorage instead.");
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
  
  // Visitor tracking methods
  async trackVisitor(visitorData: InsertVisitor): Promise<Visitor> {
    try {
      // Try to insert new visitor first
      const [visitor] = await db
        .insert(visitors)
        .values(visitorData)
        .returning();
      return visitor;
    } catch (error: any) {
      // If duplicate IP, update existing visitor
      if (error.code === '23505') {
        const [visitor] = await db
          .update(visitors)
          .set({
            lastVisit: sql`now()`,
            visitCount: sql`${visitors.visitCount} + 1`,
            userAgent: visitorData.userAgent
          })
          .where(eq(visitors.ipAddress, visitorData.ipAddress))
          .returning();
        return visitor;
      }
      throw error;
    }
  }
  
  async getTotalVisitors(): Promise<number> {
    const [result] = await db
      .select({ count: sql`COUNT(DISTINCT ${visitors.ipAddress})` })
      .from(visitors);
    return parseInt(result.count as string) || 0;
  }

  async getCategoryCounts(): Promise<Record<string, number>> {
    try {
      const allArticles = await db.select().from(articles);
      const categoryCounts: Record<string, number> = {};

      // Initialize all category counts to 0
      const categoryList = ['world', 'history', 'science', 'geography', 'sports', 'entertainment', 
                          'politics', 'technology', 'health', 'education', 'astronomy'];
      
      categoryList.forEach(cat => {
        categoryCounts[cat] = 0;
      });

      // Count articles for each category
      allArticles.forEach(article => {
        if (article.categories && Array.isArray(article.categories)) {
          article.categories.forEach((category: string) => {
            if (categoryCounts.hasOwnProperty(category)) {
              categoryCounts[category]++;
            }
          });
        }
      });

      return categoryCounts;
    } catch (error) {
      console.error('Error getting category counts:', error);
      return {};
    }
  }

  async updateUserIqScore(userId: string, iqScore: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        iqScore: iqScore,
        iqTestTaken: true,
        iqTestDate: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateVisitorIqScore(ipAddress: string, iqScore: number): Promise<Visitor> {
    const [visitor] = await db
      .update(visitors)
      .set({
        iqScore: iqScore,
        iqTestTaken: true,
        iqTestDate: new Date(),
      })
      .where(eq(visitors.ipAddress, ipAddress))
      .returning();
    return visitor;
  }

  async getUserIqStatus(userId: string): Promise<{ iqScore: number | null; iqTestTaken: boolean }> {
    const [user] = await db
      .select({
        iqScore: users.iqScore,
        iqTestTaken: users.iqTestTaken,
      })
      .from(users)
      .where(eq(users.id, userId));
    
    return user ? { iqScore: user.iqScore, iqTestTaken: Boolean(user.iqTestTaken) } : { iqScore: null, iqTestTaken: false };
  }

  async getVisitorIqStatus(ipAddress: string): Promise<{ iqScore: number | null; iqTestTaken: boolean }> {
    const [visitor] = await db
      .select({
        iqScore: visitors.iqScore,
        iqTestTaken: visitors.iqTestTaken,
      })
      .from(visitors)
      .where(eq(visitors.ipAddress, ipAddress));
    
    return visitor ? { iqScore: visitor.iqScore, iqTestTaken: Boolean(visitor.iqTestTaken) } : { iqScore: null, iqTestTaken: false };
  }

  // Post methods implementation
  async createPost(insertPost: InsertPost): Promise<Post> {
    const [post] = await db
      .insert(posts)
      .values(insertPost)
      .returning();
    return post;
  }

  async getPost(id: number): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post || undefined;
  }

  async getAllPosts(): Promise<Post[]> {
    return await db.select().from(posts).orderBy(sql`${posts.createdAt} DESC`);
  }

  async deletePost(id: number): Promise<void> {
    await db.delete(posts).where(eq(posts.id, id));
  }

  async updatePostStats(id: number, likes: number, dislikes: number, comments: number, downloads: number, reposts: number): Promise<void> {
    await db
      .update(posts)
      .set({ likes, dislikes, comments, downloads, reposts })
      .where(eq(posts.id, id));
  }

  // Post Like/Dislike methods
  async createOrUpdatePostLike(insertLike: InsertPostLike): Promise<PostLike> {
    const existingLike = await this.getUserPostLike(insertLike.postId, insertLike.userIp);
    
    if (existingLike) {
      if (existingLike.type === insertLike.type) {
        // Same type clicked again, remove the like
        await this.removePostLike(insertLike.postId, insertLike.userIp);
        return existingLike;
      } else {
        // Different type, update existing
        const [updatedLike] = await db
          .update(postLikes)
          .set({ type: insertLike.type })
          .where(and(eq(postLikes.postId, insertLike.postId), eq(postLikes.userIp, insertLike.userIp)))
          .returning();
        return updatedLike;
      }
    } else {
      // Create new like
      const [newLike] = await db
        .insert(postLikes)
        .values(insertLike)
        .returning();
      return newLike;
    }
  }

  async getUserPostLike(postId: number, userIp: string): Promise<PostLike | undefined> {
    const [like] = await db
      .select()
      .from(postLikes)
      .where(and(eq(postLikes.postId, postId), eq(postLikes.userIp, userIp)));
    return like || undefined;
  }

  async getPostLikeCounts(postId: number): Promise<{ likes: number; dislikes: number }> {
    const likesResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(postLikes)
      .where(and(eq(postLikes.postId, postId), eq(postLikes.type, "like")));

    const dislikesResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(postLikes)
      .where(and(eq(postLikes.postId, postId), eq(postLikes.type, "dislike")));

    return {
      likes: likesResult[0]?.count || 0,
      dislikes: dislikesResult[0]?.count || 0,
    };
  }

  async removePostLike(postId: number, userIp: string): Promise<void> {
    await db
      .delete(postLikes)
      .where(and(eq(postLikes.postId, postId), eq(postLikes.userIp, userIp)));
  }

  // Post Comment methods
  async createPostComment(insertComment: InsertPostComment): Promise<PostComment> {
    const [comment] = await db
      .insert(postComments)
      .values(insertComment)
      .returning();
    return comment;
  }

  async getCommentsByPost(postId: number): Promise<PostComment[]> {
    return await db
      .select()
      .from(postComments)
      .where(eq(postComments.postId, postId))
      .orderBy(sql`${postComments.createdAt} ASC`);
  }

  // Post Download methods
  async trackPostDownload(insertDownload: InsertPostDownload): Promise<PostDownload> {
    const [download] = await db
      .insert(postDownloads)
      .values(insertDownload)
      .returning();
    return download;
  }

  async getPostDownloadCount(postId: number): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(postDownloads)
      .where(eq(postDownloads.postId, postId));
    
    return result[0]?.count || 0;
  }

  // Page Post methods
  async createPagePost(insertPost: InsertPagePost): Promise<PagePost> {
    const [post] = await db
      .insert(pagePosts)
      .values(insertPost)
      .returning();
    return post;
  }

  async getPagePost(id: number): Promise<PagePost | undefined> {
    const [post] = await db.select().from(pagePosts).where(eq(pagePosts.id, id));
    return post;
  }

  async getAllPagePosts(): Promise<PagePost[]> {
    const posts = await db.select().from(pagePosts).orderBy(sql`${pagePosts.createdAt} DESC`);
    return posts;
  }

  async deletePagePost(id: number): Promise<void> {
    // First get the post to check if it has an authorId and how many likes it has
    const post = await db.select().from(pagePosts).where(eq(pagePosts.id, id)).limit(1);
    
    if (post.length > 0 && post[0].authorId) {
      // Calculate honor points to remove: 0.2 per like
      const honorToRemove = post[0].likes * 0.2;
      
      if (honorToRemove > 0) {
        // Remove honor points from the user
        await db.update(users)
          .set({ 
            fame: sql`${users.fame} - ${honorToRemove}`,
            updatedAt: new Date()
          })
          .where(eq(users.id, post[0].authorId));
      }
    }
    
    // Delete the post
    await db.delete(pagePosts).where(eq(pagePosts.id, id));
  }

  async updatePagePostStats(id: number, likes: number, dislikes: number, comments: number): Promise<void> {
    await db
      .update(pagePosts)
      .set({ likes, dislikes, comments, updatedAt: new Date() })
      .where(eq(pagePosts.id, id));
  }

  // Page Post Like/Dislike methods
  async createOrUpdatePagePostLike(insertLike: InsertPagePostLike): Promise<PagePostLike> {
    const [like] = await db
      .insert(pagePostLikes)
      .values(insertLike)
      .onConflictDoUpdate({
        target: [pagePostLikes.postId, pagePostLikes.userIp],
        set: {
          isLike: insertLike.isLike,
          createdAt: new Date(),
        },
      })
      .returning();
    return like;
  }

  async getUserPagePostLike(postId: number, userIp: string): Promise<PagePostLike | undefined> {
    const [like] = await db
      .select()
      .from(pagePostLikes)
      .where(and(eq(pagePostLikes.postId, postId), eq(pagePostLikes.userIp, userIp)));
    return like;
  }

  async getPagePostLikeCounts(postId: number): Promise<{ likes: number; dislikes: number }> {
    const likesResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(pagePostLikes)
      .where(and(eq(pagePostLikes.postId, postId), eq(pagePostLikes.isLike, true)));

    const dislikesResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(pagePostLikes)
      .where(and(eq(pagePostLikes.postId, postId), eq(pagePostLikes.isLike, false)));

    return {
      likes: likesResult[0]?.count || 0,
      dislikes: dislikesResult[0]?.count || 0,
    };
  }

  async removePagePostLike(postId: number, userIp: string): Promise<void> {
    await db
      .delete(pagePostLikes)
      .where(and(eq(pagePostLikes.postId, postId), eq(pagePostLikes.userIp, userIp)));
  }

  // Page Post Comment methods
  async createPagePostComment(insertComment: InsertPagePostComment): Promise<PagePostComment> {
    const [comment] = await db
      .insert(pagePostComments)
      .values(insertComment)
      .returning();
    return comment;
  }

  async getCommentsByPagePost(postId: number): Promise<PagePostComment[]> {
    const comments = await db
      .select()
      .from(pagePostComments)
      .where(eq(pagePostComments.postId, postId))
      .orderBy(sql`${pagePostComments.createdAt} ASC`);
    return comments;
  }

  // Page Post Vote methods
  async createPagePostVote(insertVote: InsertPagePostVote): Promise<PagePostVote> {
    const [vote] = await db
      .insert(pagePostVotes)
      .values(insertVote)
      .onConflictDoUpdate({
        target: [pagePostVotes.postId, pagePostVotes.userIp],
        set: {
          option: insertVote.option,
          createdAt: new Date(),
        },
      })
      .returning();
    return vote;
  }

  async getUserPagePostVote(postId: number, userIp: string): Promise<PagePostVote | undefined> {
    const [vote] = await db
      .select()
      .from(pagePostVotes)
      .where(and(eq(pagePostVotes.postId, postId), eq(pagePostVotes.userIp, userIp)));
    return vote;
  }

  async getPagePostVoteCounts(postId: number): Promise<Record<string, number>> {
    const votes = await db
      .select()
      .from(pagePostVotes)
      .where(eq(pagePostVotes.postId, postId));

    const counts: Record<string, number> = {};
    votes.forEach(vote => {
      counts[vote.option] = (counts[vote.option] || 0) + 1;
    });

    return counts;
  }

  async removePagePostVote(postId: number, userIp: string): Promise<void> {
    await db
      .delete(pagePostVotes)
      .where(and(eq(pagePostVotes.postId, postId), eq(pagePostVotes.userIp, userIp)));
  }

  // User honour and verification methods
  async checkAndUpdateUserVerification(userId: string): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Check if user should have blue checkmark (500+ honour)
    const shouldBeVerified = (user.fame || 0) >= 500;
    
    if (user.isVerifiedCheckmark !== shouldBeVerified) {
      const [updatedUser] = await db
        .update(users)
        .set({
          isVerifiedCheckmark: shouldBeVerified,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning();
      return updatedUser;
    }

    return user;
  }

  async getNextAnonymousNumber(): Promise<number> {
    const result = await db.select({ maxNumber: sql<number>`max(${visitors.anonymousNumber})` })
      .from(visitors)
      .where(sql`${visitors.anonymousNumber} IS NOT NULL`);
    
    const maxNumber = result[0]?.maxNumber || 0;
    return maxNumber + 1;
  }

  async updateVisitorAnonymousNumber(ipAddress: string, anonymousNumber: number): Promise<void> {
    await db.update(visitors)
      .set({ anonymousNumber })
      .where(eq(visitors.ipAddress, ipAddress));
  }

  // IQ Test Tracking methods for persistent button visibility
  async getIqTestStatus(identifier: string, identifierType: 'ip' | 'user'): Promise<IqTestTracking | undefined> {
    const [result] = await db.select()
      .from(iqTestTracking)
      .where(and(
        eq(iqTestTracking.identifier, identifier),
        eq(iqTestTracking.identifierType, identifierType)
      ));
    return result;
  }

  async markIqTestCompleted(identifier: string, identifierType: 'ip' | 'user', iqScore: number): Promise<IqTestTracking> {
    const existingRecord = await this.getIqTestStatus(identifier, identifierType);
    
    if (existingRecord) {
      // Update existing record
      const [updated] = await db.update(iqTestTracking)
        .set({ 
          iqTestCompleted: true, 
          iqScore, 
          testDate: new Date(),
          updatedAt: new Date()
        })
        .where(eq(iqTestTracking.id, existingRecord.id))
        .returning();
      return updated;
    } else {
      // Create new record
      const [created] = await db.insert(iqTestTracking)
        .values({
          identifier,
          identifierType,
          iqTestCompleted: true,
          iqScore,
          testDate: new Date()
        })
        .returning();
      return created;
    }
  }

  async checkIqTestButtonVisibility(identifier: string, identifierType: 'ip' | 'user'): Promise<boolean> {
    const status = await this.getIqTestStatus(identifier, identifierType);
    // Return true if button should be visible (test not completed)
    return !status || !status.iqTestCompleted;
  }
}

export const storage = new DatabaseStorage();