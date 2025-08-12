# Project Structure

## Root Level
```
├── src/                 # Frontend source code
├── server/              # Backend API server
├── prisma/              # Database schema and migrations
├── public/              # Static assets
├── README/              # Documentation files
├── api/                 # Vercel API routes
├── scripts/             # Utility scripts
└── uploads/             # File upload storage
```

## Frontend Structure (`src/`)
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   └── layouts/        # Layout components (DashboardLayout, AdminLayout)
├── pages/              # Route components
│   └── admin/          # Admin-specific pages
├── contexts/           # React contexts (ThemeContext)
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries (utils, prisma client)
├── minimal-tiptap/     # Rich text editor components
├── res/                # Resources (images, assets)
├── App.tsx             # Main app component with routing
├── main.tsx            # React app entry point
└── index.css           # Global styles
```

## Backend Structure (`server/`)
```
server/
├── server.js           # MongoDB server (legacy)
├── server-prisma.js    # Prisma/PostgreSQL server (current)
└── .env                # Server environment variables
```

## Database (`prisma/`)
```
prisma/
└── schema.prisma       # Database schema definition
```

## Key Architectural Patterns

### Component Organization
- **UI Components**: Located in `src/components/ui/` (shadcn/ui based)
- **Feature Components**: Located in `src/components/` (business logic)
- **Layout Components**: Located in `src/components/layouts/`
- **Page Components**: Located in `src/pages/` (route handlers)

### Routing Structure
- **Public Routes**: `/`, `/about`, `/blog`, etc.
- **Dashboard Routes**: `/dashboard/*` (protected, uses DashboardLayout)
- **Admin Routes**: `/admin/*` (protected, uses AdminLayout)
- **Course Routes**: `/course/:courseId/*`
- **Payment Routes**: `/payment-*`

### Data Layer
- **Database Models**: Defined in `prisma/schema.prisma`
- **API Client**: Prisma client in `src/lib/prisma.ts`
- **Server API**: Express routes in `server/server-prisma.js`

### Styling Approach
- **Tailwind CSS**: Utility-first styling
- **CSS Variables**: Theme system using HSL color space
- **Component Variants**: Using `class-variance-authority`
- **Responsive Design**: Mobile-first approach

### State Management
- **Server State**: React Query for API data
- **Client State**: React hooks and context
- **Form State**: React Hook Form
- **Theme State**: ThemeContext

### File Naming Conventions
- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Pages**: PascalCase (e.g., `Dashboard.tsx`)
- **Utilities**: camelCase (e.g., `utils.ts`)
- **Hooks**: camelCase with `use` prefix (e.g., `useAuth.ts`)

### Import Patterns
- Use path aliases: `@/components`, `@/lib`, `@/hooks`
- Absolute imports preferred over relative imports
- Group imports: external libraries, internal modules, relative imports

### Environment Configuration
- **Frontend**: Environment variables prefixed with `VITE_`
- **Backend**: Standard environment variables in `.env`
- **Database**: Connection strings and credentials
- **External APIs**: Service-specific API keys