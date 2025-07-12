import { IStorage } from './storage';
import { 
  UserModel, ArticleModel, VisitorModel, CommentModel, 
  ArticleLikeModel, ArticleFavoriteModel, PostModel, PagePostModel,
  PagePostLikeModel as PagePostLikeModelSchema, PagePostCommentModel as PagePostCommentModelSchema, PagePostVoteModel as PagePostVoteModelSchema,
  IqTestTrackingModel, GuildModel, GuildMemberModel, GuildPostModel,
  GuildPostLikeModel, GuildPostCommentModel, GuildJoinRequestModel,
  getNextSequence,
  User, Article, Visitor, Comment, ArticleLike, ArticleFavorite,
  Post, PagePost, PagePostLike as PagePostLikeSchema, PagePostComment as PagePostCommentSchema, PagePostVote as PagePostVoteSchema,
  IqTestTracking, Guild, GuildMember, GuildPost, GuildPostLike,
  GuildPostComment, GuildJoinRequest, InsertUser, InsertArticle, 
  UpsertUser, UpdateProfile
} from '../shared/mongodb-schema';
import { connectToMongoDB } from './mongodb';

// Additional types needed for compatibility
interface InsertComment {
  articleId: number;
  author: string;
  content: string;
  userIp: string;
}

interface InsertArticleLike {
  articleId: number;
  userIp: string;
  isLike: boolean;
}

interface InsertArticleFavorite {
  articleId: number;
  userIp: string;
}

interface InsertVisitor {
  ipAddress: string;
  userAgent?: string;
  iqScore?: number;
  iqTestTaken?: boolean;
  anonymousNumber?: number;
}

interface InsertPost {
  title: string;
  content: string;
  type: 'photo' | 'video' | 'discussion';
  mediaUrl?: string;
  author: string;
  userIp: string;
  isNsfw?: boolean;
}

interface InsertPostLike {
  postId: number;
  userIp: string;
  isLike: boolean;
}

interface InsertPostComment {
  postId: number;
  author: string;
  content: string;
  userIp: string;
}

interface InsertPostDownload {
  postId: number;
  userIp: string;
}

interface InsertPagePost {
  title?: string;
  content: string;
  type: 'photo' | 'video' | 'discussion';
  mediaUrl?: string;
  mediaType?: string;
  authorId?: string;
  authorName: string;
  authorAlias?: string;
  authorProfileUrl?: string;
  authorIp: string;
  hashtags?: string[];
  isVotingEnabled?: boolean;
  votingOptions?: string[];
  isNsfw?: boolean;
}

interface InsertPagePostLike {
  postId: number;
  userIp: string;
  isLike: boolean;
}

interface InsertPagePostComment {
  postId: number;
  authorId?: string | null;
  authorIp: string;
  authorName?: string;
  authorAlias?: string | null;
  authorProfileUrl?: string | null;
  authorIq?: number | null;
  content: string;
  author?: string; // For backward compatibility
}

interface InsertPagePostVote {
  postId: number;
  userIp: string;
  userId?: string;
  userEmail?: string;
  option: string;
}

interface InsertGuild {
  name: string;
  description: string;
  insignia: string;
  logo: string;
  logoBackgroundColor: string;
  isPrivate: boolean;
  ownerId: string;
  ownerName: string;
}

interface InsertGuildMember {
  guildId: number;
  userId: string;
  username: string;
  role?: 'owner' | 'admin' | 'member';
}

interface InsertGuildPost {
  guildId: number;
  guildName: string;
  guildInsignia: string;
  title?: string;
  content: string;
  type: 'photo' | 'video' | 'discussion';
  mediaUrl?: string;
  mediaType?: string;
  authorId: string;
  authorName: string;
  authorAlias?: string;
  authorProfileUrl?: string;
  authorIp: string;
  hashtags?: string[];
}

interface InsertGuildJoinRequest {
  guildId: number;
  userId: string;
  username: string;
  message?: string;
}

interface PostLike {
  id: number;
  postId: number;
  userIp: string;
  isLike: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface PostComment {
  id: number;
  postId: number;
  author: string;
  content: string;
  userIp: string;
  createdAt: Date;
}

interface PostDownload {
  id: number;
  postId: number;
  userIp: string;
  createdAt: Date;
}

interface PagePostLike {
  id: number;
  postId: number;
  userIp: string;
  isLike: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface PagePostComment {
  id: number;
  postId: number;
  author: string;
  content: string;
  userIp: string;
  createdAt: Date;
}

interface PagePostVote {
  id: number;
  postId: number;
  userIp: string;
  option: string;
  createdAt: Date;
}

export class MongoStorage implements IStorage {
  constructor() {
    // Ensure MongoDB connection is established
    connectToMongoDB().catch(console.error);
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    await connectToMongoDB();
    const user = await UserModel.findOne({ id }).exec();
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    await connectToMongoDB();
    const user = await UserModel.findOne({ email }).exec();
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    await connectToMongoDB();
    const user = await UserModel.findOneAndUpdate(
      { id: userData.id },
      { ...userData, updatedAt: new Date() },
      { upsert: true, new: true }
    ).exec();
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
    await connectToMongoDB();
    const user = new UserModel(userData);
    await user.save();
    return user;
  }

  async verifyUser(email: string, code: string): Promise<boolean> {
    await connectToMongoDB();
    const user = await UserModel.findOne({ 
      email, 
      verificationCode: code,
      verificationCodeExpiry: { $gt: new Date() }
    }).exec();

    if (user) {
      user.isVerified = true;
      user.verificationCode = undefined;
      user.verificationCodeExpiry = undefined;
      await user.save();
      return true;
    }
    return false;
  }

  async updateUserPassword(userId: string, newPassword: string): Promise<boolean> {
    await connectToMongoDB();
    const result = await UserModel.updateOne(
      { id: userId },
      { password: newPassword, updatedAt: new Date() }
    ).exec();
    return result.modifiedCount > 0;
  }

  async updateUserResetToken(userId: string, resetToken: string, resetTokenExpiry: Date): Promise<void> {
    await connectToMongoDB();
    await UserModel.updateOne(
      { id: userId },
      { resetToken, resetTokenExpiry, updatedAt: new Date() }
    ).exec();
  }

  async getUserByResetToken(resetToken: string): Promise<User | undefined> {
    await connectToMongoDB();
    const user = await UserModel.findOne({ resetToken }).exec();
    return user || undefined;
  }

  async clearUserResetToken(userId: string): Promise<void> {
    await connectToMongoDB();
    await UserModel.updateOne(
      { id: userId },
      { $unset: { resetToken: "", resetTokenExpiry: "" }, updatedAt: new Date() }
    ).exec();
  }

  async updateUserVerification(userId: string, verificationCode: string, expiryDate: Date): Promise<void> {
    await connectToMongoDB();
    await UserModel.updateOne(
      { id: userId },
      { verificationCode, verificationCodeExpiry: expiryDate, updatedAt: new Date() }
    ).exec();
  }

  async updateUserProfile(userId: string, profileData: UpdateProfile): Promise<User> {
    await connectToMongoDB();
    console.log("Updating user profile for ID:", userId);
    console.log("Profile data:", profileData);

    const user = await UserModel.findOneAndUpdate(
      { id: userId },
      { 
        $set: {
          ...profileData, 
          updatedAt: new Date() 
        }
      },
      { new: true, upsert: false }
    ).exec();

    if (!user) {
      console.log("User not found for ID:", userId);
      throw new Error("User not found");
    }

    console.log("User updated successfully:", user);
    return user;
  }

  async updateUserHonour(userId: string, honourIncrement: number): Promise<User> {
    await connectToMongoDB();
    const user = await UserModel.findOne({ id: userId }).exec();
    if (!user) throw new Error("User not found");

    user.fame = (user.fame || 0) + honourIncrement;
    user.updatedAt = new Date();
    await user.save();
    return user;
  }

  async updateUserMembership(userId: string, membershipType: 'free' | 'topaz' | 'agate' | 'aqua'): Promise<User> {
    await connectToMongoDB();
    const user = await UserModel.findOne({ id: userId }).exec();
    if (!user) throw new Error("User not found");

    // Reset all membership flags
    user.isFree = false;
    user.isTopaz = false;
    user.isAgate = false;
    user.isAqua = false;

    // Set the appropriate flag based on membership type
    switch (membershipType) {
      case 'topaz':
        user.isTopaz = true;
        break;
      case 'agate':
        user.isAgate = true;
        break;
      case 'aqua':
        user.isAqua = true;
        break;
      default:
        user.isFree = true;
    }

    user.updatedAt = new Date();
    await user.save();
    return user;
  }

  async updateUserTheme(userId: string, theme: string): Promise<User> {
    await connectToMongoDB();
    console.log("Updating theme for user ID:", userId, "to theme:", theme);

    // Validate theme is one of the allowed values
    const allowedThemes = ['dark', 'light', 'auto', 'topaz', 'agate', 'aqua'];
    if (!allowedThemes.includes(theme)) {
      throw new Error(`Invalid theme: ${theme}. Must be one of: ${allowedThemes.join(', ')}`);
    }

    const user = await UserModel.findOne({ id: userId }).exec();
    console.log("Found user:", user ? "Yes" : "No");
    if (!user) throw new Error("User not found");

    user.selectedTheme = theme;
    user.updatedAt = new Date();
    await user.save();
    console.log("Theme updated successfully to:", user.selectedTheme);
    return user;
  }

  async updateUserCurrentGuild(userId: string, guildId: number | null, guildName: string | null): Promise<User> {
    await connectToMongoDB();
    const user = await UserModel.findOne({ id: userId }).exec();
    if (!user) throw new Error("User not found");

    user.currentGuildId = guildId || undefined;
    user.currentGuildName = guildName || undefined;
    user.updatedAt = new Date();
    await user.save();
    return user;
  }

  async getUserCurrentGuild(userId: string): Promise<{ guildId: number | null; guildName: string | null }> {
    await connectToMongoDB();
    const user = await UserModel.findOne({ id: userId }).exec();
    if (!user) throw new Error("User not found");

    return {
      guildId: user.currentGuildId || null,
      guildName: user.currentGuildName || null
    };
  }

  // Article methods
  async createArticle(insertArticle: InsertArticle): Promise<Article> {
    await connectToMongoDB();
    const id = await getNextSequence('article');
    const article = new ArticleModel({ ...insertArticle, id });
    await article.save();
    return article;
  }

  async getArticle(id: number): Promise<Article | undefined> {
    await connectToMongoDB();
    const article = await ArticleModel.findOne({ id }).exec();
    return article || undefined;
  }

  async getArticlesByCategory(category: string): Promise<Article[]> {
    await connectToMongoDB();
    console.log("Searching for articles in category:", category);

    // Search for articles where the category is included in the categories array
    const articles = await ArticleModel.find({ 
      categories: { $in: [category] } 
    }).sort({ createdAt: -1 }).exec();

    console.log(`Found ${articles.length} articles in category "${category}"`);
    return articles;
  }

  async getAllArticles(): Promise<Article[]> {
    await connectToMongoDB();
    const articles = await ArticleModel.find().sort({ createdAt: -1 }).lean().exec();
    return articles;
  }

  async updateArticleStats(id: number, likes: number, dislikes: number): Promise<void> {
    await connectToMongoDB();
    await ArticleModel.updateOne(
      { id },
      { likes, dislikes, updatedAt: new Date() }
    ).exec();
  }

  // Comment methods
  async createComment(insertComment: InsertComment): Promise<Comment> {
    await connectToMongoDB();
    const id = await getNextSequence('comment');
    const comment = new CommentModel({ ...insertComment, id });
    await comment.save();
    return comment;
  }

  async getCommentsByArticle(articleId: number): Promise<Comment[]> {
    await connectToMongoDB();
    const comments = await CommentModel.find({ articleId }).sort({ createdAt: -1 }).exec();
    return comments;
  }

  // Like/Dislike methods
  async createOrUpdateLike(insertLike: InsertArticleLike): Promise<ArticleLike> {
    await connectToMongoDB();
    const existingLike = await ArticleLikeModel.findOne({
      articleId: insertLike.articleId,
      userIp: insertLike.userIp
    }).exec();

    if (existingLike) {
      existingLike.isLike = insertLike.isLike;
      existingLike.updatedAt = new Date();
      await existingLike.save();
      return existingLike;
    } else {
      const id = await getNextSequence('articleLike');
      const like = new ArticleLikeModel({ ...insertLike, id });
      await like.save();
      return like;
    }
  }

  async getUserLike(articleId: number, userIp: string): Promise<ArticleLike | undefined> {
    await connectToMongoDB();
    const like = await ArticleLikeModel.findOne({ articleId, userIp }).exec();
    return like || undefined;
  }

  async getArticleLikeCounts(articleId: number): Promise<{ likes: number; dislikes: number }> {
    await connectToMongoDB();
    const likes = await ArticleLikeModel.countDocuments({ articleId, isLike: true }).exec();
    const dislikes = await ArticleLikeModel.countDocuments({ articleId, isLike: false }).exec();
    return { likes, dislikes };
  }

  async removeLike(articleId: number, userIp: string): Promise<void> {
    await connectToMongoDB();
    await ArticleLikeModel.deleteOne({ articleId, userIp }).exec();
  }

  // Favorite methods
  async createOrRemoveFavorite(insertFavorite: InsertArticleFavorite): Promise<ArticleFavorite | null> {
    await connectToMongoDB();
    const existingFavorite = await ArticleFavoriteModel.findOne({
      articleId: insertFavorite.articleId,
      userIp: insertFavorite.userIp
    }).exec();

    if (existingFavorite) {
      await ArticleFavoriteModel.deleteOne({ _id: existingFavorite._id }).exec();
      return null;
    } else {
      const id = await getNextSequence('articleFavorite');
      const favorite = new ArticleFavoriteModel({ ...insertFavorite, id });
      await favorite.save();
      return favorite;
    }
  }

  async getUserFavorite(articleId: number, userIp: string): Promise<ArticleFavorite | undefined> {
    await connectToMongoDB();
    const favorite = await ArticleFavoriteModel.findOne({ articleId, userIp }).exec();
    return favorite || undefined;
  }

  async getUserFavorites(userIp: string): Promise<ArticleFavorite[]> {
    await connectToMongoDB();
    const favorites = await ArticleFavoriteModel.find({ userIp }).exec();
    return favorites;
  }

  // Visitor tracking methods
  async trackVisitor(visitorData: InsertVisitor): Promise<Visitor> {
    await connectToMongoDB();
    const existingVisitor = await VisitorModel.findOne({ ipAddress: visitorData.ipAddress }).exec();

    if (existingVisitor) {
      Object.assign(existingVisitor, visitorData);
      existingVisitor.updatedAt = new Date();
      await existingVisitor.save();
      return existingVisitor;
    } else {
      const visitor = new VisitorModel(visitorData);
      await visitor.save();
      return visitor;
    }
  }

  async getTotalVisitors(): Promise<number> {
    await connectToMongoDB();
    const count = await VisitorModel.countDocuments().exec();
    return count;
  }

  // Category counting methods
  async getCategoryCounts(): Promise<Record<string, number>> {
    await connectToMongoDB();
    const articles = await ArticleModel.find().exec();
    const counts: Record<string, number> = {};

    articles.forEach(article => {
      article.categories.forEach(category => {
        counts[category] = (counts[category] || 0) + 1;
      });
    });

    return counts;
  }

  // IQ Test methods
  async updateUserIqScore(userId: string, iqScore: number): Promise<User> {
    await connectToMongoDB();
    const user = await UserModel.findOneAndUpdate(
      { id: userId },
      { iqScore, iqTestTaken: true, updatedAt: new Date() },
      { new: true }
    ).exec();
    if (!user) throw new Error("User not found");
    return user;
  }

  async updateVisitorIqScore(ipAddress: string, iqScore: number): Promise<Visitor> {
    await connectToMongoDB();
    const visitor = await VisitorModel.findOneAndUpdate(
      { ipAddress },
      { iqScore, iqTestTaken: true, updatedAt: new Date() },
      { upsert: true, new: true }
    ).exec();
    return visitor;
  }

  async getUserIqStatus(userId: string): Promise<{ iqScore: number | null; iqTestTaken: boolean }> {
    await connectToMongoDB();
    const user = await UserModel.findOne({ id: userId }).exec();
    return {
      iqScore: user?.iqScore || null,
      iqTestTaken: user?.iqTestTaken || false
    };
  }

  async getVisitor(ipAddress: string): Promise<Visitor | undefined> {
    await connectToMongoDB();
    const visitor = await VisitorModel.findOne({ ipAddress }).exec();
    return visitor || undefined;
  }

  async getVisitorIqStatus(ipAddress: string): Promise<{ iqScore: number | null; iqTestTaken: boolean }> {
    await connectToMongoDB();
    const visitor = await VisitorModel.findOne({ ipAddress }).exec();
    return {
      iqScore: visitor?.iqScore || null,
      iqTestTaken: visitor?.iqTestTaken || false
    };
  }

  // Stub implementations for remaining methods (Post, PagePost, etc.)
  // These would need full implementations based on your requirements

  async createPost(insertPost: InsertPost): Promise<Post> {
    await connectToMongoDB();
    const id = await getNextSequence('post');
    const post = new PostModel({ ...insertPost, id });
    await post.save();
    return post;
  }

  async getPost(id: number): Promise<Post | undefined> {
    await connectToMongoDB();
    const post = await PostModel.findOne({ id }).exec();
    return post || undefined;
  }

  async getAllPosts(): Promise<Post[]> {
    await connectToMongoDB();
    const posts = await PostModel.find().sort({ createdAt: -1 }).exec();
    return posts;
  }

  async deletePost(id: number): Promise<void> {
    await connectToMongoDB();
    await PostModel.deleteOne({ id }).exec();
  }

  async updatePostStats(id: number, likes: number, dislikes: number, comments: number, downloads: number, reposts: number): Promise<void> {
    await connectToMongoDB();
    await PostModel.updateOne(
      { id },
      { likes, dislikes, comments, downloads, reposts, updatedAt: new Date() }
    ).exec();
  }

  // Post Like implementations
  async createOrUpdatePostLike(like: InsertPostLike): Promise<PostLike> {
    await connectToMongoDB();
    // Implementation needed - placeholder for now
    throw new Error("Post likes not yet implemented for MongoDB");
  }

  async getUserPostLike(postId: number, userIp: string): Promise<PostLike | undefined> {
    return undefined;
  }

  async getPostLikeCounts(postId: number): Promise<{ likes: number; dislikes: number }> {
    return { likes: 0, dislikes: 0 };
  }

  async removePostLike(postId: number, userIp: string): Promise<void> {
    // Implementation needed
  }

  async createPostComment(comment: InsertPostComment): Promise<PostComment> {
    await connectToMongoDB();
    // Implementation needed - placeholder for now
    throw new Error("Post comments not yet implemented for MongoDB");
  }

  async getCommentsByPost(postId: number): Promise<PostComment[]> {
    return [];
  }

  async trackPostDownload(download: InsertPostDownload): Promise<PostDownload> {
    await connectToMongoDB();
    // Implementation needed - placeholder for now
    throw new Error("Post downloads not yet implemented for MongoDB");
  }

  async getPostDownloadCount(postId: number): Promise<number> {
    return 0;
  }

  async createPagePost(post: InsertPagePost): Promise<PagePost> {
    await connectToMongoDB();
    const id = await getNextSequence('pagePost');
    const pagePost = new PagePostModel({ ...post, id });
    await pagePost.save();
    return pagePost;
  }

  async getPagePost(id: number): Promise<PagePost | undefined> {
    await connectToMongoDB();
    const post = await PagePostModel.findOne({ id }).exec();
    return post || undefined;
  }

  async getAllPagePosts(): Promise<PagePost[]> {
    await connectToMongoDB();
    const posts = await PagePostModel.find().sort({ createdAt: -1 }).exec();
    return posts;
  }

  async deletePagePostById(id: number): Promise<void> {
    await connectToMongoDB();
    await PagePostModel.deleteOne({ id }).exec();
  }

  async updatePagePostStats(id: number, likes: number, dislikes: number, comments: number): Promise<void> {
    await connectToMongoDB();
    await PagePostModel.updateOne(
      { id },
      { likes, dislikes, comments, updatedAt: new Date() }
    ).exec();
  }

  // Page Post Like implementations
  async createOrUpdatePagePostLike(like: InsertPagePostLike): Promise<PagePostLike> {
    await connectToMongoDB();

    // Check if like already exists
    const existingLike = await PagePostLikeModel.findOne({ 
      postId: like.postId, 
      userIp: like.userIp 
    }).exec();

    if (existingLike) {
      // Update existing like
      existingLike.isLike = like.isLike;
      existingLike.updatedAt = new Date();
      await existingLike.save();
      return existingLike;
    } else {
      // Create new like
      const newId = await getNextSequence('pagePostLike');
      const newLike = new PagePostLikeModel({
        id: newId,
        postId: like.postId,
        userIp: like.userIp,
        isLike: like.isLike,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await newLike.save();
      return newLike;
    }
  }

  async getUserPagePostLike(postId: number, userIp: string): Promise<PagePostLike | undefined> {
    await connectToMongoDB();
    const like = await PagePostLikeModel.findOne({ 
      postId: postId, 
      userIp: userIp 
    }).exec();
    return like || undefined;
  }

  async getPagePostLikeCounts(postId: number): Promise<{ likes: number; dislikes: number }> {
    await connectToMongoDB();

    const likes = await PagePostLikeModel.countDocuments({ 
      postId: postId, 
      isLike: true 
    }).exec();

    const dislikes = await PagePostLikeModel.countDocuments({ 
      postId: postId, 
      isLike: false 
    }).exec();

    return { likes, dislikes };
  }

  async removePagePostLike(postId: number, userIp: string): Promise<void> {
    await connectToMongoDB();
    await PagePostLikeModel.deleteOne({ 
      postId: postId, 
      userIp: userIp 
    }).exec();
  }

  async createPagePostComment(comment: InsertPagePostComment): Promise<PagePostComment> {
    await connectToMongoDB();

    const newId = await getNextSequence('pagePostComment');
    const newComment = new PagePostCommentModel({
      id: newId,
      postId: comment.postId,
      author: comment.authorName || comment.author || 'Anonymous User',
      content: comment.content,
      userIp: comment.userIp,
      authorId: comment.authorId,
      authorName: comment.authorName || 'Anonymous User',
      authorAlias: comment.authorAlias,
      authorProfileUrl: comment.authorProfileUrl,
      authorIq: comment.authorIq,
      createdAt: new Date()
    });

    const savedComment = await newComment.save();

    // Update post comment count
    await PagePostModel.updateOne(
      { id: comment.postId },
      { $inc: { comments: 1 } }
    ).exec();

    return savedComment;
  }

  async getCommentsByPagePost(postId: number): Promise<PagePostComment[]> {
    await connectToMongoDB();
    const comments = await PagePostCommentModel.find({ postId: postId })
      .sort({ createdAt: 1 })
      .exec();
    return comments;
  }

  async createPagePostVote(vote: InsertPagePostVote): Promise<PagePostVote> {
    await connectToMongoDB();

    try {
      // Check if user already voted on this post
      const existingVote = await PagePostVoteModel.findOne({
        postId: vote.postId,
        userIp: vote.userIp
      }).exec();

      if (existingVote) {
        // Update existing vote (user can change their choice)
        existingVote.option = vote.option;
        existingVote.updatedAt = new Date();
        if (vote.userId) existingVote.userId = vote.userId;
        if (vote.userEmail) existingVote.userEmail = vote.userEmail;

        await existingVote.save();
        return existingVote;
      } else {
        // Create new vote
        const id = await getNextSequence('page_post_vote');
        const newVote = new PagePostVoteModel({
          id,
          postId: vote.postId,
          userIp: vote.userIp,
          userId: vote.userId,
          userEmail: vote.userEmail,
          option: vote.option,
          createdAt: new Date(),
          updatedAt: new Date()
        });

        await newVote.save();
        return newVote;
      }
    } catch (error) {
      console.error('Error creating page post vote:', error);
      throw error;
    }
  }

  async getUserPagePostVote(postId: number, userIp: string): Promise<PagePostVote | undefined> {
    await connectToMongoDB();

    try {
      const vote = await PagePostVoteModel.findOne({
        postId: postId,
        userIp: userIp
      }).exec();

      return vote || undefined;
    } catch (error) {
      console.error('Error getting user page post vote:', error);
      return undefined;
    }
  }

  async getPagePostVoteCounts(postId: number): Promise<Record<string, number>> {
    await connectToMongoDB();

    try {
      const votes = await PagePostVoteModel.find({ postId: postId }).exec();

      const counts: Record<string, number> = {};
      votes.forEach(vote => {
        counts[vote.option] = (counts[vote.option] || 0) + 1;
      });

      return counts;
    } catch (error) {
      console.error('Error getting page post vote counts:', error);
      return {};
    }
  }

  async removePagePostVote(postId: number, userIp: string): Promise<void> {
    await connectToMongoDB();

    try {
      await PagePostVoteModel.deleteOne({
        postId: postId,
        userIp: userIp
      }).exec();
    } catch (error) {
      console.error('Error removing page post vote:', error);
      throw error;
    }
  }

  async checkAndUpdateUserVerification(userId: string): Promise<User> {
    await connectToMongoDB();
    const user = await UserModel.findOne({ id: userId }).exec();
    if (!user) throw new Error("User not found");
    return user;
  }

  async getNextAnonymousNumber(): Promise<number> {
    await connectToMongoDB();
    const lastVisitor = await VisitorModel.findOne()
      .sort({ anonymousNumber: -1 })
      .exec();
    return (lastVisitor?.anonymousNumber || 0) + 1;
  }

  async updateVisitorAnonymousNumber(ipAddress: string, anonymousNumber: number): Promise<void> {
    await connectToMongoDB();
    await VisitorModel.updateOne(
      { ipAddress },
      { anonymousNumber, updatedAt: new Date() },
      { upsert: true }
    ).exec();
  }

  async getIqTestStatus(identifier: string, identifierType: 'ip' | 'user'): Promise<IqTestTracking | undefined> {
    await connectToMongoDB();
    const tracking = await IqTestTrackingModel.findOne({ identifier, identifierType }).exec();
    return tracking || undefined;
  }

  async markIqTestCompleted(identifier: string, identifierType: 'ip' | 'user', iqScore: number): Promise<IqTestTracking> {
    await connectToMongoDB();
    const id = await getNextSequence('iqTestTracking');
    const tracking = new IqTestTrackingModel({
      id,
      identifier,
      identifierType,
      iqScore,
      completedAt: new Date()
    });
    await tracking.save();
    return tracking;
  }

  async checkIqTestButtonVisibility(identifier: string, identifierType: 'ip' | 'user'): Promise<boolean> {
    await connectToMongoDB();
    const tracking = await IqTestTrackingModel.findOne({ identifier, identifierType }).exec();
    return !tracking; // Return true if no test completed, false if test was completed
  }

  // Reset methods for testing purposes
  async resetUserIqStatus(userId: string): Promise<void> {
    await connectToMongoDB();
    await UserModel.updateOne(
      { id: userId },
      { $unset: { iqScore: "", iqTestTaken: "" } }
    ).exec();
    console.log(`Reset user IQ status for user: ${userId}`);
  }

  async resetVisitorIqStatus(ipAddress: string): Promise<void> {
    await connectToMongoDB();
    await VisitorModel.updateOne(
      { ipAddress },
      { $unset: { iqScore: "", iqTestTaken: "" } }
    ).exec();
    console.log(`Reset visitor IQ status for IP: ${ipAddress}`);
  }

  async resetIqTestTracking(identifier: string, identifierType: 'ip' | 'user'): Promise<void> {
    await connectToMongoDB();
    const result = await IqTestTrackingModel.deleteOne({ identifier, identifierType }).exec();
    console.log(`Reset IQ test tracking for ${identifierType} ${identifier}, deleted: ${result.deletedCount}`);
  }

  async clearAllIqTestData(ipAddress: string, userId?: string): Promise<void> {
    await connectToMongoDB();

    // Clear all IQ test tracking for this IP
    const ipResult = await IqTestTrackingModel.deleteMany({ identifier: ipAddress, identifierType: 'ip' }).exec();
    console.log(`Cleared IQ test tracking for IP ${ipAddress}, deleted: ${ipResult.deletedCount}`);

    // Clear all IQ test tracking for this user if provided
    if (userId) {
      const userResult = await IqTestTrackingModel.deleteMany({ identifier: userId, identifierType: 'user' }).exec();
      console.log(`Cleared IQ test tracking for user ${userId}, deleted: ${userResult.deletedCount}`);
    }

    // Clear visitor IQ data for this IP
    const visitorResult = await VisitorModel.updateMany(
      { ipAddress: ipAddress },
      { $unset: { iqScore: "", iqTestTaken: "" } }
    ).exec();
    console.log(`Cleared visitor IQ data for IP ${ipAddress}, updated: ${visitorResult.modifiedCount}`);

    // Clear user IQ data if user is provided
    if (userId) {
      const userUpdateResult = await UserModel.updateMany(
        { id: userId },
        { $unset: { iqScore: "", iqTestTaken: "" } }
      ).exec();
      console.log(`Cleared user IQ data for user ${userId}, updated: ${userUpdateResult.modifiedCount}`);
    }
  }

  async updateUserDatabaseBadges(userId: string, badges: {
    databasePlan?: string;
    hasBasicDB?: boolean;
    hasInterDB?: boolean;
    hasProDB?: boolean;
    isDeveloper?: boolean;
    isModerator?: boolean;
    isStaff?: boolean;
  }): Promise<User> {
    await connectToMongoDB();

    const updateData = {
      ...badges,
      updatedAt: new Date()
    };

    const user = await UserModel.findOneAndUpdate(
      { id: userId },
      { $set: updateData },
      { new: true }
    ).exec();

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  // Database deletion methods
  async deleteAllDatabaseData(userId: string): Promise<boolean> {
    await connectToMongoDB();

    try {
      // Delete all data created by this user
      await ArticleModel.deleteMany({ author: userId });
      await CommentModel.deleteMany({ authorId: userId });
      await PagePostModel.deleteMany({ authorId: userId });
      await PagePostCommentModel.deleteMany({ authorId: userId });
      await ArticleLikeModel.deleteMany({ userIp: userId }); // If user likes are tracked by ID
      await PagePostLikeModel.deleteMany({ userIp: userId });
      await PagePostVoteModel.deleteMany({ userIp: userId });
      await ArticleFavoriteModel.deleteMany({ userIp: userId });
      await IqTestTrackingModel.deleteMany({ identifier: userId });

      // Delete the user's database entries and authorized users
      const { UserDatabaseModel } = await import('../shared/mongodb-schema');
      await UserDatabaseModel.deleteMany({ userId });

      // Also remove user from authorized users in other databases
      await UserDatabaseModel.updateMany(
        { 'authorizedUsers.userId': userId },
        { $pull: { authorizedUsers: { userId } } }
      );

      return true;
    } catch (error) {
      console.error('Error deleting all database data:', error);
      return false;
    }
  }

  async deleteUserIPAccess(userId: string, ipAddress: string): Promise<boolean> {
    await connectToMongoDB();

    try {
      const { UserDatabaseModel } = await import('../shared/mongodb-schema');

      // Remove IP from user's databases
      await UserDatabaseModel.updateMany(
        { userId },
        { $pull: { networkIPs: ipAddress } }
      );

      return true;
    } catch (error) {
      console.error('Error deleting IP access:', error);
      return false;
    }
  }

  async deleteAuthorizedUser(userId: string, targetUserId: string): Promise<boolean> {
    await connectToMongoDB();

    try {
      const { UserDatabaseModel } = await import('../shared/mongodb-schema');

      // Remove authorized user from user's databases
      await UserDatabaseModel.updateMany(
        { userId },
        { $pull: { authorizedUsers: { userId: targetUserId } } }
      );

      return true;
    } catch (error) {
      console.error('Error deleting authorized user:', error);
      return false;
    }
  }

  // Article deletion by author
  async deleteArticle(articleId: number, userId: string): Promise<boolean> {
    await connectToMongoDB();

    try {
      const article = await ArticleModel.findOne({ id: articleId }).exec();
      if (!article) {
        return false;
      }

      // Check if user is the author
      if (article.author !== userId) {
        return false;
      }

      // Delete the article and related data
      await ArticleModel.deleteOne({ id: articleId });
      await CommentModel.deleteMany({ articleId });
      await ArticleLikeModel.deleteMany({ articleId });
      await ArticleFavoriteModel.deleteMany({ articleId });

      return true;
    } catch (error) {
      console.error('Error deleting article:', error);
      return false;
    }
  }

  // Page post deletion by author
  async deletePagePost(postId: number, userId: string): Promise<boolean> {
    await connectToMongoDB();

    try {
      const post = await PagePostModel.findOne({ id: postId }).exec();
      if (!post) {
        return false;
      }

      // Check if user is the author
      if (post.authorId !== userId) {
        return false;
      }

      // Delete the post and related data
      await PagePostModel.deleteOne({ id: postId });
      await PagePostCommentModel.deleteMany({ postId });
      await PagePostLikeModel.deleteMany({ postId });
      await PagePostVoteModel.deleteMany({ postId });

      return true;
    } catch (error) {
      console.error('Error deleting page post:', error);
      return false;
    }
  }

  // Guild-related methods
  async createGuild(guildData: InsertGuild): Promise<Guild> {
    await connectToMongoDB();

    const id = await getNextSequence('guild');
    const newGuild = new GuildModel({
      id,
      ...guildData,
      memberCount: 0, // Start with 0, will be incremented by createGuildMember
      postCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const savedGuild = await newGuild.save();

    // Add owner as first member (this will increment memberCount to 1)
    await this.createGuildMember({
      guildId: id,
      userId: guildData.ownerId,
      username: guildData.ownerName,
      role: 'owner'
    });

    return savedGuild;
  }

  async getGuildById(guildId: number): Promise<Guild | undefined> {
    await connectToMongoDB();
    
    // Validate input to prevent injection
    if (!guildId || typeof guildId !== 'number' || guildId <= 0) {
      return undefined;
    }
    
    const guild = await GuildModel.findOne({ 
      id: { $eq: guildId } // Use exact match operator for security
    }).select('-__v -updatedAt').exec(); // Exclude sensitive fields
    
    if (guild) {
      // Sanitize returned data
      const sanitizedGuild = guild.toObject();
      delete sanitizedGuild._id;
      return sanitizedGuild;
    }
    
    return undefined;
  }

  async getGuildByInsignia(insignia: string): Promise<Guild | undefined> {
    await connectToMongoDB();
    const guild = await GuildModel.findOne({ insignia }).exec();
    return guild || undefined;
  }

  async getAllGuilds(limit?: number): Promise<Guild[]> {
    await connectToMongoDB();
    let query = GuildModel.find().sort({ createdAt: -1 });
    if (limit) {
      query = query.limit(limit);
    }
    return await query.exec();
  }

  async getPublicGuilds(limit?: number): Promise<Guild[]> {
    await connectToMongoDB();
    console.log("=== MONGO getPublicGuilds DEBUG ===");
    let query = GuildModel.find({ isPrivate: false }).sort({ createdAt: -1 });
    if (limit) {
      query = query.limit(limit);
    }
    const guilds = await query.exec();
    console.log("Total public guilds found:", guilds.length);
    if (guilds.length > 0) {
      console.log("First guild raw data:", JSON.stringify(guilds[0].toObject(), null, 2));
    }
    console.log("=== END MONGO getPublicGuilds DEBUG ===");
    return guilds;
  }

  async createGuildMember(memberData: InsertGuildMember): Promise<GuildMember> {
    await connectToMongoDB();

    const id = await getNextSequence('guildMember');
    const newMember = new GuildMemberModel({
      id,
      ...memberData,
      joinedAt: new Date()
    });

    await newMember.save();

    // Update guild member count
    await GuildModel.updateOne(
      { id: memberData.guildId },
      { $inc: { memberCount: 1 }, $set: { updatedAt: new Date() } }
    ).exec();

    return newMember;
  }

  async getGuildMembers(guildId: number): Promise<GuildMember[]> {
    await connectToMongoDB();
    return await GuildMemberModel.find({ guildId }).sort({ joinedAt: 1 }).exec();
  }

  async isUserGuildMember(guildId: number, userId: string): Promise<boolean> {
    await connectToMongoDB();
    const member = await GuildMemberModel.findOne({ guildId, userId }).exec();
    return !!member;
  }

  async getUserGuilds(userId: string): Promise<Guild[]> {
    await connectToMongoDB();
    const membershipData = await GuildMemberModel.find({ userId }).exec();
    const guildIds = membershipData.map(m => m.guildId);
    return await GuildModel.find({ id: { $in: guildIds } }).sort({ createdAt: -1 }).exec();
  }

  async updateGuildMemberCount(guildId: number, newCount: number): Promise<void> {
    await connectToMongoDB();
    await GuildModel.updateOne(
      { id: guildId },
      { $set: { memberCount: newCount, updatedAt: new Date() } }
    ).exec();
  }

  async createGuildPost(postData: InsertGuildPost): Promise<GuildPost> {
    await connectToMongoDB();

    const id = await getNextSequence('guildPost');
    const newPost = new GuildPostModel({
      id,
      ...postData,
      likes: 0,
      dislikes: 0,
      comments: 0,
      reposts: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const savedPost = await newPost.save();

    // Update guild post count
    await GuildModel.updateOne(
      { id: postData.guildId },
      { $inc: { postCount: 1 }, $set: { updatedAt: new Date() } }
    ).exec();

    return savedPost;
  }

  async getGuildPosts(guildId: number, limit?: number): Promise<GuildPost[]> {
    await connectToMongoDB();
    let query = GuildPostModel.find({ guildId }).sort({ createdAt: -1 });
    if (limit) {
      query = query.limit(limit);
    }
    return await query.exec();
  }

  async getGuildPostById(postId: number): Promise<GuildPost | undefined> {
    await connectToMongoDB();
    const post = await GuildPostModel.findOne({ id: postId }).exec();
    return post || undefined;
  }

  async searchGuilds(query: string): Promise<Guild[]> {
    await connectToMongoDB();
    const searchRegex = new RegExp(query, 'i');
    return await GuildModel.find({
      $or: [
        { name: searchRegex },
        { description: searchRegex },
        { insignia: query }
      ]
    }).sort({ memberCount: -1 }).exec();
  }

  // Delete guild methods
  async deleteGuild(guildId: number, ownerId: string): Promise<boolean> {
    await connectToMongoDB();

    // Verify the user is the owner
    const guild = await GuildModel.findOne({ id: guildId, ownerId }).exec();
    if (!guild) {
      return false; // Guild doesn't exist or user is not the owner
    }

    // Delete all guild posts
    await GuildPostModel.deleteMany({ guildId }).exec();

    // Delete all guild members
    await GuildMemberModel.deleteMany({ guildId }).exec();

    // Delete all guild join requests
    await GuildJoinRequestModel.deleteMany({ guildId }).exec();

    // Delete the guild
    await GuildModel.deleteOne({ id: guildId }).exec();

    return true;
  }

  async deleteGuildPost(postId: number, authorId: string): Promise<boolean> {
    await connectToMongoDB();

    // Find the post and verify ownership
    const post = await GuildPostModel.findOne({ id: postId, authorId }).exec();
    if (!post) {
      return false; // Post doesn't exist or user is not the author
    }

    // Delete the post
    await GuildPostModel.deleteOne({ id: postId }).exec();

    // Update guild post count
    await GuildModel.updateOne(
      { id: post.guildId },
      { $inc: { postCount: -1 }, $set: { updatedAt: new Date() } }
    ).exec();

    return true;
  }

  async leaveGuild(guildId: number, userId: string): Promise<boolean> {
    await connectToMongoDB();

    // Check if user is a member
    const member = await GuildMemberModel.findOne({ guildId, userId }).exec();
    if (!member) {
      return false; // User is not a member
    }

    // Check if user is the owner (owners cannot leave their own guild)
    if (member.role === 'owner') {
      return false; // Owners cannot leave their own guild
    }

    // Remove the member
    await GuildMemberModel.deleteOne({ guildId, userId }).exec();

    // Update guild member count
    await GuildModel.updateOne(
      { id: guildId },
      { $inc: { memberCount: -1 }, $set: { updatedAt: new Date() } }
    ).exec();

    return true;
  }

  async getUserGuildMembership(userId: string): Promise<GuildMember[]> {
    await connectToMongoDB();
    return await GuildMemberModel.find({ userId }).exec();
  }

  async createGuildJoinRequest(requestData: InsertGuildJoinRequest): Promise<GuildJoinRequest> {
    await connectToMongoDB();

    // Check if request already exists
    const existingRequest = await GuildJoinRequestModel.findOne({
      guildId: requestData.guildId,
      userId: requestData.userId,
      status: 'pending'
    }).exec();

    if (existingRequest) {
      throw new Error('Join request already pending');
    }

    const id = await getNextSequence('guildJoinRequest');
    const newRequest = new GuildJoinRequestModel({
      id,
      ...requestData,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await newRequest.save();
    return newRequest;
  }

  async getGuildJoinRequests(guildId: number): Promise<GuildJoinRequest[]> {
    await connectToMongoDB();
    return await GuildJoinRequestModel.find({ 
      guildId, 
      status: 'pending' 
    }).sort({ createdAt: -1 }).exec();
  }

  async updateGuildJoinRequest(requestId: number, status: 'approved' | 'rejected'): Promise<GuildJoinRequest | undefined> {
    await connectToMongoDB();

    const request = await GuildJoinRequestModel.findOneAndUpdate(
      { id: requestId },
      { status, updatedAt: new Date() },
      { new: true }
    ).exec();

    if (request && status === 'approved') {
      // Add user to guild
      await this.createGuildMember({
        guildId: request.guildId,
        userId: request.userId,
        username: request.username
      });

      // Update guild member count
      await GuildModel.updateOne(
        { id: request.guildId },
        { $inc: { memberCount: 1 }, $set: { updatedAt: new Date() } }
      ).exec();
    }

    return request || undefined;
  }


}