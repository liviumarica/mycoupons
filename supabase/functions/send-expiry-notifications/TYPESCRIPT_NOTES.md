# TypeScript Diagnostics Notes

## Expected TypeScript Errors

When viewing the Edge Function in your IDE, you may see TypeScript errors. These are **expected and normal** for Supabase Edge Functions running on Deno.

### Why These Errors Appear

1. **Deno-specific imports:** The `npm:` and `jsr:` prefixes are Deno-specific and not recognized by standard TypeScript
2. **Deno global:** The `Deno` global object is only available in the Deno runtime, not during TypeScript compilation
3. **Runtime resolution:** These imports are resolved at runtime by Deno, not at compile time

### Common "Errors" You'll See

```typescript
// ❌ IDE shows error, but ✅ works in Deno
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.0";

// ❌ IDE shows error, but ✅ works in Deno
Deno.env.get("SUPABASE_URL")
Deno.serve(async (req: Request) => { ... })
```

### These Are NOT Real Errors

The code will work perfectly when deployed to Supabase Edge Functions. The TypeScript compiler in your IDE doesn't understand Deno's runtime environment.

## Verification

To verify the code is correct:

### 1. Use Deno CLI (Optional)

If you have Deno installed locally:

```bash
deno check supabase/functions/send-expiry-notifications/index.ts
```

### 2. Deploy and Test

The best verification is to deploy and test:

```bash
# Deploy the function
supabase functions deploy send-expiry-notifications

# Test it
supabase functions invoke send-expiry-notifications

# Check logs
supabase functions logs send-expiry-notifications
```

### 3. Check Supabase Dashboard

After deployment, check the Supabase Dashboard:
- Edge Functions → send-expiry-notifications
- Look for any deployment errors
- Check invocation logs

## IDE Configuration (Optional)

If you want to reduce IDE errors, you can:

### Option 1: Add Deno Extension

Install the Deno extension for your IDE:
- **VS Code:** Install "Deno" extension by Denoland
- **Other IDEs:** Check for Deno support

### Option 2: Configure Deno for This Directory

Create `.vscode/settings.json` in the `supabase/functions` directory:

```json
{
  "deno.enable": true,
  "deno.lint": true,
  "deno.unstable": false
}
```

### Option 3: Ignore the Errors

The simplest approach is to ignore these IDE errors. They don't affect the actual functionality of the Edge Function.

## Real Errors to Watch For

While the TypeScript diagnostics show false positives, here are **real** errors to watch for:

### 1. Logic Errors

```typescript
// ❌ Wrong: Using wrong field name
if (preferences.remind_7day) { ... }  // Missing 's'

// ✅ Correct
if (preferences.remind_7_days) { ... }
```

### 2. Type Mismatches

```typescript
// ❌ Wrong: Passing wrong type
await logNotification(supabase, userId, couponId, "7-day", "sent")

// ✅ Correct
await logNotification(supabase, userId, couponId, "7_day", "sent")
```

### 3. Missing Null Checks

```typescript
// ❌ Wrong: Not checking for null
const preferences = await getPreferences(userId)
if (preferences.remind_7_days) { ... }  // Could be null

// ✅ Correct
const preferences = await getPreferences(userId)
if (preferences && preferences.remind_7_days) { ... }
```

## Testing Strategy

Since IDE diagnostics aren't reliable for Deno code:

1. **Write the code** following Deno/Supabase patterns
2. **Deploy to Supabase** to verify syntax
3. **Test with real data** to verify logic
4. **Check logs** for runtime errors
5. **Monitor in production** for issues

## Summary

- ✅ The code is correct and will work in Supabase Edge Functions
- ❌ IDE TypeScript errors are false positives
- 🎯 Focus on logic errors, not TypeScript diagnostics
- 🚀 Deploy and test to verify functionality

## Need Help?

If you see errors during deployment or execution:

1. Check function logs: `supabase functions logs send-expiry-notifications`
2. Review the error message carefully
3. Check environment variables are set
4. Verify database tables exist
5. Test with manual invocation

The TypeScript diagnostics in your IDE are **not** indicators of real problems with this Edge Function.
