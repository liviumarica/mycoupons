# Coupon Management Platform

A modern web application for managing discount and loyalty coupons with AI-powered extraction and smart notifications.

## Features

- 🔐 **Secure Authentication** - Magic link authentication via Supabase Auth
- 🤖 **AI-Powered Extraction** - Extract coupon data from text or images using OpenAI GPT-4 Vision
- 📱 **Web Push Notifications** - Receive timely reminders before coupons expire
- 🎨 **Beautiful UI** - Modern, responsive design with smooth animations
- 🔍 **Smart Filtering** - Filter and sort coupons by merchant, type, and expiration
- 🔒 **Data Privacy** - Row-level security ensures your data stays private
- 📦 **Monorepo Architecture** - Scalable structure ready for mobile and browser extensions

## Project Structure

This is a monorepo managed with pnpm workspaces and Turbo:

```
coupon-management/
├── apps/
│   └── web/              # Next.js 15+ web application
│       ├── src/
│       │   ├── app/      # App Router pages and API routes
│       │   ├── components/ # React components
│       │   └── lib/      # Utilities and clients
│       └── docs/         # Feature documentation
├── packages/
│   ├── core/             # Shared business logic and types
│   ├── supabase/         # Supabase client and database types
│   └── ui/               # Shared UI components (shadcn/ui)
└── supabase/
    ├── functions/        # Edge Functions
    └── migrations/       # Database migrations
```

## Tech Stack

- **Framework**: Next.js 15.5.7 with App Router
- **Language**: TypeScript 5.9.3
- **Styling**: Tailwind CSS 3.4.17
- **UI Components**: shadcn/ui + Radix UI
- **Animations**: Framer Motion 11.15.0
- **Backend**: Supabase 2.47.10 (Auth, Database, Storage, Edge Functions)
- **AI**: OpenAI GPT-4 and GPT-4 Vision
- **Monorepo**: pnpm 9.15.4 workspaces + Turbo 2.6.3
- **React**: React 19.0.0

### 🆕 Latest Updates (December 2024)
All packages updated to latest stable versions with security patches. See `UPDATE-SUMMARY.md` for details.

## Getting Started

### Prerequisites

- **Node.js** 18.0.0 or higher
- **pnpm** 9.0.0 or higher
- **Supabase account** (free tier available)
- **OpenAI API key** (for AI extraction features)

### Quick Start

1. **Clone the repository:**

```bash
git clone <repository-url>
cd coupon-management
```

2. **Install dependencies:**

```bash
pnpm install
```

3. **Set up environment variables:**

```bash
cd apps/web
cp .env.example .env.local
```

Edit `.env.local` with your actual values:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key

# Web Push Notifications (VAPID keys)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
```

4. **Set up Supabase:**

Follow the [Supabase Setup Guide](./SUPABASE_SETUP.md) to:
- Create database tables
- Configure Row Level Security (RLS) policies
- Set up storage buckets
- Deploy Edge Functions

5. **Generate VAPID keys for push notifications:**

```bash
node apps/web/scripts/generate-vapid-keys.js
```

Copy the generated keys to your `.env.local` file.

6. **Run the development server:**

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Available Scripts

### Development

- `pnpm dev` - Start development servers for all apps
- `pnpm build` - Build all apps and packages for production
- `pnpm start` - Start production server (after build)
- `pnpm lint` - Lint all packages
- `pnpm format` - Format code with Prettier
- `pnpm type-check` - Run TypeScript type checking

### Testing

- `pnpm test` - Run all tests
- `pnpm test:ui` - Run UI component tests
- `pnpm test:rls` - Run Row Level Security policy tests

## Environment Variables

### Required Variables

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) | Supabase Dashboard → Settings → API |
| `OPENAI_API_KEY` | OpenAI API key for AI extraction | OpenAI Platform → API Keys |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | VAPID public key for push notifications | Generate with provided script |
| `VAPID_PRIVATE_KEY` | VAPID private key (server-side only) | Generate with provided script |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `NEXT_PUBLIC_APP_URL` | Application URL | `http://localhost:3000` |

## Development

### Project Guidelines

- **Shared business logic** → `packages/core`
- **UI components** → `packages/ui`
- **Supabase-related code** → `packages/supabase`
- **App-specific code** → `apps/web`

### Adding Dependencies

To add a dependency to a specific package:

```bash
pnpm add <package> --filter <workspace-name>
```

Examples:
```bash
# Add to web app
pnpm add zod --filter web

# Add to core package
pnpm add date-fns --filter @coupon-management/core

# Add to UI package
pnpm add clsx --filter @coupon-management/ui
```

### Code Style

- **TypeScript** for type safety
- **ESLint** for code quality
- **Prettier** for consistent formatting
- **Conventional Commits** for clear git history

Format code before committing:
```bash
pnpm format
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions for:
- Vercel (recommended for Next.js)
- Supabase Edge Functions
- Environment configuration
- CI/CD setup

## Documentation

📖 **[Complete Documentation Index](./DOCUMENTATION_INDEX.md)** - Full documentation catalog

### Getting Started

- [Quick Reference](./QUICK_REFERENCE.md) - ⚡ Fast access to common commands and configs
- [Setup Guide](./SETUP.md) - Initial project setup
- [Supabase Setup](./SUPABASE_SETUP.md) - Database and backend configuration

### Deployment

- [Deployment Guide](./DEPLOYMENT.md) - Production deployment instructions
- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md) - Step-by-step deployment verification
- [Production Readiness](./PRODUCTION_READINESS.md) - Pre-launch preparation guide
- [Environment Variables](./ENVIRONMENT_VARIABLES.md) - Complete environment variable reference

### Features

- [Push Notifications](./apps/web/docs/PUSH_NOTIFICATIONS.md) - Web push notification setup
- [Error Handling](./apps/web/docs/ERROR_HANDLING.md) - Error handling patterns
- [Performance](./apps/web/docs/PERFORMANCE_OPTIMIZATIONS.md) - Performance optimization guide

### CI/CD

- [GitHub Actions](./.github/README.md) - CI/CD pipeline documentation

## Architecture

### Monorepo Benefits

- **Code Sharing**: Shared packages reduce duplication
- **Type Safety**: TypeScript types shared across packages
- **Consistent Tooling**: Unified linting, formatting, and testing
- **Efficient Builds**: Turbo caches and parallelizes builds
- **Future-Ready**: Easy to add mobile apps or browser extensions

### Security

- **Row Level Security (RLS)**: Database-level access control
- **Server-Side API Keys**: OpenAI keys never exposed to client
- **Magic Link Auth**: Passwordless authentication via Supabase
- **HTTPS Only**: All connections encrypted
- **Input Validation**: Server-side validation for all inputs

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests: `pnpm test`
4. Format code: `pnpm format`
5. Commit with conventional commits
6. Create a pull request

## Troubleshooting

### Common Issues

**Build Errors:**
```bash
# Clear cache and rebuild
rm -rf .turbo node_modules
pnpm install
pnpm build
```

**Type Errors:**
```bash
# Regenerate Supabase types
cd packages/supabase
pnpm generate-types
```

**Environment Variables Not Loading:**
- Ensure `.env.local` is in `apps/web/` directory
- Restart the development server
- Check variable names start with `NEXT_PUBLIC_` for client-side access

## Support

- 📖 [Documentation](./docs)
- 🐛 [Issue Tracker](./issues)
- 💬 [Discussions](./discussions)

## License

Private - All rights reserved
