# Supabase Implementation Guide

This document outlines the Supabase authentication implementation and best practices for this project.

## 📁 File Structure

```
frontend/
├── lib/
│   └── supabase/
│       ├── client.ts          # Browser client (singleton)
│       ├── server.ts          # Server client for Server Components/API Routes
│       └── middleware.ts      # Session refresh middleware
├── hooks/
│   └── use-auth.ts           # Centralized auth hook (USE THIS!)
├── types/
│   └── supabase.ts           # TypeScript types for User/Profile
├── app/
│   ├── login/
│   │   └── page.tsx          # Magic link login page
│   └── auth/
│       ├── callback/
│       │   └── route.ts      # OAuth callback handler
│       └── auth-code-error/
│           └── page.tsx      # Auth error page
└── middleware.ts             # Root middleware
```

## 🎯 Core Principles

### 1. **Use `useAuth()` Hook for All Client Components**

✅ **DO THIS:**
```typescript
import { useAuth } from '@/hooks/use-auth'

export function MyComponent() {
  const { user, loading, error, signOut } = useAuth()

  if (loading) return <div>Loading...</div>
  if (user) return <div>Welcome {user.email}</div>
  return <div>Please login</div>
}
```

❌ **DON'T DO THIS:**
```typescript
// Don't create your own auth logic
const [user, setUser] = useState(null)
useEffect(() => {
  const supabase = createClient()
  supabase.auth.getUser().then(...)
}, [])
```

**Why?** The `useAuth()` hook:
- Handles auth state management centrally
- Fetches and merges user profile data
- Manages loading and error states
- Subscribes to auth state changes
- Prevents code duplication

### 2. **Server vs Client Components**

#### Client Components (Browser)
Use `createClient()` from `@/lib/supabase/client`:
```typescript
import { createClient } from '@/lib/supabase/client'

// In client components, event handlers, etc.
const supabase = createClient()
const { data, error } = await supabase.auth.signInWithOtp({ email })
```

#### Server Components & API Routes
Use `createClient()` from `@/lib/supabase/server`:
```typescript
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  // ...
}
```

### 3. **Cookie Security**

- ✅ Server cookies use `httpOnly: true` by default (secure against XSS)
- ✅ Client cookies are managed via Supabase SSR cookie handlers
- ✅ Middleware refreshes sessions automatically
- ⚠️ Never override `httpOnly: false` in production

### 4. **Authentication Flow**

```
1. User visits /login
2. Enters email
3. Supabase sends magic link
4. User clicks link → redirects to /auth/callback
5. Callback exchanges code for session
6. Middleware refreshes session on subsequent requests
7. Client components use useAuth() to access user
```

## 🔒 Security Best Practices

### ✅ DO:
- Always use `getUser()` instead of `getSession()` (more reliable)
- Let middleware handle session refresh
- Use TypeScript types from `@/types/supabase`
- Handle errors gracefully
- Use environment variables for config

### ❌ DON'T:
- Don't set `httpOnly: false` on server cookies
- Don't store sensitive data in client state
- Don't skip middleware for authenticated routes
- Don't use `localStorage` for tokens (Supabase handles this)

## 📝 Common Patterns

### Check if User is Pro
```typescript
const { user } = useAuth()
const isPro = user?.is_pro ?? false
```

### Sign Out
```typescript
const { signOut } = useAuth()
await signOut()
router.refresh()
```

### Conditional Rendering
```typescript
const { user, loading } = useAuth()

if (loading) return <Spinner />
if (!user) return <LoginPrompt />
if (!user.is_pro) return <UpgradePrompt />
return <ProContent />
```

### Refresh User Data
```typescript
const { refreshUser } = useAuth()

// After updating profile in DB
await supabase.from('profiles').update({ is_pro: true })
await refreshUser() // Re-fetch user with updated profile
```

## 🐛 Debugging

### Check Auth State
```typescript
const { user, loading, error } = useAuth()
console.log('Auth State:', { user, loading, error })
```

### Check Cookies (Dev Tools)
1. Open browser DevTools
2. Application → Cookies
3. Look for cookies starting with `sb-`

### Check Middleware Logs (Development)
```bash
# Terminal running Next.js will show:
⚠️ Middleware: Failed to get user: <error>
```

## 🚀 Performance Tips

1. **Singleton Pattern**: Client instance is created once and reused
2. **Centralized Hook**: `useAuth()` is used by all components, preventing duplicate subscriptions
3. **Middleware**: Refreshes sessions automatically without client-side calls
4. **Type Safety**: TypeScript catches errors at compile time

## 📖 TypeScript Types

```typescript
import type { AppUser, Profile, AuthState } from '@/types/supabase'

// AppUser = Supabase User + { is_pro: boolean }
// Profile = Database profile row
// AuthState = { user, loading, error }
```

## 🔄 Migration Guide

If you have old code using direct Supabase calls:

### Before:
```typescript
const [user, setUser] = useState(null)

useEffect(() => {
  const supabase = createClient()
  supabase.auth.getUser().then(({ data }) => {
    if (data.user) {
      supabase.from('profiles').select('is_pro')
        .eq('id', data.user.id)
        .single()
        .then(({ data: profile }) => {
          setUser({ ...data.user, is_pro: profile?.is_pro })
        })
    }
  })
}, [])
```

### After:
```typescript
const { user, loading } = useAuth()
```

Much simpler! 🎉

## 📚 Additional Resources

- [Supabase SSR Docs](https://supabase.com/docs/guides/auth/server-side-rendering)
- [Next.js + Supabase](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
