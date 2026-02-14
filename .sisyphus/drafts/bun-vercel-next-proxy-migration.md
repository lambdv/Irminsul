# Draft: Bun + Vercel + Next Proxy Migration

## Requirements (confirmed)

- Migrate app to Bun runtime for Vercel deployment.
- Update app to latest Next.js first.
- Replace middleware approach with proxy pattern.
- Ensure code builds without errors.
- Ensure runtime setup is suitable for Vercel with Bun.

## Technical Decisions

- Next.js dependency already appears to be on a recent latest line (`next@^16.0.10`), but the plan must include explicit verification and compatibility checks.
- Existing `src/middleware.ts` centralizes security headers, suspicious request blocking, API rate limiting, admin access checks, and legacy path redirects; migration must preserve behavior.

## Research Findings

- `package.json` has `next@^16.0.10`, `react@19.2.3`, `react-dom@19.2.3`.
- Existing middleware file: `src/middleware.ts`.
- Existing Next config: `next.config.mjs`.
- No `vercel.json` currently present.
- Test infra exists: Jest + Playwright configured (`jest.config.ts`, `playwright.config.ts`, `tests/setup.ts`, multiple `tests/**/*.test.ts`).
- CI workflow files are not present under `.github/workflows` (local scripts exist but no repo CI automation).
- Middleware behavior currently includes: suspicious-request 403 blocking, API rate limiting, `/admin` auth gate, security headers, and legacy redirects for `/characters|/weapons|/artifacts`.
- Middleware imports `isAdmin` from `src/app/(auth)/actions.ts` (DB/cookie dependent), which is a migration risk if runtime boundaries are wrong.
- `src/lib/rate-limit.ts` is process-memory based; not globally consistent across serverless instances.
- Official guidance confirms middleware-to-proxy migration path and Bun-on-Vercel runtime configuration requirements.

## Test Strategy Decision

- **Infrastructure exists**: YES
- **Automated tests**: NO NEW TESTS
- **Agent-Executed QA**: mandatory in plan (for all tasks)

## Scope Boundaries

- INCLUDE: dependency/runtime migration tasks, proxy migration tasks, Vercel Bun compatibility checks, and build verification.
- EXCLUDE: unrelated feature refactors not required for runtime/proxy migration.

## Open Questions

- None.
