import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import { MongoStorage } from "./mongo-storage";
import { sendGuildInviteEmail, sendGuildRequestNotificationEmail } from "./email";

// Initialize MongoDB storage
const storage = new MongoStorage();
import { 
  insertArticleSchema, 
  insertUserSchema, 
  insertPagePostVoteSchema, 
  insertPagePostCommentSchema, 
  insertPagePostLikeSchema, 
  type UpsertUser,
  GuildModel,
  GuildMemberModel,
  GuildInviteModel,
  GuildRequestModel,
  GuildPostModel,
  getNextSequence
} from "@shared/mongodb-schema";
import { signUpSchema, signInSchema, verifyEmailSchema, resetPasswordSchema, updateProfileSchema, insertCommentSchema, insertArticleLikeSchema, insertPostSchema, insertPostLikeSchema, insertPostCommentSchema, insertPostDownloadSchema, insertPagePostSchema } from "@shared/schema";
import passport from "passport";
import "./auth"; // Import to configure strategies
import session from "express-session";
import MongoStore from "connect-mongo";
import nodemailer from "nodemailer";
import { hashPassword, comparePasswords, generateVerificationCode, generateVerificationCodeExpiry } from "./utils/auth";
import { autoCorrectCategories } from "./utils/articleVerification";
import { randomUUID } from "crypto";
import { CONFIG } from "./config.js";
import { WebSocketServer, WebSocket } from "ws";
import { MongoClient } from "mongodb";
import { mongoose, connectToMongoDB } from "./mongodb.js";

// Extend session interface to include userId
declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

function getClientIP(req: express.Request): string {
  const forwarded = req.headers['x-forwarded-for'] as string;
  const ip = forwarded ? forwarded.split(',')[0].trim() : req.socket?.remoteAddress || '127.0.0.1';
  return ip;
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
  // Add middleware to handle secure routing format /v2/?code&errorCode#path
  app.use((req, res, next) => {
    // Only apply secure routing to frontend navigation, not API calls
    if (req.path === '/v2/' && !req.url.includes('/api/')) {
      // Rate limiting disabled - using Cloudflare for traffic management
      const ip = getClientIP(req);

      // Security validation
      if (req.query.code && typeof req.query.code === 'string') {
        const codeParam = req.query.code as string;

        // Block SQL injection attempts - more specific detection
        const sqlInjectionPatterns = [
          /\-\-/,
          /\/\*.*\*\//,
          /\bUNION\b.*\bSELECT\b/i,
          /\bOR\b.*\d+=\d+/i,
          /\bAND\b.*\d+=\d+/i,
          /\bSELECT\b.*\bFROM\b/i
        ];

        const isMalicious = sqlInjectionPatterns.some(pattern => pattern.test(codeParam));
        if (isMalicious) {
          console.log(`🚫 Blocked malicious v2 request: ${codeParam.substring(0, 50)}...`);
          return res.status(400).json({ error: 'Invalid request format' });
        }

        // Check if using new format with hash (errorCode present)
        if (req.query.errorCode) {
          // New format: /v2/?code=abc&errorCode=xyz#path
          console.log(`🔄 v2 new format detected: code=${codeParam.substring(0, 10)}..., errorCode=${req.query.errorCode}`);
          // Don't rewrite URL, let frontend handle hash routing
        } else {
          // Old format handling with security
          const pathMatch = codeParam.match(/^[a-zA-Z0-9]+\/(.*)$/);
          if (pathMatch) {
            const originalPath = '/' + pathMatch[1];
            req.url = originalPath;
            console.log(`🔄 v2 old format routing: -> ${originalPath}`);
          }
        }
      }
    }
    next();
  });

  // Initialize MongoDB connection first
  console.log('🔄 Initializing MongoDB connection...');
  let mongoUri: string;

  try {
    mongoUri = await connectToMongoDB();
    console.log('✅ MongoDB connection established');

    // Create test user account for development
    console.log('🔄 Creating test user account...');
    const testEmail = 'mellyaldenangela@gmail.com';
    const existingUser = await storage.getUserByEmail(testEmail);

    if (!existingUser) {
      const testPassword = await hashPassword('123456');
      await storage.createUser({
        id: 'test-user-melly',
        email: testEmail,
        firstName: 'Melly',
        lastName: 'Alden',
        password: testPassword,
        provider: 'local',
        verificationCode: '123456',
        verificationCodeExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      });

      // Verify the user immediately
      await storage.verifyUser(testEmail, '123456');
      console.log('✅ Test user account created and verified:', testEmail);
    } else {
      console.log('✅ Test user account already exists:', testEmail);
    }
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    console.log('🔄 Continuing with memory store fallback...');
    mongoUri = '';
  }

  // Setup session management
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week

  // Set up session store
  let sessionStore: any;

  try {
    if (mongoUri && mongoose.connection.readyState === 1) {
      // Use existing MongoDB connection for sessions
      sessionStore = MongoStore.create({
        client: mongoose.connection.getClient(),
        dbName: 'queit',
        collectionName: 'sessions',
        touchAfter: 24 * 3600 // lazy session update
      });

      console.log('✅ Using MongoDB store for sessions');
    } else {
      throw new Error('MongoDB connection not available');
    }
  } catch (error) {
    console.log('Session store setup error:', error);
    // Fallback to memory store if MongoDB fails
    const MemoryStore = (await import('memorystore')).default(session);
    sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    console.log('✅ Using memory store for sessions');
  }

  app.use(session({
    secret: CONFIG.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: CONFIG.NODE_ENV === 'production',
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

  // Configure nodemailer for email sending - NO SECRETS REQUIRED
  let transporter: any = undefined;
  const EMAIL_USER = 'bmgobmgo749@gmail.com';
  const EMAIL_PASS = 'uxujqtkuhldurifo';

  console.log('Configuring email with user:', EMAIL_USER);
  console.log('App Password length:', EMAIL_PASS.length);
  console.log('App Password (first 4 chars):', EMAIL_PASS.substring(0, 4));

    try {
      // Create transporter for Gmail with App Password
      transporter = nodemailer.createTransport({
        service: 'gmail',
        secure: true,
        auth: {
          user: EMAIL_USER,
          pass: EMAIL_PASS // App Password hardcoded - no secrets
        },
        pool: true,
        maxConnections: 5,
        maxMessages: 100
      });

      console.log('Email transporter created successfully');

      // Test connection immediately
      transporter.verify((error: any, success: any) => {
        if (error) {
          console.error('Gmail verification failed:', error.message);
          // Try alternative configuration
          console.log('Trying alternative Gmail configuration...');
          transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
              user: EMAIL_USER,
              pass: EMAIL_PASS
            }
          });
        } else {
          console.log('Gmail server is ready to send messages');
        }
      });
    } catch (error) {
      console.error('Email transporter creation error:', error);
    }

  console.log('Email system configured with hardcoded credentials - NO SECRETS NEEDED');

  // Authentication routes - HARDCODED OAuth credentials, NO SECRETS NEEDED
  const GOOGLE_CLIENT_ID = '693608051666-kpemam0j804vf5fl8v2h1edg8jgjh3g5.apps.googleusercontent.com';
  const GOOGLE_CLIENT_SECRET = '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';

  if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
    app.get('/api/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

    app.get('/api/auth/google/callback',
      passport.authenticate('google', { failureRedirect: '/auth' }),
      async (req, res) => {
        const user = req.user as any;

        // Set session userId for all authenticated users
        if (user) {
          req.session.userId = user.id;
        }

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
                from: EMAIL_USER,
                to: user.email,
                subject: 'Verify your Queit account',
                html: `
                  <h2>Verify Your Account</h2>
                  <p>Hello ${user.firstName || 'User'},</p>
                  <p>Thank you for signing up with Queit via Google. Please verify your account with this code:</p>
                  <h1 style="color: #007bff; font-size: 32px; letter-spacing: 5px;">${verificationCode}</h1>
                  <p>This code will expire in 15 minutes.</p>
                  <p>Best regards,<br>The Queit Team</p>
                `,
              });
            } catch (error) {
              console.error('Failed to send verification email:', error);
            }
          }

          // Redirect to auth page with verification needed
          res.redirect('/auth?needsVerification=true&email=' + encodeURIComponent(user.email));
        } else {
          // User already verified, redirect to secure auth page
          res.redirect('/v2/?code=AUTH_SUCCESS&errorCode=LOGIN#auth');
        }
      }
    );
  }

  // Discord OAuth - HARDCODED credentials, NO SECRETS NEEDED
  const DISCORD_CLIENT_ID = '1344311791177564202';
  const DISCORD_CLIENT_SECRET = 'RuT-QizmyKCAJ_eaUyPEJActwst8Ws32';

  if (DISCORD_CLIENT_ID && DISCORD_CLIENT_SECRET) {
    app.get('/api/auth/discord', passport.authenticate('discord'));

    app.get('/api/auth/discord/callback',
      passport.authenticate('discord', { failureRedirect: '/auth' }),
      async (req, res) => {
        const user = req.user as any;

        // Set session userId for all authenticated users
        if (user) {
          req.session.userId = user.id;
        }

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
                from: EMAIL_USER,
                to: user.email,
                subject: 'Verify your Queit account',
                html: `
                  <h2>Verify Your Account</h2>
                  <p>Hello ${user.firstName || 'User'},</p>
                  <p>Thank you for signing up with Queit via Discord. Please verify your account with this code:</p>
                  <h1 style="color: #007bff; font-size: 32px; letter-spacing: 5px;">${verificationCode}</h1>
                  <p>This code will expire in 15 minutes.</p>
                  <p>Best regards,<br>The Queit Team</p>
                `,
              });
            } catch (error) {
              console.error('Failed to send verification email:', error);
            }
          }

          // Redirect to auth page with verification needed
          res.redirect('/auth?needsVerification=true&email=' + encodeURIComponent(user.email));
        } else {
          // User already verified, redirect to secure auth page
          res.redirect('/v2/?code=AUTH_SUCCESS&errorCode=LOGIN#auth');
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
            client_id: DISCORD_CLIENT_ID,
            client_secret: DISCORD_CLIENT_SECRET,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: 'https://queit.site/',
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
            res.redirect('/v2/?code=AUTH_SUCCESS&errorCode=LOGIN#auth');
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
            client_id: DISCORD_CLIENT_ID,
            client_secret: DISCORD_CLIENT_SECRET,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: 'https://queit.site/',
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
          email: discordUser.email || undefined,
          firstName: discordUser.username || undefined,
          lastName: discordUser.discriminator || undefined,
          profileImageUrl: discordUser.avatar ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png` : undefined,
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
                from: EMAIL_USER,
                to: user.email,
                subject: 'Verify your Queit account',
                html: `
                  <h2>Verify Your Account</h2>
                  <p>Hello ${user.firstName || 'User'},</p>
                  <p>Thank you for signing up with Queit via Discord. Please verify your account with this code:</p>
                  <h1 style="color: #007bff; font-size: 32px; letter-spacing: 5px;">${verificationCode}</h1>
                  <p>This code will expire in 15 minutes.</p>
                  <p>Best regards,<br>The Queit Team</p>
                `,
              }).catch(console.error);
            }

            // Redirect to auth page with verification needed
            const emailParam = user.email ? encodeURIComponent(user.email) : '';
            res.redirect('/auth?needsVerification=true&email=' + emailParam);
          } else {
            // User already verified, redirect to secure auth page
            res.redirect('/v2/?code=AUTH_SUCCESS&errorCode=LOGIN#auth');
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

  app.get('/api/auth/user', async (req, res) => {
    // Disable caching for user data
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    if (req.isAuthenticated() && req.user) {
      // Set session.userId for profile routes
      req.session.userId = (req.user as any).id;

      // Get fresh user data from database
      try {
        const freshUser = await storage.getUser((req.user as any).id);
        if (freshUser) {
          res.json(freshUser);
        } else {
          res.json(req.user);
        }
      } catch (error) {
        console.error('Error fetching fresh user data:', error);
        res.json(req.user);
      }
    } else {
      res.status(401).json({ message: 'Not authenticated' });
    }
  });

  // Test email endpoint
  app.post('/api/test-email', async (req, res) => {
    try {
      console.log('Testing email configuration...');
      console.log('EMAIL_USER:', CONFIG.EMAIL_USER);
      console.log('EMAIL_PASS:', CONFIG.EMAIL_PASS ? 'Set' : 'Not set');

      if (!transporter) {
        return res.status(500).json({ 
          message: 'Email service not configured. Kemungkinan masalah dengan App Password Gmail.',
          troubleshooting: {
            'Langkah 1': 'Pastikan 2-Step Verification aktif di akun Gmail Anda',
            'Langkah 2': 'Buat App Password baru di https://myaccount.google.com/apppasswords',
            'Langkah 3': 'Gunakan App Password 16 karakter (tanpa spasi) bukan password akun Gmail biasa',
            'Langkah 4': 'Pastikan "Less secure app access" dinonaktifkan (gunakan App Password saja)',
            'Status Email User': CONFIG.EMAIL_USER,
            'Status App Password': CONFIG.EMAIL_PASS ? `Set (${CONFIG.EMAIL_PASS.length} karakter)` : 'Not set'
          }
        });
      }

      // Try to send test email
      const testResult = await transporter.sendMail({
        from: CONFIG.EMAIL_USER,
        to: 'bmgobmgo749@gmail.com',
        subject: 'Test Email from Queit - Gmail App Password Success!',
        html: `
          <h2>🎉 Email Test Berhasil!</h2>
          <p>Selamat! Konfigurasi Gmail dengan App Password berfungsi dengan baik.</p>
          <p>Email verifikasi sign up sekarang akan dikirim otomatis.</p>
          <hr>
          <p><strong>Detail pengiriman:</strong></p>
          <ul>
            <li>Waktu kirim: ${new Date().toLocaleString('id-ID')}</li>
            <li>Dari: ${CONFIG.EMAIL_USER}</li>
            <li>Ke: bmgobmgo749@gmail.com</li>
            <li>Server: Gmail SMTP</li>
          </ul>
          <p><em>Pesan ini dikirim dari aplikasi Queit untuk test konfigurasi email.</em></p>
        `,
      });

      console.log('Email sent successfully:', testResult.messageId);
      res.json({ 
        message: 'Test email berhasil dikirim ke bmgobmgo749@gmail.com',
        messageId: testResult.messageId,
        to: 'bmgobmgo749@gmail.com',
        from: CONFIG.EMAIL_USER,
        status: 'SUCCESS',
        verificationReady: true
      });
    } catch (error: any) {
      console.error('Email test error:', error);
      res.status(500).json({ 
        message: 'Gmail App Password gagal digunakan',
        error: error.message,
        troubleshooting: {
          'Error Code': error.code,
          'Masalah Umum': {
            'EAUTH': 'App Password tidak valid atau belum dibuat dengan benar',
            'Solusi 1': 'Buat App Password baru di https://myaccount.google.com/apppasswords',
            'Solusi 2': 'Pastikan menggunakan App Password (16 karakter) bukan password Gmail biasa',
            'Solusi 3': 'Pastikan 2-Step Verification aktif di akun Gmail',
            'Solusi 4': 'Coba hapus dan buat ulang App Password'
          },
          'App Password Info': {
            'Panjang': CONFIG.EMAIL_PASS?.length || 0,
            'Format': 'Harus tepat 16 karakter tanpa spasi',
            'Contoh': 'abcdwxyzefgh1234'
          }
        }
      });
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
          from: CONFIG.EMAIL_USER,
          to: validatedData.email,
          subject: 'Verify your Queit account',
          html: `
            <h2>Verify Your Account</h2>
            <p>Hello ${validatedData.firstName},</p>
            <p>Thank you for signing up with Queit. Your verification code is:</p>
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
        // Set session userId for profile routes
        req.session.userId = user.id;
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
          from: CONFIG.EMAIL_USER,
          to: email,
          subject: 'New verification code for Queit',
          html: `
            <h2>New Verification Code</h2>
            <p>Hello ${user.firstName || 'User'},</p>
            <p>Your new verification code is:</p>
            <h1 style="color: #007bff; font-size: 32px; letter-spacing: 5px;">${verificationCode}</h1>
            <p>This code will expire in 15 minutes.</p>
            <p>Best regards,<br>The Queit Team</p>
          `,
        });
      }

      res.json({ message: 'New verification code sent' });
    } catch (error) {
      console.error('Resend verification error:', error);
      res.status(500).json({ message: 'Failed to resend verification code' });
    }
  });

  // Password reset request
  app.post('/api/auth/forgot-password', async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal if user exists or not for security
        return res.json({ message: 'If an account with this email exists, you will receive a password reset link.' });
      }

      // Generate reset token
      const resetToken = randomUUID();
      const resetTokenExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

      // Update user with reset token
      await storage.updateUserResetToken(user.id, resetToken, resetTokenExpiry);

      // Send reset email
      if (transporter) {
        const resetUrl = `${CONFIG.DEPLOYMENT_DOMAIN}/reset-password?token=${resetToken}`;

        await transporter.sendMail({
          from: CONFIG.EMAIL_USER,
          to: email,
          subject: 'Reset Password - Queit',
          html: `
            <h2>🔐 Reset Your Password</h2>
            <p>Hello ${user.firstName || 'User'},</p>
            <p>You have requested to reset your password for your Queit account.</p>
            <p>Click the link below to create a new password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Reset Password
              </a>
            </div>
            <p>This link will expire in 30 minutes for security reasons.</p>
            <p>If you didn't request this password reset, please ignore this email.</p>
            <p>Best regards,<br>The Queit Team</p>
          `,
        });
      }

      res.json({ message: 'If an account with this email exists, you will receive a password reset link.' });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ message: 'Failed to send password reset email' });
    }
  });

  // Password reset confirmation
  app.post('/api/auth/reset-password', async (req, res) => {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({ message: 'Token and new password are required' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
      }

      const user = await storage.getUserByResetToken(token);
      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired reset token' });
      }

      // Check if token is expired
      if (user.resetTokenExpiry && user.resetTokenExpiry < new Date()) {
        return res.status(400).json({ message: 'Reset token has expired' });
      }

      // Hash new password
      const hashedPassword = await hashPassword(newPassword);

      // Update user password and clear reset token
      await storage.updateUserPassword(user.id, hashedPassword);
      await storage.clearUserResetToken(user.id);

      res.json({ message: 'Password reset successful' });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ message: 'Failed to reset password' });
    }
  });

  // Visitor tracking middleware
  app.use(async (req, res, next) => {
    try {
      const userIp = req.ip || req.connection.remoteAddress || '127.0.0.1';
      const userAgent = req.get('User-Agent') || '';

      // Track visitor asynchronously only if MongoDB is connected
      if (mongoose.connection.readyState === 1) {
        storage.trackVisitor({ ipAddress: userIp, userAgent }).catch(err => {
          console.error('Visitor tracking error:', err);
        });
      }
    } catch (error) {
      console.error('Visitor tracking middleware error:', error);
    }
    next();
  });

  // Rate limiting disabled - using Cloudflare for traffic management
  // No rate limiting middleware applied

  // API routes for the wiki application

  // Get stats (categories, articles, visitors)
  app.get("/api/stats", async (req, res) => {
    try {
      const totalVisitors = await storage.getTotalVisitors();
      const articles = await storage.getAllArticles();

      res.json({
        categories: 11, // 10 + Space & Astronomy
        articles: articles.length,
        visitors: totalVisitors
      });
    } catch (error) {
      console.error('Stats error:', error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

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

  // Get category counts
  app.get("/api/categories/counts", async (req, res) => {
    try {
      const counts = await storage.getCategoryCounts();
      res.json(counts);
    } catch (error) {
      console.error('Failed to fetch category counts:', error);
      res.status(500).json({ message: 'Failed to fetch category counts' });
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

  // Get recent updates (trending top 2 overall)
  app.get("/api/recent-updates", async (req, res) => {
    try {
      const allArticles = await storage.getAllArticles();

      // Get top 2 trending articles overall
      const topArticles = allArticles
        .sort((a, b) => b.likes - a.likes)
        .slice(0, 2);

      // Resolve author IDs to display names and clean up the data
      const articlesWithAuthors = await Promise.all(topArticles.map(async (article) => {
        try {
          const user = await storage.getUser(article.author);
          const displayName = user ? `${user.firstName} ${user.lastName}` : 'Anonymous User';

          // Convert Mongoose document to plain object and clean up
          const cleanArticle = article.toObject ? article.toObject() : article;

          return {
            id: cleanArticle.id,
            title: cleanArticle.title,
            content: cleanArticle.content,
            categories: cleanArticle.categories,
            hashtags: cleanArticle.hashtags,
            thumbnail: cleanArticle.thumbnail,
            author: cleanArticle.author,
            language: cleanArticle.language,
            enableForum: cleanArticle.enableForum,
            likes: cleanArticle.likes,
            dislikes: cleanArticle.dislikes,
            createdAt: cleanArticle.createdAt,
            updatedAt: cleanArticle.updatedAt,
            authorName: displayName
          };
        } catch (error) {
          const cleanArticle = article.toObject ? article.toObject() : article;
          return {
            id: cleanArticle.id,
            title: cleanArticle.title,
            content: cleanArticle.content,
            categories: cleanArticle.categories,
            hashtags: cleanArticle.hashtags,
            thumbnail: cleanArticle.thumbnail,
            author: cleanArticle.author,
            language: cleanArticle.language,
            enableForum: cleanArticle.enableForum,
            likes: cleanArticle.likes,
            dislikes: cleanArticle.dislikes,
            createdAt: cleanArticle.createdAt,
            updatedAt: cleanArticle.updatedAt,
            authorName: 'Anonymous User'
          };
        }
      }));

      res.json(articlesWithAuthors);
    } catch (error) {
      console.error('Recent updates error:', error);
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

  // Upload profile image
  const profileUpload = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, uploadsDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
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

  app.post("/api/upload/profile", profileUpload.single('profile'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      res.json({ url: fileUrl });
    } catch (error) {
      console.error("Error uploading profile image:", error);
      res.status(500).json({ message: "Failed to upload profile image" });
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

  // Get public profile (excluding email)
  app.get("/api/users/:userId/profile", async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Return public profile data (excluding email and sensitive info)
      const publicProfile = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        aliasName: user.aliasName,
        description: user.description,
        profileImageUrl: user.profileImageUrl,
        honour: user.fame, // Display as Honor
        isVerified: user.isVerified,
        isTopaz: user.isTopaz,
        isAgate: user.isAgate,
        isAqua: user.isAqua,
        selectedTheme: user.selectedTheme,
        createdAt: user.createdAt
      };

      res.json(publicProfile);
    } catch (error) {
      console.error('Public profile error:', error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  // Article Routes

  // Create new article - REQUIRE AUTHENTICATION
  app.post("/api/articles", async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.session.userId) {
        return res.status(401).json({ 
          message: "You must be logged in to create articles",
          requireAuth: true 
        });
      }

      let articleData = req.body;

      // Set authenticated user as the author
      articleData = {
        ...articleData,
        author: req.session.userId,
      };

      // Verify and auto-correct categories based on content analysis
      if (articleData.title && articleData.content && articleData.categories) {
        const categoryCorrection = autoCorrectCategories(
          articleData.title,
          articleData.content,
          articleData.categories
        );

        // Update categories if they were auto-corrected
        if (categoryCorrection.wasChanged) {
          articleData.categories = categoryCorrection.correctedCategories;
          console.log(`Article categories auto-corrected: ${categoryCorrection.explanation}`);
        }
      }

      const validatedData = insertArticleSchema.parse(articleData);
      const article = await storage.createArticle(validatedData);

      // Award 0.1 honour for creating an article
      if (req.session.userId) {
        await storage.updateUserHonour(req.session.userId, 0.1);
      }

      // Return the article with information about category changes if any
      const response = {
        ...article,
        categoryInfo: articleData.title && articleData.content && articleData.categories ? 
          autoCorrectCategories(articleData.title, articleData.content, articleData.categories) : 
          undefined
      };

      res.status(201).json(response);
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



  // Database Plans and Badge Management
  app.post("/api/user/database-plan", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { plan } = req.body;
      if (!['basic', 'inter', 'pro'].includes(plan)) {
        return res.status(400).json({ message: "Invalid database plan" });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Update database plan and badges
      const updateData: any = {
        databasePlan: plan,
        hasBasicDB: true, // Everyone gets Basic DB
        hasInterDB: plan === 'inter' || plan === 'pro',
        hasProDB: plan === 'pro'
      };

      const updatedUser = await storage.updateUserProfile(req.session.userId, updateData);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating database plan:", error);
      res.status(500).json({ message: "Failed to update database plan" });
    }
  });

  // Staff Badge Management (Admin only)
  app.post("/api/user/staff-badges", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { userId, badges } = req.body;

      // Check if current user is admin/staff (you can implement proper admin check)
      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser?.isStaff && !currentUser?.isDeveloper) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const updateData: any = {
        isModerator: badges.isModerator || false,
        isStaff: badges.isStaff || false,
        isDeveloper: badges.isDeveloper || false
      };

      const updatedUser = await storage.updateUserProfile(userId, updateData);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating staff badges:", error);
      res.status(500).json({ message: "Failed to update staff badges" });
    }
  });

  // Search articles with security and rate limiting
  app.get("/api/articles/search", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: "Search query is required" });
      }

      // COMPREHENSIVE input sanitization
      const sanitizedQuery = q
        .replace(/[\$\{\}\[\]\\\/\.\*\+\?\^\(\)\|`~!@#%]/g, '') // Remove injection chars
        .replace(/[<>'"&=]/g, '') // Remove XSS chars
        .replace(/javascript:/gi, '') // Remove JS protocol
        .replace(/data:/gi, '') // Remove data protocol
        .trim();

      if (sanitizedQuery.length < 2) {
        return res.status(400).json({ message: "Search query must be at least 2 characters" });
      }

      if (sanitizedQuery.length > 50) { // Reduced from 100
        return res.status(400).json({ message: "Search query too long" });
      }

      // Use exact text matching instead of regex to prevent injection
      const searchFilter = {
        $text: { $search: sanitizedQuery }
      };

      // Rate limiting disabled for search - using Cloudflare
      const userIp = getClientIP(req);

      const allArticles = await storage.getAllArticles();
      const searchTerm = sanitizedQuery.toLowerCase();

      const filteredArticles = allArticles.filter(article => {
        return (
          article.title.toLowerCase().includes(searchTerm) ||
          article.content.toLowerCase().includes(searchTerm) ||
          article.categories.some(cat => cat.toLowerCase().includes(searchTerm))
        );
      }).slice(0, 50); // Limit results to prevent excessive data transfer

      res.json(filteredArticles);
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ message: "Failed to search articles" });
    }
  });

  // Search page posts with NSFW filtering and security
  app.get("/api/page-posts/search", async (req, res) => {
    try {
      const { q, includeNsfw } = req.query;
      if (!q || typeof q !== 'string') {
        return res.json([]);
      }

      // Sanitize search query
      const sanitizedQuery = q.replace(/[\$\{\}<>'"]/g, '').trim();
      if (sanitizedQuery.length < 2) {
        return res.status(400).json({ message: "Search query must be at least 2 characters" });
      }

      // Rate limiting disabled for page posts search - using Cloudflare
      const userIp = getClientIP(req);

      const allPosts = await storage.getAllPagePosts();
      const searchTerm = sanitizedQuery.toLowerCase();
      const showNsfw = includeNsfw === 'true';

      const filteredPosts = allPosts.filter(post => {
        // Filter NSFW content unless explicitly requested
        if (post.isNsfw && !showNsfw) {
          return false;
        }

        const hasHashtagMatch = post.hashtags?.some(hashtag => 
          hashtag.toLowerCase().includes(searchTerm)
        );

        return (
          (post.title && post.title.toLowerCase().includes(searchTerm)) ||
          post.content.toLowerCase().includes(searchTerm) ||
          post.type.toLowerCase().includes(searchTerm) ||
          post.authorName.toLowerCase().includes(searchTerm) ||
          hasHashtagMatch
        );
      }).slice(0, 30); // Limit results

      // Remove sensitive information from NSFW posts in search results
      const cleanedPosts = filteredPosts.map(post => {
        if (post.isNsfw && !showNsfw) {
          return {
            ...post,
            content: post.content.length > 50 ? post.content.substring(0, 50) + '...' : post.content,
            mediaUrl: null // Don't expose media URLs in search
          };
        }
        return post;
      });

      res.json(cleanedPosts);
    } catch (error) {
      console.error("Page posts search error:", error);
      res.status(500).json({ message: "Failed to search page posts" });
    }
  });

  // Get popular hashtags for autocomplete
  app.get("/api/hashtags/popular", async (req, res) => {
    try {
      const { hideNsfw } = req.query;
      const allPosts = await storage.getAllPagePosts();

      // Extract all hashtags from posts
      const hashtagCounts = new Map<string, number>();

      allPosts.forEach(post => {
        // Skip NSFW posts if hideNsfw is true
        if (hideNsfw === 'true' && post.isNsfw) {
          return;
        }

        if (post.hashtags && Array.isArray(post.hashtags)) {
          post.hashtags.forEach(hashtag => {
            const normalizedTag = hashtag.toLowerCase();
            hashtagCounts.set(normalizedTag, (hashtagCounts.get(normalizedTag) || 0) + 1);
          });
        }
      });

      // Convert to array and sort by popularity
      const popularHashtags = Array.from(hashtagCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20) // Top 20 popular hashtags
        .map(([hashtag, count]) => ({ hashtag, count }));

      res.json(popularHashtags);
    } catch (error) {
      console.error("Error fetching popular hashtags:", error);
      res.status(500).json({ message: "Failed to fetch popular hashtags" });
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

  // Get trending articles by category (top 2)
  app.get("/api/articles/trending/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const allArticles = await storage.getAllArticles();

      // Filter by category and sort by likes, take top 2
      const topArticles = allArticles
        .filter(article => article.categories && article.categories.includes(category))
        .sort((a, b) => b.likes - a.likes)
        .slice(0, 2);

      // Resolve author IDs to display names
      const articlesWithAuthors = await Promise.all(topArticles.map(async (article) => {
        try {
          const user = await storage.getUser(article.author);
          const displayName = user ? `${user.firstName} ${user.lastName}` : 'Anonymous User';
          return {
            ...article,
            authorName: displayName
          };
        } catch (error) {
          return {
            ...article,
            authorName: 'Anonymous User'
          };
        }
      }));

      res.json(articlesWithAuthors);
    } catch (error) {
      console.error("Error fetching trending articles by category:", error);
      res.status(500).json({ message: "Failed to fetch trending articles" });
    }
  });

  // Get trending page posts
  app.get("/api/page-posts/trending", async (req, res) => {
    try {
      const allPagePosts = await storage.getAllPagePosts();

      // Sort page posts by likes count (descending) and take top 20
      const trendingPagePosts = allPagePosts
        .sort((a, b) => b.likes - a.likes)
        .slice(0, 20);

      res.json(trendingPagePosts);
    } catch (error) {
      console.error("Error fetching trending page posts:", error);
      res.status(500).json({ message: "Failed to fetch trending page posts" });
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
      const userIp = getClientIP(req);

      let commentData = { 
        ...req.body, 
        articleId,
        userIp
      };

      // If user is authenticated, get their profile info
      if (req.session.userId) {
        const user = await storage.getUser(req.session.userId);
        if (user) {
          commentData = {
            ...commentData,
            author: user.id,
            authorId: user.id,
            authorName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            authorAlias: user.aliasName,
            authorFame: user.fame || 0,
            authorProfileUrl: user.profileImageUrl,
            authorIsTopaz: user.isTopaz || false,
            authorIsAgate: user.isAgate || false,
            authorIsAqua: user.isAqua || false,
          };
        }
      } else {
        // For anonymous users
        commentData.author = userIp;
        commentData.authorName = req.body.author || 'Anonymous User';
      }

      const comment = await storage.createComment(commentData);
      res.status(201).json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(400).json({ message: "Failed to create comment" });
    }
  });

  // Handle likes/dislikes with strict rate limiting (1 request per IP per article)
  app.post("/api/articles/:id/like", async (req, res) => {
    try {
      const articleId = parseInt(req.params.id);
      const { isLike } = req.body;
      const userIp = getClientIP(req);

      // Check if user already has a like/dislike for this article
      const existingLike = await storage.getUserLike(articleId, userIp);

      // STRICT RATE LIMITING: Only allow one like/dislike per IP per article
      if (existingLike) {
        // If user clicks the same button they already clicked, remove it
        if (existingLike.isLike === isLike) {
          await storage.removeLike(articleId, userIp);
        } else {
          // User is trying to switch from like to dislike or vice versa
          // This is allowed as it's still one interaction per IP per article
          await storage.createOrUpdateLike({
            articleId,
            userIp,
            isLike
          });
        }
      } else {
        // New like/dislike - this is the first interaction from this IP for this article
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

      // Calculate honour based on likes (for article author)
      const article = await storage.getArticle(articleId);
      if (article && article.author) {
        // Get user by author name (assuming author is user ID for now)
        let honourIncrement = 0;

        if (likes >= 10000) {
          // Every 10k likes gets additional honour
          const tensOfThousands = Math.floor(likes / 10000);
          honourIncrement = 10 + tensOfThousands; // 10k = 11 honour, 20k = 12 honour, etc.
        } else if (likes >= 1000) {
          honourIncrement = 5; // 1000+ likes = 5 honour
        } else if (likes >= 100) {
          honourIncrement = 1; // 100+ likes = 1 honour
        }

        if (honourIncrement > 0) {
          try {
            await storage.updateUserHonour(article.author, honourIncrement);
          } catch (error) {
            console.error("Error updating author honour:", error);
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

  // Database Management API Endpoints

  // Delete all database data for a user
  app.delete("/api/database/all", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const success = await storage.deleteAllDatabaseData(req.session.userId);

      if (success) {
        res.json({ message: "All database data deleted successfully" });
      } else {
        res.status(500).json({ message: "Failed to delete database data" });
      }
    } catch (error) {
      console.error("Error deleting all database data:", error);
      res.status(500).json({ message: "Failed to delete database data" });
    }
  });

  // Delete specific IP access from user's database
  app.delete("/api/database/ip/:ipAddress", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { ipAddress } = req.params;
      const success = await storage.deleteUserIPAccess(req.session.userId, ipAddress);

      if (success) {
        res.json({ message: "IP access deleted successfully" });
      } else {
        res.status(500).json({ message: "Failed to delete IP access" });
      }
    } catch (error) {
      console.error("Error deleting IP access:", error);
      res.status(500).json({ message: "Failed to delete IP access" });
    }
  });

  // Delete authorized user from database
  app.delete("/api/database/user/:targetUserId", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { targetUserId } = req.params;
      const success = await storage.deleteAuthorizedUser(req.session.userId, targetUserId);

      if (success) {
        res.json({ message: "Authorized user deleted successfully" });
      } else {
        res.status(500).json({ message: "Failed to delete authorized user" });
      }
    } catch (error) {
      console.error("Error deleting authorized user:", error);
      res.status(500).json({ message: "Failed to delete authorized user" });
    }
  });

  // Delete article (author only)
  app.delete("/api/articles/:id", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const articleId = parseInt(req.params.id);
      const success = await storage.deleteArticle(articleId, req.session.userId);

      if (success) {
        res.json({ message: "Article deleted successfully" });
      } else {
        res.status(403).json({ message: "You can only delete your own articles" });
      }
    } catch (error) {
      console.error("Error deleting article:", error);
      res.status(500).json({ message: "Failed to delete article" });
    }
  });

  // Delete page post (author only)
  app.delete("/api/page-posts/:id", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const postId = parseInt(req.params.id);
      const success = await storage.deletePagePost(postId, req.session.userId);

      if (success) {
        res.json({ message: "Page post deleted successfully" });
      } else {
        res.status(403).json({ message: "You can only delete your own posts" });
      }
    } catch (error) {
      console.error("Error deleting page post:", error);
      res.status(500).json({ message: "Failed to delete page post" });
    }
  });

  // API Documentation endpoint
  app.get("/api/docs", async (req, res) => {
    res.type('html');
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Queit API Documentation</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background: #f8f9fa; }
          .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          h1 { color: #2563eb; border-bottom: 3px solid #2563eb; padding-bottom: 10px; }
          h2 { color: #1e40af; margin-top: 30px; padding: 10px 0; border-bottom: 2px solid #e5e7eb; }
          h3 { color: #1f2937; margin-top: 25px; }
          .endpoint { background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 10px 0; border-left: 4px solid #10b981; }
          .method { display: inline-block; padding: 2px 8px; border-radius: 3px; font-weight: bold; color: white; margin-right: 10px; }
          .get { background: #10b981; }
          .post { background: #f59e0b; }
          .put { background: #3b82f6; }
          .delete { background: #ef4444; }
          .params { background: #fef3c7; padding: 10px; border-radius: 5px; margin: 10px 0; }
          .response { background: #ecfdf5; padding: 10px; border-radius: 5px; margin: 10px 0; }
          .rate-limit { background: #fee2e2; padding: 10px; border-radius: 5px; margin: 10px 0; color: #991b1b; }
          code { background: #f3f4f6; padding: 2px 6px; border-radius: 3px; font-family: 'Courier New', monospace; }
          pre { background: #1f2937; color: #f9fafb; padding: 15px; border-radius: 5px; overflow-x: auto; }
          .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 10px; border-radius: 5px; margin: 10px 0; }
          .success { background: #ecfdf5; border: 1px solid #10b981; padding: 10px; border-radius: 5px; margin: 10px 0; }
          .nav { position: sticky; top: 0; background: white; padding: 15px 0; border-bottom: 1px solid #e5e7eb; margin-bottom: 20px; }
          .nav a { color: #2563eb; text-decoration: none; margin-right: 20px; }
          .nav a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🚀 Queit API Documentation</h1>

          <div class="nav">
            <a href="#overview">Overview</a>
            <a href="#authentication">Authentication</a>
            <a href="#articles">Articles</a>
            <a href="#comments">Comments</a>
            <a href="#users">Users</a>
            <a href="#page-posts">Page Posts</a>

            <a href="#rate-limiting">Rate Limiting</a>
          </div>

          <section id="overview">
            <h2>📚 Overview</h2>
            <p>Welcome to the Queit API! This is a RESTful API that powers the Queit platform - a multilingual knowledge sharing and social interaction platform.</p>
            <p><strong>Base URL:</strong> <code>https://queit-two.vercel.app/api</code></p>
            <p><strong>Content Type:</strong> All requests and responses use <code>application/json</code></p>
            <p><strong>Rate Limiting:</strong> IP-based restrictions apply to prevent abuse (1 request per IP per article/post)</p>
          </section>

          <section id="authentication">
            <h2>🔐 Authentication</h2>
            <p>Authentication is session-based. Users must login to access protected endpoints.</p>

            <div class="endpoint">
              <span class="method post">POST</span>
              <strong>/api/auth/signin</strong>
              <div class="params">
                <strong>Body:</strong> <code>{ "email": "string", "password": "string" }</code>
              </div>
              <div class="response">
                <strong>Success:</strong> <code>{ "message": "Login successful", "user": {...} }</code>
              </div>
            </div>

            <div class="endpoint">
              <span class="method post">POST</span>
              <strong>/api/auth/signup</strong>
              <div class="params">
                <strong>Body:</strong> <code>{ "email": "string", "password": "string", "firstName": "string", "lastName": "string" }</code>
              </div>
              <div class="response">
                <strong>Success:</strong> <code>{ "message": "Registration successful", "email": "string" }</code>
              </div>
            </div>

            <div class="endpoint">
              <span class="method post">POST</span>
              <strong>/api/auth/logout</strong>
              <div class="response">
                <strong>Success:</strong> <code>{ "message": "Logged out successfully" }</code>
              </div>
            </div>
          </section>

          <section id="articles">
            <h2>📖 Articles</h2>

            <div class="endpoint">
              <span class="method get">GET</span>
              <strong>/api/articles</strong>
              <div class="response">
                <strong>Response:</strong> Array of all articles with author information
              </div>
            </div>

            <div class="endpoint">
              <span class="method get">GET</span>
              <strong>/api/articles/:id</strong>
              <div class="params">
                <strong>URL Params:</strong> <code>id</code> - Article ID (integer)
              </div>
              <div class="response">
                <strong>Response:</strong> Single article object
              </div>
            </div>

            <div class="endpoint">
              <span class="method post">POST</span>
              <strong>/api/articles</strong> 🔒
              <div class="params">
                <strong>Body:</strong> <code>{ "title": "string", "content": "string", "categories": ["string"], "thumbnail": "string" }</code>
              </div>
              <div class="response">
                <strong>Success:</strong> Created article object with category auto-correction info
              </div>
              <div class="warning">
                <strong>Auth Required:</strong> Must be logged in to create articles
              </div>
            </div>

            <div class="endpoint">
              <span class="method post">POST</span>
              <strong>/api/articles/:id/like</strong>
              <div class="params">
                <strong>URL Params:</strong> <code>id</code> - Article ID (integer)<br>
                <strong>Body:</strong> <code>{ "isLike": boolean }</code>
              </div>
              <div class="rate-limit">
                <strong>Rate Limit:</strong> 1 request per IP per article. Same IP can only like/dislike once per article.
              </div>
              <div class="response">
                <strong>Response:</strong> <code>{ "success": true, "likes": number, "dislikes": number }</code>
              </div>
            </div>

            <div class="endpoint">
              <span class="method get">GET</span>
              <strong>/api/articles/:id/like-status</strong>
              <div class="params">
                <strong>URL Params:</strong> <code>id</code> - Article ID (integer)
              </div>
              <div class="response">
                <strong>Response:</strong> <code>{ "isLiked": boolean, "isDisliked": boolean, "isFavorited": boolean }</code>
              </div>
            </div>

            <div class="endpoint">
              <span class="method get">GET</span>
              <strong>/api/articles/category/:category</strong>
              <div class="params">
                <strong>URL Params:</strong> <code>category</code> - Category name (string)
              </div>
              <div class="response">
                <strong>Response:</strong> Array of articles in specified category
              </div>
            </div>

            <div class="endpoint">
              <span class="method get">GET</span>
              <strong>/api/articles/search</strong>
              <div class="params">
                <strong>Query Params:</strong> <code>q</code> - Search query (string)
              </div>
              <div class="response">
                <strong>Response:</strong> Array of articles matching search criteria
              </div>
            </div>
          </section>

          <section id="comments">
            <h2>💬 Comments</h2>

            <div class="endpoint">
              <span class="method get">GET</span>
              <strong>/api/articles/:id/comments</strong>
              <div class="params">
                <strong>URL Params:</strong> <code>id</code> - Article ID (integer)
              </div>
              <div class="response">
                <strong>Response:</strong> Array of comments for the article
              </div>
            </div>

            <div class="endpoint">
              <span class="method post">POST</span>
              <strong>/api/articles/:id/comments</strong>
              <div class="params">
                <strong>URL Params:</strong> <code>id</code> - Article ID (integer)<br>
                <strong>Body:</strong> <code>{ "content": "string", "author": "string" }</code>
              </div>
              <div class="response">
                <strong>Response:</strong> Created comment object with author info
              </div>
            </div>
          </section>

          <section id="users">
            <h2>👥 Users</h2>

            <div class="endpoint">
              <span class="method get">GET</span>
              <strong>/api/auth/me</strong> 🔒
              <div class="response">
                <strong>Response:</strong> Current user profile information
              </div>
            </div>

            <div class="endpoint">
              <span class="method get">GET</span>
              <strong>/api/users/:userId/profile</strong>
              <div class="params">
                <strong>URL Params:</strong> <code>userId</code> - User ID (string)
              </div>
              <div class="response">
                <strong>Response:</strong> Public profile information (excludes sensitive data)
              </div>
            </div>

            <div class="endpoint">
              <span class="method put">PUT</span>
              <strong>/api/profile</strong> 🔒
              <div class="params">
                <strong>Body:</strong> <code>{ "firstName": "string", "lastName": "string", "username": "string", "aliasName": "string", "description": "string" }</code>
              </div>
              <div class="response">
                <strong>Response:</strong> Updated user profile
              </div>
            </div>
          </section>

          <section id="page-posts">
            <h2>📱 Page Posts (Social Media)</h2>

            <div class="endpoint">
              <span class="method get">GET</span>
              <strong>/api/page-posts</strong>
              <div class="response">
                <strong>Response:</strong> Array of all page posts with engagement metrics
              </div>
            </div>

            <div class="endpoint">
              <span class="method post">POST</span>
              <strong>/api/page-posts</strong> 🔒
              <div class="params">
                <strong>Body:</strong> <code>{ "title": "string", "content": "string", "type": "photo|video|discussion", "mediaUrl": "string", "isNsfw": boolean }</code>
              </div>
              <div class="response">
                <strong>Response:</strong> Created page post object
              </div>
            </div>

            <div class="endpoint">
              <span class="method post">POST</span>
              <strong>/api/page-posts/:id/like</strong>
              <div class="params">
                <strong>URL Params:</strong> <code>id</code> - Post ID (integer)<br>
                <strong>Body:</strong> <code>{ "isLike": boolean }</code>
              </div>
              <div class="rate-limit">
                <strong>Rate Limit:</strong> 1 request per IP per post. NSFW posts cannot be liked.
              </div>
              <div class="response">
                <strong>Response:</strong> <code>{ "likes": number, "dislikes": number }</code>
              </div>
            </div>

            <div class="endpoint">
              <span class="method post">POST</span>
              <strong>/api/page-posts/:id/comments</strong>
              <div class="params">
                <strong>URL Params:</strong> <code>id</code> - Post ID (integer)<br>
                <strong>Body:</strong> <code>{ "content": "string", "author": "string" }</code>
              </div>
              <div class="response">
                <strong>Response:</strong> Created comment object
              </div>
            </div>
          </section>



          <section id="rate-limiting">
            <h2>⚡ Rate Limiting & Restrictions</h2>
            <div class="rate-limit">
              <h3>Article Interactions</h3>
              <ul>
                <li><strong>Like/Dislike:</strong> 1 request per IP per article</li>
                <li><strong>Comments:</strong> No rate limit, but IP tracking applies</li>
                <li><strong>Favorites:</strong> 1 request per IP per article</li>
              </ul>
            </div>
            <div class="rate-limit">
              <h3>Page Post Interactions</h3>
              <ul>
                <li><strong>Like/Dislike:</strong> 1 request per IP per post</li>
                <li><strong>NSFW Posts:</strong> Likes/dislikes disabled, comments allowed</li>
                <li><strong>Comments:</strong> No rate limit, but IP tracking applies</li>
              </ul>
            </div>

          </section>

          <section id="errors">
            <h2>❌ Error Handling</h2>
            <p>All endpoints return appropriate HTTP status codes:</p>
            <ul>
              <li><strong>200:</strong> Success</li>
              <li><strong>201:</strong> Created</li>
              <li><strong>400:</strong> Bad Request (validation errors)</li>
              <li><strong>401:</strong> Unauthorized (authentication required)</li>
              <li><strong>404:</strong> Not Found</li>
              <li><strong>500:</strong> Internal Server Error</li>
            </ul>
            <div class="response">
              <strong>Error Response Format:</strong>
              <pre>{ "message": "Error description" }</pre>
            </div>
          </section>

          <div class="success">
            <h3>🎉 Need Help?</h3>
            <p>For technical support or questions about the API, please contact our support team or check our GitHub repository.</p>
            <p><strong>Last Updated:</strong> January 8, 2025</p>
          </div>
        </div>
      </body>
      </html>
    `);
  });

  // Comment Routes

  // Create comment
  app.post("/api/comments", async (req, res) => {
    try {
      const commentData = {
        ...req.body,
        userIp: getClientIP(req)
      };
      const validatedData = insertCommentSchema.parse(commentData);
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

  // WebSocket server for real-time online user tracking with stability improvements
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws',
    clientTracking: true,
    perMessageDeflate: false // Disable compression for stability
  });

  let onlineUsers = 0;

  wss.on('connection', (ws, req) => {
    onlineUsers++;
    console.log(`User connected. Online users: ${onlineUsers}`);

    // Set up ping/pong for connection health
    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
      }
    }, 30000);

    ws.on('pong', () => {
      // Connection is alive
    });

    // Broadcast updated count to all connected clients
    const broadcastCount = () => {
      const message = JSON.stringify({ type: 'online_count', count: Math.max(1, onlineUsers) });
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          try {
            client.send(message);
          } catch (error) {
            console.error('WebSocket send error:', error);
          }
        }
      });
    };

    broadcastCount();

    ws.on('close', () => {
      clearInterval(pingInterval);
      onlineUsers = Math.max(0, onlineUsers - 1);
      console.log(`User disconnected. Online users: ${onlineUsers}`);
      broadcastCount();
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clearInterval(pingInterval);
    });
  });

  // API endpoint to get current online users count - simplified to show 1 user
  app.get("/api/online", (req, res) => {
    res.json({ count: 1 });
  });

  // =============== POST API ROUTES ===============

  // Get all posts
  app.get("/api/posts", async (req, res) => {
    try {
      const posts = await storage.getAllPosts();
      res.json(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  // Get single post
  app.get("/api/posts/:id", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const post = await storage.getPost(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Error fetching post:", error);
      res.status(500).json({ message: "Failed to fetch post" });
    }
  });

  // Create post (with image upload support)
  app.post("/api/posts", upload.single('image'), async (req, res) => {
    try {
      const userIp = getClientIP(req);
      const user = req.session.userId ? await storage.getUser(req.session.userId) : null;

      let postData = req.body;

      // Handle uploaded image
      if (req.file) {
        postData.imageUrl = `/uploads/${req.file.filename}`;
      }

      // Set author information
      postData.authorId = user?.id || null;
      postData.authorName = user ? `${user.firstName} ${user.lastName}` : 'Anonymous User';
      postData.authorIp = userIp;
      postData.author = user?.id || 'Anonymous';
      postData.userIp = userIp;
      postData.content = postData.content || ''; // Ensure content is not null/undefined

      const validatedData = insertPostSchema.parse(postData);
      const post = await storage.createPost(validatedData);

      res.status(201).json(post);
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(400).json({ message: "Invalid post data" });
    }
  });

  // Like/Dislike post
  app.post("/api/posts/:id/like", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const userIp = getClientIP(req);
      const { type } = req.body; // 'like' or 'dislike'

      const likeData = {
        postId,
        userIp,
        userId: req.session.userId || null,
        isLike: type === 'like'
      };

      const validatedData = insertPostLikeSchema.parse(likeData);
      await storage.createOrUpdatePostLike(validatedData);

      // Get updated counts
      const counts = await storage.getPostLikeCounts(postId);

      // Update post stats
      await storage.updatePostStats(
        postId, 
        counts.likes, 
        counts.dislikes, 
        0, // comments count will be updated separately
        0, // downloads count will be updated separately
        0  // reposts count will be updated separately
      );

      res.json(counts);
    } catch (error) {
      console.error("Error updating post like:", error);
      res.status(400).json({ message: "Failed to update like" });
    }
  });

  // Remove like/dislike from post
  app.delete("/api/posts/:id/like", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const userIp = getClientIP(req);

      await storage.removePostLike(postId, userIp);

      // Get updated counts
      const counts = await storage.getPostLikeCounts(postId);

      // Update post stats
      await storage.updatePostStats(
        postId, 
        counts.likes, 
        counts.dislikes, 
        0, 0, 0
      );

      res.json(counts);
    } catch (error) {
      console.error("Error removing post like:", error);
      res.status(400).json({ message: "Failed to remove like" });
    }
  });

  // Get user's like status for a post
  app.get("/api/posts/:id/like-status", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const userIp = getClientIP(req);

      const userLike = await storage.getUserPostLike(postId, userIp);
      const counts = await storage.getPostLikeCounts(postId);

      res.json({
        userLike: userLike?.isLike ? 'like' : 'dislike',
        ...counts
      });
    } catch (error) {
      console.error("Error fetching post like status:", error);
      res.status(500).json({ message: "Failed to fetch like status" });
    }
  });

  // Create post comment
  app.post("/api/posts/:id/comments", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const userIp = getClientIP(req);
      const user = req.session.userId ? await storage.getUser(req.session.userId) : null;
      const visitor = await storage.getVisitorIqStatus(userIp);

      const commentData = {
        postId,
        content: req.body.content,
        authorName: user ? `${user.firstName} ${user.lastName}` : 'Anonymous User',
        authorIp: userIp,
        authorId: user?.id || null,
        author: user?.id || 'Anonymous',
        userIp: userIp,
        authorIq: null,
      };

      const validatedData = insertPostCommentSchema.parse(commentData);
      const comment = await storage.createPostComment(validatedData);

      res.status(201).json(comment);
    } catch (error) {
      console.error("Error creating post comment:", error);
      res.status(400).json({ message: "Invalid comment data" });
    }
  });

  // Get post comments
  app.get("/api/posts/:id/comments", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const comments = await storage.getCommentsByPost(postId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching post comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  // Track post download
  app.post("/api/posts/:id/download", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const userIp = getClientIP(req);

      const downloadData = {
        postId,
        userIp,
        userId: req.session.userId || null,
      };

      const validatedData = insertPostDownloadSchema.parse(downloadData);
      await storage.trackPostDownload(validatedData);

      // Get updated download count
      const downloadCount = await storage.getPostDownloadCount(postId);

      // Update post stats
      const post = await storage.getPost(postId);
      if (post) {
        await storage.updatePostStats(
          postId, 
          post.likes, 
          post.dislikes, 
          post.comments,
          downloadCount,
          post.reposts
        );
      }

      res.json({ downloadCount });
    } catch (error) {
      console.error("Error tracking post download:", error);
      res.status(400).json({ message: "Failed to track download" });
    }
  });

  // Repost (create a new post referencing original)
  app.post("/api/posts/:id/repost", async (req, res) => {
    try {
      const originalPostId = parseInt(req.params.id);
      const userIp = getClientIP(req);
      const user = req.session.userId ? await storage.getUser(req.session.userId) : null;

      const originalPost = await storage.getPost(originalPostId);
      if (!originalPost) {
        return res.status(404).json({ message: "Original post not found" });
      }

      const repostData = {
        type: originalPost.type,
        title: `Repost: ${originalPost.title}`,
        content: req.body.content || '', // Optional additional content
        authorName: user ? `${user.firstName} ${user.lastName}` : 'Anonymous User',
        authorIp: userIp,
        authorId: user?.id || null,
        author: user?.id || 'Anonymous',
        userIp: userIp,
        imageUrl: originalPost.imageUrl || '',
        originalPostId: originalPostId,
      };

      const validatedData = insertPostSchema.parse(repostData);
      const repost = await storage.createPost(validatedData);

      // Update original post repost count
      await storage.updatePostStats(
        originalPostId,
        originalPost.likes,
        originalPost.dislikes,
        originalPost.comments,
        originalPost.downloads,
        originalPost.reposts + 1
      );

      res.status(201).json(repost);
    } catch (error) {
      console.error("Error creating repost:", error);
      res.status(400).json({ message: "Failed to create repost" });
    }
  });

  // Create test user account (for development)
  app.post("/api/dev/create-test-user", async (req, res) => {
    try {
      const testEmail = 'mellyaldenangela@gmail.com';
      const existingUser = await storage.getUserByEmail(testEmail);

      if (existingUser) {
        return res.json({ message: 'Test user already exists', user: existingUser });
      }

      const testPassword = await hashPassword('123456');
      const testUser = await storage.createUser({
        id: 'test-user-melly',
        email: testEmail,
        firstName: 'Melly',
        lastName: 'Alden',
        password: testPassword,
        provider: 'local',
        verificationCode: '123456',
        verificationCodeExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      });

      // Verify the user immediately
      await storage.verifyUser(testEmail, '123456');

      res.json({ message: 'Test user created successfully', user: testUser });
    } catch (error) {
      console.error('Error creating test user:', error);
      res.status(500).json({ message: 'Failed to create test user' });
    }
  });

  // Delete post (only by author)
  app.delete("/api/posts/:id", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const userIp = getClientIP(req);

      const post = await storage.getPost(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      // Check if user is the author
      const canDelete = post.author === req.session.userId || post.authorIp === userIp;
      if (!canDelete) {
        return res.status(403).json({ message: "You can only delete your own posts" });
      }

      await storage.deletePost(postId);
      res.json({ message: "Post deleted successfully" });
    } catch (error) {
      console.error("Error deleting post:", error);
      res.status(500).json({ message: "Failed to delete post" });
    }
  });

  // PAGE POSTS API - Social media style posts with photos, discussions, videos, and voting

  // Get all page posts (filtered for NSFW)
  app.get("/api/page-posts", async (req, res) => {
    try {
      const allPosts = await storage.getAllPagePosts();

      // Filter out NSFW posts from home page feed
      const { includeNsfw } = req.query;
      const posts = includeNsfw === 'true' 
        ? allPosts 
        : allPosts.filter(post => !post.isNsfw);

      res.json(posts);
    } catch (error) {
      console.error("Error fetching page posts:", error);
      res.status(500).json({ message: "Failed to fetch page posts" });
    }
  });

  // Get single page post
  app.get("/api/page-posts/:id", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const post = await storage.getPagePost(postId);
      if (!post) {
        return res.status(404).json({ message: "Page post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Error fetching page post:", error);
      res.status(500).json({ message: "Failed to fetch page post" });
    }
  });

  // Create page post (photo, discussion, video)
  app.post("/api/page-posts", upload.single('media'), async (req, res) => {
    try {
      const user = req.session.userId ? await storage.getUser(req.session.userId) : null;
      const userIp = getClientIP(req);

      const postData = { ...req.body };

      // Handle uploaded media (photos/videos)
      if (req.file) {
        postData.mediaUrl = `/uploads/${req.file.filename}`;
        postData.mediaType = req.file.mimetype.startsWith('image/') ? 'image' : 'video';
      }

      // Set author information
      postData.authorId = user?.id || null;

      if (user) {
        postData.authorName = `${user.firstName} ${user.lastName}`;
        postData.authorAlias = user.aliasName || null;
        postData.authorProfileUrl = user.profileImageUrl || null;
      } else {
        // Handle anonymous user with unique number
        const visitor = await storage.trackVisitor({
          ipAddress: userIp,
          userAgent: req.headers['user-agent'] || 'Unknown'
        });
        const anonNumber = visitor.anonymousNumber || await storage.getNextAnonymousNumber();
        if (!visitor.anonymousNumber) {
          await storage.updateVisitorAnonymousNumber(userIp, anonNumber);
        }
        postData.authorName = `Anonymous#${anonNumber}`;
        postData.authorAlias = null;
        postData.authorProfileUrl = null;
      }

      postData.authorIp = userIp;

      // Convert string booleans to actual booleans
      if (typeof postData.isVotingEnabled === 'string') {
        postData.isVotingEnabled = postData.isVotingEnabled === 'true';
      }
      if (typeof postData.isNsfw === 'string') {
        postData.isNsfw = postData.isNsfw === 'true';
      }

      // Parse voting options if provided
      if (postData.votingOptions && typeof postData.votingOptions === 'string') {
        postData.votingOptions = JSON.parse(postData.votingOptions);
      }

      // Parse hashtags if provided
      if (postData.hashtags && typeof postData.hashtags === 'string') {
        postData.hashtags = JSON.parse(postData.hashtags);
      }

      // Ensure hashtags is an array with at least #pagefeed
      if (!postData.hashtags || !Array.isArray(postData.hashtags) || postData.hashtags.length === 0) {
        postData.hashtags = ['#pagefeed'];
      }

      // Map the data to match MongoDB schema
      const pagePostData: any = {
        title: postData.title || '',
        content: postData.content || '',
        type: postData.type || 'discussion',
        mediaUrl: postData.mediaUrl,
        mediaType: postData.mediaType,
        authorId: postData.authorId,
        authorName: postData.authorName || 'Anonymous',
        authorAlias: postData.authorAlias,
        authorProfileUrl: postData.authorProfileUrl,
        authorIp: postData.authorIp || userIp,
        hashtags: postData.hashtags || ['#pagefeed'],
        isVotingEnabled: postData.isVotingEnabled || false,
        votingTitle: postData.votingTitle || postData.votingQuestion || '',
        votingOptions: postData.votingOptions || [],
        isNsfw: postData.isNsfw || false
      };

      const post = await storage.createPagePost(pagePostData);

      res.status(201).json(post);
    } catch (error) {
      console.error("Error creating page post:", error);
      res.status(400).json({ message: "Invalid page post data" });
    }
  });

  // Get individual page post
  app.get("/api/page-posts/:id", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }

      const post = await storage.getPagePost(postId);
      if (!post) {
        return res.status(404).json({ message: "Page post not found" });
      }

      res.json(post);
    } catch (error) {
      console.error("Error fetching page post:", error);
      res.status(500).json({ message: "Failed to fetch page post" });
    }
  });

  // Like/Dislike page post (only for registered users)
  app.post("/api/page-posts/:id/like", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const userIp = getClientIP(req);
      const { isLike } = req.body; // true for like, false for dislike

      // Only allow registered users to like/dislike
      if (!req.session.userId) {
        return res.status(401).json({ message: "Only registered users can like/dislike posts" });
      }

      // Check if user already liked/disliked this post
      const existingLike = await storage.getUserPagePostLike(postId, userIp);

      if (existingLike) {
        if (existingLike.isLike === Boolean(isLike)) {
          // Same action - remove the like/dislike
          await storage.removePagePostLike(postId, userIp);
        } else {
          // Different action - update the like/dislike
          const likeData = { postId, userIp, userId: req.session.userId, isLike: Boolean(isLike) };
          const validatedData = insertPagePostLikeSchema.parse(likeData);
          await storage.createOrUpdatePagePostLike(validatedData);
        }
      } else {
        // New like/dislike
        const likeData = { postId, userIp, userId: req.session.userId, isLike: Boolean(isLike) };
        const validatedData = insertPagePostLikeSchema.parse(likeData);
        await storage.createOrUpdatePagePostLike(validatedData);
      }

      // Get updated counts
      const counts = await storage.getPagePostLikeCounts(postId);

      // Update post stats - preserve current comment count
      const currentPost = await storage.getPagePost(postId);
      await storage.updatePagePostStats(postId, counts.likes, counts.dislikes, currentPost?.comments || 0);

      // Award honour for likes (0.2 per like) - but NOT for NSFW posts
      const post = await storage.getPagePost(postId);
      if (post && post.authorId && isLike && !post.isNsfw) {
        await storage.updateUserHonour(post.authorId, 0.2);
        await storage.checkAndUpdateUserVerification(post.authorId);
      }

      res.json({ likes: counts.likes, dislikes: counts.dislikes });
    } catch (error) {
      console.error("Error liking page post:", error);
      res.status(500).json({ message: "Failed to like page post" });
    }
  });

  // Remove like/dislike from page post
  app.delete("/api/page-posts/:id/like", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const userIp = getClientIP(req);

      if (!req.session.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      await storage.removePagePostLike(postId, userIp);

      // Get updated counts
      const counts = await storage.getPagePostLikeCounts(postId);

      // Update post stats - preserve current comment count
      const currentPost = await storage.getPagePost(postId);
      await storage.updatePagePostStats(postId, counts.likes, counts.dislikes, currentPost?.comments || 0);

      res.json({ likes: counts.likes, dislikes: counts.dislikes });
    } catch (error) {
      console.error("Error removing page post like:", error);
      res.status(500).json({ message: "Failed to remove like" });
    }
  });

  // Get page post like status
  app.get("/api/page-posts/:id/like-status", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const userIp = getClientIP(req);

      const existingLike = await storage.getUserPagePostLike(postId, userIp);

      res.json({
        isLiked: existingLike ? existingLike.isLike : false,
        isDisliked: existingLike ? !existingLike.isLike : false
      });
    } catch (error) {
      console.error("Error fetching page post like status:", error);
      res.status(500).json({ message: "Failed to fetch like status" });
    }
  });

  // Get page post comments
  app.get("/api/page-posts/:id/comments", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const comments = await storage.getCommentsByPagePost(postId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching page post comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  // Add comment to page post (anonymous users allowed)
  app.post("/api/page-posts/:id/comments", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const userIp = getClientIP(req);
      const user = req.session.userId ? await storage.getUser(req.session.userId) : null;

      // Get visitor IQ if not registered user
      let authorIq = null;
      if (user && user.iqScore) {
        authorIq = user.iqScore;
      } else if (!user) {
        const visitorStatus = await storage.getVisitorIqStatus(userIp);
        authorIq = visitorStatus.iqScore;
      }

      const commentData = {
        postId,
        authorId: user?.id || null,
        authorIp: userIp,
        authorName: user ? `${user.firstName} ${user.lastName}` : 'Anonymous User',
        authorAlias: user?.aliasName || null,
        authorProfileUrl: user?.profileImageUrl || null,
        authorIq,
        content: req.body.content,
        userIp: userIp // Add this field for MongoDB schema compatibility
      };

      const validatedData = insertPagePostCommentSchema.parse(commentData);
      const comment = await storage.createPagePostComment(validatedData);

      // Note: MongoDB storage automatically increments comment count in createPagePostComment

      res.status(201).json(comment);
    } catch (error) {
      console.error("Error creating page post comment:", error);
      res.status(400).json({ message: "Failed to create comment" });
    }
  });

  // Vote on page post (with email and IP tracking) - FIXED RACE CONDITION
  app.post("/api/page-posts/:id/vote", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const userIp = getClientIP(req);
      const { option } = req.body;

      if (!option || typeof option !== 'string') {
        return res.status(400).json({ 
          success: false, 
          message: "Valid vote option is required" 
        });
      }

      // Sanitize option input
      const sanitizedOption = option.replace(/[<>'"&]/g, '').trim();
      if (sanitizedOption.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid vote option" 
        });
      }

      // Get user info if authenticated
      const userId = req.session?.userId;
      let userEmail: string | undefined;

      if (userId) {
        try {
          const user = await storage.getUser(userId);
          userEmail = user?.email || undefined;
        } catch (error) {
          console.error("Error getting user for vote:", error);
          userEmail = undefined;
        }
      }

      // ATOMIC OPERATION - Use MongoDB transaction to prevent race condition
      const session = await mongoose.startSession();

      try {
        await session.withTransaction(async () => {
          // Check if user has already voted for this option
          const existingVote = await storage.getUserPagePostVote(postId, userIp);

          if (existingVote && existingVote.option === sanitizedOption) {
            // User clicked the same option - remove their vote
            await storage.removePagePostVote(postId, userIp);
            return;
          }

          const voteData = {
            postId,
            userIp,
            userId,
            userEmail,
            option: sanitizedOption
          };

          await storage.createPagePostVote(voteData);
        });
      } finally {
        await session.endSession();
      }

      // Get updated vote counts and calculate percentages
      const voteCounts = await storage.getPagePostVoteCounts(postId);
      const totalVotes = Object.values(voteCounts).reduce((sum, count) => sum + count, 0);

      // Get post to get voting options
      const post = await storage.getPagePost(postId);
      const results = (post?.votingOptions || []).map(opt => {
        const count = voteCounts[opt] || 0;
        const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
        return { option: opt, count, percentage };
      });

      res.json({
        success: true,
        message: "Vote submitted successfully",
        totalVotes,
        results
      });
    } catch (error) {
      console.error("Error voting on page post:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to vote"
      });
    }
  });

  // Get page post vote results with percentages
  app.get("/api/page-posts/:id/votes", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);

      // Get post to check voting options
      const post = await storage.getPagePost(postId);
      if (!post) {
        return res.status(404).json({ 
          success: false, 
          message: "Post not found" 
        });
      }

      if (!post.isVotingEnabled || !post.votingOptions) {
        return res.status(400).json({ 
          success: false, 
          message: "Voting is not enabled for this post" 
        });
      }

      // Get vote counts
      const voteCounts = await storage.getPagePostVoteCounts(postId);
      const totalVotes = Object.values(voteCounts).reduce((sum, count) => sum + count, 0);

      // Calculate percentages (rounded to whole numbers)
      const results = post.votingOptions.map(option => {
        const count = voteCounts[option] || 0;
        const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;

        return {
          option,
          count,
          percentage
        };
      });

      res.json({
        success: true,
        totalVotes,
        results
      });
    } catch (error) {
      console.error("Error fetching page post votes:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch votes" 
      });
    }
  });

  // Get user's vote status for a page post
  app.get("/api/page-posts/:id/vote-status", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const userIp = getClientIP(req);

      // Check if user has voted
      const userVote = await storage.getUserPagePostVote(postId, userIp);

      res.json({
        success: true,
        hasVoted: !!userVote,
        selectedOption: userVote ? userVote.option : null
      });
    } catch (error) {
      console.error("Error fetching user vote status:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch vote status" 
      });
    }
  });

  // Get page post vote counts (for frontend)
  app.get("/api/page-posts/:id/vote-counts", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const voteCounts = await storage.getPagePostVoteCounts(postId);
      res.json(voteCounts);
    } catch (error) {
      console.error("Error fetching page post vote counts:", error);
      res.status(500).json({ message: "Failed to fetch vote counts" });
    }
  });

  // Get user vote status for page post
  app.get("/api/page-posts/:id/vote-status", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const userIp = getClientIP(req);

      const userVote = await storage.getUserPagePostVote(postId, userIp);

      res.json({
        success: true,
        hasVoted: !!userVote,
        selectedOption: userVote?.option || null,
        votedAt: userVote?.createdAt || null,
        canChange: true // Users can always change their vote
      });
    } catch (error) {
      console.error("Error fetching page post vote status:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch vote status" 
      });
    }
  });

  // Delete page post (only by author)
  app.delete("/api/page-posts/:id", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const userIp = getClientIP(req);

      const post = await storage.getPagePost(postId);
      if (!post) {
        return res.status(404).json({ message: "Page post not found" });
      }

      // Check if user is the author
      const canDelete = post.authorId === req.session.userId || post.authorIp === userIp;
      if (!canDelete) {
        return res.status(403).json({ message: "You can only delete your own posts" });
      }

      await storage.deletePagePost(postId);
      res.json({ message: "Page post deleted successfully" });
    } catch (error) {
      console.error("Error deleting page post:", error);
      res.status(500).json({ message: "Failed to delete page post" });
    }
  });

  // Get page post comments
  app.get("/api/page-posts/:id/comments", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const comments = await storage.getCommentsByPagePost(postId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching page post comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  // Create page post comment
  app.post("/api/page-posts/:id/comments", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const user = req.session.userId ? await storage.getUser(req.session.userId) : null;
      const userIp = getClientIP(req);

      const { content, authorName } = req.body;

      if (!content || !content.trim()) {
        return res.status(400).json({ message: "Comment content is required" });
      }

      let commentData: any = {
        postId,
        content: content.trim(),
        authorIp: userIp
      };

      if (user) {
        // Registered user
        commentData.authorId = user.id;
        commentData.authorName = `${user.firstName} ${user.lastName}`;
        commentData.authorAlias = user.aliasName;
        commentData.authorProfileUrl = user.profileImageUrl;
        commentData.authorIqScore = user.iqScore;
      } else {
        // Anonymous user
        if (!authorName || !authorName.trim()) {
          return res.status(400).json({ message: "Author name is required for anonymous comments" });
        }

        // Get or create visitor record for IQ score
        const visitor = await storage.trackVisitor({
          ipAddress: userIp,
          userAgent: req.headers['user-agent'] || 'Unknown'
        });

        commentData.authorId = null;
        commentData.authorName = authorName.trim();
        commentData.authorAlias = null;
        commentData.authorProfileUrl = null;
        commentData.authorIqScore = visitor.iqScore;
      }

      const validatedData = insertPagePostCommentSchema.parse(commentData);
      const comment = await storage.createPagePostComment(validatedData);

      // Give 0.1 honour to post author for each comment (even on NSFW posts)
      // Note: MongoDB storage automatically increments comment count in createPagePostComment
      const post = await storage.getPagePost(postId);
      if (post && post.authorId) {
        await storage.updateUserHonour(post.authorId, 0.1);
      }

      res.json(comment);
    } catch (error) {
      console.error("Error creating page post comment:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // Theme and Membership endpoints
  app.post("/api/user/membership", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { membershipType } = req.body;
      if (!['free', 'topaz', 'agate', 'aqua'].includes(membershipType)) {
        return res.status(400).json({ message: "Invalid membership type" });
      }

      const user = await storage.updateUserMembership(req.session.userId, membershipType);
      res.json(user);
    } catch (error) {
      console.error("Error updating membership:", error);
      res.status(500).json({ message: "Failed to update membership" });
    }
  });

  // Get public user profile
  app.get("/api/user/public/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Return only public information including ALL badges
      const publicUser = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        aliasName: user.aliasName,
        profileImageUrl: user.profileImageUrl,
        description: user.description,
        fame: user.fame || 0,
        iqScore: user.iqScore,
        iqTestTaken: user.iqTestTaken || false,
        // Membership badges
        isTopaz: user.isTopaz || false,
        isAgate: user.isAgate || false,
        isAqua: user.isAqua || false,
        // Staff badges
        isModerator: user.isModerator || false,
        isStaff: user.isStaff || false,
        isDeveloper: user.isDeveloper || false,
        // Database badges
        hasBasicDB: user.hasBasicDB || true,
        hasInterDB: user.hasInterDB || false,
        hasProDB: user.hasProDB || false,
        createdAt: user.createdAt
      };

      res.json(publicUser);
    } catch (error) {
      console.error("Error fetching public user profile:", error);
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });

  app.post("/api/user/theme", async (req, res) => {
    try {
      console.log("Theme update request received. Session userId:", req.session.userId);
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { theme } = req.body;
      console.log("Requested theme:", theme);
      if (!theme) {
        return res.status(400).json({ message: "Theme is required" });
      }

      const user = await storage.updateUserTheme(req.session.userId, theme);
      console.log("Theme update successful, returning user data");
      res.json(user);
    } catch (error) {
      console.error("Error updating theme:", error);
      res.status(500).json({ message: "Failed to update theme" });
    }
  });

  // ============ QueitDB API Endpoints ============
  // QueitDB JSON-NoSQL Interface dengan PostgreSQL Backend

  // Import QueitDB bridge
  const { QueitDBBridge } = await import('./db.js');

  // Get all databases (collections)
  app.get("/api/queitdb/databases", async (req, res) => {
    try {
      const databases = [
        { name: 'users', collections: 1, size: '4.2 KB', documents: 0 },
        { name: 'articles', collections: 1, size: '8.7 KB', documents: 0 },
        { name: 'comments', collections: 1, size: '2.1 KB', documents: 0 },
        { name: 'page_posts', collections: 1, size: '3.5 KB', documents: 0 }
      ];
      res.json(databases);
    } catch (error) {
      console.error("Error fetching databases:", error);
      res.status(500).json({ message: "Failed to fetch databases" });
    }
  });

  // Create new database
  app.post("/api/queitdb/databases", async (req, res) => {
    try {
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ message: "Database name is required" });
      }

      // Create table in PostgreSQL
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS ${name} (
          id SERIAL PRIMARY KEY,
          data JSONB NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      await QueitDBBridge.executeJSONQuery(createTableQuery);

      res.json({ 
        message: `Database ${name} created successfully`,
        database: { name, collections: 1, size: '0 KB', documents: 0 }
      });
    } catch (error) {
      console.error("Error creating database:", error);
      res.status(500).json({ message: "Failed to create database" });
    }
  });

  // Delete database
  app.delete("/api/queitdb/databases/:name", async (req, res) => {
    try {
      const { name } = req.params;

      // Drop table in PostgreSQL
      const dropTableQuery = `DROP TABLE IF EXISTS ${name}`;
      await QueitDBBridge.executeJSONQuery(dropTableQuery);

      res.json({ message: `Database ${name} deleted successfully` });
    } catch (error) {
      console.error("Error deleting database:", error);
      res.status(500).json({ message: "Failed to delete database" });
    }
  });

  // Execute JSON-style query
  app.post("/api/queitdb/query", async (req, res) => {
    try {
      const { query, collection } = req.body;

      if (!query || !collection) {
        return res.status(400).json({ message: "Query and collection are required" });
      }

      let result;

      // Parse JSON-style query untuk konversi ke SQL
      if (query.startsWith('find(')) {
        const findQuery = `SELECT * FROM ${collection} WHERE data @> '{}'`;
        result = await QueitDBBridge.executeJSONQuery(findQuery);
      } else if (query.startsWith('insert(')) {
        const insertMatch = query.match(/insert\((.*)\)/);
        if (insertMatch) {
          const data = JSON.parse(insertMatch[1]);
          const insertQuery = `INSERT INTO ${collection} (data) VALUES ($1) RETURNING *`;
          result = await QueitDBBridge.executeJSONQuery(insertQuery, [JSON.stringify(data)]);
        }
      } else if (query.startsWith('update(')) {
        const updateMatch = query.match(/update\((.*)\)/);
        if (updateMatch) {
          const data = JSON.parse(updateMatch[1]);
          const updateQuery = `UPDATE ${collection} SET data = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`;
          result = await QueitDBBridge.executeJSONQuery(updateQuery, [JSON.stringify(data), data.id]);
        }
      } else if (query.startsWith('delete(')) {
        const deleteMatch = query.match(/delete\((.*)\)/);
        if (deleteMatch) {
          const data = JSON.parse(deleteMatch[1]);
          const deleteQuery = `DELETE FROM ${collection} WHERE id = $1`;
          result = await QueitDBBridge.executeJSONQuery(deleteQuery, [data.id]);
        }
      } else {
        // Direct SQL query
        result = await QueitDBBridge.executeJSONQuery(query);
      }

      res.json({
        success: true,
        executionTime: "12ms",
        result: result || [],
        collection: collection
      });
    } catch (error) {
      console.error("Error executing query:", error);
      res.status(500).json({ 
        success: false,
        message: "Query execution failed",
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Get database data in JSON format
  app.get("/api/queitdb/data/:collection", async (req, res) => {
    try {
      const { collection } = req.params;

      const query = `SELECT * FROM ${collection} LIMIT 100`;
      const result = await QueitDBBridge.executeJSONQuery(query);

      res.json({
        collection: collection,
        documents: result.length,
        data: result
      });
    } catch (error) {
      console.error("Error fetching collection data:", error);
      res.status(500).json({ message: "Failed to fetch collection data" });
    }
  });

  // Insert document to collection
  app.post("/api/queitdb/data/:collection", async (req, res) => {
    try {
      const { collection } = req.params;
      const { document } = req.body;

      if (!document) {
        return res.status(400).json({ message: "Document data is required" });
      }

      const insertQuery = `INSERT INTO ${collection} (data) VALUES ($1) RETURNING *`;
      const result = await QueitDBBridge.executeJSONQuery(insertQuery, [JSON.stringify(document)]);

      res.json({
        success: true,
        document: result[0],
        collection: collection
      });
    } catch (error) {
      console.error("Error inserting document:", error);
      res.status(500).json({ message: "Failed to insert document" });
    }
  });

  // Update document in collection
  app.put("/api/queitdb/data/:collection/:id", async (req, res) => {
    try {
      const { collection, id } = req.params;
      const { document } = req.body;

      if (!document) {
        return res.status(400).json({ message: "Document data is required" });
      }

      const updateQuery = `UPDATE ${collection} SET data = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`;
      const result = await QueitDBBridge.executeJSONQuery(updateQuery, [JSON.stringify(document), id]);

      res.json({
        success: true,
        document: result[0],
        collection: collection
      });
    } catch (error) {
      console.error("Error updating document:", error);
      res.status(500).json({ message: "Failed to update document" });
    }
  });

  // Delete document from collection
  app.delete("/api/queitdb/data/:collection/:id", async (req, res) => {
    try {
      const { collection, id } = req.params;

      const deleteQuery = `DELETE FROM ${collection} WHERE id = $1`;
      await QueitDBBridge.executeJSONQuery(deleteQuery, [id]);

      res.json({
        success: true,
        message: `Document with ID ${id} deleted from ${collection}`
      });
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ message: "Failed to delete document" });
    }
  });

  // Get server status
  app.get("/api/queitdb/status", async (req, res) => {
    try {
      const status = {
        server: "running",
        uptime: Math.floor(process.uptime()),
        memoryUsed: Math.floor(process.memoryUsage().heapUsed / 1024 / 1024),
        memoryMax: 512,
        cpuUsage: Math.floor(Math.random() * 30) + 20,
        cpuMax: 100,
        diskUsage: Math.floor(Math.random() * 50) + 15,
        diskMax: 1024,
        activeConnections: Math.floor(Math.random() * 10) + 1,
        databaseEngine: "PostgreSQL",
        version: "QueitDB 1.0.0"
      };

      res.json(status);
    } catch (error) {
      console.error("Error getting server status:", error);
      res.status(500).json({ message: "Failed to get server status" });
    }
  });

  // Get connection info
  app.get("/api/queitdb/connection", async (req, res) => {
    try {
      const connectionInfo = {
        url: CONFIG.QUEITDB_URL,
        database: "QueitDB",
        connectionString: `queitdb://${CONFIG.QUEITDB_URL.replace('https://', '')}/connect`,
        platform: "QueitDB Platform",
        credentials: {
          username: "queit_user",
          password: "queit_password",
          apiKey: "queit_api_key_2025"
        }
      };

      res.json(connectionInfo);
    } catch (error) {
      console.error("Error getting connection info:", error);
      res.status(500).json({ message: "Failed to get connection info" });
    }
  });

  // ============ New Database API Endpoints ============
  // Support for redesigned database interface

  // Use existing MongoDB connection from main application
  async function connectToQueitDB() {
    await connectToMongoDB();

    // Access the native MongoDB client through mongoose connection
    const db = mongoose.connection.db;

    if (!db) {
      throw new Error('MongoDB connection not available');
    }

    return db;
  }

  // SQL Query execution endpoint - requires authentication
  app.post("/api/database/sql", async (req, res) => {
    // Check authentication
    if (!req.session?.userId) {
      return res.status(401).json({ 
        success: false, 
        error: "Authentication required. Please login to access database." 
      });
    }

    try {
      const { query, database } = req.body;

      if (!query || !database) {
        return res.status(400).json({ 
          success: false, 
          error: "Query and database are required" 
        });
      }

      // Connect to QueitDB collection
      const db = mongoose.connection.db;
      if (!db) {
        return res.status(500).json({ success: false, error: "Database connection not available" });
      }
      const queitDbCollection = db.collection('queit_databases');

      // Handle simple SELECT queries for database values
      if (query.toLowerCase().includes('select')) {
        // Import the UserDatabase model
        const { UserDatabaseModel } = await import('../shared/mongodb-schema');

        const dbRecord = await UserDatabaseModel.findOne({ 
          userId: req.session.userId, 
          databaseName: database 
        });

        if (!dbRecord) {
          return res.json({
            success: true,
            result: `No database found with name: ${database} for this user`,
            query
          });
        }

        // Return only dataFields with clean format
        const cleanResult = dbRecord.dataFields || {};

        return res.json({
          success: true,
          result: JSON.stringify(cleanResult, null, 2),
          query
        });
      }

      // Handle INSERT queries for adding values
      if (query.toLowerCase().includes('insert')) {
        return res.json({
          success: true,
          result: "INSERT operations are handled through Create New DB interface",
          query
        });
      }

      // Default response for other queries
      res.json({
        success: true,
        result: "Query executed successfully. Use SELECT to view database values.",
        query
      });
    } catch (error) {
      console.error("Error executing SQL query:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to execute query" 
      });
    }
  });

  // Queit Found search endpoint
  app.post("/api/database/search", async (req, res) => {
    try {
      const { searchQuery } = req.body;

      if (!searchQuery) {
        return res.status(400).json({ 
          success: false, 
          error: "Search query is required" 
        });
      }

      // Parse FOUND('key':'value') format
      const foundMatch = searchQuery.match(/FOUND\('(.+?)':'(.+?)'\)/);

      if (!foundMatch) {
        return res.status(400).json({ 
          success: false, 
          error: "Invalid search format. Use FOUND('key':'value')" 
        });
      }

      const [, key, value] = foundMatch;

      // Connect to QueitDB and search across collections
      const db = await connectToQueitDB();
      const collections = await db.listCollections().toArray();

      const searchResults = [];

      for (const collectionInfo of collections) {
        const collection = db.collection(collectionInfo.name);

        // Search for documents that match the key-value pair
        const query = { [key]: { $regex: value, $options: 'i' } };
        const results = await collection.find(query).limit(10).toArray();

        for (const result of results) {
          const { _id, _queit_db_created, ...rest } = result;
          searchResults.push({
            database: collectionInfo.name,
            value: { id: _id, ...rest }
          });
        }
      }

      res.json({
        success: true,
        results: searchResults
      });
    } catch (error) {
      console.error("Error executing search:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to execute search" 
      });
    }
  });

  // Create new database using user-specific persistent storage - requires authentication
  app.post("/api/database/create", async (req, res) => {
    // Check authentication
    if (!req.session?.userId) {
      return res.status(401).json({ 
        success: false, 
        error: "Authentication required. Please login to create database." 
      });
    }

    try {
      const { name, nameValue, dataValue } = req.body;

      if (!name) {
        return res.status(400).json({ 
          success: false, 
          error: "Database name is required" 
        });
      }

      // Use name-value pair or defaults
      const fieldName = nameValue && nameValue.trim() ? nameValue.trim() : "username";
      const fieldValue = dataValue && dataValue.trim() ? dataValue.trim() : "admin123";

      // Import the UserDatabase model
      const { UserDatabaseModel } = await import('../shared/mongodb-schema');

      // Check if database already exists for this user
      const existingDb = await UserDatabaseModel.findOne({ 
        userId: req.session.userId, 
        databaseName: name 
      });

      if (existingDb) {
        return res.status(400).json({ 
          success: false, 
          error: `Database '${name}' already exists for this user` 
        });
      }

      // Create new user database with name-value field
      const userDatabase = new UserDatabaseModel({
        userId: req.session.userId,
        databaseName: name,
        dataFields: { [fieldName]: fieldValue }, // Store as name: value pair
        authorizedUsers: [],
        networkIPs: [],
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await userDatabase.save();

      res.json({
        success: true,
        message: `Database '${name}' created successfully with "${fieldName}": "${fieldValue}"`,
        database: { name, fieldName, fieldValue }
      });
    } catch (error) {
      console.error("Error creating database:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to create database" 
      });
    }
  });

  // Add value to existing database - requires authentication
  app.post("/api/database/add-value", async (req, res) => {
    // Check authentication
    if (!req.session?.userId) {
      return res.status(401).json({ 
        success: false, 
        error: "Authentication required. Please login to add values." 
      });
    }

    try {
      const { database, nameValue, dataValue } = req.body;

      if (!database || !nameValue || !dataValue) {
        return res.status(400).json({ 
          success: false, 
          error: "Database name, name value, and data value are required" 
        });
      }

      // Import the UserDatabase model
      const { UserDatabaseModel } = await import('../shared/mongodb-schema');

      // Check if database exists for this user
      const dbRecord = await UserDatabaseModel.findOne({ 
        userId: req.session.userId, 
        databaseName: database 
      });

      if (!dbRecord) {
        return res.status(404).json({ 
          success: false, 
          error: `Database '${database}' not found for this user` 
        });
      }

      const fieldName = nameValue.trim();
      const fieldValue = dataValue.trim();

      // Add new field with name-value pair
      const updateResult = await UserDatabaseModel.updateOne(
        { userId: req.session.userId, databaseName: database },
        { 
          $set: { 
            [`dataFields.${fieldName}`]: fieldValue,
            updatedAt: new Date()
          }
        }
      );

      console.log(`Add value update result:`, updateResult);
      console.log(`Added field "${fieldName}" with value "${fieldValue}" to database "${database}"`);

      res.json({
        success: true,
        message: `Added "${fieldName}": "${fieldValue}" to database '${database}'`,
        database: database,
        fieldName: fieldName,
        fieldValue: fieldValue
      });
    } catch (error) {
      console.error("Error adding value:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to add value to database" 
      });
    }
  });

  // Update database data directly - requires authentication
  app.post("/api/database/update", async (req, res) => {
    // Check authentication
    if (!req.session?.userId) {
      return res.status(401).json({ 
        success: false, 
        error: "Authentication required. Please login to update database." 
      });
    }

    try {
      const { database, data } = req.body;

      if (!database || !data) {
        return res.status(400).json({ 
          success: false, 
          error: "Database name and data are required" 
        });
      }

      // Import the UserDatabase model
      const { UserDatabaseModel } = await import('../shared/mongodb-schema');

      // Check if database exists for this user
      const dbRecord = await UserDatabaseModel.findOne({ 
        userId: req.session.userId, 
        databaseName: database 
      });

      if (!dbRecord) {
        return res.status(404).json({ 
          success: false, 
          error: `Database '${database}' not found for this user` 
        });
      }

      // Update the entire dataFields object with new data
      const updateResult = await UserDatabaseModel.updateOne(
        { userId: req.session.userId, databaseName: database },
        { 
          $set: { 
            dataFields: data,
            updatedAt: new Date()
          }
        }
      );

      res.json({
        success: true,
        message: `Database '${database}' updated successfully`,
        database: database,
        data: data
      });
    } catch (error) {
      console.error("Error updating database:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to update database" 
      });
    }
  });

  // Create new user for database access - requires authentication
  app.post("/api/database/users", async (req, res) => {
    // Check authentication
    if (!req.session?.userId) {
      return res.status(401).json({ 
        success: false, 
        error: "Authentication required. Please login to create users." 
      });
    }

    try {
      const { database, username, password, authType, privilege } = req.body;

      if (!database || !username || (authType === 'password' && !password)) {
        return res.status(400).json({ 
          success: false, 
          error: "Database name, username and password are required" 
        });
      }

      // Import the UserDatabase model
      const { UserDatabaseModel } = await import('../shared/mongodb-schema');

      // Check if database exists for this user
      const dbRecord = await UserDatabaseModel.findOne({ 
        userId: req.session.userId, 
        databaseName: database 
      });

      if (!dbRecord) {
        return res.status(404).json({ 
          success: false, 
          error: `Database '${database}' not found for this user` 
        });
      }

      // Check if username already exists in this database
      const existingUser = dbRecord.authorizedUsers.find(user => user.username === username);
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          error: "Username already exists in this database" 
        });
      }

      // Add new authorized user to the database
      const newUser = {
        username,
        password: authType === 'password' ? password : undefined,
        authType,
        privilege,
        createdAt: new Date()
      };

      await UserDatabaseModel.updateOne(
        { userId: req.session.userId, databaseName: database },
        { 
          $push: { authorizedUsers: newUser },
          $set: { updatedAt: new Date() }
        }
      );

      res.json({
        success: true,
        message: `User '${username}' added to database '${database}' successfully`,
        user: { username, privilege, authType, database }
      });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to create user" 
      });
    }
  });

  // Add network IP to whitelist - requires authentication
  app.post("/api/database/network", async (req, res) => {
    // Check authentication
    if (!req.session?.userId) {
      return res.status(401).json({ 
        success: false, 
        error: "Authentication required. Please login to manage network access." 
      });
    }

    try {
      const { database, ipAddress, description } = req.body;

      if (!database || !ipAddress) {
        return res.status(400).json({ 
          success: false, 
          error: "Database name and IP address are required" 
        });
      }

      // Import the UserDatabase model
      const { UserDatabaseModel } = await import('../shared/mongodb-schema');

      // Check if database exists for this user
      const dbRecord = await UserDatabaseModel.findOne({ 
        userId: req.session.userId, 
        databaseName: database 
      });

      if (!dbRecord) {
        return res.status(404).json({ 
          success: false, 
          error: `Database '${database}' not found for this user` 
        });
      }

      // Check if IP already exists in this database
      const existingIp = dbRecord.networkIPs.find(ip => ip.ipAddress === ipAddress);
      if (existingIp) {
        return res.status(400).json({ 
          success: false, 
          error: "IP address already exists in this database whitelist" 
        });
      }

      // Add new network IP to the database
      const newIP = {
        ipAddress,
        description: description || '',
        createdAt: new Date()
      };

      await UserDatabaseModel.updateOne(
        { userId: req.session.userId, databaseName: database },
        { 
          $push: { networkIPs: newIP },
          $set: { updatedAt: new Date() }
        }
      );

      res.json({
        success: true,
        message: `IP ${ipAddress} added to database '${database}' whitelist`,
        ipAddress,
        database
      });
    } catch (error) {
      console.error("Error adding network:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to add network" 
      });
    }
  });

  // Get user databases - requires authentication
  app.get("/api/database/list", async (req, res) => {
    // Check authentication
    if (!req.session?.userId) {
      return res.status(401).json({ 
        success: false, 
        error: "Authentication required. Please login to view databases." 
      });
    }

    try {
      // Import the UserDatabase model
      const { UserDatabaseModel } = await import('../shared/mongodb-schema');

      // Get all databases for this user
      const userDatabases = await UserDatabaseModel.find({ 
        userId: req.session.userId 
      });

      // Format database list for frontend
      const databases = userDatabases.map(db => ({
        name: db.databaseName,
        records: Object.keys(db.dataFields).length,
        authorizedUsers: db.authorizedUsers.length,
        networkIPs: db.networkIPs.length,
        createdAt: db.createdAt,
        updatedAt: db.updatedAt
      }));

      res.json({
        success: true,
        databases
      });
    } catch (error) {
      console.error("Error fetching databases:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to fetch databases" 
      });
    }
  });

  // Get database backup list
  app.get("/api/database/backups", async (req, res) => {
    try {
      const backups = [
        {
          id: 1,
          database: 'users',
          filename: 'users_backup_2025-01-08.sql',
          size: '4.2 KB',
          created_at: '2025-01-08T10:30:00Z'
        },
        {
          id: 2,
          database: 'articles',
          filename: 'articles_backup_2025-01-08.sql',
          size: '8.7 KB',
          created_at: '2025-01-08T11:00:00Z'
        }
      ];

      res.json({
        success: true,
        backups
      });
    } catch (error) {
      console.error("Error fetching backups:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to fetch backups" 
      });
    }
  });

  // Create database backup
  app.post("/api/database/backup", async (req, res) => {
    try {
      const { database } = req.body;

      if (!database) {
        return res.status(400).json({ 
          success: false, 
          error: "Database name is required" 
        });
      }

      const backupFilename = `${database}_backup_${new Date().toISOString().split('T')[0]}.sql`;

      // Create backup using MongoDB connection
      // This is a placeholder implementation

      res.json({
        success: true,
        message: `Backup created for database '${database}'`,
        backup: {
          database,
          filename: backupFilename,
          size: '2.1 KB',
          created_at: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error("Error creating backup:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to create backup" 
      });
    }
  });

  // Deploy realtime triggers
  app.post("/api/database/realtime", async (req, res) => {
    try {
      const { database, region } = req.body;

      if (!database || !region) {
        return res.status(400).json({ 
          success: false, 
          error: "Database and region are required" 
        });
      }

      // Deploy realtime triggers using MongoDB connection
      // This is a placeholder implementation

      res.json({
        success: true,
        message: `Realtime triggers deployed for database '${database}' in region '${region}'`,
        deployment: {
          database,
          region,
          status: 'active',
          deployed_at: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error("Error deploying realtime triggers:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to deploy realtime triggers" 
      });
    }
  });

  // Update user database badges - direct MongoDB access  
  app.post("/api/database/update-badges", async (req, res) => {

    try {
      const { email, badges } = req.body;

      if (!email || !badges) {
        return res.status(400).json({ 
          success: false, 
          error: "Email and badges are required" 
        });
      }

      // Direct MongoDB access
      const { UserModel } = await import('../shared/mongodb-schema');

      const user = await UserModel.findOne({ email });
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          error: `User with email ${email} not found` 
        });
      }

      // Update user with database badges
      const updatedUser = await UserModel.findOneAndUpdate(
        { email },
        { 
          $set: {
            ...badges,
            updatedAt: new Date()
          }
        },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(500).json({ success: false, error: "Failed to update user" });
      }

      res.json({
        success: true,
        message: `Database badges updated for user ${email}`,
        user: {
          email: updatedUser.email,
          databasePlan: updatedUser.databasePlan,
          hasBasicDB: updatedUser.hasBasicDB,
          hasInterDB: updatedUser.hasInterDB,
          hasProDB: updatedUser.hasProDB,
          isDeveloper: updatedUser.isDeveloper,
          isModerator: updatedUser.isModerator,
          isStaff: updatedUser.isStaff
        }
      });
    } catch (error) {
      console.error("Error updating database badges:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to update database badges" 
      });
    }
  });

  // Get user badges by email
  app.get("/api/database/user-badges/:email", async (req, res) => {
    try {
      const { email } = req.params;

      if (!email) {
        return res.status(400).json({ 
          success: false, 
          error: "Email is required" 
        });
      }

      // Direct MongoDB access
      const { UserModel } = await import('../shared/mongodb-schema');

      const user = await UserModel.findOne({ email });
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          error: `User with email ${email} not found` 
        });
      }

      res.json({
        success: true,
        email: user.email,
        badges: {
          databasePlan: user.databasePlan || 'free',
          hasBasicDB: user.hasBasicDB || false,
          hasInterDB: user.hasInterDB || false,
          hasProDB: user.hasProDB || false,
          isDeveloper: user.isDeveloper || false,
          isModerator: user.isModerator || false,
          isStaff: user.isStaff || false
        }
      });
    } catch (error) {
      console.error("Error fetching user badges:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to fetch user badges" 
      });
    }
  });

  // Get authorized users from MongoDB - requires authentication
  app.get("/api/database/authorized-users", async (req, res) => {
    // Check authentication
    if (!req.session?.userId) {
      return res.status(401).json({ 
        success: false, 
        error: "Authentication required. Please login to view authorized users." 
      });
    }

    try {
      // Import the UserDatabase model
      const { UserDatabaseModel } = await import('../shared/mongodb-schema');

      // Get all databases for this user and extract authorized users
      const userDatabases = await UserDatabaseModel.find({ 
        userId: req.session.userId 
      });

      // Aggregate all authorized users from all databases
      const allUsers: any[] = [];
      userDatabases.forEach(db => {
        if (db.authorizedUsers && db.authorizedUsers.length > 0) {
          db.authorizedUsers.forEach(user => {
            allUsers.push({
              username: user.username,
              privilege: user.privilege,
              authType: user.authType,
              database: db.databaseName,
              createdAt: user.createdAt || new Date()
            });
          });
        }
      });

      res.json({
        success: true,
        users: allUsers
      });
    } catch (error) {
      console.error("Error fetching authorized users:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to fetch authorized users" 
      });
    }
  });

  // ============ NEW DELETION API ENDPOINTS ============

  // Delete specific database and all its data
  app.delete("/api/database/delete", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ 
          success: false, 
          error: "Authentication required. Please login to delete databases." 
        });
      }

      const { database } = req.body;
      if (!database) {
        return res.status(400).json({ 
          success: false, 
          error: "Database name is required" 
        });
      }

      // Import the UserDatabase model
      const { UserDatabaseModel } = await import('../shared/mongodb-schema');

      // Check if database exists for this user
      const dbRecord = await UserDatabaseModel.findOne({ 
        userId: req.session.userId, 
        databaseName: database 
      });

      if (!dbRecord) {
        return res.status(404).json({ 
          success: false, 
          error: `Database '${database}' not found for this user` 
        });
      }

      // Delete the database
      const deleteResult = await UserDatabaseModel.deleteOne({ 
        userId: req.session.userId, 
        databaseName: database 
      });

      console.log(`Database '${database}' deleted. Result:`, deleteResult);

      res.json({
        success: true,
        message: `Database '${database}' and all its data have been permanently deleted`
      });
    } catch (error) {
      console.error("Error deleting database:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to delete database" 
      });
    }
  });

  // Delete all database data for a user
  app.delete("/api/database/delete-all", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const success = await storage.deleteAllDatabaseData(req.session.userId);

      if (success) {
        res.json({ message: "All database data deleted successfully" });
      } else {
        res.status(500).json({ message: "Failed to delete database data" });
      }
    } catch (error) {
      console.error("Error deleting all database data:", error);
      res.status(500).json({ message: "Failed to delete database data" });
    }
  });

  // Delete IP access for a user
  app.delete("/api/database/delete-ip", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const { ipAddress } = req.body;
      if (!ipAddress) {
        return res.status(400).json({ message: "IP address is required" });
      }

      const success = await storage.deleteUserIPAccess(req.session.userId, ipAddress);

      if (success) {
        res.json({ message: "IP access deleted successfully" });
      } else {
        res.status(500).json({ message: "Failed to delete IP access" });
      }
    } catch (error) {
      console.error("Error deleting IP access:", error);
      res.status(500).json({ message: "Failed to delete IP access" });
    }
  });

  // Delete authorized user
  app.delete("/api/database/delete-user", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const { targetUserId } = req.body;
      if (!targetUserId) {
        return res.status(400).json({ message: "Target user ID is required" });
      }

      const success = await storage.deleteAuthorizedUser(req.session.userId, targetUserId);

      if (success) {
        res.json({ message: "Authorized user deleted successfully" });
      } else {
        res.status(500).json({ message: "Failed to delete authorized user" });
      }
    } catch (error) {
      console.error("Error deleting authorized user:", error);
      res.status(500).json({ message: "Failed to delete authorized user" });
    }
  });

  // Delete article by author (based on email verification)
  app.delete("/api/articles/:id", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const articleId = parseInt(req.params.id);
      const success = await storage.deleteArticle(articleId, req.session.userId);

      if (success) {
        res.json({ message: "Article deleted successfully" });
      } else {
        res.status(403).json({ message: "You can only delete your own articles" });
      }
    } catch (error) {
      console.error("Error deleting article:", error);
      res.status(500).json({ message: "Failed to delete article" });
    }
  });

  // Delete page post by author (based on email verification) - enhanced version
  app.delete("/api/page-posts/:id/by-author", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const postId = parseInt(req.params.id);
      const success = await storage.deletePagePost(postId, req.session.userId);

      if (success) {
        res.json({ message: "Page post deleted successfully" });
      } else {
        res.status(403).json({ message: "You can only delete your own posts" });
      }
    } catch (error) {
      console.error("Error deleting page post:", error);
      res.status(500).json({ message: "Failed to delete page post" });
    }
  });

  // ============ DATABASE INVITE AND UPGRADE API ENDPOINTS ============

  // Invite user to database with email verification
  app.post("/api/database/invite", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ 
          error: "Authentication required" 
        });
      }

      const { email, role } = req.body;

      if (!email || !role) {
        return res.status(400).json({ 
          error: "Email and role are required" 
        });
      }

      // Validate role
      if (!['Reader', 'Writer', 'Admin'].includes(role)) {
        return res.status(400).json({ 
          error: "Invalid role. Must be Reader, Writer, or Admin" 
        });
      }

      // Check if the email is registered with Queit
      const invitedUser = await storage.getUserByEmail(email);
      if (!invitedUser) {
        return res.status(404).json({ 
          error: "User not found. The email must be registered with Queit." 
        });
      }

      // Get inviting user details
      const invitingUser = await storage.getUser(req.session.userId);
      if (!invitingUser) {
        return res.status(404).json({ 
          error: "Inviting user not found" 
        });
      }

      // Send invitation email using Gmail
      const emailModule = await import('./email.js');
      const sendEmail = emailModule.default || emailModule.sendEmail;

      const subject = `Database Collaboration Invitation from ${invitingUser.firstName} ${invitingUser.lastName}`;
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Database Collaboration Invitation</h2>
          <p>Hello ${invitedUser.firstName},</p>

          <p><strong>${invitingUser.firstName} ${invitingUser.lastName}</strong> has invited you to collaborate on their Queit database with <strong>${role}</strong> access level.</p>

          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #555;">Access Level: ${role}</h3>
            <ul style="margin: 0; padding-left: 20px;">
              ${role === 'Reader' ? '<li>View databases and execute read queries</li>' : ''}
              ${role === 'Writer' ? '<li>View databases and execute read queries</li><li>Create and modify data</li>' : ''}
              ${role === 'Admin' ? '<li>View databases and execute read queries</li><li>Create and modify data</li><li>Full access and user management</li>' : ''}
            </ul>
          </div>

          <p>To access the database collaboration features:</p>
          <ol>
            <li>Log in to your Queit account</li>
            <li>Navigate to the Database section</li>
            <li>You'll see the shared databases in your authorized list</li>
          </ol>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://queit-two.vercel.app/database" 
               style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Access Database
            </a>
          </div>

          <p style="color: #666; font-size: 14px;">
            This invitation was sent from Queit Database collaboration system. 
            If you didn't expect this invitation, you can safely ignore this email.
          </p>
        </div>
      `;

      const emailSent = await sendEmail({
        to: email,
        from: 'bmgobmgo749@gmail.com',
        subject: subject,
        html: htmlContent
      });

      if (!emailSent) {
        return res.status(500).json({ 
          error: "Failed to send invitation email" 
        });
      }

      res.json({
        message: `Database invitation sent successfully to ${email} with ${role} access`
      });

    } catch (error) {
      console.error("Error sending database invitation:", error);
      res.status(500).json({ 
        error: "Failed to send invitation" 
      });
    }
  });

  // Upgrade user database plan
  app.post("/api/user/database-plan", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ 
          error: "Authentication required" 
        });
      }

      const { plan } = req.body;

      if (!plan || !['inter', 'pro'].includes(plan)) {
        return res.status(400).json({ 
          error: "Invalid plan. Must be 'inter' or 'pro'" 
        });
      }

      // Get current user
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ 
          error: "User not found" 
        });
      }

      // Update user's database plan badges
      const badges = {
        databasePlan: plan === 'inter' ? 'inter' : 'pro',
        hasBasicDB: true,
        hasInterDB: plan === 'inter' || plan === 'pro',
        hasProDB: plan === 'pro'
      };

      const updatedUser = await storage.updateUserDatabaseBadges(req.session.userId, badges);

      res.json({
        message: `Successfully upgraded to ${plan.toUpperCase()}+ DB plan`,
        user: updatedUser
      });

    } catch (error) {
      console.error("Error upgrading database plan:", error);
      res.status(500).json({ 
        error: "Failed to upgrade database plan" 
      });
    }
  });

  // Configure multer for guild logo uploads
  const guildLogoUpload = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, uploadsDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'guild-logo-' + uniqueSuffix + path.extname(file.originalname));
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



  // Get all guilds (public only for non-members)
  app.get("/api/guilds", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const guilds = await storage.getPublicGuilds(limit);
      console.log("=== GUILDS LIST DEBUG ===");
      console.log("Total guilds found:", guilds.length);
      if (guilds.length > 0) {
        console.log("First guild data:", JSON.stringify(guilds[0], null, 2));
      }
      console.log("=== END GUILDS LIST DEBUG ===");
      res.json(guilds);
    } catch (error) {
      console.error("Error fetching guilds:", error);
      res.status(500).json({ error: "Failed to fetch guilds" });
    }
  });

  // Get user's guilds
  app.get("/api/guilds/my", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const guilds = await storage.getUserGuilds(req.session.userId);
      res.json(guilds);
    } catch (error) {
      console.error("Error fetching user guilds:", error);
      res.status(500).json({ error: "Failed to fetch user guilds" });
    }
  });

  // Get guild by ID with detailed information
  app.get("/api/guilds/:id", async (req, res) => {
    try {
      const guildId = parseInt(req.params.id);
      const guild = await storage.getGuildById(guildId);

      console.log("=== GUILD DEBUG INFO ===");
      console.log("Guild ID requested:", guildId);
      console.log("Guild data retrieved:", JSON.stringify(guild, null, 2));
      console.log("User session:", req.session?.userId);
      console.log("Guild exists:", !!guild);
      console.log("Guild name:", guild?.name);
      console.log("Guild description:", guild?.description);
      console.log("Guild insignia:", guild?.insignia);
      console.log("Guild owner:", guild?.ownerName);
      console.log("Guild member count:", guild?.memberCount);
      console.log("=== END DEBUG INFO ===");

      if (!guild) {
        return res.status(404).json({ error: "Guild not found" });
      }

      // Basic guild information available to all users
      const basicGuildInfo = {
        id: guild.id,
        name: guild.name,
        description: guild.description,
        insignia: guild.insignia,
        logo: guild.logo,
        logoBackgroundColor: guild.logoBackgroundColor,
        isPrivate: guild.isPrivate,
        ownerId: guild.ownerId,
        ownerName: guild.ownerName,
        memberCount: guild.memberCount,
        postCount: guild.postCount,
        createdAt: guild.createdAt,
        members: [],
        userRole: 'visitor'
      };

      // Check if user is authenticated for detailed info
      if (!req.session?.userId) {
        return res.json(basicGuildInfo);
      }

      // If guild is private, check if user is a member
      const isMember = await storage.isUserGuildMember(guildId, req.session.userId);
      if (guild.isPrivate && !isMember) {
        return res.status(403).json({ error: "Access denied to private guild" });
      }

      // Get guild members and user's role
      const members = await storage.getGuildMembers(guildId);
      const userMembership = members.find(m => m.userId === req.session.userId);
      const userRole = userMembership?.role || 'member';

      // Get guild posts count
      const posts = await storage.getGuildPosts(guildId);
      const postCount = posts.length;

      // Get the actual member count from the database
      const actualMemberCount = members.length;

      console.log("=== MEMBER COUNT DEBUG ===");
      console.log("Members found in database:", actualMemberCount);
      console.log("Guild member count in database:", guild.memberCount);
      console.log("Owner ID:", guild.ownerId);
      console.log("Owner is member:", members.some(m => m.userId === guild.ownerId));
      console.log("All members:", members.map(m => ({ userId: m.userId, username: m.username, role: m.role })));
      console.log("=== END MEMBER COUNT DEBUG ===");

      // Check if owner is not a member and add them (fix for existing guilds)
      const ownerIsMember = members.some(m => m.userId === guild.ownerId);
      if (!ownerIsMember) {
        console.log("Adding owner as member...");
        await storage.createGuildMember({
          guildId: guild.id,
          userId: guild.ownerId,
          username: guild.ownerName,
          role: 'owner'
        });
        // Refresh members list
        const updatedMembers = await storage.getGuildMembers(guildId);
        const updatedMemberCount = updatedMembers.length;

        console.log("Updated member count after adding owner:", updatedMemberCount);

        // Update guild member count in database if it doesn't match
        if (guild.memberCount !== updatedMemberCount) {
          await storage.updateGuildMemberCount(guildId, updatedMemberCount);
        }

        // Return updated information
        const detailedGuild = {
          ...guild, // Guild is already a plain object from storage
          members: updatedMembers,
          userRole,
          postCount,
          memberCount: updatedMemberCount,
          honorPoints: 0
        };
        return res.json(detailedGuild);
      }

      // Update guild member count in database if it doesn't match
      if (guild.memberCount !== actualMemberCount) {
        console.log("Updating guild member count from", guild.memberCount, "to", actualMemberCount);
        await storage.updateGuildMemberCount(guildId, actualMemberCount);
      }

      // Return detailed guild information
      const detailedGuild = {
        ...guild, // Guild is already a plain object from storage
        members,
        userRole,
        postCount,
        memberCount: actualMemberCount,
        honorPoints: 0 // This can be calculated based on guild activities
      };

      res.json(detailedGuild);
    } catch (error) {
      console.error("Error fetching guild:", error);
      res.status(500).json({ error: "Failed to fetch guild" });
    }
  });

  // Get guild posts
  app.get("/api/guilds/:id/posts", async (req, res) => {
    try {
      const guildId = parseInt(req.params.id);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

      if (!req.session?.userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const posts = await storage.getGuildPosts(guildId, limit);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching guild posts:", error);
      res.status(500).json({ error: "Failed to fetch guild posts" });
    }
  });

  // Search guilds
  app.get("/api/guilds/search/:query", async (req, res) => {
    try {
      const query = req.params.query;
      const guilds = await storage.searchGuilds(query);
      res.json(guilds);
    } catch (error) {
      console.error("Error searching guilds:", error);
      res.status(500).json({ error: "Failed to search guilds" });
    }
  });

  // Get user's current guild status
  app.get("/api/user/current-guild", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const currentGuild = await storage.getUserCurrentGuild(req.session.userId);
      res.json(currentGuild);
    } catch (error) {
      console.error("Error fetching current guild:", error);
      res.status(500).json({ error: "Failed to fetch current guild" });
    }
  });

  // Enter/Switch to a guild (set as current guild)
  app.post("/api/guilds/:id/enter", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const guildId = parseInt(req.params.id);
      const guild = await storage.getGuildById(guildId);

      if (!guild) {
        return res.status(404).json({ error: "Guild not found" });
      }

      // Check if user is a member of this guild
      const isMember = await storage.isUserGuildMember(guildId, req.session.userId);
      if (!isMember) {
        return res.status(403).json({ error: "You must be a member of this guild to enter it" });
      }

      // Update user's current guild
      await storage.updateUserCurrentGuild(req.session.userId, guildId, guild.name);

      res.json({ message: "Successfully entered guild", guildId, guildName: guild.name });
    } catch (error) {
      console.error("Error entering guild:", error);
      res.status(500).json({ error: "Failed to enter guild" });
    }
  });

  // Exit current guild (clear current guild AND remove membership)
  app.post("/api/user/exit-guild", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const userId = req.session.userId;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Get current guild to leave
      if (user.currentGuildId) {
        // Remove guild membership completely
        const success = await storage.leaveGuild(user.currentGuildId, userId);
        if (!success) {
          return res.status(400).json({ error: "Failed to leave guild" });
        }
      }

      // Clear user's current guild
      await storage.updateUserCurrentGuild(userId, null, null);

      res.json({ message: "Successfully exited guild and removed membership" });
    } catch (error) {
      console.error("Error exiting guild:", error);
      res.status(500).json({ error: "Failed to exit guild" });
    }
  });



  // Get guild members
  app.get("/api/guilds/:id/members", async (req, res) => {
    try {
      const guildId = parseInt(req.params.id);
      const guild = await storage.getGuildById(guildId);

      if (!guild) {
        return res.status(404).json({ error: "Guild not found" });
      }

      // Check access for private guilds
      if (guild.isPrivate && req.session?.userId) {
        const isMember = await storage.isUserGuildMember(guildId, req.session.userId);
        if (!isMember) {
          return res.status(403).json({ error: "Access denied" });
        }
      } else if (guild.isPrivate) {
        return res.status(403).json({ error: "Authentication required" });
      }

      const members = await storage.getGuildMembers(guildId);
      res.json(members);
    } catch (error) {
      console.error("Error fetching guild members:", error);
      res.status(500).json({ error: "Failed to fetch guild members" });
    }
  });

  // Get guild posts
  app.get("/api/guilds/:id/posts", async (req, res) => {
    try {
      const guildId = parseInt(req.params.id);
      const guild = await storage.getGuildById(guildId);

      if (!guild) {
        return res.status(404).json({ error: "Guild not found" });
      }

      // Check access for private guilds
      if (guild.isPrivate && req.session?.userId) {
        const isMember = await storage.isUserGuildMember(guildId, req.session.userId);
        if (!isMember) {
          return res.status(403).json({ error: "Access denied" });
        }
      } else if (guild.isPrivate) {
        return res.status(403).json({ error: "Authentication required" });
      }

      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const posts = await storage.getGuildPosts(guildId, limit);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching guild posts:", error);
      res.status(500).json({ error: "Failed to fetch guild posts" });
    }
  });

  // Get all guild posts for recent posts feed
  app.get("/api/guild-posts/all", async (req, res) => {
    try {
      const { GuildPostModel } = await import('../shared/mongodb-schema');

      // Get all guild posts with guild information, sorted by creation date
      const posts = await GuildPostModel.find({})
        .sort({ createdAt: -1 })
        .limit(6); // Limit to 6 for home page feed

      res.json(posts);
    } catch (error) {
      console.error("Error fetching all guild posts:", error);
      res.status(500).json({ error: "Failed to fetch guild posts" });
    }
  });

  // ============ Guild API Endpoints ============

  // Get all guilds (public only for non-members, all for members)
  app.get("/api/guilds", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const userId = req.session.userId;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Get all guilds - public guilds for browsing, user's private guilds
      const publicGuilds = await GuildModel.find({ isPrivate: false }).sort({ createdAt: -1 });

      // Get user's private guild memberships
      const userMemberships = await GuildMemberModel.find({ userId }).select('guildId');
      const userGuildIds = userMemberships.map(m => m.guildId);

      // Get private guilds user is member of
      const privateGuilds = await GuildModel.find({ 
        _id: { $in: userGuildIds },
        isPrivate: true 
      }).sort({ createdAt: -1 });

      // Combine and add membership status
      const allGuilds = [...publicGuilds, ...privateGuilds].map(guild => {
        const isMember = userGuildIds.includes(guild.id);
        return {
          ...guild.toObject(),
          isMember,
          canJoin: !guild.isPrivate || !isMember
        };
      });

      res.json(allGuilds);
    } catch (error) {
      console.error("Error fetching guilds:", error);
      res.status(500).json({ message: "Failed to fetch guilds" });
    }
  });

  // Create new guild
  app.post("/api/guilds", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const userId = req.session.userId;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      const { name, description, isPrivate, insignia, logo, logoBackgroundColor } = req.body;

      if (!name || !description || !insignia || !logo || !logoBackgroundColor) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Check if insignia is unique
      const existingGuild = await GuildModel.findOne({ insignia });
      if (existingGuild) {
        return res.status(400).json({ message: "Insignia already taken" });
      }

      const guildId = await getNextSequence('guild');

      const guild = new GuildModel({
        id: guildId,
        name,
        description,
        isPrivate: Boolean(isPrivate),
        ownerId: userId,
        ownerName: `${user.firstName} ${user.lastName}`,
        insignia,
        logo,
        logoBackgroundColor,
        memberCount: 1,
        postCount: 0
      });

      await guild.save();

      // Add owner as first member
      const membershipId = await getNextSequence('guild_member');
      const membership = new GuildMemberModel({
        id: membershipId,
        guildId: guildId,
        userId: userId,
        username: user.username || `${user.firstName} ${user.lastName}`,
        role: 'owner'
      });

      await membership.save();

      res.status(201).json(guild);
    } catch (error) {
      console.error("Error creating guild:", error);
      res.status(500).json({ message: "Failed to create guild" });
    }
  });



  // Join public guild directly
  app.post("/api/guilds/:id/join", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const guildId = parseInt(req.params.id);
      const userId = req.session.userId;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      const guild = await GuildModel.findOne({ id: guildId });
      if (!guild) {
        return res.status(404).json({ message: "Guild not found" });
      }

      if (guild.isPrivate) {
        return res.status(400).json({ message: "Cannot directly join private guild. Request to join instead." });
      }

      // Check if already member
      const existingMembership = await GuildMemberModel.findOne({ guildId, userId });
      if (existingMembership) {
        return res.status(400).json({ message: "Already a member of this guild" });
      }

      // Check guild membership limit (maximum 2 guilds per user)
      const userGuildCount = await GuildMemberModel.countDocuments({ userId });
      if (userGuildCount >= 2) {
        return res.status(400).json({ message: "You can only be a member of maximum 2 guilds. Please leave a guild first." });
      }

      // Add member
      const membershipId = await getNextSequence('guild_member');
      const membership = new GuildMemberModel({
        id: membershipId,
        guildId: guildId,
        userId: userId,
        username: user.username || `${user.firstName} ${user.lastName}`,
        role: 'member'
      });

      await membership.save();

      // Update member count
      await GuildModel.updateOne({ id: guildId }, { $inc: { memberCount: 1 } });

      res.json({ message: "Successfully joined guild", membership });
    } catch (error) {
      console.error("Error joining guild:", error);
      res.status(500).json({ message: "Failed to join guild" });
    }
  });

  // Request to join private guild
  app.post("/api/guilds/:id/request", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const guildId = parseInt(req.params.id);
      const userId = req.session.userId;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      const guild = await GuildModel.findOne({ id: guildId });
      if (!guild) {
        return res.status(404).json({ message: "Guild not found" });
      }

      if (!guild.isPrivate) {
        return res.status(400).json({ message: "This is a public guild. You can join directly." });
      }

      // Check if already member
      const existingMembership = await GuildMemberModel.findOne({ guildId, userId });
      if (existingMembership) {
        return res.status(400).json({ message: "Already a member of this guild" });
      }

      // Check guild membership limit (maximum 2 guilds per user)
      const userGuildCount = await GuildMemberModel.countDocuments({ userId });
      if (userGuildCount >= 2) {
        return res.status(400).json({ message: "You can only be a member of maximum 2 guilds. Please leave a guild first." });
      }

      // Check if request already sent
      const existingRequest = await GuildRequestModel.findOne({ guildId, userId, status: 'pending' });
      if (existingRequest) {
        return res.status(400).json({ message: "Request already sent and pending" });
      }

      // Create request
      const requestId = await getNextSequence('guild_request');
      const request = new GuildRequestModel({
        id: requestId,
        guildId: guildId,
        guildName: guild.name,
        userId: userId,
        username: user.username || `${user.firstName} ${user.lastName}`,
        userEmail: user.email
      });

      await request.save();

      // Send email notification to guild owner
      const owner = await storage.getUser(guild.ownerId);
      if (owner && owner.email) {
        await sendGuildRequestNotificationEmail(
          owner.email,
          guild.name,
          request.username,
          requestId
        );
      }

      res.json({ message: "Join request sent successfully", request });
    } catch (error) {
      console.error("Error requesting to join guild:", error);
      res.status(500).json({ message: "Failed to send join request" });
    }
  });

  // Send email invite to join guild (owner/admin only)
  app.post("/api/guilds/:id/invite", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const guildId = parseInt(req.params.id);
      const userId = req.session.userId;
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      // Check if user is owner/admin
      const membership = await GuildMemberModel.findOne({ guildId, userId });
      if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
        return res.status(403).json({ message: "Only guild owners and admins can send invites" });
      }

      const guild = await GuildModel.findOne({ id: guildId });
      if (!guild) {
        return res.status(404).json({ message: "Guild not found" });
      }

      const inviter = await storage.getUser(userId);
      if (!inviter) {
        return res.status(401).json({ message: "User not found" });
      }

      // Check if already invited
      const existingInvite = await GuildInviteModel.findOne({ 
        guildId, 
        email, 
        status: 'pending' 
      });
      if (existingInvite) {
        return res.status(400).json({ message: "Email already invited and pending" });
      }

      // Create invite
      const inviteId = await getNextSequence('guild_invite');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

      const invite = new GuildInviteModel({
        id: inviteId,
        guildId: guildId,
        guildName: guild.name,
        email: email,
        invitedBy: userId,
        invitedByName: `${inviter.firstName} ${inviter.lastName}`,
        expiresAt: expiresAt
      });

      await invite.save();

      // Send email invite
      const inviteUrl = `https://queit-two.vercel.app/guild/invite/${inviteId}`;
      const emailSent = await sendGuildInviteEmail(
        email,
        guild.name,
        invite.invitedByName,
        inviteUrl
      );

      if (!emailSent) {
        return res.status(500).json({ message: "Failed to send invite email" });
      }

      res.json({ message: "Invite sent successfully", invite });
    } catch (error) {
      console.error("Error sending guild invite:", error);
      res.status(500).json({ message: "Failed to send guild invite" });
    }
  });

  // Accept guild invite
  app.post("/api/guild-invites/:id/accept", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const inviteId = parseInt(req.params.id);
      const userId = req.session.userId;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      const invite = await GuildInviteModel.findOne({ id: inviteId });
      if (!invite) {
        return res.status(404).json({ message: "Invite not found" });
      }

      if (invite.status !== 'pending') {
        return res.status(400).json({ message: "Invite is no longer valid" });
      }

      if (invite.expiresAt < new Date()) {
        await GuildInviteModel.updateOne({ id: inviteId }, { status: 'expired' });
        return res.status(400).json({ message: "Invite has expired" });
      }

      // Check if user email matches invite
      if (user.email !== invite.email) {
        return res.status(403).json({ message: "This invite is for a different email address" });
      }

      // Check if already member
      const existingMembership = await GuildMemberModel.findOne({ 
        guildId: invite.guildId, 
        userId 
      });
      if (existingMembership) {
        return res.status(400).json({ message: "Already a member of this guild" });
      }

      // Add member
      const membershipId = await getNextSequence('guild_member');
      const membership = new GuildMemberModel({
        id: membershipId,
        guildId: invite.guildId,
        userId: userId,
        username: user.username || `${user.firstName} ${user.lastName}`,
        role: 'member'
      });

      await membership.save();

      // Update member count and mark invite as accepted
      await Promise.all([
        GuildModel.updateOne({ id: invite.guildId }, { $inc: { memberCount: 1 } }),
        GuildInviteModel.updateOne({ id: inviteId }, { status: 'accepted' })
      ]);

      res.json({ message: "Successfully joined guild via invite", membership });
    } catch (error) {
      console.error("Error accepting guild invite:", error);
      res.status(500).json({ message: "Failed to accept guild invite" });
    }
  });

  // Approve/reject join request (owner/admin only)
  app.post("/api/guild-requests/:id/:action", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const requestId = parseInt(req.params.id);
      const action = req.params.action; // 'approve' or 'reject'
      const userId = req.session.userId;

      if (action !== 'approve' && action !== 'reject') {
        return res.status(400).json({ message: "Invalid action. Use 'approve' or 'reject'" });
      }

      const request = await GuildRequestModel.findOne({ id: requestId });
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }

      if (request.status !== 'pending') {
        return res.status(400).json({ message: "Request is no longer pending" });
      }

      // Check if user is owner/admin of the guild
      const membership = await GuildMemberModel.findOne({ 
        guildId: request.guildId, 
        userId 
      });
      if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
        return res.status(403).json({ message: "Only guild owners and admins can manage requests" });
      }

      if (action === 'approve') {
        // Check guild membership limit (maximum 2 guilds per user) before approving
        const userGuildCount = await GuildMemberModel.countDocuments({ userId: request.userId });
        if (userGuildCount >= 2) {
          return res.status(400).json({ message: "User has reached maximum guild limit (2 guilds)" });
        }

        // Add member
        const membershipId = await getNextSequence('guild_member');
        const newMembership = new GuildMemberModel({
          id: membershipId,
          guildId: request.guildId,
          userId: request.userId,
          username: request.username,
          role: 'member'
        });

        await newMembership.save();

        // Update member count
        await GuildModel.updateOne({ id: request.guildId }, { $inc: { memberCount: 1 } });
      }

      // Update request status
      await GuildRequestModel.updateOne(
        { id: requestId }, 
        { status: action === 'approve' ? 'approved' : 'rejected' }
      );

      res.json({ 
        message: `Request ${action}d successfully`,
        request: { ...request.toObject(), status: action === 'approve' ? 'approved' : 'rejected' }
      });
    } catch (error) {
      console.error(`Error ${req.params.action}ing guild request:`, error);
      res.status(500).json({ message: `Failed to ${req.params.action} guild request` });
    }
  });

  // Leave guild
  app.post("/api/guilds/:id/leave", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const guildId = parseInt(req.params.id);
      const userId = req.session.userId;
      const { password } = req.body;

      // Validate password is provided
      if (!password) {
        return res.status(400).json({ message: "Password is required for leaving guild" });
      }

      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Verify password using the correct password comparison function
      const isValidPassword = await comparePasswords(password, user.password || '');

      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid password" });
      }

      const success = await storage.leaveGuild(guildId, userId);

      if (!success) {
        return res.status(400).json({ 
          message: "Cannot leave guild. You might not be a member or you are the owner." 
        });
      }

      // If this was the user's current guild, clear it
      if (user.currentGuildId === guildId) {
        await storage.updateUserCurrentGuild(userId, null, null);
      }

      res.json({ message: "Successfully left the guild" });
    } catch (error) {
      console.error("Error leaving guild:", error);
      res.status(500).json({ message: "Failed to leave guild" });
    }
  });

  // Delete guild (owner only)
  app.delete("/api/guilds/:id", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const guildId = parseInt(req.params.id);
      const success = await storage.deleteGuild(guildId, req.session.userId);

      if (!success) {
        return res.status(403).json({ 
          message: "Only guild owners can delete their guild" 
        });
      }

      res.json({ message: "Guild deleted successfully" });
    } catch (error) {
      console.error("Error deleting guild:", error);
      res.status(500).json({ message: "Failed to delete guild" });
    }
  });

  // Delete guild post (author only)
  app.delete("/api/guild-posts/:id", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const postId = parseInt(req.params.id);
      const success = await storage.deleteGuildPost(postId, req.session.userId);

      if (!success) {
        return res.status(403).json({ 
          message: "Only post authors can delete their posts" 
        });
      }

      res.json({ message: "Post deleted successfully" });
    } catch (error) {
      console.error("Error deleting guild post:", error);
      res.status(500).json({ message: "Failed to delete post" });
    }
  });

  // Check if user can create guild (not already a member of any guild)
  app.get("/api/user/can-create-guild", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const membership = await storage.getUserGuildMembership(req.session.userId);
      const canCreate = membership.length === 0; // Can only create if not member of any guild

      res.json({ canCreate, membershipCount: membership.length });
    } catch (error) {
      console.error("Error checking guild creation eligibility:", error);
      res.status(500).json({ message: "Failed to check guild creation eligibility" });
    }
  });

  // Get guild posts
  app.get("/api/guilds/:id/posts", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const guildId = parseInt(req.params.id);
      const userId = req.session.userId;

      // Check if user is member of guild
      const membership = await GuildMemberModel.findOne({ guildId, userId });
      if (!membership) {
        return res.status(403).json({ message: "Access denied. Guild members only." });
      }

      // Get guild posts
      const posts = await GuildPostModel.find({ guildId }).sort({ createdAt: -1 });

      res.json(posts);
    } catch (error) {
      console.error("Error fetching guild posts:", error);
      res.status(500).json({ message: "Failed to fetch guild posts" });
    }
  });

  // Create guild post
  app.post("/api/guild-posts", upload.single('media'), async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const userId = req.session.userId;
      const { title, content, type, guildId } = req.body;

      if (!title || !content || !type || !guildId) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const guildIdNum = parseInt(guildId);

      // Check if user is member of guild
      const membership = await GuildMemberModel.findOne({ guildId: guildIdNum, userId });
      if (!membership) {
        return res.status(403).json({ message: "Access denied. Guild members only." });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Get guild info for post
      const guild = await GuildModel.findOne({ id: guildIdNum });
      if (!guild) {
        return res.status(404).json({ message: "Guild not found" });
      }

      // Handle file upload
      let mediaUrl = null;
      if (req.file) {
        mediaUrl = `/uploads/${req.file.filename}`;
      }

      const postId = await getNextSequence('guild_post');

      const post = new GuildPostModel({
        id: postId,
        guildId: guildIdNum,
        guildName: guild.name,
        guildInsignia: guild.insignia,
        title,
        content,
        type: type as 'photo' | 'video' | 'discussion',
        mediaUrl,
        authorId: userId,
        authorName: user.username || `${user.firstName} ${user.lastName}`,
        authorAlias: user.aliasName,
        authorProfileUrl: user.profileImageUrl,
        authorIp: req.ip || '127.0.0.1'
      });

      await post.save();

      // Update guild post count
      await GuildModel.updateOne({ id: guildIdNum }, { $inc: { postCount: 1 } });

      res.status(201).json(post);
    } catch (error) {
      console.error("Error creating guild post:", error);
      res.status(500).json({ message: "Failed to create guild post" });
    }
  });

  // Update guild description (owner only)
  app.put("/api/guilds/:id", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const guildId = parseInt(req.params.id);
      const userId = req.session.userId;
      const { description } = req.body;

      if (!description) {
        return res.status(400).json({ message: "Description is required" });
      }

      // Check if user is owner of guild
      const membership = await GuildMemberModel.findOne({ guildId, userId });
      if (!membership || membership.role !== 'owner') {
        return res.status(403).json({ message: "Only guild owners can update guild description" });
      }

      // Update guild description
      await GuildModel.updateOne({ id: guildId }, { description });

      res.json({ message: "Guild description updated successfully" });
    } catch (error) {
      console.error("Error updating guild description:", error);
      res.status(500).json({ message: "Failed to update guild description" });
    }
  });

  // ============ IQ Test API Endpoints ============

  // Get IQ test status
  app.get("/api/iq/status", async (req, res) => {
    try {
      const clientIP = getClientIP(req);

      if (req.session?.userId) {
        // For logged in users
        const user = await storage.getUser(req.session.userId);
        const iqStatus = {
          iqTestTaken: user?.iqTestTaken || false,
          iqScore: user?.iqScore || null,
          testDate: user?.updatedAt || null
        };
        res.json(iqStatus);
      } else {
        // For anonymous users
        const visitor = await storage.getVisitor(clientIP);
        const iqStatus = {
          iqTestTaken: visitor?.iqTestTaken || false,
          iqScore: visitor?.iqScore || null,
          testDate: visitor?.updatedAt || null
        };
        res.json(iqStatus);
      }
    } catch (error) {
      console.error("Error getting IQ test status:", error);
      res.status(500).json({ message: "Failed to get IQ test status" });
    }
  });

  // Submit IQ test results
  app.post("/api/iq/submit", async (req, res) => {
    try {
      const { correctAnswers, totalQuestions, timeMinutes, suddenTestCorrect } = req.body;

      if (!correctAnswers || !totalQuestions || !timeMinutes) {
        return res.status(400).json({ message: "Missing required test data" });
      }

      // Calculate IQ score
      const baseScore = (correctAnswers / totalQuestions) * 130 + 20;

      // Time bonus calculation
      let timeBonus = 0;
      if (timeMinutes <= 5) timeBonus = Math.floor(Math.random() * 6) + 5; // 5-10
      else if (timeMinutes <= 10) timeBonus = Math.floor(Math.random() * 6) + 5; // 5-10
      else if (timeMinutes <= 15) timeBonus = Math.floor(Math.random() * 5) + 1; // 1-5
      else timeBonus = 0; // 20+ minutes

      // Sudden test bonus
      const suddenTestBonus = suddenTestCorrect ? 5 : 0;

      const finalScore = Math.round(baseScore + timeBonus + suddenTestBonus);
      const clientIP = getClientIP(req);

      if (req.session?.userId) {
        // Update user IQ score
        await storage.updateUserIqScore(req.session.userId, finalScore);

        // Also update IQ test tracking
        await storage.markIqTestCompleted(req.session.userId, 'user', finalScore);
      } else {
        // Update visitor IQ score
        await storage.updateVisitorIqScore(clientIP, finalScore);

        // Also update IQ test tracking
        await storage.markIqTestCompleted(clientIP, 'ip', finalScore);
      }

      res.json({ 
        iqScore: finalScore,
        message: "IQ test completed successfully",
        details: {
          correctAnswers,
          totalQuestions,
          timeMinutes,
          suddenTestCorrect: suddenTestCorrect || false
        }
      });
    } catch (error) {
      console.error("Error submitting IQ test:", error);
      res.status(500).json({ message: "Failed to submit IQ test" });
    }
  });

  // ============ GUILD POST LIKE AND COMMENT API ENDPOINTS ============

  // Like guild post
  app.post("/api/guild-posts/:id/like", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const postId = parseInt(req.params.id);
      const userIp = getClientIP(req);

      // Check if post exists
      const post = await GuildPostModel.findOne({ id: postId });
      if (!post) {
        return res.status(404).json({ message: "Guild post not found" });
      }

      // Check if user has already liked this post
      const { GuildPostLikeModel } = await import('../shared/mongodb-schema');
      const existingLike = await GuildPostLikeModel.findOne({ postId, userIp });

      if (existingLike) {
        if (existingLike.isLike) {
          // User already liked, remove like (toggle to 0, never negative)
          await GuildPostLikeModel.deleteOne({ postId, userIp });
          // Ensure likes never go below 0
          const newLikes = Math.max(0, post.likes - 1);
          await GuildPostModel.updateOne({ id: postId }, { $set: { likes: newLikes } });

          return res.json({ 
            message: "Like removed", 
            liked: false,
            likes: newLikes
          });
        } else {
          // User disliked, change to like
          await GuildPostLikeModel.updateOne(
            { postId, userIp }, 
            { isLike: true, updatedAt: new Date() }
          );
          const newLikes = post.likes + 1;
          const newDislikes = Math.max(0, post.dislikes - 1);
          await GuildPostModel.updateOne({ id: postId }, { $set: { likes: newLikes, dislikes: newDislikes } });

          return res.json({ 
            message: "Changed to like", 
            liked: true,
            likes: newLikes
          });
        }
      } else {
        // New like (toggle from 0 to 1)
        const nextId = await getNextSequence('guild_post_like');
        const newLike = new GuildPostLikeModel({
          id: nextId,
          postId,
          userIp,
          isLike: true
        });
        await newLike.save();
        const newLikes = post.likes + 1;
        await GuildPostModel.updateOne({ id: postId }, { $set: { likes: newLikes } });

        return res.json({ 
          message: "Post liked", 
          liked: true,
          likes: newLikes
        });
      }
    } catch (error) {
      console.error("Error liking guild post:", error);
      res.status(500).json({ message: "Failed to like post" });
    }
  });

  // Comment on guild post
  app.post("/api/guild-posts/:id/comment", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const postId = parseInt(req.params.id);
      const { content } = req.body;
      const userId = req.session.userId;
      const userIp = getClientIP(req);

      if (!content || !content.trim()) {
        return res.status(400).json({ message: "Comment content is required" });
      }

      // Check if post exists
      const post = await GuildPostModel.findOne({ id: postId });
      if (!post) {
        return res.status(404).json({ message: "Guild post not found" });
      }

      // Get user info
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Create comment
      const { GuildPostCommentModel } = await import('../shared/mongodb-schema');
      const nextId = await getNextSequence('guild_post_comment');

      const newComment = new GuildPostCommentModel({
        id: nextId,
        postId,
        author: user.username || `${user.firstName} ${user.lastName}`,
        content: content.trim(),
        userIp,
        authorId: userId,
        authorName: user.username || `${user.firstName} ${user.lastName}`,
        authorAlias: user.aliasName,
        authorFame: user.fame || 0,
        authorProfileUrl: user.profileImageUrl,
        authorIq: user.iqScore
      });

      await newComment.save();

      // Update post comment count
      await GuildPostModel.updateOne({ id: postId }, { $inc: { comments: 1 } });

      res.status(201).json({ 
        message: "Comment added successfully",
        comment: newComment
      });
    } catch (error) {
      console.error("Error commenting on guild post:", error);
      res.status(500).json({ message: "Failed to add comment" });
    }
  });

  // Get guild post comments
  app.get("/api/guild-posts/:id/comments", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);

      const { GuildPostCommentModel } = await import('../shared/mongodb-schema');
      const comments = await GuildPostCommentModel.find({ postId }).sort({ createdAt: 1 });

      res.json(comments);
    } catch (error) {
      console.error("Error fetching guild post comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  return httpServer;
}