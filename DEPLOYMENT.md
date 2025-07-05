# Deployment Guide

## GitHub Repository Setup

### 1. Create GitHub Repository
1. Go to GitHub and create a new repository
2. Clone this project to your local machine
3. Push the code to your GitHub repository

### 2. Configure GitHub Secrets
Go to your repository settings → Secrets and variables → Actions, then add these secrets:

#### Database & Authentication
- `DATABASE_URL` - Your PostgreSQL connection string (from Neon, Supabase, or other provider)
- `SESSION_SECRET` - A random string for session encryption (generate with `openssl rand -base64 32`)

#### OAuth Credentials
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `DISCORD_CLIENT_ID` - Discord OAuth client ID
- `DISCORD_CLIENT_SECRET` - Discord OAuth client secret

#### Email Service
- `EMAIL_USER` - Your email address for sending notifications
- `EMAIL_PASS` - Your email password or app password

#### Vercel Deployment
- `VERCEL_TOKEN` - Your Vercel deployment token
- `ORG_ID` - Your Vercel organization ID
- `PROJECT_ID` - Your Vercel project ID

### 3. Set up OAuth Applications

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `https://your-domain.vercel.app/api/auth/google/callback`
   - `https://kaiserliche.my.id/api/auth/google/callback` (if using custom domain)

#### Discord OAuth
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to OAuth2 section
4. Add redirect URIs:
   - `https://your-domain.vercel.app/api/auth/discord/callback`
   - `https://kaiserliche.my.id/api/auth/discord/callback` (if using custom domain)

### 4. Database Setup

#### Using Neon (Recommended)
1. Go to [Neon Console](https://console.neon.tech/)
2. Create a new project
3. Copy the connection string
4. Add it as `DATABASE_URL` in GitHub secrets

#### Using Supabase
1. Go to [Supabase](https://supabase.com/)
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string
5. Add it as `DATABASE_URL` in GitHub secrets

### 5. Vercel Setup
1. Go to [Vercel](https://vercel.com/)
2. Import your GitHub repository
3. Set up environment variables (same as GitHub secrets)
4. Deploy the project
5. Copy the Vercel token, organization ID, and project ID to GitHub secrets

## Deployment Process

### Automatic Deployment
- Push to `main` branch triggers automatic deployment
- Database migrations run when schema changes are detected
- All environment variables are automatically configured

### Manual Deployment
```bash
# Build the project
npm run build

# Deploy to Vercel
vercel --prod

# Run database migrations
npm run db:push
```

## Environment Variables

Create a `.env` file for local development:

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Session
SESSION_SECRET=your-random-session-secret

# OAuth - Google
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# OAuth - Discord
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret

# Email
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-email-password

# Development
NODE_ENV=development
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check if `DATABASE_URL` is correct
   - Ensure database is accessible from Vercel
   - Run `npm run db:push` to update schema

2. **OAuth Redirect URI Mismatch**
   - Update redirect URIs in Google/Discord console
   - Ensure they match your deployment domain

3. **Session Issues**
   - Check if `SESSION_SECRET` is set
   - Ensure it's the same across all instances

4. **Email Service Not Working**
   - Verify email credentials
   - Check if app passwords are required (Gmail)
   - Ensure less secure apps are enabled if needed

### Deployment Verification
1. Check if all API endpoints are working
2. Test OAuth login flows
3. Verify database operations
4. Test email notifications
5. Check mobile responsiveness

## Custom Domain Setup

### 1. Add Custom Domain to Vercel
1. Go to your Vercel project
2. Go to Settings → Domains
3. Add your custom domain
4. Configure DNS records

### 2. Update OAuth Redirect URIs
1. Update Google OAuth redirect URIs
2. Update Discord OAuth redirect URIs
3. Update any hardcoded domain references

### 3. SSL Certificate
- Vercel automatically provides SSL certificates
- Custom domains get automatic HTTPS

## Monitoring & Maintenance

### 1. Monitor Application
- Check Vercel deployment logs
- Monitor database performance
- Track user engagement metrics

### 2. Regular Updates
- Update dependencies regularly
- Monitor security vulnerabilities
- Backup database periodically

### 3. Performance Optimization
- Enable Vercel Edge Functions if needed
- Optimize database queries
- Monitor API response times