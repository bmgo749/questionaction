import mongoose, { Schema, Document } from 'mongoose';
import { z } from 'zod';

// User Schema
export interface User extends Document {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  aliasName?: string;
  profileImageUrl?: string;
  password?: string;
  provider: string;
  fame: number;
  honourLevel: number;
  isVerified: boolean;
  verificationCode?: string;
  verificationCodeExpiry?: Date;
  resetToken?: string;
  resetTokenExpiry?: Date;
  iqScore?: number;
  iqTestTaken: boolean;
  description?: string;
  // Membership badges
  isFree: boolean;
  isTopaz: boolean;
  isAgate: boolean;
  isAqua: boolean;
  // Staff badges
  isModerator: boolean;
  isStaff: boolean;
  isDeveloper: boolean;
  // Database badges
  hasBasicDB: boolean;
  hasInterDB: boolean;
  hasProDB: boolean;
  // Database plans
  databasePlan: string; // 'free', 'basic', 'inter', 'pro'
  selectedTheme: string;
  currentGuildId?: number; // ID of the guild the user is currently in
  currentGuildName?: string; // Name of the guild for display
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<User>({
  id: { type: String, required: true, unique: true },
  email: { type: String, unique: true, sparse: true },
  firstName: String,
  lastName: String,
  username: String,
  aliasName: String,
  profileImageUrl: String,
  password: String,
  provider: { type: String, required: true },
  fame: { type: Number, default: 0 },
  honourLevel: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  verificationCode: String,
  verificationCodeExpiry: Date,
  resetToken: String,
  resetTokenExpiry: Date,
  iqScore: Number,
  iqTestTaken: { type: Boolean, default: false },
  description: String,
  // Membership badges
  isFree: { type: Boolean, default: true },
  isTopaz: { type: Boolean, default: false },
  isAgate: { type: Boolean, default: false },
  isAqua: { type: Boolean, default: false },
  // Staff badges
  isModerator: { type: Boolean, default: false },
  isStaff: { type: Boolean, default: false },
  isDeveloper: { type: Boolean, default: false },
  // Database badges
  hasBasicDB: { type: Boolean, default: false },
  hasInterDB: { type: Boolean, default: false },
  hasProDB: { type: Boolean, default: false },
  // Database plans
  databasePlan: { 
    type: String, 
    default: 'free',
    enum: ['free', 'basic', 'inter', 'pro']
  },
  selectedTheme: { 
    type: String, 
    default: 'dark',
    enum: ['dark', 'light', 'auto', 'topaz', 'agate', 'aqua']
  },
  currentGuildId: Number,
  currentGuildName: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Article Schema
export interface Article extends Document {
  id: number;
  title: string;
  content: string;
  categories: string[];
  hashtags: string[];
  thumbnail?: string;
  author: string;
  language: string;
  enableForum: boolean;
  likes: number;
  dislikes: number;
  // Font formatting fields
  fontFamily?: string;
  fontSize?: number;
  fontColor?: string;
  backgroundColor?: string;
  isBold?: boolean;
  isItalic?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const articleSchema = new Schema<Article>({
  id: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  categories: [{ type: String, required: true }],
  hashtags: [String],
  thumbnail: String,
  author: { type: String, required: true },
  language: { type: String, required: true },
  enableForum: { type: Boolean, default: false },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  // Font formatting fields
  fontFamily: { type: String, default: 'Arial' },
  fontSize: { type: Number, default: 16 },
  fontColor: { type: String, default: '#000000' },
  backgroundColor: { type: String, default: '#ffffff' },
  isBold: { type: Boolean, default: false },
  isItalic: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Visitor Schema
export interface Visitor extends Document {
  ipAddress: string;
  iqScore?: number;
  iqTestTaken: boolean;
  anonymousNumber?: number;
  createdAt: Date;
  updatedAt: Date;
}

const visitorSchema = new Schema<Visitor>({
  ipAddress: { type: String, required: true, unique: true },
  iqScore: Number,
  iqTestTaken: { type: Boolean, default: false },
  anonymousNumber: Number,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Comment Schema
export interface Comment extends Document {
  id: number;
  articleId: number;
  author: string;
  content: string;
  userIp: string;
  authorId?: string;
  authorName?: string;
  authorAlias?: string;
  authorFame?: number;
  authorProfileUrl?: string;
  authorIq?: number;
  authorIsTopaz?: boolean;
  authorIsAgate?: boolean;
  authorIsAqua?: boolean;
  createdAt: Date;
}

const commentSchema = new Schema<Comment>({
  id: { type: Number, required: true, unique: true },
  articleId: { type: Number, required: true },
  author: { type: String, required: true },
  content: { type: String, required: true },
  userIp: { type: String, required: true },
  authorId: String,
  authorName: String,
  authorAlias: String,
  authorFame: Number,
  authorProfileUrl: String,
  authorIq: Number,
  authorIsTopaz: { type: Boolean, default: false },
  authorIsAgate: { type: Boolean, default: false },
  authorIsAqua: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Article Like Schema
export interface ArticleLike extends Document {
  id: number;
  articleId: number;
  userIp: string;
  isLike: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const articleLikeSchema = new Schema<ArticleLike>({
  id: { type: Number, required: true, unique: true },
  articleId: { type: Number, required: true },
  userIp: { type: String, required: true },
  isLike: { type: Boolean, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Article Favorite Schema
export interface ArticleFavorite extends Document {
  id: number;
  articleId: number;
  userIp: string;
  createdAt: Date;
}

const articleFavoriteSchema = new Schema<ArticleFavorite>({
  id: { type: Number, required: true, unique: true },
  articleId: { type: Number, required: true },
  userIp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Post Schema
export interface Post extends Document {
  id: number;
  title: string;
  content: string;
  type: 'photo' | 'video' | 'discussion';
  mediaUrl?: string;
  author: string;
  userIp: string;
  likes: number;
  dislikes: number;
  comments: number;
  downloads: number;
  reposts: number;
  isNsfw: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<Post>({
  id: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  type: { type: String, enum: ['photo', 'video', 'discussion'], required: true },
  mediaUrl: String,
  author: { type: String, required: true },
  userIp: { type: String, required: true },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  downloads: { type: Number, default: 0 },
  reposts: { type: Number, default: 0 },
  isNsfw: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Page Post Schema
export interface PagePost extends Document {
  id: number;
  title: string;
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
  votingTitle?: string;
  votingOptions?: string[];
  likes: number;
  dislikes: number;
  comments: number;
  isNsfw: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const pagePostSchema = new Schema<PagePost>({
  id: { type: Number, required: true, unique: true },
  title: { type: String, default: '' },
  content: { type: String, required: true },
  type: { type: String, enum: ['photo', 'video', 'discussion'], required: true },
  mediaUrl: String,
  mediaType: String,
  authorId: String,
  authorName: { type: String, required: true },
  authorAlias: String,
  authorProfileUrl: String,
  authorIp: { type: String, required: true },
  hashtags: [String],
  isVotingEnabled: { type: Boolean, default: false },
  votingTitle: String,
  votingOptions: [String],
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  isNsfw: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Page Post Like Schema
export interface PagePostLike extends Document {
  id: number;
  postId: number;
  userIp: string;
  isLike: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const pagePostLikeSchema = new Schema<PagePostLike>({
  id: { type: Number, required: true, unique: true },
  postId: { type: Number, required: true },
  userIp: { type: String, required: true },
  isLike: { type: Boolean, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Page Post Comment Schema
export interface PagePostComment extends Document {
  id: number;
  postId: number;
  author: string;
  content: string;
  userIp: string;
  authorId?: string;
  authorName?: string;
  authorAlias?: string;
  authorFame?: number;
  authorProfileUrl?: string;
  authorIq?: number;
  authorIsTopaz?: boolean;
  authorIsAgate?: boolean;
  authorIsAqua?: boolean;
  createdAt: Date;
}

const pagePostCommentSchema = new Schema<PagePostComment>({
  id: { type: Number, required: true, unique: true },
  postId: { type: Number, required: true },
  author: { type: String, required: true },
  content: { type: String, required: true },
  userIp: { type: String, required: true },
  authorId: String,
  authorName: String,
  authorAlias: String,
  authorFame: Number,
  authorProfileUrl: String,
  authorIq: Number,
  authorIsTopaz: { type: Boolean, default: false },
  authorIsAgate: { type: Boolean, default: false },
  authorIsAqua: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Page Post Vote Schema
export interface PagePostVote extends Document {
  id: number;
  postId: number;
  userIp: string;
  userId?: string;
  userEmail?: string;
  option: string;
  createdAt: Date;
  updatedAt: Date;
}

const pagePostVoteSchema = new Schema<PagePostVote>({
  id: { type: Number, required: true, unique: true },
  postId: { type: Number, required: true },
  userIp: { type: String, required: true },
  userId: String,
  userEmail: String,
  option: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create compound index to prevent duplicate votes (one vote per user per post)
pagePostVoteSchema.index({ postId: 1, userIp: 1 }, { unique: true });

// IQ Test Tracking Schema
export interface IqTestTracking extends Document {
  id: number;
  identifier: string;
  identifierType: 'ip' | 'user';
  iqScore: number;
  completedAt: Date;
  createdAt: Date;
}

const iqTestTrackingSchema = new Schema<IqTestTracking>({
  id: { type: Number, required: true, unique: true },
  identifier: { type: String, required: true },
  identifierType: { type: String, enum: ['ip', 'user'], required: true },
  iqScore: { type: Number, required: true },
  completedAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Counter Schema for auto-increment IDs
export interface Counter extends Document {
  _id: string;
  sequence_value: number;
}

const counterSchema = new Schema<Counter>({
  _id: { type: String, required: true },
  sequence_value: { type: Number, default: 0 }
});

// Models
export const UserModel = mongoose.model<User>('User', userSchema);

// User Database Schema - for QueitDB system with persistent user data
export interface UserDatabase extends Document {
  userId: string;
  databaseName: string;
  dataFields: { [key: string]: any }; // Dynamic fields (data1, data2, etc.)
  authorizedUsers: Array<{
    username: string;
    password?: string;
    authType: string;
    privilege: string;
    createdAt: Date;
  }>;
  networkIPs: Array<{
    ipAddress: string;
    description?: string;
    createdAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const userDatabaseSchema = new Schema<UserDatabase>({
  userId: { type: String, required: true },
  databaseName: { type: String, required: true },
  dataFields: { type: Schema.Types.Mixed, default: {} },
  authorizedUsers: [{
    username: { type: String, required: true },
    password: String,
    authType: { type: String, required: true },
    privilege: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  networkIPs: [{
    ipAddress: { type: String, required: true },
    description: String,
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create compound index for userId and databaseName
userDatabaseSchema.index({ userId: 1, databaseName: 1 }, { unique: true });

export const UserDatabaseModel = mongoose.model<UserDatabase>('UserDatabase', userDatabaseSchema);
export const ArticleModel = mongoose.model<Article>('Article', articleSchema);
export const VisitorModel = mongoose.model<Visitor>('Visitor', visitorSchema);
export const CommentModel = mongoose.model<Comment>('Comment', commentSchema);
export const ArticleLikeModel = mongoose.model<ArticleLike>('ArticleLike', articleLikeSchema);
export const ArticleFavoriteModel = mongoose.model<ArticleFavorite>('ArticleFavorite', articleFavoriteSchema);
export const PostModel = mongoose.model<Post>('Post', postSchema);
export const PagePostModel = mongoose.model<PagePost>('PagePost', pagePostSchema);
export const PagePostLikeModel = mongoose.model<PagePostLike>('PagePostLike', pagePostLikeSchema);
export const PagePostCommentModel = mongoose.model<PagePostComment>('PagePostComment', pagePostCommentSchema);
export const PagePostVoteModel = mongoose.model<PagePostVote>('PagePostVote', pagePostVoteSchema);
export const IqTestTrackingModel = mongoose.model<IqTestTracking>('IqTestTracking', iqTestTrackingSchema);
export const CounterModel = mongoose.model<Counter>('Counter', counterSchema);

// Guild Schema
export interface Guild extends Document {
  id: number;
  name: string;
  description: string;
  insignia: string; // Format: #12345
  logo: string; // Sample logo ID or custom upload path
  logoBackgroundColor: string; // Custom color
  customLogoUrl?: string; // For custom uploaded logos
  maxMembers: number; // Member limit based on membership tier
  isPrivate: boolean;
  ownerId: string;
  ownerName: string;
  memberCount: number;
  postCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const guildSchema = new Schema<Guild>({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true, maxlength: 20 },
  description: { type: String, required: true, maxlength: 600 },
  insignia: { type: String, required: true, unique: true, match: /^#[A-Z]{5}$/ },
  logo: { type: String, required: true, enum: ['logo-a', 'logo-g', 'logo-abstract1', 'logo-abstract2', 'logo-circle', 'custom'] },
  logoBackgroundColor: { type: String, required: true },
  customLogoUrl: String, // Path to uploaded custom logo
  maxMembers: { type: Number, required: true, min: 2, max: 100 }, // Min 2 (owner + 1), max 100 for Aqua
  isPrivate: { type: Boolean, default: false },
  ownerId: { type: String, required: true },
  ownerName: { type: String, required: true },
  memberCount: { type: Number, default: 1 },
  postCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Guild Member Schema
export interface GuildMember extends Document {
  id: number;
  guildId: number;
  userId: string;
  username: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: Date;
}

const guildMemberSchema = new Schema<GuildMember>({
  id: { type: Number, required: true, unique: true },
  guildId: { type: Number, required: true },
  userId: { type: String, required: true },
  username: { type: String, required: true },
  role: { type: String, enum: ['owner', 'admin', 'member'], default: 'member' },
  joinedAt: { type: Date, default: Date.now }
});

// Prevent duplicate memberships
guildMemberSchema.index({ guildId: 1, userId: 1 }, { unique: true });

// Guild Invite Schema
export interface GuildInvite extends Document {
  id: number;
  guildId: number;
  guildName: string;
  email: string;
  invitedBy: string;
  invitedByName: string;
  invitedAt: Date;
  expiresAt: Date;
  status: 'pending' | 'accepted' | 'expired';
}

const guildInviteSchema = new Schema<GuildInvite>({
  id: { type: Number, required: true, unique: true },
  guildId: { type: Number, required: true },
  guildName: { type: String, required: true },
  email: { type: String, required: true },
  invitedBy: { type: String, required: true },
  invitedByName: { type: String, required: true },
  invitedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'expired'], default: 'pending' }
});

// Guild Request Schema
export interface GuildRequest extends Document {
  id: number;
  guildId: number;
  guildName: string;
  userId: string;
  username: string;
  userEmail: string;
  requestedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
}

const guildRequestSchema = new Schema<GuildRequest>({
  id: { type: Number, required: true, unique: true },
  guildId: { type: Number, required: true },
  guildName: { type: String, required: true },
  userId: { type: String, required: true },
  username: { type: String, required: true },
  userEmail: { type: String, required: true },
  requestedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
});

// Guild Post Schema
export interface GuildPost extends Document {
  id: number;
  guildId: number;
  guildName: string;
  guildInsignia: string;
  title: string;
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
  likes: number;
  dislikes: number;
  comments: number;
  reposts: number;
  createdAt: Date;
  updatedAt: Date;
}

const guildPostSchema = new Schema<GuildPost>({
  id: { type: Number, required: true, unique: true },
  guildId: { type: Number, required: true },
  guildName: { type: String, required: true },
  guildInsignia: { type: String, required: true },
  title: { type: String, default: '' },
  content: { type: String, required: true },
  type: { type: String, enum: ['photo', 'video', 'discussion'], required: true },
  mediaUrl: String,
  mediaType: String,
  authorId: { type: String, required: true },
  authorName: { type: String, required: true },
  authorAlias: String,
  authorProfileUrl: String,
  authorIp: { type: String, required: true },
  hashtags: [String],
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  reposts: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Guild Post Like Schema
export interface GuildPostLike extends Document {
  id: number;
  postId: number;
  userIp: string;
  isLike: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const guildPostLikeSchema = new Schema<GuildPostLike>({
  id: { type: Number, required: true, unique: true },
  postId: { type: Number, required: true },
  userIp: { type: String, required: true },
  isLike: { type: Boolean, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Guild Post Comment Schema
export interface GuildPostComment extends Document {
  id: number;
  postId: number;
  author: string;
  content: string;
  userIp: string;
  authorId?: string;
  authorName?: string;
  authorAlias?: string;
  authorFame?: number;
  authorProfileUrl?: string;
  authorIq?: number;
  createdAt: Date;
}

const guildPostCommentSchema = new Schema<GuildPostComment>({
  id: { type: Number, required: true, unique: true },
  postId: { type: Number, required: true },
  author: { type: String, required: true },
  content: { type: String, required: true },
  userIp: { type: String, required: true },
  authorId: String,
  authorName: String,
  authorAlias: String,
  authorFame: Number,
  authorProfileUrl: String,
  authorIq: Number,
  createdAt: { type: Date, default: Date.now }
});

// Guild Join Request Schema
export interface GuildJoinRequest extends Document {
  id: number;
  guildId: number;
  userId: string;
  username: string;
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const guildJoinRequestSchema = new Schema<GuildJoinRequest>({
  id: { type: Number, required: true, unique: true },
  guildId: { type: Number, required: true },
  userId: { type: String, required: true },
  username: { type: String, required: true },
  message: String,
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const GuildModel = mongoose.model<Guild>('Guild', guildSchema);
export const GuildMemberModel = mongoose.model<GuildMember>('GuildMember', guildMemberSchema);
export const GuildInviteModel = mongoose.model<GuildInvite>('GuildInvite', guildInviteSchema);
export const GuildRequestModel = mongoose.model<GuildRequest>('GuildRequest', guildRequestSchema);
export const GuildPostModel = mongoose.model<GuildPost>('GuildPost', guildPostSchema);
export const GuildPostLikeModel = mongoose.model<GuildPostLike>('GuildPostLike', guildPostLikeSchema);
export const GuildPostCommentModel = mongoose.model<GuildPostComment>('GuildPostComment', guildPostCommentSchema);
export const GuildJoinRequestModel = mongoose.model<GuildJoinRequest>('GuildJoinRequest', guildJoinRequestSchema);

// Auto-increment function
export async function getNextSequence(name: string): Promise<number> {
  const result = await CounterModel.findByIdAndUpdate(
    name,
    { $inc: { sequence_value: 1 } },
    { new: true, upsert: true }
  );
  return result.sequence_value;
}

// Zod schemas for validation (keeping original structure)
export const insertUserSchema = z.object({
  id: z.string(),
  email: z.string().email().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  username: z.string().optional(),
  aliasName: z.string().optional(),
  profileImageUrl: z.string().optional(),
  password: z.string().optional(),
  provider: z.string(),
  fame: z.number().default(0),
  honourLevel: z.number().default(0),
  isVerified: z.boolean().default(false),
  verificationCode: z.string().optional(),
  verificationCodeExpiry: z.date().optional(),
  iqScore: z.number().optional(),
  iqTestTaken: z.boolean().default(false),
  description: z.string().optional(),
});

export const insertArticleSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  categories: z.array(z.string()).min(1, "At least one category is required").max(3, "Maximum 3 categories allowed"),
  hashtags: z.array(z.string()).default([]),
  thumbnail: z.string().optional(),
  author: z.string(),
  language: z.string().default("en"),
  enableForum: z.boolean().default(false),
});

export const insertPagePostVoteSchema = z.object({
  postId: z.number(),
  userIp: z.string(),
  userId: z.string().optional(),
  userEmail: z.string().email().optional(),
  option: z.string().min(1, "Vote option is required"),
});

export const insertPagePostCommentSchema = z.object({
  postId: z.number(),
  authorId: z.string().optional(),
  authorIp: z.string(),
  authorName: z.string().optional(),
  authorAlias: z.string().optional(),
  authorProfileUrl: z.string().optional(),
  authorIq: z.number().optional(),
  content: z.string().min(1, "Comment content is required"),
  userIp: z.string(), // MongoDB compatibility
});

export const insertPagePostLikeSchema = z.object({
  postId: z.number(),
  userIp: z.string(),
  userId: z.string().optional(),
  isLike: z.boolean(),
});

export const insertGuildPostSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be 200 characters or less"),
  content: z.string().min(1, "Content is required").max(2000, "Content must be 2000 characters or less"),
  postType: z.enum(['text', 'image', 'discussion']),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type InsertPagePostVote = z.infer<typeof insertPagePostVoteSchema>;
export type InsertPagePostComment = z.infer<typeof insertPagePostCommentSchema>;
export type InsertPagePostLike = z.infer<typeof insertPagePostLikeSchema>;
export type InsertGuildPost = z.infer<typeof insertGuildPostSchema>;
export type UpsertUser = Partial<InsertUser> & { id: string };
export type UpdateProfile = {
  firstName?: string;
  lastName?: string;
  aliasName?: string;
  description?: string;
  profileImageUrl?: string;
};