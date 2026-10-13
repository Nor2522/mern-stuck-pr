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
| T0.4 | Roles, banned users, admin seed | DONE | _(see git log)_ | `role`/`isBanned`/`avatar`/`bio`, `password select:false`, `requireRole`, banned→403, `seed:admin` + `report:orphans` scripts |
| T1.1 | Post model upgrade and public API | DONE | _(see git log)_ | `Category` + public `/api/categories`; `Post` upgraded (category/tags/status/counts/optional image/indexes); public `GET /post` list (pagination/search/filter/sort) + `GET /post/:id`; zod validators; seed + backfill scripts run |
| T1.2 | Frontend foundation (layout, routing, data layer) | DONE | _(see git log)_ | `@tanstack/react-query` + `zod` + `@hookform/resolvers` + `date-fns`; cookie-based `AuthProvider`/`useAuth` (session from `/user/me`), 401 interceptor; `Navbar`/`Footer` + mobile Sheet + light/dark toggle; route map + guards + 404; API types; backend `/me` + login now return `role`/`avatar`/`bio` |
| T1.3 | Home page | DONE | _(see git log)_ | Hero (role-aware CTA), Latest posts (6 `PostCard`s, skeleton/empty/error), category chips, How it works, final CTA; react-query hooks + Cloudinary optimized URLs + date-fns |
| T1.4 | Explore and post detail | DONE | _(see git log)_ | `/explore`: debounced search, category chips, latest/popular sort, pagination — all state in the URL. `/posts/:id`: full post, author card, tags, 404 state. Per-page `<title>`. New `Pagination` UI + `usePosts`/`usePost` hooks |
| T2.0 | Reactions + share (pulled forward from T2.3–T2.5) | DONE | _(see git log)_ | Real **likes**, **comments**, **bookmarks** on every post + a **share** menu on each card & detail. New `Like`/`Comment`/`Bookmark` models, `like`/`comment`/`bookmark` controllers + routes, `optionalAuth`; `#comments` section, `/saved` list |
| T2.1 | Auth pages | DONE | _(see git log)_ | `/login` + `/register` rebuilt with `Card` + `Field` + react-hook-form + zod (name 2–50, valid email, password ≥8 + letter + number, confirm); show/hide password; server field errors mapped; post-login redirect to `state.from`; backend zod-validated bodies (NoSQL-injection safe) |
| T2.2 | Create, edit, delete posts | DONE | _(see git log)_ | `/dashboard`: my-posts grid (status badge, edit/delete), stats row (my posts / total likes / total comments), "New post"; shared `PostForm` (title, description, category, tags ≤5, optional image + preview/remove); delete via `AlertDialog`; react-query mutations invalidate + toast |
| T2.3 | Likes | DONE | _(see git log)_ | Delivered early in T2.0 (pull-forward) |
| T2.4 | Comments | DONE | _(see git log)_ | Delivered early in T2.0 (pull-forward) |
| T2.5 | Bookmarks (Saved) | DONE | _(see git log)_ | Delivered early in T2.0 (pull-forward) |
| T2.6 | Profile | DONE | _(see git log)_ | Public `/u/:id` (avatar, name, bio, join date, published posts grid + count, 404 state); `/settings` (edit name/bio, avatar upload to Cloudinary with old-image destroy, duplicate-name guard, change password with current-password check); backend `GET /user/:id` (public fields only), `PUT /user/me` (multipart), `PUT /user/me/password`; `ProfilePage` updates navbar/cards/comments via react-query invalidation; added `Settings` menu item |
| T2.7 | Report content | DONE | _(see git log)_ | `Report` model (`reporter, post, reason enum, details, status`, unique `{reporter,post}`, `resolvedBy/At` for T3.4); `POST /post/:id/report` (zod reason enum, own-post 404, duplicate 409 `"You have already reported this post"`); UI "⋯" `PostMenu` dropdown on card + detail with `ReportDialog` (reason select + optional details); report option hidden on own posts; post deletion now cascades likes/bookmarks/comments/reports |
| T3.1 | Admin layout and dashboard | DONE | _(see git log)_ | `/api/admin/*` behind `authorize` + `requireRole("admin")`; `GET /api/admin/stats` (totals, 14-day daily new users/posts zero-filled, latest 5 users/posts); `/admin` sidebar layout (`AdminSidebar` + `AdminTopbar` breadcrumb/user menu) with nested routes (Dashboard live, others placeholders); `AdminDashboard` = 4 stat cards + two recharts bar charts + two recent lists with skeleton/error; added `recharts` |
| T3.2 | Manage users | DONE | _(see git log)_ | `/api/admin/users` (search name/email, role/status filters, pagination, newest/oldest sort, per-user posts count) + `PATCH .../role`, `PATCH .../ban`, `DELETE .../:id`; safety rules on backend (no self role/ban/delete, last-admin protected); hard delete cascades the user's posts (Cloudinary destroy), likes, comments, bookmarks, reports, plus avatar; `/admin/users` table with filters + row actions (`DropdownMenu`) + delete `AlertDialog` |
| T3.3 | Manage posts | DONE | _(see git log)_ | `/api/admin/posts` (all posts incl. hidden, `q`/`status` filters, newest/oldest/popular sort, pagination) + `PATCH /admin/posts/:id/status` + `DELETE /admin/posts/:id` (Cloudinary destroy + like/bookmark/comment/report cascade); `/admin/posts` table with search/filters/sort, status badge, row actions (open public page, hide/publish, delete `AlertDialog`); shared `FilterSelect` extracted (users + posts pages) |
| T3.4 | Moderation: comments and reports | DONE | _(see git log)_ | `/api/admin/reports` (status filter open/resolved/dismissed, paginated, post+reporter+resolvedBy populated) + `PATCH /admin/reports/:id` (resolve/dismiss, records `resolvedBy`/`resolvedAt`); `/api/admin/comments` (search + pagination, author+post populated) + `DELETE /admin/comments/:id` (decrements `commentsCount`); `/admin/reports` tabbed table (segmented Open/Resolved/Dismissed, row actions resolve/dismiss/hide post/open/delete post) and `/admin/comments` table (search + delete) replace their placeholders |
| T3.5 | Manage categories | DONE | _(this commit)_ | Backend: `GET/POST /api/admin/categories`, `PATCH/DELETE /api/admin/categories/:id` (auto-slug, friendly 409 on duplicate name/slug, per-category `postsCount`, delete blocked with 409 while posts remain, `?reassignTo=<id>` moves posts then deletes). Client: `/admin/categories` table + create/rename `Dialog` (RHF + zod) + delete `AlertDialog` with reassign `FilterSelect`; invalidates admin + public `categories` keys. New `backend/utils/slugify.ts`. |
| T4.1 | Security hardening review | DONE | _(this commit)_ | Audited every route (auth/role/ownership + zod inputs); added `writeLimiter` (120/15min) to all write endpoints, zod for the comment body + public list queries, upload allowlist (`files:1`, JPEG/PNG/WebP/GIF) and `MulterError`→400; cookie flags/helmet/logs confirmed; no secrets in branch history |
| T4.2 | Tests | DONE | _(this commit)_ | Split `app.ts` (exported Express app) from `server.ts` (listen + DB) so `supertest` can drive the API; `backend/tests/api.test.ts` — 12 tests on `mongodb-memory-server` covering auth (register/login/me/logout, NoSQL-injection 400, duplicate email 400), posts (public list, create 201, update/delete owner 200 + non-owner 403), admin (user 403 / admin 200, self role/ban 400, ban → 403 `Account suspended`), likes toggle and comments (add 201 + empty 400 + list); `test` script + `supertest`/`mongodb-memory-server` devDeps |
| T4.3 | UX polish pass | DONE | `f76fdc8`, `4f05d20`, `562a249` | Error boundary page + root `errorElement`; per-page titles for all 6 admin pages; `index.html` meta description + theme-color; fixed ProfilePage + DashBoard stats state gaps; keyboard/focus fixes (PasswordInput a11y labels + ring, Explore clear-search ring, ModeToggle English label). Verified: 42/42 responsive+theme sweep, keyboard-only login/register/create/delete, build+lint+tsc+tests PASS |
| T4.4 | Docs and release prep | DONE | _(this commit)_ | Rewrote root `README.md` (about, roles, stack, setup, env tables, scripts, API overview, production/deploy notes); completed both `.env.example` files (names + comments); updated `AGENTS.md` (test/build/start commands, dropped 3 now-fixed rough edges, deployment + limitations); replaced the broken `prod` script with `build`+`start` (verified booting + `/api/health` 200) and made the backend suite hermetic (`bunfig.toml` + `tests/setup.ts`, no `.env` needed); committed `backend/bun.lock` + `client/bun.lock` and stopped ignoring them so fresh installs are deterministic; made `docs/PROGRESS.md` accurate. Verified by a fresh clone (details below) |

## Final acceptance (after T4.4)

Recorded on: 2026-10-13

| Acceptance item | Status | Evidence |
|---|---|---|
| Visitor: home, explore, post detail, public profile, 404 work logged-out | PASS | T4.3 responsive/theme sweep 42/42 across `/`, `/explore`, `/posts/:id`, `/u/:id`, `/login`, `/register`, 404 (logged-out `401` on `/me` is the only expected error); public endpoints `200` in tests |
| User: register, login, create/edit/delete post, like, comment, bookmark, report, edit profile, logout | PASS | `backend/tests/api.test.ts` covers register/login/me/logout, post create/update/delete (owner vs non-owner), like toggle, comments; T2.x recorded the UI run-throughs |
| Admin: dashboard, users, posts, comments, reports, categories, all safety rules | PASS | tests cover admin `403` vs `200`, self role/ban `400`, ban → `403 Account suspended`; T3.x recorded the UI run-throughs + per-endpoint curl evidence |
| SC pass | PASS | client build PASS, client lint 0/0, backend `tsc --noEmit` PASS, `bun run test` 12/0 |
| Tests pass | PASS | 12 pass / 0 fail / 44 expect() calls |
| 0 lint errors | PASS | `eslint .` exit 0, no output |
| no `any` | PASS | `rg ': any|as any'` over `backend` + `client/src` → none |
| no `console.log` | PASS | only bootstrap logs remain (`server.ts` listen, `database/mongodb.ts` connect); none in application logic |
| no unused deps | **PARTIAL** | declared-but-unused: `backend` → `jwt`, `bson`, `dotenv-cli`, `nodemon`; `client` → `shadcn` (CLI, not imported). Pre-existing; removal needs your approval |
| `docs/PROGRESS.md` complete and accurate | PASS | this file |

## Open issues / assumptions

- **T4.4 — stray root files (needs your approval to remove):** the repo still
  tracks a root `bun.lock` (a leftover Bun *workspace* lockfile for the removed
  root `package.json`, declaring only `multer`) and a root `tsconfig.json` (the
  `bun init` default). `AGENTS.md` says the two apps are independent with no
  workspace tooling, so both are orphaned. I left them untouched (deletions need
  approval). They do not break `bun install`/build/test in either app (verified
  by temporarily renaming the root lockfile in the throwaway clone).
- **T4.4 — declared-but-unused dependencies (needs your approval to remove):**
  `backend` → `jwt`, `bson`, `dotenv-cli`, `nodemon`; `client` → `shadcn` (only
  used as a CLI via `bunx`, never imported). Pre-existing; the final-acceptance
  "no unused deps" item is therefore marked PARTIAL.
- **T4.3 — UX polish pass (committed `f76fdc8`, `4f05d20`, `562a249`):**
  error boundary + per-page titles + `index.html` meta/theme-color + state + a11y
  fixes. Details:
  - **Error boundary page:** new `client/src/pages/RouteErrorPage.tsx`
    (`useRouteError`, "Something went wrong" + Back home + Reload page +
    route path), wired as the root route's `errorElement` in `router.tsx` so it
    renders inside the shared `Navbar`/`Footer` layout and catches any
    child-route render/loader error.
  - **Page titles:** all six admin child pages now call `useDocumentTitle`
    (Admin dashboard / Users / Posts / Comments / Reports / Categories) — they
    previously all inherited the static "Admin" title. Public pages were
    already covered.
  - **`index.html`:** added a meta description, `theme-color` for light
    (`#ffffff`) and dark (`#0a0a0a`) via `prefers-color-scheme` media queries
    (favicon already existed as `public/favicon.svg`).
  - **State coverage fixes:** `ProfilePage` now shows a real error+Retry for
    non-404 profile failures (previously fell through to an empty card) and for
    the posts list (previously fell into the empty state); `DashBoard` stat
    cards show "—" on stats error instead of silently rendering `0`.
  - **Keyboard/focus + a11y strings:** `PasswordInput` toggle now English
    `Show/Hide password` (was Somali `Qari/Muuji password-ka`, violating the
    English-only convention), `aria-pressed`, and a `focus-visible` ring;
    Explore's "Clear search" button got a `focus-visible` ring (and now clears
    the URL immediately instead of waiting on the 400ms debounce); `ModeToggle`
    `aria-label` is English now ("Toggle color theme", was Somali).
  - **SC evidence:** client `bun run build` PASS (chunk >500 kB warning only,
    pre-existing), `bun run lint` PASS (0/0), backend `bunx tsc --noEmit` PASS.
  - **Responsive/theme sweep — 42/42:** headless chromium against a
    `vite preview` build (4173; the Vite dev server is too slow to transform the
    full 3370-module graph inside headless, so the built artifact was checked):
    `/`, `/explore`, `/posts/:id`, `/u/:id`, `/login`, `/register` and the 404
    page at **375/768/1280 × light/dark** — zero horizontal overflow, correct
    `.dark`/`.light` applied, exact document titles, zero app console errors
    (the only errors were the expected logged-out `/me` 401 resource load).
  - **Keyboard-only run-through:** CDP-driven Tab/Enter audits. Login and
    register tab trails reach every control (brand → nav → theme toggle →
    login/register links → all fields → show-password toggles → submit) with a
    visible `focus-visible` ring on each stop. Authenticated dashboard flow:
    Tab → "New post" → Enter opens the dialog with initial focus on the Title
    input (ring visible), Tab order through title → description → category →
    tags → image → Create post, Enter submits and the new post appears with a
    toast; the delete flow focused the card's "Delete post" button, Enter
    opened the confirm `AlertDialog`, Tab → "Delete" → Enter removed the post
    (dashboard back to "No posts yet").
  - **Temp residue:** one account `t43key1791902892@example.com` was created to
    run the authenticated keyboard flow; its post was deleted through the flow.
    The account itself was deleted after your approval (counted users
    26→25 with posts unchanged at 7).

- **T4.4 — docs and release prep:** root `README.md` fully rewritten (what it
  is, roles/features, stack, folder structure, prerequisites, two-terminal
  getting-started, backend + client env-var tables, every backend/client script,
  the full `/api` overview, and production build + deployment notes).
  `backend/.env.example` and `client/.env.example` kept names-only with short
  comments (legacy `DB_URI`/`EXPIRE_IN` noted; `ADMIN_*` marked seed-only;
  `VITE_API_URL` marked optional in dev). `AGENTS.md` updated: added
  `bun run test` / `build` / `start` and `bunx tsc --noEmit`, corrected the
  env-var list to `MONGODB_URI` / `JWT_EXPIRES_IN`, removed the three "rough
  edges" that are now fixed (`/sign-out` → `signOut`, `PUT /post/:id`,
  `user.controller.ts` implemented), and added deployment/limitations notes.
  **Production scripts:** the broken `"prod"` script (pointed at a non-existent
  `local.production.env` and `backend/config/env.ts`) was replaced by
  `"build": "bun build ./server.ts --target=bun --outdir=dist"` and
  `"start": "NODE_ENV=production bun ./dist/server.js"`. **Hermetic tests:** new
  `backend/bunfig.toml` + `backend/tests/setup.ts` preload dummy env defaults, so
  `bun run test` works on a clone with **no `.env`** (the suite always uses
  `mongodb-memory-server`, never the dev DB). **SC evidence:** `bun run test` →
  12 pass / 0 fail / 44 expect() calls; `bunx tsc --noEmit` PASS; client
  `bun run build` PASS; client `bun run lint` PASS (0/0). **Prod build smoke
  test:** `bun run build` → `dist/server.js` (1071 modules, exit 0);
  `NODE_ENV=production PORT=5010 bun ./dist/server.js` → `Server is running on
  port 5010` + `MongoDB connected successfully` and `GET /api/health` → **200**
  `{"success":true,"data":{"status":"ok"}}` (process then stopped, artifact
  removed). **Fresh-clone verification:** cloned the repo into a scratch dir and
  followed only the README. **Backend:** `bun install`, `bun run build` (exit 0),
  `bunx tsc --noEmit` (exit 0) and `bun run test` → 12 pass / 0 fail / 44
  expect() calls — **with no `.env` present** (the T4.4 test preload supplies
  dummy values; the suite uses `mongodb-memory-server`). **Client:** `bun
  install` (506 packages, 7s), `bun run build` (exit 0), `bun run lint` (exit 0).
  **Lockfiles:** `.gitignore` was ignoring `bun.lock`, so a clone had no
  lockfiles and the client's cold dependency resolution stalled (>150s) in this
  sandbox; committing `backend/bun.lock` + `client/bun.lock` (and dropping
  `bun.lock` from `.gitignore`) made the client install deterministic (7s).
  Caveat: the backend `bun install` populates `node_modules` but its process did
  not return within the sandbox timeout (a network-bound lifecycle under
  `mongodb-memory-server`); the same command with `--frozen-lockfile` returns
  immediately and every subsequent README step passes. Scratch dir deleted after
  verification.

- **T3.3 — manage posts:** backend `getAdminPosts` (resolves `status`/q/sort, paginated, author `name,avatar,email` + category populated), `updateAdminPostStatus` (hide/publish), `deleteAdminPost` (destroy Cloudinary image, cascade likes/bookmarks/comments/reports). Client `/admin/posts`: search (title/description), status + sort selects, skeleton/empty/error states, pagination; actions dropdown "Open public page" (target blank), Hide/Publish toggle, Delete via `AlertDialog`. Mutations invalidate `admin` + public `posts` + `my-posts` query keys so a hidden post disappears from the public UI immediately. The `FilterSelect` helper from the Users page was extracted to `client/src/features/admin/components/FilterSelect.tsx` and reused here (no duplication).
- **T3.3 — SC evidence:** client `bun run build` PASS, `bun run lint` PASS (0/0); backend `bunx tsc --noEmit` PASS. curl (verify_ data): `/admin/posts` anon **401**, normal user **403**, admin **200**; `q` and `status=hidden` filters work; PATCH hide → 200 and public `?author=` list drops the post (`total:1→0`), public `/post/:id` → **404**, owner `/post/user` still shows it as `"status":"hidden"`; PATCH publish → public again (`0→1`); invalid `{"status":"draft"}` → **400**; DELETE → 200, second delete → **404**. Live headless chrome (chromedriver + dev server, admin cookie injected): `/admin/posts` rendered the table with the verify post (`verify_user | Uncategorized | Published | 0 | 0`), a scripted click on row actions → "Hide" toasts "Post hidden" and the badge flips to **Hidden**. All `verify_` users + posts were deleted afterwards (0 remaining).
- **Verification session note (Step 1):** re-verified T3.1/T3.2 before this task — client build+lint PASS (0/0), backend `tsc` PASS, curl: `/admin/stats` + `/admin/users` anon **401** / normal user **403** / admin **200**; safety rules self role/ban/delete → **400**; ban → `/me` **403** `Account suspended`, unban → **200**. All dev-only response bodies include `stack` (the global error middleware only strips it in `NODE_ENV=production`, per T0.3). The `verify_` accounts used were deleted.

- **Post-delete cascade verification (pre-T3.4):** re-checked that deleting a
  post removes everything attached to it. Created `verify_` author/admin
  accounts, a post **with a Cloudinary image** (`publicId`
  `posts/mfqkb6ba6gg3keecu62s`), 1 like, 1 comment, 1 bookmark and 1 report.
  Before delete: DB counts `posts/likes/comments/bookmarks/reports = 1/1/1/1/1`
  and the Cloudinary asset was **FOUND**. After admin `DELETE /api/admin/posts/:id`
  → 200: counts `0/0/0/0/0` and the asset returned **NOT FOUND**
  (`Resource not found`). `deleteAdminPost` already cascaded correctly, so no
  code change was needed. All `verify_` users/posts/reports were removed
  (0 remaining). SC: build/lint/backend-tsc all PASS.
- **shadcn `Table` adopted in the admin tables:** added
  `client/src/components/ui/table.tsx` (via `bunx --bun shadcn@latest add
  table`) and migrated `/admin/users` and `/admin/posts` from hand-rolled
  `<table>` markup to the `Table`/`TableHeader`/`TableBody`/`TableRow`/
  `TableHead`/`TableCell` primitives. Behavior and layout are unchanged (same
  columns, filters, pagination, row actions, dialogs; `min-w-160`/`min-w-200`,
  header `bg-muted/50`, cell `px-4 py-3`, data-row `hover:bg-muted/40`). SC:
  client build PASS, lint PASS (0/0), backend `tsc` PASS; live headless chrome:
  `/admin/users` rendered the 6-column table (10 rows) and `/admin/posts` the
  8-column table (6 rows). The disposable admin used for the check was deleted
  (`verify_` remaining: 0).
- **T3.4 — moderation:** new admin endpoints, all behind `authorize` +
  `requireRole("admin")`: `GET /api/admin/reports` (`status` filter +
  `page`/`limit`, populated `post title,status` / `reporter name,email,avatar` /
  `resolvedBy name`), `PATCH /api/admin/reports/:id` (`{"status":"resolved"|"dismissed"}`
  sets `status` + `resolvedBy` = current admin + `resolvedAt` = now),
  `GET /api/admin/comments` (`q` text search + pagination, populated
  `author`/`post`) and `DELETE /api/admin/comments/:id` (removes the comment and
  decrements the post's `commentsCount`, mirroring the owner-delete path).
  Validators added: `reportUpdateSchema`, `listReportsQuerySchema`,
  `listCommentsQuerySchema`. Client: `useAdminReports`/`useUpdateReportStatus`
  and `useAdminComments`/`useDeleteAdminComment` (invalidate `admin` + public
  `comments`/`posts` keys); `/admin/reports` and `/admin/comments` pages replace
  their `AdminPlaceholder`s in `router.tsx`.
- **T3.4 — no new dependencies; tabs are a hand-rolled segmented control.**
  The plan's "tabs" are implemented as a small `Button` group (secondary/ghost)
  rather than adding a shadcn/base-ui `tabs` component, so no package was
  installed. The reports "hide post"/"delete post" actions reuse the existing
  `PATCH /api/admin/posts/:id/status` and `DELETE /api/admin/posts/:id` (no
  duplicate endpoints). Deleting the reported post cascades its reports away, so
  that row disappears from the list.
- **T3.4 — SC evidence:** client `bun run build` PASS, `bun run lint` PASS (0/0);
  backend `bunx tsc --noEmit` PASS. curl (verify_ data): `GET /admin/reports`
  anon **401**, normal user **403**, admin **200**; `?status=open` returns the
  report with populated post/reporter/reason/details; invalid `{"status":"bogus"}`
  → **400** and `?status=bogus` → **400**; `PATCH …/reports/:id {"status":"resolved"}`
  → **200** and the `?status=resolved` list shows `resolvedBy` + `resolvedAt`;
  `GET /admin/comments` → **200** with author+post; `DELETE /admin/comments/:id`
  → **200** (post `commentsCount` `1→0`), second/unknown id → **404**. Live
  headless chrome (chromedriver + dev server, admin cookie injected):
  `/admin/reports` rendered the 6-column table with tabs **Open/Resolved/Dismissed**;
  a scripted row-menu → **Resolve** toasted **"Report resolved"**, the row left the
  Open tab, and the Resolved tab showed **"Resolved by Admin · Oct 13, 2026"**;
  `/admin/comments` rendered the 5-column table, and a scripted row-menu →
  **Delete** → confirm toasted **"Comment deleted"** and removed the row. All
  `verify_` users/posts/reports/records were deleted afterwards (0 remaining).
- **T3.4 — a real open report and a real comment were left untouched:** the
  dev DB already contained a report on "NEWEST POST 1791805431" (by `nor252`) and
  a comment "this is aswome"; only the `verify_` rows were acted on.
- **Quick fix (separate commit `a82233b`) — reports tabs:** `/admin/reports`'s
  hand-rolled segmented control was replaced with the shadcn `Tabs` component
  (`bunx --bun shadcn@latest add tabs`). `tabsListVariants` was moved to
  `client/src/components/ui/tabs-variants.ts` to satisfy
  `react-refresh/only-export-components` (mirrors `button-variants.ts`).
  Behavior unchanged (`onValueChange` sets status + resets page).
- **T3.5 — manage categories:** backend `GET /api/admin/categories` (returns each
  category with an aggregated `postsCount`), `POST` (auto-slug via new
  `backend/utils/slugify.ts`, `categoryWriteSchema` name 1–50),
  `PATCH /:id` (rename + re-slug) and `DELETE /:id`. Duplicate name/slug →
  **409** `A category with this name already exists`; deleting a category that
  still has posts → **409** `This category has N posts. Reassign them to another
  category first.`; `?reassignTo=<id>` moves the posts (own category / unknown
  id → **400**) then deletes. Client `/admin/categories` (wired in `router.tsx`
  over the old placeholder): `Table`, create/rename `Dialog` (react-hook-form +
  zod `categoryFormSchema`), delete `AlertDialog` with a reassign `FilterSelect`,
  plus loading/empty/error states. New `AdminCategory` type; hooks
  `useAdminCategories`/`useCreateCategory`/`useRenameCategory`/`useDeleteCategory`
  invalidate `admin` + the public `categoriesKeys.all` so `/explore` and the home
  chips refresh immediately.
- **T3.5 — SC evidence:** client `bun run build` PASS, `bun run lint` PASS (0/0);
  backend `bunx tsc --noEmit` PASS. curl (verify_ admin + user): `GET
  /api/admin/categories` anon **401**, normal user **403**, admin **200**;
  create → **201** with slug `verify-t35-alpha-<ts>`; duplicate (case-insensitive)
  → **409**; rename → **200** and public `GET /api/categories` shows the new
  name/slug immediately; duplicate rename → **409**; a post assigned to category
  A made `postsCount` **1** and `DELETE A` → **409** (message above); reassign to
  self → **400**; `DELETE A?reassignTo=B` → **200** and the post's category is now
  **B** (`postsCount` **1**); after deleting the posts, `DELETE B` → **200**
  (admin list back to **6**).
- **T3.5 — post-delete cascade re-confirmed clean:** on the test post (liked,
  bookmarked, commented and reported) deleting it removed every child — DB counts
  `likes/bookmarks/comments/reports = 1/1/1/1` before → `0/0/0/0` after. The post
  had no Cloudinary image, so there was no asset to destroy. All `verify_`
  users/posts/categories were deleted afterwards (0 remaining; categories total
  **6**).
- **T4.1 — security hardening review (audit + fixes):** every route was
  reviewed for auth / role / ownership and every input for zod validation. Route
  coverage: public `POST /user/sign-up|login` (`registerSchema`/`loginSchema` +
  auth limiters), `GET /post`, `GET /post/:id`, `GET /post/:id/comments`,
  `GET /user/:id`, `GET /categories`, `GET /health`; authenticated user routes
  (`authorize`) for `/user/me` (+`/password`), `/post/user` (+`/stats`),
  `POST|PUT|DELETE /post(/:id)`, `/post/:id/like|bookmark|comments|report`,
  `DELETE /comment/:id`, `GET /bookmarks`; all `/api/admin/*` behind
  `authorize` + `requireRole("admin")` (already applied router-wide). Ownership
  is enforced on post update/delete and comment delete (owner or admin → 403);
  admin self-action and last-admin guards are in place.
  **Fixes applied:** (1) new `writeLimiter` (120 req / 15 min) on every
  state-changing endpoint — posts, comments, likes, bookmarks, reports, profile
  edits and all admin writes — complementing the existing login/sign-up limits;
  (2) zod input coverage closed: new `addCommentSchema` (`validateBody` on
  `POST /post/:id/comments`), new `listPostsQuerySchema` for `GET /post` and new
  shared `paginationQuerySchema` for `GET /post/user`, `GET /post/:id/comments`
  and `GET /bookmarks` (previously hand-parsed), replacing the manual clamping
  in `post`/`comment`/`bookmark` controllers; (3) upload hardening in
  `uploade.middleware.ts` — explicit JPEG/PNG/WebP/GIF allowlist (was the
  client-controlled `image/*` wildcard), `files: 1` cap and a 400 `HttpError`
  rejection; (4) `error.middleware.ts` maps `MulterError` → **400** (with a
  friendly `Image is too large (max 5MB)` for `LIMIT_FILE_SIZE`), so oversized
  files no longer surface as 500. **Confirmed already adequate:** cookie flags
  (`httpOnly`, `secure` in production, `sameSite=lax`, `maxAge` from
  `EXPIRE_IN`), `helmet()` defaults on the server, no `console.log`/PII in
  application code (only bootstrap/db/scripts), and no secrets in the branch
  history (`.env` git-ignored; only `.env.example` tracked; the sole
  secret-shaped hit is the `CLOUDINARY_API_SECRET` variable reference). Path
  params are validated with `mongoose.isValidObjectId` → 404 rather than zod.
  **SC evidence:** `backend bunx tsc --noEmit` PASS, `client bun run build`
  PASS, `client bun run lint` PASS (0/0). Runtime (live `tsx watch` on :5000):
  `GET /post?limit=999` → **400**, `?sort=zzz` → **400**, valid → **200**;
  comment body `{"text":"   "}` → **400** with `errors:[{field:"text",...}]`;
  non-image upload → **400** `Only JPEG, PNG, WebP or GIF images are allowed`;
  6 MB image → **400** `Image is too large (max 5MB)`. Throwaway `verify_t41_`
  user deleted afterwards (0 remaining).
- **T4.2 — backend tests:** added `backend/tests/api.test.ts` (12 tests, 44
  assertions) run with `bun test`, using `supertest` against the exported
  `backend/app.ts` and an in-memory MongoDB (`mongodb-memory-server`) that is
  never the dev DB. Coverage: auth register→login→`/me`→logout (+ `me` rejects
  `password`), NoSQL-injection login body → **400**, duplicate email → **400**;
  posts public list, create **201**, owner update **200** vs non-owner **403**,
  owner delete **200** vs non-owner **403** then **404**; admin `stats` user
  **403** / admin **200**, self role/ban → **400** with the exact messages, ban →
  target `/me` **403** `Account suspended`; like toggle on/off (`liked`/
  `likesCount`) and comments (empty body **400**, add **201**, list). New
  `backend/app.ts` (app only) keeps `server.ts` as the `listen` + `connectDB`
  entry point. Dev deps added: `supertest`, `@types/supertest`,
  `mongodb-memory-server`. **SC evidence:** `cd backend && bun run test` →
  `12 pass / 0 fail / 44 expect() calls` (exit 0); `bunx tsc --noEmit` PASS.
- **T1.2 — backend gap fixed in this task:** `GET /api/user/me` and `POST
  /api/user/login` only returned `_id/name/email`, so the role-aware navbar was
  impossible. Both now also return `role` (defaulting to `"user"`), `avatar`
  and `bio`. Verified live: login + `/me` return `"role":"user"` for a fresh
  user. `register` still returns `{ id, name, email }` (unchanged; not consumed
  by the client).
- **T1.2 — auth is now cookie-only.** Removed the localStorage mirror and the
  `useUser`/`UserProvider` pair (deleted, approved). `AuthProvider` treats
  `GET /user/me` as the source of truth (`useQuery` key `["me"]`). `login(user)`
  seeds the cache; `logout()` calls `POST /user/sign-out` then
  `queryClient.clear()`.
- **T1.2 — legacy files touched minimally:** `Login.tsx` and `dashboard/Post.tsx`
  now use `useAuth` (unchanged behavior; full rebuilds come in T2.1/T2.2).
  `dashboard/Posts.tsx` reads `data.data.posts` (was `data.data.post`, a T1.1
  runtime mismatch) so the routed `/dashboard` no longer crashes.
- **T1.2 — placeholder pages:** `HomePage`, `ExplorePage`, `PostDetailPage`,
  `ProfilePage`, `SavedPage`, `AdminPage` are intentionally thin stubs wired
  into the router; they are replaced in T1.3, T1.4, T2.5, T2.6 and Phase 3.
- **T1.2 — brand/wordmark:** navbar uses `DevMotiv` (repo has no official name).
  Trivial to rename later.
- **T1.2 — theme:** custom `ThemeProvider` (light/dark/system, `devmotiv-theme`
  in localStorage, `.dark` on `<html>`), no `next-themes` per the plan.
- **T1.2 — test data (additive, not deleted):** `t12test<timestamp>@example.com`
  (plain user) created via the API to verify `role` in login/`/me`. Delete needs
  your approval.
- **T1.2 — 401 interceptor:** clears the Query cache, toasts and redirects to
  `/login` for any non-`/user/me` 401. The `/user/me` session probe is excluded
  (its 401 is the normal logged-out state and is swallowed to `null`).
- **T1.3 — new shared `PostCard`** lives at
  `client/src/features/posts/components/PostCard.tsx` (image or neutral `Code2`
  block, category badge, title/description line-clamped, author avatar + name,
  relative date via `date-fns`, likes/comments counts). `PostCardSkeleton` ships
  in the same file so cards reserve identical space (no layout shift).
- **T1.3 — Cloudinary URLs are optimized** on the client via
  `client/src/lib/image.ts` (`/image/upload/` -> adds `f_auto,q_auto,w_800`).
- **T1.3 — Base UI fix:** `Button` renders with `nativeButton={false}` whenever
  the `render` prop is a `Link`. Without it Base UI logged an accessibility
  warning per link-button. Verified live: zero warnings in console.
- **T1.3 — home is responsive-checked** at 375/768/1280 (sections present,
  mobile `Sheet` trigger on 375, no console errors; verified headless).
- **T1.3 — category chips link to `/explore?category=<slug>`** (honored by
  Explore since T1.4).
- **T1.3 — SC evidence:** `bun run build` PASS; `bun run lint` PASS (0/0);
  backend `bunx tsc --noEmit` PASS; live headless chrome: all sections render,
  6 post cards + 8 category chips at 375/768/1280, **zero console warnings**
  (the Base UI `nativeButton` warnings from the first pass are gone).
- **T1.4 — `/explore` state lives in the URL** (`?q=&category=&sort=&page=`), so
  refresh / back / direct links all restore it. Search is debounced (400ms) and
  synced to the URL; the URL→input sync uses React's render-time state-adjust
  pattern (the `react-hooks/set-state-in-effect` lint rule forbids the obvious
  `useEffect`). `Pagination` preserves the other query params in its href.
- **T1.4 — post detail** (`usePost`, `retry: false`) maps a 404 (axios status) to
  the shared `NotFoundPage`; other errors show a Retry block. Like/Comment/
  Bookmark are placeholders: logged-out click toasts + routes to `/login` with
  `state.from`; logged-in click toasts "coming in a later step".
- **T1.4 — per-page `<title>`** via `useDocumentTitle` (Home, Explore, post title,
  404, NotFound). Brand suffix is `DevMotiv`.
- **T1.4 — SC evidence:** `bun run build` PASS; `bun run lint` PASS (0/0);
  backend `bunx tsc --noEmit` PASS; live headless chrome: `/explore` p1=9 cards
  + pagination, `?page=2`=2 cards + active link, `?category=ai`=3 cards (no
  pagination), `?q=temp`=6, invalid/unknown ids → 404 UI, valid id → full post,
  no app-origin console errors.
- **T1.4 — pagination was exercised with temporary data:** 6 posts (3 with
  category `ai`) created as `t14temp<ts>@example.com` to push the list past one
  page, then **deleted** (feed back to the original 5). The temp *user* remains
  (like the earlier `t12test` user); deleting it needs your approval.
- **T2.0 — reactions + share pulled forward.** The T1.4 like/comment/bookmark
  placeholders on `/posts/:id` are now real, and every post card/detail has a
  **share** menu. New backend: `Like`/`Comment`/`Bookmark` models (unique
  `{user,post}` indexes), `like`/`comment`/`bookmark` controllers + routes
  (`POST /post/:id/like`, `POST /post/:id/bookmark`, `GET|POST
  /post/:id/comments`, `DELETE /comment/:id`, `GET /bookmarks`), and an
  `optionalAuth` middleware so lists/detail attach `likedByMe`/`bookmarkedByMe`
  for signed-in users. Client: `features/posts/api.ts` (`useToggleLike`,
  `useToggleBookmark`, `useBookmarks`), `features/comments/api.ts`
  (`useComments` infinite, `useAddComment`, `useDeleteComment`), `PostActions`
  (compact on cards, `full` on detail), `ShareMenu` (X/Facebook/LinkedIn/
  WhatsApp + copy + native share) and a `#comments` `CommentsSection`.
  `PostCard` footer actions were moved **outside** the wrapping `Link` to avoid
  nested interactive elements.
- **T2.0 — lucide brand icons unavailable:** `Twitter`/`Facebook`/`Linkedin` are
  `undefined` in this lucide-react build; `ShareMenu` uses `AtSign`/`Globe`/
  `Briefcase` instead (WhatsApp uses `MessageCircle`).
- **T2.0 — SC evidence:** `bun run build` PASS; `bun run lint` PASS (0/0);
  backend `bunx tsc --noEmit` PASS. Live headless: logged-out `/explore` and
  `/posts/:id` show share/like/save/comment buttons (5 cards) + a login gate in
  comments, zero app console errors; `/` shows 5 share icons; `/saved` redirects
  to `/login` when logged out. Authenticated via CDP (cookie injected): detail
  showed `1Like`/liked state + comment textarea (no login prompt), clicking
  Like/Save toggled correctly, and a comment posted through the UI rendered with
  author + relative time. Backend curl: like 401→toggle true/false, comments
  401/400/201/list/delete (+403 cross-user), bookmarks 401/toggle/list. Test
  residue (comment/like/bookmark) removed — post counts back to `0/0`,
  bookmarks `0`.
- **T2.2 — dashboard rebuilt on react-query.** `DashBoard.tsx` now owns the
  "my posts" loop: a stats row (`GET /post/user/stats`), a paginated grid of
  `MyPostCard`s (status + category badges, likes/comments, date), a "New post"
  dialog, and empty/loading/error states. New shared
  `features/posts/components/PostForm.tsx` serves both create and edit (title,
  description `Textarea`, category `<select>` from `/categories`, comma-separated
  tags ≤ 5, optional image with preview + remove); `client/src/features/posts/schemas.ts`
  (zod) + `toPostFormData` build the multipart body. `MyPostCard` embeds the edit
  `Dialog` (prefilled) and a delete `AlertDialog`. Mutations `useCreatePost`/
  `useUpdatePost`/`useDeletePost` (with `useMyPosts`, `useMyStats`) invalidate
  `postsKeys.all` + `myPostsKeys.all` and toast; `getErrorMessage` now surfaces
  the server's `message` for axios errors.
- **T2.2 — backend:** added `getUserStats` (mongoose aggregate over the current
  user's posts → `totalPosts/totalLikes/totalComments`) at `GET /post/user/stats`.
  The create/update/delete routes already existed and are unchanged: ownership
  enforced (403), image replace destroys the old Cloudinary asset, delete removes
  the asset too. Text-only posts are allowed (image optional).
- **T2.2 — SC evidence:** `bun run build` PASS; `bun run lint` PASS (0/0);
  backend `bunx tsc --noEmit` PASS. curl: stats `0/0/0` → text-only create
  (`-F title -F description -F tags`) → 201 → stats `1/0/0`. Live CDP (cookie
  injected): `/dashboard` rendered my-posts + stats; opening "New post" showed
  all form fields; creating through the dialog added the card and bumped stats
  `1→2`; editing a card opened prefilled, saved and reflected the new title;
  the delete `AlertDialog` confirmed and removed the card. Temp post(s) deleted
  after (user back to `0/0/0`).
- **T2.2 — new temp user:** `t22test<ts>@example.com` / `Passw0rd1` created for
  the flow (DB deletes need your approval). The legacy
  `client/src/components/dashboard/{DailogForm,Posts,Post}.tsx` are no longer
  imported; deleting them needs your approval.
- **T2.2 — note:** `Posts.tsx` (legacy) had been fetching the public feed
  (`GET /post`) instead of the user's own posts; the rewrite uses
  `GET /post/user` so the dashboard is correctly scoped.
- **T2.1 — auth pages rebuilt.** `LoginPage`/`RegisterPage` now own their forms
  (the old `client/src/components/Login.tsx` + `Register.tsx` are no longer
  imported; deleting them needs your approval). Uses `Card` + the base-nova
  `Field`/`FieldLabel`/`FieldError` primitives with `react-hook-form` +
  `zodResolver` (`client/src/features/auth/schemas.ts`). New
  `features/auth/components/PasswordInput.tsx` (eye/eye-off toggle) and
  `signIn`/`signUp` in `features/auth/api.ts`. Server `400` `errors[]` from
  register map onto the name/email fields; everything else becomes a root error
  + toast.
- **T2.1 — `GuestRoute` now honors `state.from`:** a logged-out visit to
  `/saved` bounces to `/login` carrying `state.from="/saved"`, and after a
  successful login `GuestRoute` redirects back to `/saved` (no race with a
  manual `navigate`). Logout already `POST /user/sign-out` + `queryClient.clear()`
  + `navigate("/")` (`Navbar.handleLogout`).
- **T2.1 — backend validation:** new `validators/auth.validator.ts`
  (`registerSchema`/`loginSchema`) + `middlewares/validate.middleware.ts`
  (`validateBody`) applied to `POST /user/sign-up` and `/user/login`. Login
  returns the same generic `"Invalid email or password"` for unknown email or
  wrong password. `register` now returns field-scoped `errors[]`
  (`email`/`name` already used).
- **T2.1 — SC evidence:** `bun run build` PASS; `bun run lint` PASS (0/0);
  backend `bunx tsc --noEmit` PASS. curl: injection `{"email":{"$ne":null},"password":"x"}`
  → **400**; non-string email → 400; weak password → 400; valid register → 201;
  login → 200 + httpOnly `token` cookie; `/me` → 200; `sign-out` → 200 with
  `token=; Expires=Thu, 01 Jan 1970` and `/me` → **401** afterwards; wrong
  email vs wrong password → identical `"Invalid email or password"`. Live CDP:
  `/saved` (logged out) → `/login` with login card; empty submit shows the zod
  field errors; password toggle flips `password`→`text` (and relabels); after a
  real login it landed back on `/saved` ("Saved posts"). (A second CDP run hit
  the login `rateLimit` 5/15min → 429, which is why that pass showed `/login`.)
- **T2.1 — new temp user:** `t21test<ts>@example.com` / `Passw0rd1` created to
  verify the flow (DB deletes need your approval; also still present:
  `t12test<ts>`, `t14temp<ts>`, `t14b<ts>`).
- **T2.6 — new temp users:** `t26test<ts>@example.com` (final password
  `Finalpass42` — it was changed through the settings UI) and
  `t26dup<ts>@example.com` were created to verify the profile settings,
  password change and duplicate-name guard. Temp post + comment and the test
  avatar upload were cleaned up, but the two accounts and their Cloudinary
  avatar remain — DB deletes need your approval (accumulating: `t12test<ts>`,
  `t14temp<ts>`, `t14b<ts>`, `t21test<ts>`, `t22test<ts>`, `t26test<ts>`,
  `t26dup<ts>`).
- **T2.7 — no new accounts:** the report flow was verified with the existing
  `t26test<ts>`/`t26dup<ts>` accounts; the 3 temp posts and their reports were
  removed through the API (post-delete now cascades to reports), so no extra
  DB cleanup is needed from this task.
- **T3.1 — admin layout & dashboard:** `routes/admin.route.ts` applies
  `authorize` + `requireRole("admin")` to everything under `/api/admin`;
  `controllers/admin.controller.ts` `GET /admin/stats` returns `totals`
  (users/posts/comments/open reports), a zero-filled 14-day `daily` series for
  new users & posts (Mongo `$dateToString` aggregation), and latest 5 users &
  posts. Client: `/admin` is now a layout (`AdminSidebar` + `AdminTopbar`
  breadcrumb/user menu) with nested routes — Dashboard is live, Users/Posts/
  Comments/Reports/Categories render `AdminPlaceholder` for T3.2–T3.5.
  `AdminDashboard` = 4 stat cards + two `recharts` `BarChart`s + two recent
  lists (skeleton + error/retry). Added dependency `recharts`.
- **T3.1 — SC evidence:** client `bun run build` PASS and `bun run lint` PASS
  (0/0); backend `bunx tsc --noEmit` PASS. curl: `/api/admin/stats` → **401**
  anon, **200** admin, **403** normal user (`"Ma lihid fasax (forbidden)"`).
  Live CDP: admin `/admin` renders sidebar, cards (Users/Posts/Comments/Open
  reports) + 2 charts + "Latest users"/"Latest posts"; a normal user on `/admin`
  is redirected to `/`.
- **T3.1 — admin account fix:** the seeded admin's email typo
  `admin@gmial.com` was corrected to `admin@gmail.com` directly in the DB
  (`backend/.env` `ADMIN_EMAIL` still needs the same manual update so future
  `seed:admin` runs stay idempotent).
- **T3.1 — new temp user:** `t31verify@example.com` / `Finalpass42` created to
  verify the normal-user 403 / redirect. DB deletes need your approval
  (accumulating: `t12test<ts>`, `t14temp<ts>`, `t14b<ts>`, `t21test<ts>`,
  `t22test<ts>`, `t26test<ts>`, `t26dup<ts>`, `t31verify`).
- **Language switch (default = English):** removed all Somali from the codebase
  (code comments + user-facing strings, client and backend) and translated
  everything to English; updated the `AGENTS.md` convention accordingly. Fixed
  the two legacy English typos `"Unathorized"` and the model email message.
- **T3.2 — manage users:** `GET /api/admin/users` supports `q` (name/email
  regex, escaped), `role`, `status` (active/banned), `sort` (newest/oldest),
  `page`/`limit`, and returns each user's `postsCount` (post aggregation for the
  page). `PATCH /users/:id/role` and `/ban` toggle role/suspension;
  `DELETE /users/:id` hard-deletes the account and all of its content (posts +
  Cloudinary images, avatar, likes, comments, bookmarks, reports) — your chosen
  behavior. Safety rules enforced server-side: cannot change/ban/delete yourself
  (400) and the last admin is protected. Client `/admin/users` = filterable
  table (search + role/status/sort selects), role/status badges, row action
  dropdown, delete confirmation `AlertDialog`; own row shows "(you)" with no
  actions.
- **T3.2 — SC evidence:** client `bun run build` PASS, `bun run lint` PASS (0/0);
  backend `bunx tsc --noEmit` PASS. curl (admin): list OK (total 24, pagination),
  anon **401**, normal user **403**; self role/ban/delete → **400**
  (`You cannot change your own role` / `You cannot ban yourself` /
  `You cannot delete your own account`); invalid role value and bad id → 400;
  ban → 200 then the banned user's `/me` → **403** `Account suspended`;
  unban/role changes → 200; delete → 200 and the user disappears from the list.
  Live CDP: `/admin/users` renders 10 rows with filters; a scripted run typed a
  search (1 row), opened the row menu, chose "Delete user", confirmed in the
  dialog → toast **"User deleted"** and the row removed. Disposable test users
  were deleted through the API/UI (no new cleanup needed).
- **T1.1 — API response shape changed (breaking for old client code):** the list
  now returns `data: { posts, pagination }` instead of `data: { post }`.
  `client/src/components/dashboard/Posts.tsx` still reads `data.data.post` and
  will be rewritten in T1.2/T2.2. `cd client && bun run build` still PASSes
  because axios responses are untyped (`any`); this is a runtime-only mismatch.
- **T1.1 — Mongoose 9 exports `QueryFilter`, not `FilterQuery`.** Used
  `QueryFilter<PostType>` in `post.controller.ts` (the baseline `tsc` would fail
  with the old name).
- **T1.1 — ran with your approval:** `seed:categories` (8 categories, upsert) and
  `backfill:post-status` (6 posts without `status` -> `published`). Non-destructive.
- **T1.1 — category filter positive path unproven:** no existing post has a
  `category` yet, so `GET /api/post?category=<slug>` returns an empty list by
  design. It is wired (slug -> id resolution) and will be exercised in T2.2.
- **T1.1 — input conventions:** `tags` accepts a JSON array string, a
  comma-separated string, or an array; normalized to lowercase (max 5).
  `category` accepts an ObjectId or a slug. `image` is now optional (text-only
  posts allowed). `POST/PUT` do not accept `status` yet (default `published`);
  admin hide/unhide comes in T3.3.

- **Resolved in T0.3 (env names):** `backend/config/env.ts` now reads
  `MONGODB_URI` and `JWT_EXPIRES_IN` (as documented in `.env.example`) and falls
  back to the legacy `DB_URI` / `EXPIRE_IN`, so the existing `.env` keeps
  working. Env is validated with zod at startup and the process exits with a
  clear message if anything is missing.
- **`req.user` typing added early (T0.3):** `backend/types/express.d.ts` augments
  `Express.Request` with `user?: HydratedDocument<UserType>` (planned for T0.4),
  so the new `/me` controller avoids `(req as any)`. T0.4 still adds
  `requireRole`, `isBanned` and the rest.
- **Existing users without `role`:** `role`/`isBanned` are only defaults for new
  docs, so old docs read back `undefined`. They behave as a normal user: the
  banned check is falsy-safe and `requireRole("admin")` requires an exact
  `"admin"` match. No migration was run.
- **Orphan posts:** `bun run report:orphans` reported **0** posts without an
  author (dev DB). No action needed; script only lists.
- **Test data (not deleted — DB deletes need approval):**
  - `t03test<timestamp>@example.com` (T0.3)
  - `admin.t04@example.com` (admin, via `seed:admin` with test creds), `user.t04@example.com` (user), `banned.t04@example.com` (banned) (T0.4)
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
