
// CONFIGURATION WITH ENVIRONMENT VARIABLES AND SECURE FALLBACKS

export const CONFIG = {
  // Database Configuration - QueitDB dengan PostgreSQL Backend
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/queit_db',
  QUEITDB_URL: process.env.QUEITDB_URL || 'https://queit-two.vercel.app/api/queitdb',
  MONGODB_URL: process.env.MONGODB_URL || 'mongodb://localhost:27017/queit',
  MONGODB_ATLAS_URL: process.env.MONGODB_ATLAS_URL || 'mongodb+srv://Aldan:SANDI980@queit-replit.7n37zmp.mongodb.net/queit?retryWrites=true&w=majority',

  // Session Configuration
  SESSION_SECRET: process.env.SESSION_SECRET || generateSecureSecret(),

  // OAuth Credentials - Use environment variables with fallbacks
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '693608051666-kpemam0j804vf5fl8v2h1edg8jgjh3g5.apps.googleusercontent.com',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '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',

  DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID || '1344311791177564202',
  DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET || 'RuT-QizmyKCAJ_eaUyPEJActwst8Ws32',

  // Email Configuration - Gmail with App Password
  EMAIL_USER: process.env.EMAIL_USER || 'bmgobmgo749@gmail.com',
  EMAIL_PASS: process.env.email_pass || process.env.EMAIL_PASS || 'uxujqtkuhldurifo',

  // Server Configuration
  PORT: parseInt(process.env.PORT || '3000'),
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Deployment Configuration
  DEPLOYMENT_DOMAIN: process.env.DEPLOYMENT_DOMAIN || 'https://queit.site',

  // Vercel Configuration
  VERCEL_TOKEN: process.env.VERCEL_TOKEN || 'Eh21Bq1332cmFI2pKOqLVueG',
  VERCEL_ORG_ID: process.env.VERCEL_ORG_ID || 'team_m9qh00IACWJhdRUEimwit93n',
  VERCEL_PROJECT_ID: process.env.VERCEL_PROJECT_ID || 'prj_sPnN4A76B6NnWF8DaUmahsQimNX7',

  // OAuth Callback URLs
  GOOGLE_CALLBACK_URL: '/api/auth/google/callback',
  DISCORD_CALLBACK_URL: '/api/auth/discord/callback',

  // Security Configuration
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX: 100,
  SEARCH_RATE_LIMIT: 20,
  GUILD_RATE_LIMIT: 5,

  // File Upload Configuration
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  UPLOAD_PATH: 'uploads',
};

// Generate secure session secret if not provided
function generateSecureSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let result = '';
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Helper function to get config value
export function getConfig(key: keyof typeof CONFIG) {
  return CONFIG[key];
}

// Validate critical configuration
function validateConfig() {
  const criticalKeys = ['SESSION_SECRET', 'MONGODB_ATLAS_URL'];
  const missing = criticalKeys.filter(key => !CONFIG[key as keyof typeof CONFIG]);
  
  if (missing.length > 0) {
    console.warn('⚠️ Missing critical configuration:', missing);
  }
  
  // Check if we're using default OAuth credentials in production
  if (CONFIG.NODE_ENV === 'production') {
    if (CONFIG.GOOGLE_CLIENT_SECRET === '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') {
      console.warn('⚠️ Using default Google OAuth credentials in production');
    }
    if (CONFIG.DISCORD_CLIENT_SECRET === 'RuT-QizmyKCAJ_eaUyPEJActwst8Ws32') {
      console.warn('⚠️ Using default Discord OAuth credentials in production');
    }
  }
}

// Initialize configuration
console.log('✅ Configuration initialized');
console.log('✅ Database URL configured:', CONFIG.DATABASE_URL ? 'Connected' : 'Not connected');
console.log('✅ Email system configured:', CONFIG.EMAIL_USER);
console.log('✅ OAuth systems configured: Google, Discord');
console.log('✅ Deployment domain:', CONFIG.DEPLOYMENT_DOMAIN);
console.log('✅ Environment:', CONFIG.NODE_ENV);

validateConfig();
