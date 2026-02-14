# Plan: Bun Runtime + Vercel + Next Proxy Migration

## Goal

Migrate this app to be deployable on Vercel with Bun, ensure it is on the latest Next.js first, replace middleware with the proxy pattern, and finish with a clean build.

## Constraints

- No new automated tests (per request).
- Preserve current behavior from `src/middleware.ts`:
  - suspicious request blocking
  - API rate limiting
  - admin gate
  - security headers
  - archive redirects
- Keep deployment target suitable for Vercel + Bun runtime.

## Phase 1 - Baseline and upgrade preparation

- [x] Capture baseline versions and commands from `package.json`, `next.config.mjs`, and deployment files.
- [ ] Run baseline checks before migration:
  - `bun run lint`
  - `bun run test`
  - `bun run build`
- [ ] Record any existing failures as pre-existing issues before changes.

## Phase 2 - Upgrade to latest Next.js first

- [ ] Upgrade core framework packages to latest compatible:
  - `next@latest`
  - `react@latest`
  - `react-dom@latest`
  - `eslint-config-next@latest`
- [ ] Run Next codemods relevant to version upgrade and proxy migration.
- [ ] Adjust config/code for Next latest breaking changes (if surfaced by build/type/lint).
- [ ] Re-run verification:
  - `bun run lint`
  - `bun run test`
  - `bun run build`

## Phase 3 - Middleware to proxy migration

- [ ] Replace `src/middleware.ts` with `src/proxy.ts` and migrate export from `middleware` to `proxy`.
- [ ] Preserve matcher behavior for:
  - `/api/:path*`
  - `/admin/:path*`
  - `/characters/:path*`
  - `/weapons/:path*`
  - `/artifacts/:path*`
- [ ] Port logic into proxy flow:
  - suspicious request detection and 403 responses
  - API rate-limit guard and 429 responses with headers
  - admin authorization redirect behavior
  - security header injection
  - archive redirects
- [ ] Fix redirect edge cases so legacy archive redirects do not produce invalid target paths.
- [ ] Remove deprecated middleware-only naming/usages and confirm no `middleware` export remains.

## Phase 4 - Bun + Vercel runtime alignment

- [ ] Add/update `vercel.json` for Bun runtime pinning (for example `bunVersion`).
- [ ] Update scripts for Bun-first operation on Vercel:
  - ensure build runs correctly via Bun
  - ensure start/dev scripts are Bun-compatible for local verification
- [ ] Confirm no Node-only assumptions block Bun runtime on Vercel in runtime-critical paths.

## Phase 5 - Production suitability verification

- [ ] End-to-end verification commands:
  - `bun install`
  - `bun run lint`
  - `bun run test`
  - `bun run build`
- [ ] Validate proxy behavior manually for key routes:
  - sample `/api/*` route is rate-limited as expected
  - `/admin/*` unauthorized user is redirected
  - `/characters`, `/weapons`, `/artifacts` redirect correctly
- [ ] Confirm Vercel deployment config is coherent for Bun runtime.

## Acceptance criteria

- [ ] Next.js is upgraded to latest and project compiles cleanly.
- [ ] Middleware is replaced by proxy pattern with equivalent behavior.
- [ ] `bun run build` succeeds with zero build errors.
- [ ] App configuration is suitable for Vercel with Bun runtime.

## Risk watchlist

- `isAdmin` dependency path may need runtime-safe handling during proxy migration.
- In-memory rate limiting is process-local; acceptable for parity now but not globally strong across distributed instances.
- Next upgrade may surface config changes in lint/build that must be handled before deployment.
