# Sistem RAB Leora - Global Context

## Overview
Sistem ERP terintegrasi untuk PT Maju Mandiri Gemilang Terang dan PT Leora Konstruksi Indonesia. Sistem ini dibangun untuk mengelola operasional bisnis konstruksi dari penawaran hingga proyek selesai.

## Tech Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **UI Library**: DaisyUI + TailwindCSS
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod validation

### Backend
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **API**: RESTful API + Supabase client
- **ORM**: Supabase client (no ORM)

### Infrastructure
- **Hosting**: Vercel
- **Database**: Supabase
- **Email**: Supabase (SMTP optional)
- **Storage**: Supabase Storage

## Architecture

### Authentication & Authorization
- **Auth System**: Supabase Auth dengan Magic Link
- **RBAC**: Role-based access control dengan enum roles
  - `admin`: Full access semua modul
  - `manager`: Department-based access (Corsec, Finance, Human Capital, Konstruksi, Marketing, PBD, SCM)
  - `reviewer`: Create + Submit + Review dokumen
  - `approver`: Create + Submit + Approve dokumen
  - `user`: Create own + Submit + View limited
- **RLS**: Row Level Security - auth-only (semua authenticated user bisa akses data)
- **Middleware**: Auto session refresh, redirect ke login jika tidak authenticated

### Permission System
- **Matrix**: Hardcoded permission matrix di TypeScript
- **Guards**: Frontend permission guards (PermissionGuard, RoleGuard, DepartmentGuard)
- **Route Guards**: Server-side route protection dengan requirePermission()

### Data Flow
- **Caching**: TanStack Query dengan staleTime 1-5 menit
- **RPC Functions**: Database functions untuk complex operations
- **Type Safety**: Generated types dari Supabase schema
- **Optimistic Updates**: Real-time UI updates dengan cache invalidation

## Coding Conventions

### TypeScript
- **Types**: Import dari generated Supabase types (`TablesInsert`, `Tables`)
- **Interfaces**: Custom interfaces untuk complex objects (WorkflowStage, CalculatorConfig)
- **Enums**: Database enums (letter_status, user_role, sales_stage)

### File Structure
```
src/
├── app/                    # Next.js App Router
├── components/             # Reusable UI components
│   ├── ui/                # Base UI components (Button, Input, etc.)
│   ├── auth/              # Auth-related components
│   └── [module]/          # Module-specific components
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities & configurations
│   ├── supabase/          # Database client & services
│   └── [module]/          # Module utilities
└── types/                  # TypeScript type definitions
```

### Naming Conventions
- **Components**: PascalCase (UserProfile, PermissionGuard)
- **Hooks**: camelCase with `use` prefix (useUser, usePermissions)
- **Functions**: camelCase (createLetter, updateUser)
- **Files**: kebab-case (user-creation.tsx, permission-guard.tsx)
- **Constants**: UPPER_SNAKE_CASE (PERMISSION_MATRIX, AI_MODELS)

### Error Handling
- **Try-catch**: Dalam async functions
- **Toast notifications**: User-friendly error messages
- **Fallback UI**: Loading states dan error states
- **Retry logic**: Automatic retry untuk network errors

## Module List

### Core Modules (Active)
1. **Dashboard** - Overview operasional dengan charts & statistics
2. **Dokumen Surat Keluar** - Workflow draft → submit → review → approve
3. **CRM** - Pipeline penjualan dengan tracking source (Instagram/WhatsApp)
4. **Produk & RAB** - Sistem kalkulator terintegrasi dengan embed widget
5. **Meeting (MoM)** - Notulen rapat internal & eksternal

### Master Data
6. **Master Data** - Instansi, document types, workflow stages
7. **File Manager** - Storage dan management dokumen

### Advanced Modules (Active/Development)
8. **Konstruksi** - Project tracking dengan vendor SPK & progress monitoring
9. **AI Assistant** - Chatbot untuk automation tasks menggunakan OpenRouter + Claude 3
10. **Supply Chain** - Planned, belum implementasi

### Future Modules (Planned)
11. **Vendor Portal** - Direct access untuk supplier & subcontractor
12. **Client Portal** - Direct access untuk pemilik proyek
13. **Mobile App** - React Native untuk field operations

## Business Context

### Company Profile
- **PT Maju Mandiri Gemilang Terang**: Holding company
- **PT Leora Konstruksi Indonesia**: Operating company
- **Business**: Konstruksi & engineering
- **Products**: Panel Beton, Pagar Beton, Sandwich Panel, U-Ditch, Jasa Konstruksi

### Operational Flow
1. **Lead Generation**: Instagram DM, WhatsApp inquiry
2. **CRM Pipeline**: Lead → Quotation → Invoice Deal → WIP → Finish
3. **Document Workflow**: Surat Penawaran → Review → Approval → Contract
4. **Project Execution**: SPK Vendor → Progress Tracking → Payment → Completion
5. **Financial**: Customer payment → Vendor payment → Margin analysis

### Key Metrics
- **Lead Conversion Rate**: Instagram vs WhatsApp channels
- **Document Processing Time**: Draft to approval
- **Project Margin**: Contract value vs total SPK
- **Cash Flow**: Customer payment timing vs vendor payment
- **Project Progress**: Weighted average vendor progress

## Development Workflow

### Git Flow
- **Main branch**: `main` (production)
- **Feature branches**: `feature/[module]-[description]`
- **PR Reviews**: Required untuk semua changes
- **CI/CD**: Automatic deploy to staging/production

### Documentation
- **Code Comments**: JSDoc untuk functions, interfaces
- **README**: Setup instructions & API docs
- **Architecture Docs**: Di folder `docs/`
- **Database Migrations**: SQL files dengan comments

### Testing Strategy
- **Unit Tests**: Critical business logic
- **Integration Tests**: API endpoints & database functions
- **E2E Tests**: Critical user flows (login, document workflow)
- **Manual Testing**: UI/UX validation

## Security Considerations

### Data Protection
- **RLS**: Row Level Security untuk data isolation
- **JWT**: Secure token-based authentication
- **HTTPS**: All communications encrypted
- **Input Validation**: Zod schemas untuk all inputs

### Access Control
- **Principle of Least Privilege**: Users only access what they need
- **Audit Trail**: All user actions logged
- **Session Management**: Auto logout on inactivity
- **Password Policies**: Secure password requirements

### Compliance
- **GDPR**: Data protection & user consent
- **Business Ethics**: Fair vendor/client treatment
- **Financial Integrity**: Accurate transaction recording

## Performance Optimization

### Frontend
- **Code Splitting**: Dynamic imports untuk large components
- **Image Optimization**: Next.js Image component
- **Caching**: Aggressive caching dengan TanStack Query
- **Bundle Analysis**: Regular bundle size monitoring

### Backend
- **Database Indexing**: Strategic indexes untuk query performance
- **Connection Pooling**: Efficient database connections
- **RPC Functions**: Server-side business logic
- **CDN**: Static asset delivery via Vercel CDN

## Monitoring & Maintenance

### Error Tracking
- **Console Logs**: Development debugging
- **Supabase Logs**: Database errors & performance
- **User Feedback**: In-app error reporting
- **Analytics**: Usage patterns & feature adoption

### Backup & Recovery
- **Database Backups**: Automatic via Supabase
- **Code Repository**: Git version control
- **Documentation**: Up-to-date technical docs
- **Runbooks**: Incident response procedures

---

*Last Updated: 2026-04-04*
*Maintainer: Development Team*