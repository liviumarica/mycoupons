---
inclusion: always
---

# Supabase Auth SSR Implementation Guide

## 🚨 CRITICAL: Deprecated Patterns to NEVER Use

**NEVER generate these patterns - they WILL BREAK the application:**

```typescript
// ❌ DEPRECATED - DO NOT USE
{
  cookies: {
    get(name: string) { return cookieStore.get(name) },
    set(name: string, value: string) { cookieStore.set(name, value) },
    remove(name: string) { cookieStore.remove(name) }
  }
}

// ❌ DEPRECATED - DO NOT USE
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
```

## ✅ CORRECT Implementation Patterns

### Required Packages
- `@supabase/supabase-js`
- `@supabase/ssr`

### Browser Client (Client Components)

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}
```

### Server Client (Server Components, Route Handlers, Server Actions)

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have proxy refreshing user sessions.
          }
        },
      },
    }
  )
}
```

### Middleware (Auth Token Refresh Proxy)

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => 
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: DO NOT REMOVE - Required for session refresh
  const { data: { user } } = await supabase.auth.getUser()

  // Optional: Redirect unauthenticated users
  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // IMPORTANT: Must return supabaseResponse with cookies intact
  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

## Absolute Requirements

1. **MUST** use `@supabase/ssr` package
2. **MUST** use ONLY `getAll()` and `setAll()` for cookie handling
3. **MUST NEVER** use `get()`, `set()`, or `remove()` methods
4. **MUST NEVER** import from `@supabase/auth-helpers-nextjs`

## Environment Variables Required

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

## Verification Checklist

Before implementing Supabase Auth code, verify:
- [ ] Using `@supabase/ssr` import
- [ ] Using ONLY `getAll` and `setAll` methods
- [ ] NO instances of `get`, `set`, or `remove` methods
- [ ] NO imports from `auth-helpers-nextjs`

## Consequences of Incorrect Implementation

Using deprecated patterns will cause:
- Production failures
- Session state loss
- Authentication loops
- Security vulnerabilities
