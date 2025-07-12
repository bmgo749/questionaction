# Queit

A comprehensive multilingual knowledge platform with user authentication, article creation, and community engagement features.

## Features

- 🌍 **Multilingual Support**: English, Indonesian, and Malay
- 🔐 **OAuth Authentication**: Google and Discord login
- 📝 **Article Creation**: Rich text editor with image upload
- 💬 **Comment System**: User profiles with fame system
- 📈 **Trending Articles**: Algorithm based on likes and engagement
- 🏆 **Fame System**: Points for article creation and engagement
- 📱 **Responsive Design**: Mobile-first approach
- 🌙 **Dark Mode**: Complete theme support

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **Wouter** for routing
- **TanStack Query** for state management

### Backend
- **Node.js** with Express
- **TypeScript** with ES modules
- **Drizzle ORM** for database operations
- **PostgreSQL** database
- **Passport.js** for authentication

### Deployment
- **Vercel** for hosting
- **GitHub Actions** for CI/CD
- **Neon** for PostgreSQL database

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd queit
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file with:
   ```env
   DATABASE_URL=your_postgresql_url
   SESSION_SECRET=your_session_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   DISCORD_CLIENT_ID=your_discord_client_id
   DISCORD_CLIENT_SECRET=your_discord_client_secret
   EMAIL_USER=your_email
   EMAIL_PASS=your_email_password
   ```

4. **Run database migrations**
   ```bash
   npm run db:push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## Deployment

### GitHub Actions Setup

1. **Add Repository Secrets**
   - `DATABASE_URL`: PostgreSQL connection string
   - `SESSION_SECRET`: Session encryption key
   - `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: Google OAuth credentials
   - `DISCORD_CLIENT_ID` & `DISCORD_CLIENT_SECRET`: Discord OAuth credentials
   - `EMAIL_USER` & `EMAIL_PASS`: Email service credentials
   - `VERCEL_TOKEN`: Vercel deployment token
   - `ORG_ID` & `PROJECT_ID`: Vercel organization and project IDs

2. **Deploy to Vercel**
   - Push to `main` branch triggers automatic deployment
   - Database migrations run automatically when schema changes

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── contexts/       # React contexts
│   │   └── lib/           # Utility functions
├── server/                 # Express backend
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Database operations
│   ├── auth.ts            # Authentication logic
│   └── db.ts              # Database connection
├── shared/                 # Shared types and schemas
│   └── schema.ts          # Database schema
├── .github/workflows/     # GitHub Actions
└── vercel.json           # Vercel configuration
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Email registration
- `POST /api/auth/signin` - Email login
- `POST /api/auth/verify` - Email verification
- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/discord` - Discord OAuth

### Articles
- `GET /api/articles` - Get all articles
- `POST /api/articles` - Create article
- `GET /api/articles/trending` - Get trending articles
- `GET /api/articles/search` - Search articles
- `GET /api/articles/:id` - Get article by ID

### User Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile

## Database Schema

### Users
- Profile management with avatar, alias, description
- Fame system with points calculation
- OAuth and email authentication support

### Articles
- Rich content with categories and thumbnails
- Like/dislike system with anonymous IP tracking
- Author attribution and engagement metrics

### Comments
- User profile integration
- Hierarchical comment structure
- Real-time updates

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.