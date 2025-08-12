# Technology Stack

## Frontend
- **React 18** with TypeScript - Modern React with hooks and strict typing
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework with custom design system
- **Radix UI** - Headless UI components for accessibility
- **shadcn/ui** - Pre-built component library based on Radix UI
- **TipTap** - Rich text editor for course content creation
- **React Router** - Client-side routing
- **React Query** - Server state management
- **React Hook Form** - Form handling with validation

## Backend
- **Node.js** with Express.js - RESTful API server
- **Prisma ORM** - Type-safe database operations
- **PostgreSQL** - Primary database (Supabase hosted)
- **JWT** - Authentication tokens
- **Nodemailer** - Email functionality

## AI & External Services
- **Google Generative AI** - Course content generation
- **Stripe** - Payment processing
- **Flutterwave** - African payment gateway
- **Unsplash API** - Image sourcing
- **YouTube API** - Video content integration

## Development Tools
- **TypeScript** - Static type checking
- **ESLint** - Code linting
- **Prettier** - Code formatting (implied)
- **Prisma Studio** - Database GUI

## Build & Deployment
- **Vite** - Build tool
- **Vercel** - Preferred deployment platform
- **PWA** - Progressive Web App support

## Common Commands

### Development
```bash
npm run dev              # Start frontend dev server (port 8080)
npm run server           # Start backend server (port 3001)
npm run server:prisma    # Start backend with Prisma (recommended)
```

### Database
```bash
npm run db:push          # Push schema changes to database
npm run db:generate      # Generate Prisma client
npm run db:studio        # Open Prisma Studio GUI
npm run db:switch-direct # Switch to direct DB connection
npm run db:switch-pooler # Switch to connection pooler
```

### Build & Deploy
```bash
npm run build            # Production build
npm run preview          # Preview production build
npm run lint             # Run ESLint
npm run vercel-build     # Vercel-specific build command
```

## Configuration Notes
- Uses path aliases: `@/*` maps to `./src/*`
- TypeScript config is lenient (noImplicitAny: false)
- Tailwind uses CSS variables for theming
- PWA configured with service worker
- Environment variables required for all external services