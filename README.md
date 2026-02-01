# Leora ERP System

A comprehensive Enterprise Resource Planning (ERP) system designed for construction project management, Cost Budget Plans (RAB), and company operations. Built with Next.js and Supabase.

## Key Features

- **ERP Core**: Data integration for efficient business operations.
- **RAB Management**: Detailed creation and calculation of project cost budgets.
- **Meeting Management**: Meeting scheduling and Minutes of Meeting (MoM) recording.
- **Document Export**: Support for exporting reports to PDF and Excel formats.
- **Auth & Permissions**: Secure login with Supabase Auth and Role-Based Access Control (RBAC).
- **Modern Design**: Responsive and user-friendly interface.

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **Form & Validation**: React Hook Form & Zod
- **Data Fetching**: TanStack Query

## Getting Started

Follow these steps to run the application on your local machine:

### Prerequisites
Ensure you have Node.js and a package manager installed (recommended: **pnpm**).

### Installation Steps

1.  **Install Dependencies**
    Run the following command in your terminal:
    ```bash
    pnpm install
    ```

2.  **Setup Environment Variables**
    Make sure you have an environment file (`.env` or `.env.local`) containing your Supabase configuration:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

3.  **Run Development Server**
    Start the application in development mode:
    ```bash
    pnpm dev
    ```

4.  **Access the Application**
    Open your browser and visit [http://localhost:3000](http://localhost:3000).

## Other Scripts

- `pnpm build`: Build the application for production.
- `pnpm start`: Run the production build.
- `pnpm lint`: Run the linter to check code quality.
- `pnpm db:pull`: Update TypeScript types from the Supabase database.

## 📂 Project Structure

- `src/app`: App Router pages and API routes.
- `src/components`: UI components (Shadcn) and feature modules.
- `src/lib`: Utility functions, Supabase clients, and hooks.
- `src/types`: TypeScript definitions and database schemas.
- `src/hooks`: Custom React hooks (e.g., `useRABCalculation`).

## 📚 Internal Documentation

- **[Authentication Guide](./AUTH.md)**: Details on Supabase Auth & protected routes.
- **[Caching Strategy](./CACHING_IMPLEMENTATION.md)**: How the app handles data caching for performance.
- **[CRM Optimization](./CRM_FETCHING_OPTIMIZATIONS.md)**: Specifics on how CRM data loading is optimized.
- **[Color Palette](./COLOR_PALETTE.md)**: The design system's color codes and usage.
