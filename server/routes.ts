import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { insertArticleSchema, insertCommentSchema, insertArticleLikeSchema, signUpSchema, signInSchema, verifyEmailSchema, resetPasswordSchema, updateProfileSchema, type UpsertUser } from "@shared/schema";
import passport from "passport";
import "./auth"; // Import to configure strategies
import session from "express-session";
import connectPg from "connect-pg-simple";
import nodemailer from "nodemailer";
import { hashPassword, comparePasswords, generateVerificationCode, generateVerificationCodeExpiry } from "./utils/auth";
import { randomUUID } from "crypto";

// Extend session interface to include userId
declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

// Configure multer for file uploads
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'thumbnail-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session management
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });

  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
    },
  }));

  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport serialization
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user || false);
    } catch (error) {
      done(error);
    }
  });

  // Serve uploaded files statically
  app.use('/uploads', express.static(uploadsDir));
  
  // Configure nodemailer for email sending (optional)
  let transporter: any = undefined;
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // Authentication routes - only register if OAuth credentials are available
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    app.get('/api/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
    
    app.get('/api/auth/google/callback',
      passport.authenticate('google', { failureRedirect: '/auth' }),
      async (req, res) => {
        const user = req.user as any;
        
        // Check if user needs verification
        if (user && !user.isVerified) {
          // Generate verification code and send email
          const verificationCode = generateVerificationCode();
          const verificationCodeExpiry = generateVerificationCodeExpiry();
          
          // Update user with verification code
          await storage.updateUserVerification(user.id, verificationCode, verificationCodeExpiry);
          
          // Send verification email
          if (user.email && transporter) {
            try {
              await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: 'Verify your QuestionAction account',
                html: `
                  <h2>Verify Your Account</h2>
                  <p>Hello ${user.firstName || 'User'},</p>
                  <p>Thank you for signing up with QuestionAction via Google. Please verify your account with this code:</p>
                  <h1 style="color: #007bff; font-size: 32px; letter-spacing: 5px;">${verificationCode}</h1>
                  <p>This code will expire in 15 minutes.</p>
                  <p>Best regards,<br>The QuestionAction Team</p>
                `,
              });
            } catch (error) {
              console.error('Failed to send verification email:', error);
            }
          }
          
          // Redirect to auth page with verification needed
          res.redirect('/auth?needsVerification=true&email=' + encodeURIComponent(user.email));
        } else {
          // User already verified, redirect to home
          res.redirect('/');
        }
      }
    );
  }

  if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
    app.get('/api/auth/discord', passport.authenticate('discord'));
    
    app.get('/api/auth/discord/callback',
      passport.authenticate('discord', { failureRedirect: '/auth' }),
      async (req, res) => {
        const user = req.user as any;
        
        // Check if user needs verification
        if (user && !user.isVerified) {
          // Generate verification code and send email
          const verificationCode = generateVerificationCode();
          const verificationCodeExpiry = generateVerificationCodeExpiry();
          
          // Update user with verification code
          await storage.updateUserVerification(user.id, verificationCode, verificationCodeExpiry);
          
          // Send verification email
          if (user.email && transporter) {
            try {
              await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: 'Verify your QuestionAction account',
                html: `
                  <h2>Verify Your Account</h2>
                  <p>Hello ${user.firstName || 'User'},</p>
                  <p>Thank you for signing up with QuestionAction via Discord. Please verify your account with this code:</p>
                  <h1 style="color: #007bff; font-size: 32px; letter-spacing: 5px;">${verificationCode}</h1>
                  <p>This code will expire in 15 minutes.</p>
                  <p>Best regards,<br>The QuestionAction Team</p>
                `,
              });
            } catch (error) {
              console.error('Failed to send verification email:', error);
            }
          }
          
          // Redirect to auth page with verification needed
          res.redirect('/auth?needsVerification=true&email=' + encodeURIComponent(user.email));
        } else {
          // User already verified, redirect to home
          res.redirect('/');
        }
      }
    );
  }

  // Discord OAuth callback handler for root path (production)
  app.get('/', async (req, res, next) => {
    const { code } = req.query;
    
    // Only handle if there's a code parameter (Discord OAuth callback)
    if (code && typeof code === 'string') {
      try {
        // Exchange authorization code for access token
        const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: process.env.DISCORD_CLIENT_ID!,
            client_secret: process.env.DISCORD_CLIENT_SECRET!,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: 'https://kaiserliche.my.id',
          }),
        });

        if (!tokenResponse.ok) {
          console.error('Discord token exchange failed:', await tokenResponse.text());
          res.redirect('/auth?error=token_exchange_failed');
          return;
        }

        const tokens = await tokenResponse.json();

        // Get user information from Discord
        const userResponse = await fetch('https://discord.com/api/users/@me', {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
          },
        });

        if (!userResponse.ok) {
          console.error('Discord user fetch failed:', await userResponse.text());
          res.redirect('/auth?error=user_fetch_failed');
          return;
        }

        const discordUser = await userResponse.json();

        // Create or update user in database
        const userData: UpsertUser = {
          id: discordUser.id,
          email: discordUser.email || `${discordUser.username}@discord.local`,
          firstName: discordUser.global_name || discordUser.username,
          lastName: '',
          password: '',
          provider: 'discord',
          isVerified: true,
        };

        const user = await storage.upsertUser(userData);

        // Create session
        (req.session as any).userId = user.id;
        req.session.save((err) => {
          if (err) {
            console.error('Session save error:', err);
            res.redirect('/auth?error=session_failed');
          } else {
            res.redirect('/');
          }
        });

      } catch (error) {
        console.error('Discord OAuth error:', error);
        res.redirect('/auth?error=oauth_failed');
      }
    } else {
      // No code parameter, pass to next handler (Vite)
      next();
    }
  });

  // Discord OAuth callback handler for development
  app.get('/api/auth/discord/callback', async (req, res) => {
    const { code } = req.query;
    
    if (code && typeof code === 'string') {
      try {
        // Exchange authorization code for access token
        const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: process.env.DISCORD_CLIENT_ID!,
            client_secret: process.env.DISCORD_CLIENT_SECRET!,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: 'https://kaiserliche.my.id',
          }),
        });

        if (!tokenResponse.ok) {
          throw new Error('Failed to exchange code for token');
        }

        const tokenData = await tokenResponse.json();
        
        // Get user info from Discord
        const userResponse = await fetch('https://discord.com/api/users/@me', {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
          },
        });

        if (!userResponse.ok) {
          throw new Error('Failed to get user info');
        }

        const discordUser = await userResponse.json();
        
        // Create or update user in database
        const userData = {
          id: `discord_${discordUser.id}`,
          email: discordUser.email || null,
          firstName: discordUser.username || null,
          lastName: discordUser.discriminator || null,
          profileImageUrl: discordUser.avatar ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png` : null,
          provider: 'discord',
        };

        const user = await storage.upsertUser(userData);
        
        // Log user in
        req.login(user, (err) => {
          if (err) {
            console.error('Login error:', err);
            return res.redirect('/auth?error=login_failed');
          }
          
          // Check if user needs verification
          if (!user.isVerified) {
            // Generate verification code and send email
            const verificationCode = generateVerificationCode();
            const verificationCodeExpiry = generateVerificationCodeExpiry();
            
            // Update user with verification code
            storage.updateUserVerification(user.id, verificationCode, verificationCodeExpiry);
            
            // Send verification email
            if (user.email && transporter) {
              transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: 'Verify your QuestionAction account',
                html: `
                  <h2>Verify Your Account</h2>
                  <p>Hello ${user.firstName || 'User'},</p>
                  <p>Thank you for signing up with QuestionAction via Discord. Please verify your account with this code:</p>
                  <h1 style="color: #007bff; font-size: 32px; letter-spacing: 5px;">${verificationCode}</h1>
                  <p>This code will expire in 15 minutes.</p>
                  <p>Best regards,<br>The QuestionAction Team</p>
                `,
              }).catch(console.error);
            }
            
            // Redirect to auth page with verification needed
            const emailParam = user.email ? encodeURIComponent(user.email) : '';
            res.redirect('/auth?needsVerification=true&email=' + emailParam);
          } else {
            // User already verified, redirect to home
            res.redirect('/');
          }
        });
        
      } catch (error) {
        console.error('Discord OAuth error:', error);
        res.redirect('/auth?error=oauth_failed');
      }
    } else {
      res.redirect('/auth?error=no_code');
    }
  });

  app.get('/api/auth/logout', (req, res) => {
    req.logout(() => {
      res.redirect('/');
    });
  });

  app.get('/api/auth/user', (req, res) => {
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else {
      res.status(401).json({ message: 'Not authenticated' });
    }
  });

  // Email-based authentication routes
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const validatedData = signUpSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      // Hash password and generate verification code
      const hashedPassword = await hashPassword(validatedData.password);
      const verificationCode = generateVerificationCode();
      const verificationCodeExpiry = generateVerificationCodeExpiry();

      // Create user
      const userId = randomUUID();
      await storage.createUser({
        id: userId,
        email: validatedData.email,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        password: hashedPassword,
        provider: 'email',
        verificationCode,
        verificationCodeExpiry,
      });

      // Send verification email
      if (transporter) {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: validatedData.email,
          subject: 'Verify your QuestionAction account',
          html: `
            <h2>Verify Your Account</h2>
            <p>Hello ${validatedData.firstName},</p>
            <p>Thank you for signing up with QuestionAction. Your verification code is:</p>
            <h1 style="color: #007bff; font-size: 32px; letter-spacing: 5px;">${verificationCode}</h1>
            <p>This code will expire in 15 minutes.</p>
            <p>If you didn't create this account, please ignore this email.</p>
          `,
        });
      }

      res.status(201).json({ 
        message: 'Registration successful. Please check your email for verification code.',
        email: validatedData.email 
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error('Signup error:', error);
      res.status(500).json({ message: 'Registration failed' });
    }
  });

  app.post('/api/auth/signin', async (req, res) => {
    try {
      const validatedData = signInSchema.parse(req.body);
      
      // Find user by email
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        return res.status(400).json({ message: 'User not registered' });
      }

      // Check if user is verified
      if (!user.isVerified) {
        return res.status(400).json({ message: 'Account not verified' });
      }

      // Check password
      if (!user.password || !(await comparePasswords(validatedData.password, user.password))) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }

      // Login user
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: 'Login failed' });
        }
        res.json({ message: 'Login successful', user });
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error('Signin error:', error);
      res.status(500).json({ message: 'Login failed' });
    }
  });

  app.post('/api/auth/verify', async (req, res) => {
    try {
      const { code, email } = req.body;
      
      const isVerified = await storage.verifyUser(email, code);
      if (isVerified) {
        res.json({ message: 'Verification successful' });
      } else {
        res.status(400).json({ message: 'Invalid or expired verification code' });
      }
    } catch (error) {
      console.error('Verification error:', error);
      res.status(500).json({ message: 'Verification failed' });
    }
  });

  app.post('/api/auth/resend-verification', async (req, res) => {
    try {
      const { email } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(400).json({ message: 'User not found' });
      }

      if (user.isVerified) {
        return res.status(400).json({ message: 'Account already verified' });
      }

      // Generate new verification code
      const verificationCode = generateVerificationCode();
      const verificationCodeExpiry = generateVerificationCodeExpiry();

      // Update user with new verification code
      await storage.updateUserVerification(user.id, verificationCode, verificationCodeExpiry);

      // Send verification email
      if (transporter) {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'New verification code for QuestionAction',
          html: `
            <h2>New Verification Code</h2>
            <p>Hello ${user.firstName || 'User'},</p>
            <p>Your new verification code is:</p>
            <h1 style="color: #007bff; font-size: 32px; letter-spacing: 5px;">${verificationCode}</h1>
            <p>This code will expire in 15 minutes.</p>
            <p>Best regards,<br>The QuestionAction Team</p>
          `,
        });
      }

      res.json({ message: 'New verification code sent' });
    } catch (error) {
      console.error('Resend verification error:', error);
      res.status(500).json({ message: 'Failed to resend verification code' });
    }
  });
  
  // API routes for the wiki application
  
  // Get all categories
  app.get("/api/categories", async (req, res) => {
    try {
      // In a real app, this would fetch from database
      const categories = [
        { id: 'world', name: 'World', slug: 'world', icon: 'globe', color: 'blue-600', articleCount: 847 },
        { id: 'history', name: 'History', slug: 'history', icon: 'history', color: 'amber-600', articleCount: 1234 },
        { id: 'science', name: 'Science', slug: 'science', icon: 'flask', color: 'green-600', articleCount: 2156 },
        { id: 'geography', name: 'Geography', slug: 'geography', icon: 'map', color: 'purple-600', articleCount: 923 },
        { id: 'sports', name: 'Sports', slug: 'sports', icon: 'running', color: 'red-600', articleCount: 756 },
        { id: 'entertainment', name: 'Entertainment', slug: 'entertainment', icon: 'film', color: 'pink-600', articleCount: 1089 },
        { id: 'politics', name: 'Politics', slug: 'politics', icon: 'landmark', color: 'indigo-600', articleCount: 678 },
        { id: 'technology', name: 'Technology', slug: 'technology', icon: 'microchip', color: 'cyan-600', articleCount: 1892 },
        { id: 'health', name: 'Health', slug: 'health', icon: 'heartbeat', color: 'emerald-600', articleCount: 1345 },
        { id: 'education', name: 'Education', slug: 'education', icon: 'graduation-cap', color: 'orange-600', articleCount: 987 },
      ];
      
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Get category by slug
  app.get("/api/categories/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      
      // In a real app, this would fetch from database
      const categories = [
        { id: 'world', name: 'World', slug: 'world', icon: 'globe', color: 'blue-600', articleCount: 847 },
        { id: 'history', name: 'History', slug: 'history', icon: 'history', color: 'amber-600', articleCount: 1234 },
        { id: 'science', name: 'Science', slug: 'science', icon: 'flask', color: 'green-600', articleCount: 2156 },
        { id: 'geography', name: 'Geography', slug: 'geography', icon: 'map', color: 'purple-600', articleCount: 923 },
        { id: 'sports', name: 'Sports', slug: 'sports', icon: 'running', color: 'red-600', articleCount: 756 },
        { id: 'entertainment', name: 'Entertainment', slug: 'entertainment', icon: 'film', color: 'pink-600', articleCount: 1089 },
        { id: 'politics', name: 'Politics', slug: 'politics', icon: 'landmark', color: 'indigo-600', articleCount: 678 },
        { id: 'technology', name: 'Technology', slug: 'technology', icon: 'microchip', color: 'cyan-600', articleCount: 1892 },
        { id: 'health', name: 'Health', slug: 'health', icon: 'heartbeat', color: 'emerald-600', articleCount: 1345 },
        { id: 'education', name: 'Education', slug: 'education', icon: 'graduation-cap', color: 'orange-600', articleCount: 987 },
      ];
      
      const category = categories.find(cat => cat.slug === slug);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch category" });
    }
  });

  // Get articles by category
  app.get("/api/categories/:slug/articles", async (req, res) => {
    try {
      const { slug } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 12;
      
      // In a real app, this would fetch from database with pagination
      const mockArticles = Array.from({ length: limit }, (_, i) => ({
        id: (page - 1) * limit + i + 1,
        title: `Sample Article Title ${(page - 1) * limit + i + 1}`,
        content: "This is a sample article description that would normally contain relevant information about the topic.",
        category: slug,
        language: "en",
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        author: `Author ${Math.floor(Math.random() * 10) + 1}`,
      }));
      
      res.json({
        articles: mockArticles,
        pagination: {
          page,
          limit,
          total: 100, // Mock total
          pages: Math.ceil(100 / limit),
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch articles" });
    }
  });

  // Get recent updates
  app.get("/api/recent-updates", async (req, res) => {
    try {
      // In a real app, this would fetch from database
      const recentUpdates = [
        {
          id: '1',
          title: 'Quantum Computing Breakthrough in 2024',
          description: 'New developments in quantum computing technology show promising advances in processing capabilities...',
          category: 'Technology',
          time: '2 hours ago',
          author: 'Dr. Sarah Chen',
          color: 'blue-500',
        },
        {
          id: '2',
          title: 'Climate Change Effects on Marine Life',
          description: 'Recent studies reveal significant impacts of rising ocean temperatures on coral reef ecosystems worldwide...',
          category: 'Science',
          time: '5 hours ago',
          author: 'Marine Biology Team',
          color: 'green-500',
        },
        {
          id: '3',
          title: 'Ancient Roman Archaeological Discovery',
          description: 'Archaeologists uncover well-preserved Roman villa with intricate mosaics in southern Italy...',
          category: 'History',
          time: '1 day ago',
          author: 'Archaeological Institute',
          color: 'amber-500',
        },
      ];
      
      res.json(recentUpdates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent updates" });
    }
  });

  // Upload thumbnail
  app.post("/api/upload/thumbnail", upload.single('thumbnail'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const fileUrl = `/uploads/${req.file.filename}`;
      res.json({ url: fileUrl });
    } catch (error) {
      console.error("Error uploading thumbnail:", error);
      res.status(500).json({ message: "Failed to upload thumbnail" });
    }
  });

  // Profile update route
  app.put("/api/profile", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const validatedData = updateProfileSchema.parse(req.body);
      const updatedUser = await storage.updateUserProfile(req.session.userId, validatedData);
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(400).json({ message: "Invalid profile data" });
    }
  });

  // Article Routes
  
  // Create new article
  app.post("/api/articles", async (req, res) => {
    try {
      let articleData = req.body;
      
      // If user is authenticated, set them as the author
      if (req.session.userId) {
        articleData = {
          ...articleData,
          author: req.session.userId,
        };
      }
      
      const validatedData = insertArticleSchema.parse(articleData);
      const article = await storage.createArticle(validatedData);
      
      // Award 0.1 fame for creating an article
      if (req.session.userId) {
        await storage.updateUserFame(req.session.userId, 0.1);
      }
      
      res.status(201).json(article);
    } catch (error) {
      console.error("Error creating article:", error);
      res.status(400).json({ message: "Invalid article data" });
    }
  });

  // Get all articles
  app.get("/api/articles", async (req, res) => {
    try {
      const articles = await storage.getAllArticles();
      res.json(articles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch articles" });
    }
  });

  // Search articles
  app.get("/api/articles/search", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: "Search query is required" });
      }

      const allArticles = await storage.getAllArticles();
      const searchTerm = q.toLowerCase();
      
      const filteredArticles = allArticles.filter(article => {
        return (
          article.title.toLowerCase().includes(searchTerm) ||
          article.content.toLowerCase().includes(searchTerm) ||
          article.categories.some(cat => cat.toLowerCase().includes(searchTerm))
        );
      });

      res.json(filteredArticles);
    } catch (error) {
      res.status(500).json({ message: "Failed to search articles" });
    }
  });

  // Get trending articles
  app.get("/api/articles/trending", async (req, res) => {
    try {
      const allArticles = await storage.getAllArticles();
      
      // Sort articles by likes count (descending) and take top 20
      const trendingArticles = allArticles
        .sort((a, b) => b.likes - a.likes)
        .slice(0, 20);
      
      res.json(trendingArticles);
    } catch (error) {
      console.error("Error fetching trending articles:", error);
      res.status(500).json({ message: "Failed to fetch trending articles" });
    }
  });

  // Get article by ID
  app.get("/api/articles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const article = await storage.getArticle(id);
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      res.json(article);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch article" });
    }
  });

  // Get articles by category  
  app.get("/api/articles/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const articles = await storage.getArticlesByCategory(category);
      res.json(articles);
    } catch (error) {
      console.error("Error fetching articles by category:", error);
      res.status(500).json({ message: "Failed to fetch articles by category" });
    }
  });

  // Get comments for an article
  app.get("/api/articles/:id/comments", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const comments = await storage.getCommentsByArticle(id);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  // Create a comment
  app.post("/api/articles/:id/comments", async (req, res) => {
    try {
      const articleId = parseInt(req.params.id);
      let commentData = { ...req.body, articleId };
      
      // If user is authenticated, get their profile info
      if (req.session.userId) {
        const user = await storage.getUser(req.session.userId);
        if (user) {
          commentData = {
            ...commentData,
            author: user.id,
            authorName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            authorAlias: user.aliasName,
            authorFame: user.fame || 0,
            authorProfileUrl: user.profileImageUrl,
          };
        }
      }
      
      const comment = await storage.createComment(commentData);
      res.status(201).json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(400).json({ message: "Failed to create comment" });
    }
  });

  // Handle likes/dislikes
  app.post("/api/articles/:id/like", async (req, res) => {
    try {
      const articleId = parseInt(req.params.id);
      const { isLike } = req.body;
      const userIp = req.ip || req.connection.remoteAddress || "unknown";
      
      // Check if user already has a like/dislike for this article
      const existingLike = await storage.getUserLike(articleId, userIp);
      
      // If user clicks the same button they already clicked, remove it
      if (existingLike && existingLike.isLike === isLike) {
        await storage.removeLike(articleId, userIp);
      } else {
        // Create or update the like/dislike
        await storage.createOrUpdateLike({
          articleId,
          userIp,
          isLike
        });
      }

      // Get updated like counts
      const { likes, dislikes } = await storage.getArticleLikeCounts(articleId);
      
      // Update article stats
      await storage.updateArticleStats(articleId, likes, dislikes);

      // Calculate fame based on likes (for article author)
      const article = await storage.getArticle(articleId);
      if (article && article.author) {
        // Get user by author name (assuming author is user ID for now)
        let fameIncrement = 0;
        
        if (likes >= 10000) {
          // Every 10k likes gets additional fame
          const tensOfThousands = Math.floor(likes / 10000);
          fameIncrement = 10 + tensOfThousands; // 10k = 11 fame, 20k = 12 fame, etc.
        } else if (likes >= 1000) {
          fameIncrement = 5; // 1000+ likes = 5 fame
        } else if (likes >= 100) {
          fameIncrement = 1; // 100+ likes = 1 fame
        }
        
        if (fameIncrement > 0) {
          try {
            await storage.updateUserFame(article.author, fameIncrement);
          } catch (error) {
            console.error("Error updating author fame:", error);
          }
        }
      }

      res.json({ success: true, likes, dislikes });
    } catch (error) {
      console.error("Error updating like:", error);
      res.status(400).json({ message: "Failed to update like" });
    }
  });

  // Handle favorites
  app.post("/api/articles/:id/favorite", async (req, res) => {
    try {
      const articleId = parseInt(req.params.id);
      const userIp = req.ip || req.connection.remoteAddress || "unknown";
      
      const favorite = await storage.createOrRemoveFavorite({
        articleId,
        userIp
      });

      res.json({ isFavorited: !!favorite });
    } catch (error) {
      res.status(400).json({ message: "Failed to update favorite" });
    }
  });

  // Get user's like status for an article
  app.get("/api/articles/:id/like-status", async (req, res) => {
    try {
      const articleId = parseInt(req.params.id);
      const userIp = req.ip || req.connection.remoteAddress || "unknown";
      
      const like = await storage.getUserLike(articleId, userIp);
      const favorite = await storage.getUserFavorite(articleId, userIp);
      
      res.json({
        isLiked: like?.isLike === true,
        isDisliked: like?.isLike === false,
        isFavorited: !!favorite
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch like status" });
    }
  });

  // Like/Dislike article
  app.post("/api/articles/:id/like", async (req, res) => {
    try {
      const articleId = parseInt(req.params.id);
      const { isLike } = req.body;
      const userIp = req.ip || req.connection.remoteAddress || "unknown";
      
      const likeData = insertArticleLikeSchema.parse({
        articleId,
        userIp,
        isLike
      });
      
      await storage.createOrUpdateLike(likeData);
      
      // Update article stats
      const article = await storage.getArticle(articleId);
      if (article) {
        // Count likes and dislikes for this article
        const allLikes = await storage.getUserLike(articleId, userIp);
        // This is simplified - in a real app you'd count all likes/dislikes
        const newLikes = isLike ? article.likes + 1 : article.likes;
        const newDislikes = !isLike ? article.dislikes + 1 : article.dislikes;
        await storage.updateArticleStats(articleId, newLikes, newDislikes);
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating like:", error);
      res.status(400).json({ message: "Failed to update like" });
    }
  });

  // Comment Routes
  
  // Create comment
  app.post("/api/comments", async (req, res) => {
    try {
      const validatedData = insertCommentSchema.parse(req.body);
      const comment = await storage.createComment(validatedData);
      res.status(201).json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(400).json({ message: "Invalid comment data" });
    }
  });

  // Get comments for article
  app.get("/api/articles/:id/comments", async (req, res) => {
    try {
      const articleId = parseInt(req.params.id);
      const comments = await storage.getCommentsByArticle(articleId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
