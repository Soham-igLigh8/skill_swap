# SkillSwap Platform

## Overview

SkillSwap is a full-stack web application that connects skilled professionals for knowledge exchange through a skill-swapping platform. Users can share their expertise, learn new skills, and build community connections through structured skill exchanges.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for development and production builds
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation
- **UI Components**: Radix UI primitives with custom styling

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon serverless PostgreSQL
- **Authentication**: Username/password authentication with Passport.js
- **Session Management**: Express sessions with PostgreSQL store

### Data Storage Solutions
- **Primary Database**: PostgreSQL via Neon serverless
- **ORM**: Drizzle ORM for type-safe database operations
- **Session Store**: PostgreSQL-based session storage
- **Schema Management**: Drizzle Kit for migrations and schema management

## Key Components

### Authentication System
- **Provider**: Username/password authentication with Passport.js Local Strategy
- **Session Management**: Express sessions with PostgreSQL backing
- **User Management**: Manual user registration and login system
- **Authorization**: Role-based access control (admin/user roles)
- **Security**: Scrypt password hashing with salt

### Core Features
- **Skill Management**: Users can create, categorize, and manage offered/wanted skills
- **Skill Discovery**: Browse and search skills by category, level, and keywords
- **Swap Requests**: Request skill exchanges with messaging system
- **User Profiles**: Comprehensive profiles with ratings, availability, and bio
- **Rating System**: Peer-to-peer rating system for completed exchanges
- **Admin Panel**: Content moderation, user management, and system administration

### Database Schema
- **Users**: Profile information, preferences, ratings, and admin status
- **Skills**: Skill definitions with categories, levels, and tags
- **Swap Requests**: Exchange requests with status tracking
- **Ratings**: User ratings and feedback system
- **Availability**: User availability scheduling
- **Admin Messages**: System-wide announcements
- **Reports**: User reporting system for content moderation

## Data Flow

1. **User Authentication**: Username/password authentication with session management, user data stored in PostgreSQL
2. **Skill Creation**: Users create skills through form validation, stored with Drizzle ORM
3. **Skill Discovery**: Real-time search and filtering through API endpoints
4. **Swap Requests**: Request creation, status updates, and messaging between users
5. **Real-time Updates**: TanStack Query manages cache invalidation and data synchronization

## Recent Changes (July 12, 2025)

- **Authentication Overhaul**: Replaced Replit Auth with username/password authentication
- **Router Fixes**: Completely rebuilt frontend routing system for stability
- **Database Schema**: Updated users table with username and password fields
- **Session Management**: Implemented PostgreSQL-based session storage
- **UI/UX**: Maintained futuristic design theme throughout authentication flow
- **Error Handling**: Added comprehensive error states and loading indicators

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL serverless driver
- **drizzle-orm**: Type-safe ORM for PostgreSQL
- **@tanstack/react-query**: Server state management
- **@radix-ui**: Accessible UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **wouter**: Lightweight React router
- **passport**: Authentication middleware
- **express-session**: Session management

### Development Tools
- **tsx**: TypeScript execution for development
- **vite**: Build tool and development server
- **drizzle-kit**: Database schema management
- **@replit/vite-plugin-runtime-error-modal**: Development error handling

## Deployment Strategy

### Build Process
1. **Frontend**: Vite builds React app to `dist/public`
2. **Backend**: esbuild compiles TypeScript server to `dist/index.js`
3. **Database**: Drizzle migrations applied via `db:push` command

### Environment Requirements
- `DATABASE_URL`: PostgreSQL connection string (Neon)
- `SESSION_SECRET`: Express session encryption key
- `REPLIT_DOMAINS`: Allowed domains for CORS
- `ISSUER_URL`: OpenID Connect issuer URL

### Production Deployment
- **Server**: Node.js process serving Express app
- **Static Files**: Vite-built frontend served from Express
- **Database**: Neon serverless PostgreSQL (auto-scaling)
- **Sessions**: Persistent sessions in PostgreSQL

### Development Workflow
- **Local Development**: `npm run dev` starts both frontend and backend
- **Database Management**: Drizzle Kit handles schema changes
- **Type Safety**: Full TypeScript coverage across frontend and backend
- **Hot Reload**: Vite HMR for frontend, tsx for backend development

The application follows a monorepo structure with shared TypeScript schemas between frontend and backend, ensuring type safety across the entire stack. The authentication system integrates seamlessly with Replit's environment while maintaining flexibility for other deployment targets.