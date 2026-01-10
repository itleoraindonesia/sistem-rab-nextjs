# Sistem RAB Next.js - Project Documentation

## Project name

Leora Sistem Mangement (RAB, Document, etc)

## Project purpose / domain

Sistem manajemen RAB untuk perusahaan panel dinding/lantai. Mengelola perhitungan biaya proyek konstruksi, approval workflow, dan dokumentasi. Akan dikembangkan menjadi ERP/dashboard internal dengan fitur permission management, audit trail, dan document management.

## Application type (web / api / mobile)

Web application (Progressive Web App - PWA)

## Framework utama

Next.js 16.1.1 with App Router

## Language & mode (TypeScript strict, dll)

TypeScript strict mode enabled, dengan konfigurasi tsconfig.json yang ketat

## Frontend stack

- **React**: 19.2.3
- **Next.js**: 16.1.1 (App Router)
- **TypeScript**: 5.x
- **Tailwind CSS**: 4.x
- **Zustand**: State management
- **React Hook Form**: Form handling
- **Zod**: Schema validation
- **Lucide React**: Icons

## Backend stack

- **Supabase**: Backend-as-a-Service (Auth, Database, Storage, Edge Functions)
- **PostgreSQL**: Database (via Supabase)

## Database

PostgreSQL (managed by Supabase)

## ORM / Query builder

Supabase Client (JavaScript/TypeScript SDK) - Direct SQL queries dengan PostgREST

## Package manager

pnpm (v8+)

## Runtime version (Node, PHP, dll)

Node.js 18+ (LTS)

## Build tool

Next.js built-in build system (Webpack via Next.js)

## Formatter

Prettier (via ESLint config)

## Linter

ESLint 9.x dengan custom rules:

- @typescript-eslint/recommended
- @next/eslint-config-next
- Import sorting

## Test framework

Jest 30.x dengan:

- @testing-library/react
- @testing-library/jest-dom
- @testing-library/user-event
- jest-environment-jsdom

## Folder structure & fungsi tiap folder

```
src/
├── app/                    # Next.js App Router pages
│   ├── (protected)/       # Protected routes (authenticated users)
│   ├── api/               # API routes
│   ├── login/             # Authentication pages
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── ui/               # UI components (custom, akan migrasi ke shadcn/ui)
│   ├── form/             # Form-specific components
│   ├── layout/           # Layout components
│   ├── tables/           # Table components
│   └── Providers.tsx     # App providers
├── context/              # React Context providers
├── hooks/                # Custom hooks
├── lib/                  # Utility libraries
├── schemas/              # Zod validation schemas
├── __tests__/            # Test files
└── proxy.ts              # Development proxy config

public/                   # Static assets
scripts/                  # Build/utility scripts
```

## Entry point aplikasi

`src/app/layout.tsx` - Root layout dengan providers

## Routing mechanism

Next.js App Router dengan:

- File-based routing
- Dynamic routes: `[id]`, `[...slug]`
- Route groups: `(protected)`, `(public)`
- Parallel routes dan intercepting routes jika diperlukan

## State management (jika ada)

- **Zustand**: Global state management untuk master data dan form state
- **React Context**: Auth context, Form context
- **React Hook Form**: Local form state
- **Server State**: Supabase real-time subscriptions

## Data flow utama

1. **Authentication**: Supabase Auth → AuthContext → Protected routes
2. **Master Data**: Zustand store → Components → Supabase queries
3. **Form Data**: React Hook Form → Zod validation → Supabase mutations
4. **Real-time**: Supabase subscriptions → Zustand updates → UI re-renders

## Form handling library

React Hook Form 7.x dengan:

- Controlled components
- Zod schema validation
- Field arrays untuk dynamic forms
- Integration dengan React Hook Form resolvers

## Validation library

Zod 4.x untuk:

- Schema definition
- Type inference
- Runtime validation
- Form validation

## UI component rules

- **Custom components** saat ini (akan migrasi ke shadcn/ui)
- Variants pattern: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`
- Size variants: `sm`, `md`, `lg`, `icon`
- CSS variables untuk theming
- Tailwind CSS untuk styling
- Responsive design (mobile-first)

## Styling convention

- **Tailwind CSS** dengan custom design system
- CSS variables untuk colors, spacing, typography
- Component-level styling dengan `cn()` utility
- Dark mode support (prepared)
- Mobile-responsive dengan Tailwind breakpoints

## API communication pattern

- **Supabase Client**: Direct database access
- **RESTful API routes**: `/api/*` untuk custom logic
- **Real-time subscriptions**: Supabase real-time
- **Error handling**: Try-catch dengan custom error types
- **Loading states**: Suspense boundaries

## Auth mechanism

- **Supabase Auth**: Email/password authentication
- **JWT tokens**: Automatic token refresh
- **Route protection**: Middleware checks
- **Session management**: Server-side session validation

## Role / permission handling

- **Current**: Basic auth (authenticated vs anonymous)
- **Planned**: RBAC system dengan:
  - Users, Roles, Permissions tables
  - Custom claims di JWT
  - Route-level permission checks
  - Component-level access control

## Database schema ownership (existing / new)

- **Existing**: Basic RAB tables (rab_documents, master data)
- **New**: ERP features akan require schema redesign:
  - User management tables
  - Audit logging tables
  - Document template tables
  - Permission system tables

## Migration rules

- **Supabase migrations**: SQL files di `supabase/migrations/`
- **Version control**: Git-based migration tracking
- **Rollback strategy**: Down migrations untuk rollback
- **Data migration**: Careful handling of existing data

## Seed rules

- **Development seeds**: Sample data untuk development
- **Production seeds**: Master data (panels, shipping rates)
- **User seeds**: Default admin user creation
- **Conditional seeding**: Only run if tables are empty

## Coding conventions

- **TypeScript strict**: No `any`, explicit types
- **Functional components**: React.FC dengan arrow functions
- **Custom hooks**: Business logic separation
- **Error boundaries**: Graceful error handling
- **Performance**: Memoization dengan useMemo/useCallback

## Naming conventions

- **Components**: PascalCase (Button, FormRAB)
- **Hooks**: camelCase with `use` prefix (useRABCalculation)
- **Files**: kebab-case (form-rab.tsx)
- **Folders**: kebab-case (components/ui)
- **Types**: PascalCase with descriptive names
- **Constants**: SCREAMING_SNAKE_CASE

## File creation rules

- **Components**: Colocate dengan related files
- **Hooks**: `src/hooks/` dengan descriptive names
- **Utils**: `src/lib/` untuk shared utilities
- **Types**: Inline atau `src/types/` jika shared
- **Tests**: Same directory dengan `__tests__/` folder

## Refactor boundaries

- **Single Responsibility**: One component/function = one responsibility
- **File size limit**: 300 lines max per component
- **Component complexity**: Extract jika > 5 props atau complex logic
- **State management**: Local state vs global state decision tree

## Performance constraints

- **Bundle size**: < 500KB initial load
- **Lighthouse score**: > 90 untuk semua metrics
- **Core Web Vitals**: Good/Fast scores
- **Memory usage**: Efficient state management
- **Database queries**: Optimized dengan indexes

## Security constraints

- **Authentication**: Supabase Auth dengan MFA support
- **Authorization**: Row Level Security (RLS) policies
- **Input validation**: Zod schemas + server-side validation
- **XSS protection**: Next.js built-in + Content Security Policy
- **CSRF protection**: Next.js CSRF token handling

## Error handling pattern

- **Client-side**: try-catch blocks dengan user-friendly messages
- **Server-side**: Error boundaries + global error handler
- **API errors**: Standardized error response format
- **Logging**: Console.error untuk development, proper logging untuk production
- **Fallback UI**: Error boundaries dengan retry options

## Logging pattern

- **Development**: Console logging dengan structured data
- **Production**: Supabase logging + external service (planned)
- **Audit trail**: Database logging untuk business actions
- **Performance**: Web vitals tracking
- **Errors**: Sentry/error tracking service (planned)

## What CAN be changed

- UI component library (migration to shadcn/ui)
- State management solution (if needed)
- Database schema (with migrations)
- Build tools and configurations
- Testing framework setup
- Folder structure (with team agreement)

## What CANNOT be changed

- Next.js as framework
- Supabase as backend
- TypeScript strict mode
- Core business logic (RAB calculations)
- Existing database data integrity
- Authentication flow

## What MUST NOT be assumed

- User permissions (always check auth state)
- Network connectivity (offline-first approach)
- Browser compatibility (modern browsers only)
- Data consistency (always validate)
- Performance on low-end devices (test thoroughly)

## How to run project (dev / prod)

### Development

```bash
pnpm install
pnpm dev
```

### Production Build

```bash
pnpm build
pnpm start
```

### Testing

```bash
pnpm test
pnpm test:coverage
```

## Environment variable rules

- **Required**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Optional**: `SUPABASE_SERVICE_ROLE_KEY` (server-side only)
- **Naming**: `NEXT_PUBLIC_` prefix untuk client-side
- **Validation**: Runtime validation di app startup
- **Security**: Never commit secrets to git

## AI behavior rules (read-only, patch-only, dll)

- **Read operations**: Full access untuk analysis
- **Create/Update**: Only dengan explicit approval
- **Delete operations**: Require confirmation
- **Database changes**: Migration-first approach
- **Production data**: Never modify without approval
- **Code changes**: Follow existing patterns and conventions

## Output expectations (diff / snippet / full file)

- **New files**: Full file content
- **Modifications**: SEARCH/REPLACE blocks dengan context
- **Refactors**: Multiple targeted changes
- **Documentation**: Clear explanations
- **Tests**: Complete test coverage untuk new features

## Known limitations

- **PWA offline**: Limited offline functionality
- **Real-time**: Supabase real-time has connection limits
- **File uploads**: Size limits dari Supabase storage
- **Complex calculations**: Client-side only (no server-side validation)
- **Mobile UX**: Some features optimized for desktop

## Known unknowns

- **Scalability limits**: Database performance at scale
- **Integration points**: Third-party service integrations
- **Regulatory compliance**: Industry-specific requirements
- **Multi-tenancy**: If needed for future expansion
- **Internationalization**: Multi-language support requirements
