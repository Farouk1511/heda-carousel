# Phase 3: Auth

## Goal
Implement NextAuth v5 with Prisma Adapter, credentials auth, Google OAuth, and route protection.

## Step 1: Env Vars
Add:

```env
AUTH_SECRET="replace-with-strong-random-string"
AUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

## Step 2: Install

```bash
npm install next-auth@beta @auth/prisma-adapter bcryptjs
npm install -D @types/bcryptjs
```

## Step 3: Configure `src/lib/auth.ts`
Include:
- Prisma adapter
- Credentials provider (email + passwordHash compare)
- Google provider
- Session callback that exposes `session.user.id`
- Custom sign-in page: `/login`

Export:
- `handlers`
- `auth`
- `signIn`
- `signOut`

## Step 4: Auth Route
Create `src/app/api/auth/[...nextauth]/route.ts`:

```ts
import { handlers } from "@/lib/auth";
export const { GET, POST } = handlers;
```

## Step 5: Signup Endpoint
Create `src/app/api/auth/signup/route.ts`:
- validate payload
- hash password with bcrypt
- prevent duplicate email
- create user
- create FREE subscription row

## Step 6: Auth Pages
Create:
- `src/app/(auth)/layout.tsx`
- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/signup/page.tsx`

Requirements:
- login via credentials
- login via Google
- signup then auto-login
- redirect to `/brands/new` for first onboarding

## Step 7: Type Augmentation
Create `src/types/next-auth.d.ts` to add `id` on `Session.user`.

## Step 8: Protect Routes
Create `src/middleware.ts`:

```ts
export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: ["/brands/:path*", "/projects/:path*"],
};
```

Also guard `src/app/(dashboard)/layout.tsx` server-side via `auth()` and redirect unauthenticated users to `/login`.

## Done Criteria
- [ ] Signup works
- [ ] Email/password login works
- [ ] Google login works
- [ ] Protected routes redirect when unauthenticated
- [ ] Session includes `user.id`
