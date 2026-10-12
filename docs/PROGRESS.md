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
| T0.2 | Cleanup and consistency | DONE | _(see git log)_ | sonner-only toasts, typed `AuthUser`, lint 0/0, `api.ts` reads `VITE_API_URL`, removed `react-hot-toast` |
| T0.3 | Backend foundation | DONE | _(see git log)_ | env validation (zod), helmet, rate limit, global error + 404, `/api/health`, `GET /api/user/me`, cookie hardened, token removed from body |
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

- **Resolved in T0.3 (env names):** `backend/config/env.ts` now reads
  `MONGODB_URI` and `JWT_EXPIRES_IN` (as documented in `.env.example`) and falls
  back to the legacy `DB_URI` / `EXPIRE_IN`, so the existing `.env` keeps
  working. Env is validated with zod at startup and the process exits with a
  clear message if anything is missing.
- **`req.user` typing added early (T0.3):** `backend/types/express.d.ts` augments
  `Express.Request` with `user?: HydratedDocument<UserType>` (planned for T0.4),
  so the new `/me` controller avoids `(req as any)`. T0.4 still adds
  `requireRole`, `isBanned` and the rest.
- **Test data:** T0.3 API verification created one throwaway user in the dev DB
  (`t03test<timestamp>@example.com`). Not deleted (DB deletes need approval).
- **Resolved in T0.2:** `client/src/lib/api.ts` now reads
  `import.meta.env.VITE_API_URL` (falls back to `http://localhost:5000/api`).
  Note this bypasses the Vite `/api` proxy for calls made through `api`;
  `Login.tsx`, `Register.tsx` and `DailogForm.tsx` still call axios with the
  relative `/api` path and are unified onto `api` in T2.1/T2.2.
- **`AuthUser.role` (from T0.2):** the type declares `role: "user" | "admin"`
  per the plan, but the backend login response does not include `role` until
  T0.4. Until then the value is `undefined` at runtime; no code branches on it
  yet.
- **Pending deletion (needs your approval — AGENTS.md says ask before deleting):**
  - Root `package.json` is stray (only `multer` + `@types/multer`, no scripts).
    Removing it also orphans the root `node_modules`; not done without approval.
  - (`backend/controllers/user.controller.ts` was resolved in T0.3: instead of
    deleting, it now implements `GET /api/user/me`.)
