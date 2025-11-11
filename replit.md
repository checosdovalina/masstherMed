# Clínica de Terapias Management System

## Overview

This is a comprehensive clinic management system designed for Massther Med°, a therapy clinic specializing in professional therapeutic massages. The application provides tools for managing patients, therapists, appointments, and clinical records in a healthcare setting.

The system is built as a full-stack web application with a React-based frontend and Express.js backend, currently using in-memory storage with the infrastructure in place to migrate to PostgreSQL/Neon database when needed.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing (instead of React Router)

**UI Component System:**
- Shadcn/ui component library based on Radix UI primitives
- Tailwind CSS for styling with custom design tokens
- Material Design principles adapted for healthcare applications
- Custom theme system supporting light/dark modes

**Design System:**
- Typography: Inter (primary UI) and Merriweather (clinical notes)
- Spacing: Tailwind units (2, 4, 6, 8) for consistent layout
- Component variants using class-variance-authority
- Custom CSS variables for theming in index.css

**State Management:**
- TanStack Query (React Query) for server state management and caching
- React Context for authentication state
- Form state managed by React Hook Form with Zod validation

### Backend Architecture

**Server Framework:**
- Express.js with TypeScript
- Session-based authentication using express-session
- In-memory session storage (MemoryStore) - production-ready for PostgreSQL sessions via connect-pg-simple

**API Design:**
- RESTful API endpoints under `/api/*`
- Authentication middleware (requireAuth) protecting routes
- Consistent error handling with appropriate HTTP status codes
- Session-based auth rather than JWT for simplicity

**Storage Layer:**
- Interface-based storage pattern (IStorage) for easy database swapping
- Current implementation: MemStorage (in-memory)
- Prepared for: PostgreSQL via Drizzle ORM
- Database schema defined in shared/schema.ts using Drizzle ORM

**Data Validation:**
- Shared Zod schemas between client and server
- Drizzle-Zod integration for type-safe schema validation
- Form validation using @hookform/resolvers with Zod

### Database Schema (PostgreSQL-ready)

**Core Entities:**
- **therapy_types**: Therapy service categories with color coding
- **therapists**: Staff members with specialties and contact info
- **patients**: Patient records with demographics and emergency contacts
- **appointments**: Scheduled therapy sessions with status tracking
- **sessions**: Clinical session records with notes and observations
- **users**: Authentication and user management

**Key Design Decisions:**
- UUID primary keys using `gen_random_uuid()`
- Timestamp fields for audit trails
- Status enums for appointment and patient states
- Array fields for therapist specialties (PostgreSQL native arrays)
- Separate session and appointment tables for clinical vs scheduling concerns

### Authentication & Authorization

**Authentication Strategy:**
- Session-based authentication (not JWT)
- bcrypt for password hashing (6 rounds)
- HTTP-only cookies for session management
- Session secret from environment variable with fallback

**Session Management:**
- Express-session middleware
- Memory store in development
- Prepared for PostgreSQL session store (connect-pg-simple) in production
- 24-hour session expiration
- Secure cookies in production environment

**Authorization Pattern:**
- requireAuth middleware for protected routes
- User verification on each authenticated request
- Automatic session cleanup on invalid user

### Route Structure

**Public Routes:**
- `GET /` - Landing page
- `POST /api/auth/login` - User authentication
- `POST /api/auth/logout` - Session termination

**Protected Routes (require authentication):**
- `/dashboard` - Main dashboard with statistics
- `/pacientes` - Patient management
- `/pacientes/:id` - Patient detail view
- `/citas` - Appointment scheduling
- `/terapeutas` - Therapist management
- `/expedientes` - Clinical records/sessions

**API Endpoints:**
- `/api/patients` - CRUD operations for patients
- `/api/therapists` - CRUD operations for therapists
- `/api/appointments` - CRUD operations for appointments
- `/api/sessions` - CRUD operations for clinical sessions
- `/api/therapy-types` - CRUD operations for therapy categories
- `/api/auth/session` - Current session verification

## External Dependencies

### Database & ORM
- **Drizzle ORM** (v0.39.1): TypeScript ORM for PostgreSQL
- **@neondatabase/serverless** (v0.10.4): Neon PostgreSQL serverless driver
- **drizzle-kit**: Database migrations and schema management
- Configuration in `drizzle.config.ts` pointing to PostgreSQL via DATABASE_URL

### UI Component Libraries
- **@radix-ui/***: Unstyled, accessible component primitives (20+ components)
- **shadcn/ui**: Pre-styled Radix UI components with Tailwind
- **lucide-react**: Icon library (consistent with design system)
- **cmdk**: Command palette component
- **date-fns** (v3.6.0): Date manipulation and formatting

### Form Management & Validation
- **react-hook-form**: Form state management
- **@hookform/resolvers**: Validation resolvers
- **zod**: Runtime type validation
- **drizzle-zod**: Generate Zod schemas from Drizzle tables

### State & Data Fetching
- **@tanstack/react-query** (v5.60.5): Server state management, caching, synchronization
- Query client configured with infinite stale time and disabled refetch

### Authentication & Security
- **bcrypt** (v6.0.0): Password hashing
- **express-session**: Session middleware
- **connect-pg-simple** (v10.0.0): PostgreSQL session store (prepared, not yet active)
- **memorystore**: In-memory session storage for development

### Styling & Theming
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **clsx** / **tailwind-merge**: Conditional className utilities
- Custom CSS variables for theme tokens

### Development Tools
- **Vite**: Build tool and dev server
- **@vitejs/plugin-react**: React support for Vite
- **@replit/vite-plugin-***: Replit-specific development tools
- **tsx**: TypeScript execution for Node.js
- **esbuild**: Fast bundler for production builds

### Fonts
- **Google Fonts**: Inter (UI) and Merriweather (clinical notes)
- Preconnected in HTML for performance