# CLAUDE.md

Guidance for AI coding assistants working in this repository. `CLAUDE.md` and
`GEMINI.md` are kept identical — edit both or neither.

## Working agreement (read first)

- **Never run shell commands.** Do not execute Bash, Docker, `npm`/`npx`, `git`,
  tests, builds, or any other command. Give me the exact command(s) in a copyable
  block and let me report back the output.
- **Propose before applying.** Show changes in the chat first (diffs or full
  snippets). Do not edit files until I say so.
- **Don't do everything end-to-end.** Keep changes scoped to what I asked. Surface
  bugs, options, and follow-ups as suggestions — let me decide.
- When a task needs verification, write the code and hand me the commands.

## Assistant behaviour (security & performance)

- Before writing or changing code, check it against the rules in this file.
- When you notice existing code that breaks a rule — even outside the current task —
  **flag it**: `file:line`, the issue, severity (critical / high / medium / low), and
  a suggested fix. Flag; don't fix unless asked.
- **Never weaken a security setting to make something work** (no token in
  `localStorage`, no dropped `httpOnly`/`Secure`, no loosened CSP or
  `remotePatterns`, no auth check removed from `proxy.ts`). Explain the safe
  alternative instead.
- Prefer the current official Next.js 16 and React 19 docs. Next 16 changed several
  defaults (`middleware` → `proxy`, caching model, async request APIs). When unsure
  about a version-specific detail, say so rather than guess.
- **Read the comments.** Many odd-looking choices are documented trade-offs.
  Don't "fix" a documented decision; raise it instead.

## Project overview

`tinsae-frontend` — web app for Tinsae, a verified-shop marketplace (Addis Ababa).
Talks to the Django API in `../tinsae-backend` (separate repo).

- Next.js 16.3.8, **App Router**, React 19.3, TypeScript 5, Node ≥ 22
- Tailwind CSS 4 · shadcn/ui (`src/components/ui`, owned code) · `@base-ui/react`
- `server-only` for server-only modules · `@react-google-maps/api`
- Tests: Vitest 4 (unit), Playwright 1.63 (e2e) · ESLint 9 (`eslint-config-next`)
- Docker: `dev` (compose watch, hot reload) and `prod` (`next build` + `next start`)

## Layout

- `src/app/` — route groups `(auth)`, `(common)`, `(dashboard)`; `robots.ts`, `sitemap.ts`
- `src/app/api/` — route handlers: `auth/*` (login, register, OTP, logout, me) and
  `shop/[slug]/*` (merchant writes, all via `proxyToDjango`), plus `telemetry`
- `src/proxy.ts` — route guard + silent token refresh (Next 16's renamed middleware)
- `src/lib/config.ts` — **the only place API/site env vars are read**
- `src/lib/api/` — `public.ts` (cached anonymous reads, `CATALOG_TAG`), `server.ts`,
  `client.ts` (browser → same-origin `/api/shop/*` only, never Django)
- `src/lib/auth/` — `session.ts` (cookies), `authed-fetch.ts` (Bearer + one retry),
  `django-proxy.ts` (`proxyToDjango`), `route-helpers.ts` (`rejectCrossOrigin`,
  `errorResponse`), `http-driver.ts`, `refresh-lock.ts`, `tokens.ts`
- `src/components/` (feature folders + `ui/` shadcn), `src/hooks/`, `src/context/`
- `src/components/json-ld.tsx` — the one sanctioned `dangerouslySetInnerHTML`
- `next.config.ts` — security headers, `images.remotePatterns`, `/media` rewrite
- `.github/workflows/frontend-ci.yml` — `npm audit --omit=dev --audit-level=high`,
  lint, `tsc --noEmit`, vitest, build

## Commands (for me to run)

```bash
docker compose watch                         # dev server on :3000 with hot reload
docker compose exec frontend npm run lint    # ESLint
docker compose exec frontend npm test        # Vitest
docker compose exec frontend npx tsc --noEmit
npm run test:e2e                             # Playwright (host)
docker build --build-arg NEXT_PUBLIC_API_URL=https://api.example --target prod .
npm audit --omit=dev
```

## Conventions

- Branches `fro-<id>-<summary>`; Conventional Commits; PRs say `Closes FRO-XX`.
- Default to Server Components; add `"use client"` only for interactivity, as low
  in the tree as possible.
- Read env only via `src/lib/config.ts`; never `process.env` scattered in components.

## Auth flow (shared with the backend — keep both repos' docs in sync)

1. Browser talks to **Next.js route handlers**, never to Django's auth endpoints.
2. Next's server calls `POST /api/v1/auth/token/`, `/register/`, `/otp/verify/`,
   `/token/refresh/`, `/logout/`, `GET /me/` using `API_INTERNAL_URL`.
3. Django returns a simplejwt pair: access 15 min, refresh 14 days, rotated on
   every refresh and the old one blacklisted.
4. Next stores both in `httpOnly`, `SameSite=Lax`, `Secure` + `__Host-`-prefixed
   (prod) cookies. Tokens never reach client JS.
5. Server Components call Django with `Authorization: Bearer <access>`.
   `src/proxy.ts` refreshes silently when the access cookie has expired.
6. Anonymous catalogue reads may go browser → Django directly
   (`NEXT_PUBLIC_API_URL`), which is why CORS exists.
7. Django API auth is JWT-header only, so CSRF does not apply to it. Session auth
   exists only for `/admin/` and `ops`.

## Rules — Next.js security

**Secrets & env**
- Never put a secret in a `NEXT_PUBLIC_*` variable — those are inlined into the
  browser bundle at build time. Only public, browser-safe values (API base URL, a
  referrer-restricted Maps key) may be `NEXT_PUBLIC_`.
- Modules that touch secrets, cookies or `API_INTERNAL_URL` start with
  `import "server-only"`.
- `.env.local` is git-ignored; `.env.example` holds placeholders only.

**Tokens & auth**
- Tokens live only in the httpOnly cookies in `src/lib/auth/session.ts`. Never in
  `localStorage`/`sessionStorage`, React state, URLs, or props passed to a client
  component.
- Authenticated calls to Django run server-side (Server Components, route
  handlers, server actions). A client component needing auth data calls a route
  handler or server action, never Django directly.
- `proxy.ts` is UX, not security: it redirects early, but **Django is the
  authorization boundary.** Every protected page/handler still verifies the
  session (`requireSession`), and nothing trusts a client-supplied role or owner id.
- Every mutating route handler calls `rejectCrossOrigin` first (or goes through
  `proxyToDjango`, which does). New merchant routes reuse `proxyToDjango` +
  `djangoPath` rather than hand-rolling a fetch. Allowlist dynamic segments and
  query params (see the `[action]` route).
- Never forward client-controlled headers (e.g. `X-Forwarded-For`) to Django
  unless the edge proxy has overwritten them.
- `localStorage` is for non-sensitive UI state only (compare list, saved items,
  view mode, onboarding draft). Never tokens, never PII beyond what the user typed.

**Headers**
- Keep the headers in `next.config.ts`: `X-Frame-Options: DENY` /
  `frame-ancestors 'none'`, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, HSTS in
  production, `poweredByHeader: false`.
- Move toward a full CSP: ship it as `Content-Security-Policy-Report-Only` first,
  then enforce with nonces (via `proxy.ts`) rather than `'unsafe-inline'`.

**Input & rendering**
- Validate all user input on the server (route handler/server action) as well as in
  the form. Treat Django error bodies as data.
- Avoid `dangerouslySetInnerHTML`. When it's unavoidable (JSON-LD), escape `<` as
  `<` in `JSON.stringify` output; for HTML, sanitise with DOMPurify first.
- Never build `href`/`src` from user input without allowing only `https:`/`http:`
  schemes (blocks `javascript:`).
- `images.remotePatterns` lists exact hosts + path prefixes. No wildcards;
  `dangerouslyAllowLocalIP` must stay out of production.

**Dependencies**
- Commit `package-lock.json`, install with `npm ci`, run `npm audit` in CI.
- Prefer exact or caret pins already used. Keep `next` and `eslint-config-next`
  on the same version.

## Rules — Next.js performance

- Use `next/image` for every image, with `sizes` and `width`/`height` (or `fill`).
  Use `priority` only above the fold.
- Be explicit about caching on every `fetch`: `cache: "no-store"` for per-user or
  authenticated data, `next: { revalidate: N }` or `"use cache"` for public catalogue
  data. Never cache a response that depended on a user's token.
- Fetch in parallel (`Promise.all`) and dedupe per request with React `cache()`.
  Avoid request waterfalls across layout → page → component.
- Keep client components small. Load heavy, below-the-fold or interaction-only UI
  (maps, editors, charts) with `next/dynamic`.
- Use `next/font` (already in `src/lib/fonts`) — no external font `<link>`s.
- Stream slow sections with `loading.tsx` / `<Suspense>` instead of blocking the page.
- Put a timeout (`AbortSignal.timeout`) on every server-side call to Django.

## Cross-cutting (Django ↔ Next.js)

- `NEXT_PUBLIC_API_URL`, `API_INTERNAL_URL`, `SITE_URL`, cookie `SameSite`/`Domain`
  and Django's `CORS_ALLOWED_ORIGINS`, `CSRF_TRUSTED_ORIGINS`, `ALLOWED_HOSTS` must
  match the real deployed domains. Change them together.
- Client IP: the Next server forwards `X-Forwarded-For` to Django. Only the
  trusted edge may set it; Django's `NUM_PROXIES` must match the path a request
  actually takes.
- Errors follow DRF's shape (`{"detail": ...}` / `{"field": [...]}`). Show users a
  friendly message. Never render raw error bodies, stack traces or internal URLs.
  OTP error strings from Django are matched exactly — don't reword them on either
  side without coordinating.

## Deliberate decisions (don't flag as violations)

- Cookies are `SameSite=Lax`, not `Strict`, so Telegram deep links arrive signed in.
- `proxy.ts` refreshes in-process (not via `/api/auth/refresh`) to avoid every
  user sharing one Django throttle bucket.
- No enforced CSP yet; a Report-Only rollout is planned (see `next.config.ts`).
- `/media/*` is rewritten to Django; this is temporary until object storage lands.
