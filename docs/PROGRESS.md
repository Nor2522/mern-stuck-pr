# PROGRESS.md — Programmers' Motivation Platform

Living log for the build. Read this at the start of every session together with
`AGENTS.md` and `docs/BUILD_PLAN.md`.

## Baseline (T0.1)

Recorded on: 2026-10-12

`git status`: clean. Branch `main`, ahead of `origin/main` by 6 commits (no push).

| Check | Command | Result |
|---|---|---|
| build | `cd client && bun run build` | PASS (exit 0; chunk >500 kB warning only) |
| lint | `cd client && bun run lint` | FAIL (exit 1): 4 errors, 1 warning (pre-existing) |
| types | `cd backend && bunx tsc --noEmit` | PASS (exit 0) |
| tests | `cd backend && bun test` | N/A — no test script and no test files yet (added in T4.2) |

Pre-existing lint findings (baseline, target for T0.2):

| File | Line | Rule | Severity |
|---|---|---|---|
| `client/src/components/Login.tsx` | 30:5 | `react-hooks/exhaustive-deps` | warning |
| `client/src/components/ui/button.tsx` | 57:18 | `react-refresh/only-export-components` | error |
| `client/src/hooks/useUser.tsx` | 14:35 | `@typescript-eslint/no-explicit-any` | error |
| `client/src/hooks/useUser.tsx` | 30:9 | `react-hooks/set-state-in-effect` | error |
| `client/src/hooks/useUser.tsx` | 54:16 | `react-refresh/only-export-components` | error |

## Task table

| Task | Title | Status | Commit | Notes |
|---|---|---|---|---|
| T0.1 | Baseline and progress log | DONE | _(see checkout)_ | Created `docs/BUILD_PLAN.md`, `docs/PROGRESS.md`, `backend/.env.example`, `client/.env.example` |
| T0.2 | Cleanup and consistency | TODO | — | — |
| T0.3 | Backend foundation | TODO | — | — |
| T0.4 | Roles, banned users, admin seed | TODO | — | — |
| T1.1 | Post model upgrade and public API | TODO | — | — |
| T1.2 | Frontend foundation (layout, routing, data layer) | TODO | — | — |
| T1.3 | Home page | TODO | — | — |
| T1.4 | Explore and post detail | TODO | — | — |
| T2.1 | Auth pages | TODO | — | — |
| T2.2 | Create, edit, delete posts | TODO | — | — |
| T2.3 | Likes | TODO | — | — |
| T2.4 | Comments | TODO | — | — |
| T2.5 | Bookmarks (Saved) | TODO | — | — |
| T2.6 | Profile | TODO | — | — |
| T2.7 | Report content | TODO | — | — |
| T3.1 | Admin layout and dashboard | TODO | — | — |
| T3.2 | Manage users | TODO | — | — |
| T3.3 | Manage posts | TODO | — | — |
| T3.4 | Moderation: comments and reports | TODO | — | — |
| T3.5 | Manage categories | TODO | — | — |
| T4.1 | Security hardening review | TODO | — | — |
| T4.2 | Tests | TODO | — | — |
| T4.3 | UX polish pass | TODO | — | — |
| T4.4 | Docs and release prep | TODO | — | — |

## Open issues / assumptions

- **Env var naming mismatch (carry-over to T0.3):** current code in
  `backend/config/env.ts` reads `DB_URI` and `EXPIRE_IN`, while the plan's
  `.env.example` uses `MONGODB_URI` and `JWT_EXPIRES_IN`. T0.1 only creates the
  example files; T0.3 (env validation) must reconcile the names so the app reads
  what the example documents.
- `client/.env.example` documents `VITE_API_URL`; `client/src/lib/api.ts`
  currently hardcodes the base URL. Wiring happens in T0.2.
