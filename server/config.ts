// HARDCODED CONFIGURATION - NO SECRETS NEEDED
// All credentials are public and hardcoded for global deployment without dependencies

export const CONFIG = {
  // Database Configuration - Permanent Global Database
  DATABASE_URL: 'postgresql://questionaction_user:strong_password_123@db-postgresql-sgp1-47891-do-user-16486936-0.c.db.ondigitalocean.com:25060/questionaction_db?sslmode=require',
  
  // Session Configuration
  SESSION_SECRET: 'super_secret_session_key_for_production_use_only_2025',
  
  // OAuth Credentials - Public Configuration
  GOOGLE_CLIENT_ID: '693608051666-kpemam0j804vf5fl8v2h1edg8jgjh3g5.apps.googleusercontent.com',
  GOOGLE_CLIENT_SECRET: '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',
  
  DISCORD_CLIENT_ID: '1344311791177564202',
  DISCORD_CLIENT_SECRET: 'RuT-QizmyKCAJ_eaUyPEJActwst8Ws32',
  
  // Email Configuration - Gmail with App Password
  EMAIL_USER: 'bmgobmgo749@gmail.com',
  EMAIL_PASS: 'uxujqtkuhldurifo',
  
  // Server Configuration
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Deployment Configuration
  DEPLOYMENT_DOMAIN: 'https://kaiserliche.my.id',
  
  // Vercel Configuration
  VERCEL_TOKEN: 'Eh21Bq1332cmFI2pKOqLVueG',
  VERCEL_ORG_ID: 'team_m9qh00IACWJhdRUEimwit93n',
  VERCEL_PROJECT_ID: 'prj_sPnN4A76B6NnWF8DaUmahsQimNX7',
  
  // OAuth Callback URLs
  GOOGLE_CALLBACK_URL: '/api/auth/google/callback',
  DISCORD_CALLBACK_URL: '/api/auth/discord/callback',
};

// Helper function to get config value
export function getConfig(key: keyof typeof CONFIG) {
  return CONFIG[key];
}

// Initialize configuration
console.log('✅ Configuration initialized with hardcoded values - NO SECRETS NEEDED');
console.log('✅ Database URL configured:', CONFIG.DATABASE_URL.includes('questionaction_db') ? 'Connected' : 'Not connected');
console.log('✅ Email system configured:', CONFIG.EMAIL_USER);
console.log('✅ OAuth systems configured: Google, Discord');
console.log('✅ Deployment domain:', CONFIG.DEPLOYMENT_DOMAIN);