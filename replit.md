# WikiInfo Application

## Overview

WikiInfo is a modern web application that serves as a comprehensive knowledge platform across multiple disciplines and languages. The application features a clean, responsive design with support for multiple languages (English, Indonesian, Malay) and both light and dark themes. Built with a modern tech stack, it provides users with categorized access to information similar to Wikipedia but with a more streamlined interface.

## System Architecture

The application follows a full-stack architecture with clear separation between frontend and backend concerns:

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Routing**: Wouter for client-side routing
- **State Management**: React Context for theme and language management, TanStack Query for server state
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Development**: tsx for TypeScript execution in development
- **Production**: esbuild for bundling server code

## Key Components

### Database Layer
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured via DATABASE_URL)
- **Schema Management**: Centralized schema definitions in `shared/schema.ts`
- **Migrations**: Drizzle-kit for database migrations

### UI Components
- **Design System**: shadcn/ui components built on Radix UI primitives
- **Theme**: Custom CSS variables for consistent theming
- **Responsive Design**: Mobile-first approach with Tailwind CSS breakpoints
- **Icons**: Lucide React for consistent iconography

### Internationalization
- **Languages**: English (en), Indonesian (id), Malay (my)
- **Implementation**: Context-based translation system with localStorage persistence
- **Structure**: Nested translation keys for organized content management

### Category System
The application organizes content into 10 main categories:
- World (global affairs, international relations)
- History (historical events, civilizations)
- Science (scientific discoveries, research)
- Geography (countries, cities, natural features)
- Sports (sports history, athletes, competitions)
- Entertainment (movies, music, celebrities)
- Politics (political systems, elections, governance)
- Technology (computing, innovation, digital trends)
- Health (medical advances, wellness, healthcare)
- Education (learning systems, academic institutions)

## Data Flow

### Client-Server Communication
1. **API Routes**: RESTful endpoints under `/api/` prefix
2. **Request Handling**: Express middleware for JSON parsing and logging
3. **Error Handling**: Centralized error handling with status codes
4. **Development**: Vite dev server proxy for seamless development experience

### State Management
1. **Client State**: React Context for UI state (theme, language)
2. **Server State**: TanStack Query for caching and synchronization
3. **Local Storage**: Persistence for user preferences (theme, language)

### Frontend Routing
- Home page (`/`) - Main dashboard with category overview
- Category pages (`/category/:slug`) - Category-specific content
- 404 handling for unknown routes

## External Dependencies

### Core Dependencies
- **React Ecosystem**: React 18, React DOM, React Router (Wouter)
- **UI Framework**: Radix UI primitives, Tailwind CSS, class-variance-authority
- **State Management**: TanStack Query for server state
- **Database**: Drizzle ORM, @neondatabase/serverless for PostgreSQL
- **Development**: Vite, TypeScript, esbuild for production builds

### Development Tools
- **Linting/Formatting**: TypeScript compiler for type checking
- **Build Tools**: Vite for frontend, esbuild for backend bundling
- **Development Server**: Vite dev server with HMR support

## Deployment Strategy

### Development Environment
- **Frontend**: Vite dev server with HMR on client port
- **Backend**: tsx execution of TypeScript server code
- **Database**: PostgreSQL via environment variable configuration
- **Assets**: Served through Vite's asset handling

### Production Build
1. **Frontend**: Vite builds optimized React application to `dist/public`
2. **Backend**: esbuild bundles TypeScript server to `dist/index.js`
3. **Static Assets**: Frontend build output served by Express in production
4. **Database**: PostgreSQL connection via DATABASE_URL environment variable

### Environment Configuration
- **Development**: NODE_ENV=development with tsx and Vite
- **Production**: NODE_ENV=production with built assets
- **Database**: Configurable via DATABASE_URL environment variable

The architecture prioritizes developer experience with hot reload, type safety, and modern tooling while maintaining production readiness with optimized builds and proper error handling.

## Changelog
```
Changelog:
- July 04, 2025. Initial setup
- July 04, 2025. Logo styling updates:
  * Made QuestionAction logo black with white background in light mode
  * Changed all "questionaction" text to "QuestionAction" with capital Q
  * Removed magnifying glass icon from language selector
  * Added glow hover effects to all card components
  * Removed template articles from category pages
  * Added empty state messages for categories
- July 04, 2025. Article creation page enhancements:
  * Changed "Create Article" to "Creativity Creation" with lightbulb icon
  * Updated all field labels: Title, Category, Thumbnail, Article Formatting, Content, Language
  * Added default white background color for content editor with color customization
  * Added background color control to article formatting toolbar
  * Implemented category-based article filtering in explore pages
  * Articles now display in categories regardless of language
  * Made all data global across languages
- July 04, 2025. Article preview system with database integration:
  * Created comprehensive article preview page with full content display
  * Added likes system with visible count and global permanent storage
  * Added dislikes system (count hidden) with database persistence
  * Added favorites system with star icon and user-specific storage
  * Added comments system with author name and content
  * Implemented real-time interactions with optimistic updates
  * Added proper error handling and loading states
  * Made articles clickable from category pages to preview
  * Database storage for permanent data across sessions
- July 04, 2025. Enhanced interaction system and media features:
  * Fixed like/dislike system with instant response using optimistic updates
  * Improved like/dislike logic: clicking same button removes selection
  * Like counts update immediately and are globally permanent
  * Dislike counts remain hidden but functional for user preference tracking
  * Added file upload support for thumbnails with image preview
  * Added file validation (max 5MB, image files only)
  * Implemented fullscreen image modal for thumbnail viewing
  * Added hover effects and smooth transitions for image interactions
  * Fixed backend API endpoints with proper error handling
- July 04, 2025. User experience improvements and navigation enhancements:
  * Fixed fullscreen image modal to support scrolling for large images
  * Added exit buttons to all preview sections for better navigation
  * Category pages now have "Exit Category" button to return to home
  * Article creation page has "Exit Creation" button in header
  * Article preview pages have "Exit Article" button to go back
  * Improved responsive layout for exit buttons on all screen sizes
  * Hidden all scrollbars globally while maintaining scroll functionality via mouse/touch
  * Fixed logo in light mode: removed circular background, increased size to match dark mode
  * Logo now displays consistently across both themes without visual artifacts
- July 04, 2025. Search functionality implementation:
  * Added comprehensive search system that replaces category grid with search results
  * Created SearchResults component with proper Indonesian/English translations
  * Implemented backend search API endpoint with text matching across title, content, and categories
  * Search results show with thumbnail preview, category badges, and like counts
  * Added "Back to Home" button to return from search mode to normal view
  * Search supports real-time filtering with loading animation
  * Empty search results show user-friendly message with suggestions
  * Search interface maintains consistent styling with rest of application
- July 04, 2025. Discord OAuth integration fixes:
  * Fixed Discord OAuth URL to use root path redirect with connections scope
  * Updated all Discord login buttons to use correct authorization URL
  * Added Discord OAuth callback handler at root path to handle authorization code
  * Fixed redirect URI to match Discord app configuration
  * Discord OAuth credentials stored in .env file for deployment compatibility
- July 05, 2025. Discord OAuth domain update:
  * Changed Discord OAuth redirect URI from Replit domain to https://kaiserliche.my.id
  * Updated all Discord login buttons to use kaiserliche.my.id redirect
  * Removed connections scope, now using identify+email scopes only
  * Backend redirect_uri parameter updated to match new domain
  * OAuth flow now configured for production deployment on user's domain
- July 05, 2025. Mobile optimization and Vercel deployment setup:
  * Fixed mobile login form: removed black background panel, kept only white form with stars
  * Added Login and "Creativity Creation" buttons to mobile menu with icons
  * Created Vercel configuration file (vercel.json) for deployment
  * Added Google OAuth credentials to .env file for deployment compatibility
  * Fixed TypeScript errors in server routes for proper session handling
  * Mobile layout now shows only white form with black stars, no right panel
- July 05, 2025. Navigation restructure and new pages:
  * Updated header navigation: World→Home, History→Category, Science→Trending, Geography→Question
  * Removed Sports from navigation menu
  * Created Categories page (/categories) showing all 10 categories with article counts
  * Created Trending page (/trending) displaying most-liked articles with engagement metrics
  * Created Question page (/question) with FAQ, contact info, and legal resources
  * Added "See All Categories" button to category grid on home page
  * Added trending API endpoint that sorts articles by likes count
- July 05, 2025. Question page personalization and trending improvements:
  * Replaced categories section in Question page with personalized welcome message
  * Added greeting "Hi <username>!" or "Hi Newcomer!" for non-authenticated users
  * Enhanced trending algorithm to show top 20 articles maximum (10 per page)
  * Added pagination controls to trending page with Previous/Next buttons
  * Trending page now shows correct ranking numbers (#1-#20) across pages
  * Welcome message explains QuestionAction purpose and functionality
- July 05, 2025. GitHub deployment setup:
  * Created .github/workflows folder for GitHub Actions CI/CD
  * Added deploy.yml for automatic Vercel deployment on main branch push
  * Added db-migrate.yml for automatic database migrations on schema changes
  * Created comprehensive README.md with setup and deployment instructions
  * Added DEPLOYMENT.md with detailed deployment guide and troubleshooting
  * Configured GitHub Actions to use repository secrets for environment variables
- July 05, 2025. Permanent database and deployment configuration:
  * Made DATABASE_URL permanent using DigitalOcean PostgreSQL database
  * Removed all GitHub secrets dependency from deploy.yml
  * Added hardcoded environment variables directly in deployment files
  * Updated vercel.json with embedded environment variables
  * Created deploy-simple.yml for deployment without secrets
  * Added deploy.config.js for global deployment configuration
  * Database now accessible globally without Replit dependency
  * All OAuth credentials and API keys are public and hardcoded
- July 05, 2025. Gmail email integration completed:
  * Successfully configured Gmail SMTP with App Password (uxujqtkuhldurifo)
  * Email verification for user sign up now fully functional
  * Test email endpoint working correctly to bmgobmgo749@gmail.com
  * Updated all configuration files with new App Password
  * Removed deploy-simple.yml file as requested
  * Email system ready for production deployment
- July 05, 2025. Complete hardcoded configuration system:
  * Created server/config.ts with all hardcoded credentials and configurations
  * Eliminated all environment variable dependencies from production code
  * Updated server/db.ts, server/auth.ts, and server/routes.ts to use CONFIG object
  * Hardcoded OAuth credentials: Google (693608051666-...) and Discord (1344311791177564202)
  * Hardcoded database URL: PostgreSQL DigitalOcean permanent connection
  * Hardcoded email credentials: bmgobmgo749@gmail.com with app password
  * Updated .github/workflows/db-migrate.yml with direct database URL
  * All deployment files (deploy.yml, vercel.json, deploy.config.js) use hardcoded values
  * Created DEPLOYMENT-CHECKLIST.md documenting all configurations
  * Application ready for GitHub upload without any secrets or environment variables
  * Updated Vercel configuration with real project ID: prj_TMoYORqMmQ1mKMYh04qSWo3griMF
  * Updated Vercel organization ID: team_m9qh00IACWJhdRUEimwit93n
  * Updated Vercel token: Eh21Bq1332cmFI2pKOqLVueG
  * Fixed vercel.json by removing conflicting functions property with builds
  * Updated project owner to zunjutsu@gmail.com (Aldan Zunjutsu)
  * Changed project name to "website" as requested
  * Kept email authentication as bmgobmgo749@gmail.com (working app password)
  * Fixed Vercel deployment error by removing functions/builds conflict
```

## User Preferences
```
Preferred communication style: Simple, everyday language.
```