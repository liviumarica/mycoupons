---
inclusion: always
---

# Supabase Edge Functions Best Practices

## Core Guidelines

1. **Prefer Web APIs and Deno core APIs** over external dependencies
   - Use `fetch` instead of Axios
   - Use WebSockets API instead of node-ws

2. **Shared utilities** go in `supabase/functions/_shared`
   - Import using relative paths
   - NO cross-dependencies between Edge Functions

3. **NO bare specifiers** for imports
   - ❌ `import { createClient } from '@supabase/supabase-js'`
   - ✅ `import { createClient } from 'npm:@supabase/supabase-js@2.39.0'`

4. **Always specify versions** for external dependencies
   - ❌ `npm:express`
   - ✅ `npm:express@4.18.2`

5. **Import priority order:**
   - `npm:` and `jsr:` (preferred)
   - `node:` for Node built-in APIs
   - Minimize use of `deno.land/x`, `esm.sh`, `unpkg.com`

6. **Use Node built-in APIs** when Deno APIs have gaps
   - Import with `node:` specifier
   - Example: `import process from 'node:process'`

7. **Use built-in `Deno.serve`**
   - ❌ `import { serve } from "https://deno.land/std@0.168.0/http/server.ts"`
   - ✅ `Deno.serve(async (req: Request) => { ... })`

## Pre-populated Environment Variables

These are automatically available in both local and hosted environments:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_URL`

For custom secrets, use: `supabase secrets set --env-file path/to/env-file`

## Routing

A single Edge Function can handle multiple routes. Use Express or Hono for better maintainability.

**Important:** Each route must be prefixed with `/function-name` for correct routing.

```typescript
import express from 'npm:express@4.18.2'

const app = express()

// Routes are prefixed with /my-function
app.get('/my-function/users', (req, res) => {
  res.json({ users: [] })
})

app.post('/my-function/users', (req, res) => {
  res.json({ created: true })
})

app.listen(8000)
```

## File Operations

File write operations are **ONLY permitted in `/tmp` directory**.

```typescript
// ✅ Allowed
await Deno.writeTextFile('/tmp/output.txt', data)

// ❌ Not allowed
await Deno.writeTextFile('./output.txt', data)
```

## Background Tasks

Use `EdgeRuntime.waitUntil(promise)` for long-running tasks without blocking the response.

**Note:** Do NOT assume it's available in request/execution context.

```typescript
Deno.serve(async (req: Request) => {
  const response = new Response('Processing started')
  
  // Run in background
  EdgeRuntime.waitUntil(
    longRunningTask().catch(console.error)
  )
  
  return response
})
```

## Example Templates

### Simple Hello World

```typescript
interface ReqPayload {
  name: string
}

console.info('server started')

Deno.serve(async (req: Request) => {
  const { name }: ReqPayload = await req.json()
  
  const data = {
    message: `Hello ${name}!`
  }
  
  return new Response(
    JSON.stringify(data),
    { 
      headers: { 
        'Content-Type': 'application/json',
        'Connection': 'keep-alive'
      }
    }
  )
})
```

### Using Node Built-in APIs

```typescript
import { randomBytes } from 'node:crypto'
import { createServer } from 'node:http'
import process from 'node:process'

const generateRandomString = (length: number) => {
  const buffer = randomBytes(length)
  return buffer.toString('hex')
}

const randomString = generateRandomString(10)
console.log(randomString)

const server = createServer((req, res) => {
  const message = 'Hello'
  res.end(message)
})

server.listen(9999)
```

### Using npm Packages

```typescript
import express from 'npm:express@4.18.2'

const app = express()

app.get(/(.*)/, (req, res) => {
  res.send('Welcome to Supabase')
})

app.listen(8000)
```

### Generate Embeddings with Supabase.ai

```typescript
const model = new Supabase.ai.Session('gte-small')

Deno.serve(async (req: Request) => {
  const params = new URL(req.url).searchParams
  const input = params.get('text')
  
  const output = await model.run(input, { 
    mean_pool: true, 
    normalize: true 
  })
  
  return new Response(
    JSON.stringify(output),
    {
      headers: {
        'Content-Type': 'application/json',
        'Connection': 'keep-alive'
      }
    }
  )
})
```

### Using Supabase Client

```typescript
import { createClient } from 'npm:@supabase/supabase-js@2.39.0'

Deno.serve(async (req: Request) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
  
  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
  
  return new Response(
    JSON.stringify(data),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
```

### Multi-route Function with Express

```typescript
import express from 'npm:express@4.18.2'
import { createClient } from 'npm:@supabase/supabase-js@2.39.0'

const app = express()
app.use(express.json())

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

// All routes prefixed with /my-function
app.get('/my-function/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.get('/my-function/users', async (req, res) => {
  const { data, error } = await supabase.from('users').select('*')
  
  if (error) {
    return res.status(500).json({ error: error.message })
  }
  
  res.json(data)
})

app.post('/my-function/users', async (req, res) => {
  const { data, error } = await supabase
    .from('users')
    .insert(req.body)
    .select()
  
  if (error) {
    return res.status(500).json({ error: error.message })
  }
  
  res.json(data)
})

app.listen(8000)
```

## Code Generation Checklist

- ✅ Use `Deno.serve` (not old `serve` import)
- ✅ Prefix all imports with `npm:`, `jsr:`, or `node:`
- ✅ Specify versions for all external dependencies
- ✅ Use Web APIs and Deno APIs when possible
- ✅ Put shared code in `_shared` folder
- ✅ Prefix routes with function name
- ✅ Only write files to `/tmp`
- ✅ Use pre-populated env vars (SUPABASE_URL, etc.)
- ✅ Include proper error handling
- ✅ Set appropriate response headers
