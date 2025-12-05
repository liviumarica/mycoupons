# Coupon Management Platform

A modern web application for managing discount and loyalty coupons with AI-powered extraction and smart notifications.

## Project Structure

This is a monorepo managed with pnpm workspaces and Turbo:

```
coupon-management/
├── apps/
│   └── web/              # Next.js 14+ web application
├── packages/
│   ├── core/             # Shared business logic and types
│   ├── supabase/         # Supabase client and database types
│   └── ui/               # Shared UI components (shadcn/ui)
```

## Tech Stack

- **Framework**: Next.js 15.5.7 with App Router
- **Language**: TypeScript 5.9.3
- **Styling**: Tailwind CSS 3.4.17
- **UI Components**: shadcn/ui
- **Animations**: Framer Motion 11.15.0
- **Backend**: Supabase 2.47.10 (Auth, Database, Storage, Edge Functions)
- **AI**: OpenAI GPT-4 and GPT-4 Vision
- **Monorepo**: pnpm 9.15.4 workspaces + Turbo 2.6.3
- **React**: React 19.0.0

### 🆕 Latest Updates (December 2024)
All packages updated to latest stable versions with security patches. See `UPDATE-SUMMARY.md` for details.

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+

### Installation

1. Install dependencies:

```bash
pnpm install
```

2. Set up environment variables:

```bash
cd apps/web
cp .env.example .env.local
# Edit .env.local with your actual values
```

3. Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Available Scripts

- `pnpm dev` - Start development servers for all apps
- `pnpm build` - Build all apps and packages
- `pnpm lint` - Lint all packages
- `pnpm format` - Format code with Prettier
- `pnpm type-check` - Run TypeScript type checking

## Development

### Adding New Packages

To add a dependency to a specific package:

```bash
pnpm add <package> --filter <workspace-name>
```

Example:
```bash
pnpm add zod --filter @coupon-management/core
```

### Project Guidelines

- Place shared business logic in `packages/core`
- Place UI components in `packages/ui`
- Place Supabase-related code in `packages/supabase`
- Keep app-specific code in `apps/web`

## License

Private - All rights reserved
