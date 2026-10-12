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
| T2.1 | Auth pages | TODO | — | — |
| T2.2 | Create, edit, delete posts | TODO | — | — |
| T2.3 | Likes | DONE | _(see git log)_ | Delivered early in T2.0 (pull-forward) |
| T2.4 | Comments | DONE | _(see git log)_ | Delivered early in T2.0 (pull-forward) |
| T2.5 | Bookmarks (Saved) | DONE | _(see git log)_ | Delivered early in T2.0 (pull-forward) |
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
