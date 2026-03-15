# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun dev          # Start dev server
bun build        # Production build
bun lint         # ESLint

bunx prisma migrate dev   # Apply migrations (uses DIRECT_URL)
bunx prisma generate      # Regenerate Prisma client → lib/generated/prisma
bunx prisma studio        # DB GUI
```

## Environment variables

```
DATABASE_URL              # PostgreSQL (pooled)
DIRECT_URL                # PostgreSQL (direct, for Prisma migrations)
BETTER_AUTH_URL           # Auth base URL (server-side)
NEXT_PUBLIC_APP_URL       # Public app URL (client-side, used in trustedOrigins)
GOOGLE_CLIENT_ID/SECRET
GITHUB_CLIENT_ID/SECRET
```

## Architecture

### App Router structure

```
app/
  (auth)/                     # Public: login, register
  (post-auth)/                # Protected: dashboard, org/[slug]/projects/[slug]
  api/
    [[...route]]/route.ts     # Single Hono app, exports AppType
    auth/[...all]/route.ts    # better-auth handler
```

### Feature modules (`features/`)

Each feature (`auth`, `organizations`, `projects`) follows this structure:
- `server/` — Hono route handlers (server-side, use Prisma directly)
- `api/` — TanStack Query hooks (client-side, call RPC client)
- `components/` — UI components tied to the feature
- `hooks/` — Custom hooks (modal state via nuqs)
- `schemas.ts` — Zod validation schemas
- `keys.ts` — React Query key factories

### Hono RPC pattern

All routes are registered in `app/api/[[...route]]/route.ts` and typed via `AppType`. The RPC client in `lib/rpc.ts` uses `hc<AppType>("/")` (same-origin so auth cookies are sent automatically).

API is structure to respect the REST convention, for example :
`GET /api/users/me/organizations` to return user's organization
`POST /api/organizations/:organizationSlug/projects` to create a project in an organization

API response shape is always: `{ success: boolean, data?: T, error?: string }`

HTTP status conventions: 201 (created), 401 (unauthenticated), 403 (forbidden), 404 (not found), 409 (unique constraint conflict).

Use `isUniqueConstraint()` from `lib/prisma-errors.ts` to detect Prisma P2002 errors and return 409.

### Middleware chain (`lib/middlewares/api/`)

Compose in order as needed:
1. `requireAuth` — validates session, sets `c.get("user")` and `c.get("session")`
2. `loadOrganization` — loads org by `:organizationSlug` param, sets `c.get("organization")`
3. `requireOrganizationMember` — checks membership, sets `c.get("organizationRole")`
4. `requireOrganizationAdmin` — checks role is `ADMIN` or `OWNER`
5. `requireSuperAdmin` — checks `user.isSuperAdmin`

### Auth

better-auth is configured in `lib/auth.ts` (server) and `lib/auth-client.ts` (client). `NEXT_PUBLIC_APP_URL` must be set in production for `trustedOrigins` to include the production domain.

### Modal state

Modals are controlled via URL params using `nuqs` (`useQueryState`). This enables deep-linking. Modal state hooks live in `features/*/hooks/`.

### Database

Prisma 7 with `@prisma/adapter-pg` (connection pool). Singleton pattern in `lib/prisma.ts`. Schema defines: `User`, `Session`, `Account`, `Organization`, `OrganizationMember`, `Project`, `ProjectMember`. Role enum: `OWNER | ADMIN | MEMBER`.
