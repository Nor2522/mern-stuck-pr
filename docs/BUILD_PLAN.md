# BUILD_PLAN.md — Programmers' Motivation Platform (mern-stuck-pr)

> Put this file at `docs/BUILD_PLAN.md` in the repo. Start OpenCode in **Build mode** and send:
>
> `Read AGENTS.md and docs/BUILD_PLAN.md fully. Then start with task T0.1 only. Follow the working rules and stop at the checkpoint.`

---

## 1. Mission

A community platform where **programmers share posts** (progress, lessons, wins, struggles) so they **motivate each other**.

Three kinds of people use it:

| Role | Who | Can do |
|---|---|---|
| **Visitor** | Not logged in | Home page, browse/search posts, read a post, view public profiles |
| **User** | Registered | Everything a visitor can + create/edit/delete own posts, like, comment, bookmark, report, edit profile |
| **Admin** | Platform owner | Everything a user can + dashboard stats, manage users (role/ban/delete), posts (hide/delete), comments, reports, categories |

---

## 2. Current project state (do not assume more than this)

- Monorepo `mern-stuck-pr/`: `backend/` (Express + Mongoose + TypeScript, run with Bun/tsx) and `client/` (React + Vite + TypeScript + shadcn/ui + Tailwind).
- Auth: JWT in an **httpOnly cookie named `token`**. Routes: `POST /api/user/sign-up`, `POST /api/user/login`, `POST /api/user/sign-out`.
- Posts: `/api/post` (`GET /`, `GET /user`, `POST /` with multer `upload.single("image")` + Cloudinary, `PUT /:id`, `DELETE /:id`). Ownership checks exist for update/delete.
- `User` model has `name` (NOT `username`), `email`, `password`.
- `Post` model: `title`, `description`, `image {url, publicId}`, `author` (ref `User`), timestamps.
- Client has: `lib/api.ts` (axios, `withCredentials: true`), sonner toasts, react-hook-form, post cards with edit/delete.
- Known debt: `react-hot-toast` still used in some files (should be sonner only), `useUser.tsx` has `any` + lint errors, `user.controller.ts` is an empty stub, old posts in the DB have no `author`.

---

## 3. Working rules (MANDATORY)

1. **One task at a time.** Do exactly the task I name. Do not start the next one.
2. **Stop at every checkpoint** (format in section 5) and wait for me to reply `continue` or give feedback. Default mode is REVIEW. Only if I write `AUTO until <task id>` may you continue through tasks, still doing a checkpoint report and a commit after each.
3. **Plan first.** Before editing, list in 3 to 6 lines what you will change. Then do it.
4. **Minimal, focused diffs.** Do not touch unrelated files. No drive-by refactors, no reformatting of untouched code.
5. **Commit after each task**: `git add -A && git commit -m "feat(T2.3): likes"`. Never `git push`. Never rewrite history.
6. **No destructive actions without asking me**: no `rm -rf`, no dropping/deleting DB data, no `git reset --hard`. If a task needs a data migration, write a script and ask me to approve before running it.
7. **Never invent.** If an API field, route or file does not exist, check the code first. If something is ambiguous, state your assumption in the checkpoint instead of silently guessing.
8. **Never claim something passes unless you ran the command and saw it pass.** Paste the real output summary.
9. **Update `docs/PROGRESS.md`** at the end of every task (task id, status, commit hash, notes, open issues). It is the memory for future sessions.
10. **Secrets**: never print or commit `.env` values. Maintain `.env.example` with names only.
11. **New dependencies**: list each one with a one-line reason in the checkpoint. Prefer what is already installed.
12. **Context hygiene**: after every 2 to 3 tasks, tell me to run `/compact` or open a new session. A new session must begin by reading `AGENTS.md`, `docs/BUILD_PLAN.md`, `docs/PROGRESS.md`.

---

## 4. Anti-slop rules (quality bar)

### UI / design
- **Use shadcn/ui for every UI primitive.** Never hand-roll a button, input, dialog, dropdown, table, tabs, badge, avatar, skeleton, card, sheet, pagination. Add components with the CLI: `bunx --bun shadcn@latest add <name>`.
- Components you are expected to use: `button card input textarea label form select badge avatar skeleton separator dialog alert-dialog dropdown-menu sheet sidebar table tabs pagination tooltip sonner chart breadcrumb`.
- **Theme tokens only**: `bg-background`, `text-foreground`, `text-muted-foreground`, `border`, `bg-primary`, etc. No hard-coded hex colors, no random `bg-slate-800` / `bg-pink-500` classes, no inline `style={{}}` for colors.
- **Icons**: `lucide-react` only. **No emojis in the UI.**
- One consistent layout: centered container (`max-w-6xl mx-auto px-4`), consistent spacing scale, clear type hierarchy (one `h1` per page).
- **Every data view has 3 states**: loading (skeleton, not the word "Loading"), empty (short message + action), error (message + Retry button).
- Forms: `react-hook-form` + `zod` resolver, inline field errors, submit disabled while pending, success/error toast via sonner.
- Destructive actions always go through `AlertDialog`.
- Responsive at **375px, 768px, 1280px**. Keyboard accessible: labels on inputs, `alt` on images, visible focus, dialogs close with Esc.
- Dark mode must not break: use tokens so both themes work.
- **Copy**: short, real, specific. No lorem ipsum. No marketing fluff ("revolutionary", "seamless", "unleash"). **No fake stats, fake testimonials or fake users.** Language of the UI: English (assumption; easy to change later).
- Images from Cloudinary: request optimized URLs (`/upload/f_auto,q_auto,w_800/`), always set width/height or aspect ratio to avoid layout shift.

### Code
- TypeScript strict: **no `any`**, no `@ts-ignore`, no non-null `!` without a reason.
- No `console.log`, no commented-out code, no TODOs left behind, no dead files, no duplicate components or helpers. Search before creating.
- One toast library (**sonner**). One HTTP client (`lib/api.ts`). One shape per entity (types in `client/src/types/`).
- API response convention (backend and client must agree):
  - Success: `{ "success": true, "data": { ... } }`
  - Error: `{ "success": false, "message": "human readable" }`
  - Lists: `data: { posts: [...], pagination: { page, limit, total, totalPages } }`
- Backend: controllers stay thin; validation with `zod` in `validators/`; errors go through the global error middleware; never return raw `error` objects or stack traces.
- Frontend: feature folders for new code: `client/src/features/<auth|posts|comments|profile|admin>/` (components, hooks, api). Do not rewrite working legacy files unless the task says so.
- Server state with **TanStack Query** (cache, loading, error, invalidation). No manual `useEffect + useState` fetching in new code.

---

## 5. Checkpoint report (after EVERY task, then STOP)

Print exactly this structure:

```
## Checkpoint: <Task ID> — <title>
Status: DONE / PARTIAL / BLOCKED

### What changed
<git diff --stat> + one line per file explaining why.

### Evidence (real output)
| Check | Command | Result |
| build | cd client && bun run build | PASS/FAIL |
| lint | cd client && bun run lint | PASS/FAIL (no NEW findings) |
| types | cd backend && bunx tsc --noEmit | PASS/FAIL |
| tests | cd backend && bun test (if exists) | PASS/FAIL (n passed) |
| API | the curl commands you ran | status codes + short body |

### How I verify it myself (step by step)
1. <exact URL / click / command>  -> expected: <what I should see>
2. ...
(Include logged-out, normal-user and admin cases when relevant.)

### New dependencies
<name — reason> or "none"

### Assumptions / deviations / known issues
<list> or "none"

### Commit
<hash> <message>

Reply `continue` to start <next task id>, or tell me what to change.
```

---

## 6. Tools and setup (use them, do not reinvent)

### Frontend
| Tool | Why |
|---|---|
| **shadcn/ui CLI** (`bunx --bun shadcn@latest add ...`) | All UI primitives. Check `components.json` first. Reference: ui.shadcn.com/docs |
| **shadcn Blocks** (ui.shadcn.com/blocks) | Start from real layouts: sidebar admin layout, login form, dashboard. Adapt them, do not copy blindly |
| **shadcn Chart** (recharts) | Admin dashboard charts |
| **shadcn Data Table + @tanstack/react-table** | Admin tables (sorting, pagination) |
| **@tanstack/react-query** | Server state, caching, optimistic updates |
| **react-hook-form + zod + @hookform/resolvers** | Forms and validation |
| **lucide-react** | Icons |
| **date-fns** | Date formatting ("3 days ago") |
| **Existing router** (react-router) | Routes, guards (`ProtectedRoute`, `RoleRoute`) |

### Backend
| Tool | Why |
|---|---|
| **zod** | Request validation (body, params, query) |
| **helmet**, **express-rate-limit**, **cors**, **cookie-parser** | Security basics |
| **bun test + supertest + mongodb-memory-server** | API tests that NEVER touch the dev database |
| **Cloudinary SDK** | Upload + `destroy` on delete/replace |

### Optional MCP servers (only if they connect without hassle)
- **shadcn MCP** (see ui.shadcn.com/docs/mcp for the OpenCode setup) so you can browse/install components accurately.
- **Context7 MCP** for up-to-date library docs. Say "use context7" when unsure about an API (TanStack Query, react-router, zod, Mongoose).

If a tool is not available, use official docs via web fetch. Do not guess APIs from memory when a library version changed.

### Standard checks (referenced below as "SC")
```
cd client  && bun run build && bun run lint
cd backend && bunx tsc --noEmit
cd backend && bun test          # once tests exist (T4.2 onward, earlier if added)
```
"No new lint findings" means: do not add warnings/errors; pre-existing ones are fixed in T0.2.

### Done means (every task)
SC pass, no new lint findings, manual steps listed, `docs/PROGRESS.md` updated, committed, checkpoint printed.

---

# PHASE 0 — Foundation

### T0.1 — Baseline and progress log
**Goal:** know the true starting state.
**Do:**
- `git status` must be clean (tell me if not).
- Run SC and record results (expected: some lint errors, that is the baseline).
- Create `docs/PROGRESS.md` with a table: `Task | Status | Commit | Notes`, and a "Baseline" section.
- Create `backend/.env.example` and `client/.env.example` (names only: `PORT`, `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_URL`, `CLOUDINARY_*`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `VITE_API_URL`).
**Done when:** files exist, baseline recorded. **Show me:** baseline table of SC.

### T0.2 — Cleanup and consistency
**Goal:** one toast lib, typed user, zero lint errors.
**Do:**
- Replace every `react-hot-toast` usage with `sonner`; remove the dependency and its `<Toaster/>`.
- Fix `useUser.tsx`: remove `any`, define `AuthUser = { _id, name, email, role }` in `types/`, store ONE shape (no `user.user._id` fallbacks). Fix the 5 known lint errors (`button.tsx` react-refresh export, `useUser.tsx` x3, `Login.tsx` hook dep).
- Delete dead code: empty `user.controller.ts` (or implement later if a task needs it), unused deps, stray files.
- Make `lib/api.ts` read `VITE_API_URL` (default `http://localhost:5000/api`).
**Done when:** `bun run lint` has **0 errors, 0 warnings**; app still logs in and shows posts.
**Show me:** lint output, list of removed files/deps.

### T0.3 — Backend foundation
**Goal:** safe, predictable backend base.
**Do:**
- Global error middleware + 404 handler + `asyncHandler` wrapper. Error shape: `{ success:false, message }`; hide stack in production.
- Validate env at startup (fail fast with a clear message). CORS origin from `CLIENT_URL`. Port from env.
- Add `helmet`, `express-rate-limit` on `/api/user/login` and `/api/user/sign-up`.
- `GET /api/health` -> `{ success:true, data:{ status:"ok" } }`.
- Auth cookie: `httpOnly`, `sameSite:"lax"`, `secure` in production, `maxAge` = JWT expiry. **Stop returning the token in the JSON body.**
- Add `GET /api/user/me` (authorized) returning the current user (no password). 
- Mongo connect failure must exit the process with a clear log.
**Done when:** SC pass; curl proves: health 200, login sets cookie, `/me` with cookie 200, `/me` without cookie 401, 6th rapid bad login gets 429.
**Show me:** the curl transcript.

### T0.4 — Roles, banned users, admin seed
**Goal:** roles exist and are enforced.
**Do:**
- `User` model: `role` enum `user|admin` (default `user`), `isBanned` (default false), `avatar {url, publicId}` optional, `bio` (max 160) optional. `password` must be `select:false`.
- `authorize` middleware: also rejects banned users (403 "Account suspended") and attaches a typed `req.user`. Add `requireRole("admin")` middleware. Extend Express `Request` type (no `(req as any)`).
- Seed script `backend/scripts/seed-admin.ts` + package script `seed:admin`: creates (or promotes) an admin from `ADMIN_EMAIL` / `ADMIN_PASSWORD` env. No hard-coded credentials.
- Existing users without `role` must behave as `user` (state how you handled it).
- Posts without `author`: write `backend/scripts/report-orphan-posts.ts` that only **lists** them. Do not delete. Ask me what to do.
**Done when:** SC pass; curl proves: normal user gets 403 on a `requireRole("admin")` test route (temporary route removed after), admin gets 200, banned user gets 403.
**Show me:** curl transcript + orphan post count.

---

# PHASE 1 — Visitor (public side)

### T1.1 — Post model upgrade and public API
**Goal:** visitors can read posts without logging in.
**Do:**
- `Category` model (`name`, `slug` unique) + seed script with ~8 categories (e.g. Web, Mobile, AI, Security, DevOps, Career, Learning, Projects). `GET /api/categories` (public).
- `Post` model: add `category` (ref), `tags` (max 5, lowercase), `status` (`published|hidden`, default `published`), `likesCount` and `commentsCount` (default 0). `image` becomes **optional** (text-only posts are allowed). `description` max 2000. Add indexes: `createdAt`, `author`, `category`, text index on `title`/`description`.
- Make `GET /api/post` **public** (remove `authorize`), supporting `?page&limit&q&category&author&sort=latest|popular`, only `status:"published"`. Return `data:{ posts, pagination }` with author populated (`name`, `avatar`).
- `GET /api/post/:id` public (published only; 404 otherwise).
- `GET /api/post/user` stays authorized (my posts, includes hidden, labelled).
- `POST/PUT` accept `category`, `tags`; validate with zod (`validators/post.validator.ts`). Replacing the image on PUT destroys the old Cloudinary asset.
- Existing posts get `status:"published"` via a documented, **non-destructive** update script (ask me before running).
**Done when:** SC pass; curl proves public list works without cookie, pagination math is right, `q` search works, hidden posts are not public.
**Show me:** curl transcript.

### T1.2 — Frontend foundation (layout, routing, data layer)
**Goal:** the skeleton every page sits on.
**Do:**
- Install and set up `@tanstack/react-query` (`QueryClientProvider`), `zod`, `@hookform/resolvers`, `date-fns`.
- `AuthProvider`/`useAuth`: loads session from `GET /user/me` on app start (cookie is the source of truth, not localStorage). Axios 401 interceptor: clear session, redirect to `/login` with a toast.
- Layout: `Navbar` (logo, Home, Explore; Visitor sees Login/Register; User sees avatar dropdown with Profile, My posts, Saved, Logout; Admin also sees "Admin"), `Footer`, mobile menu via shadcn `Sheet`.
- Route map: `/` home, `/explore`, `/posts/:id`, `/u/:id`, `/login`, `/register`, `/dashboard` (user), `/saved`, `/admin/*`, `*` 404. Guards: `ProtectedRoute` (logged in), `RoleRoute role="admin"`, `GuestRoute` (redirect logged-in users away from login/register).
- Theme: light/dark toggle (shadcn pattern for Vite, no `next-themes`).
- Shared types in `client/src/types/` matching the API exactly.
**Done when:** SC pass; visitor, user and admin see different navbars; `/admin` redirects non-admins; unknown URL shows a proper 404 page.
**Show me:** the three navbar states described step by step.

### T1.3 — Home page
**Goal:** a visitor understands the platform in 5 seconds.
**Do:**
- Sections: Hero (clear headline, one-line value, primary CTA "Join the community" or "Go to dashboard" if logged in, secondary CTA "Browse posts"); Latest posts (6 cards); Categories (chips linking to `/explore?category=`); "How it works" (3 steps with lucide icons); final CTA; Footer.
- `PostCard` shared component (image or neutral block, category badge, title line-clamp-1, description line-clamp-3, author avatar+name, relative date, likes/comments counts). Whole card links to `/posts/:id`.
- Loading skeletons, empty and error states. Real copy only, no fake numbers.
**Done when:** SC pass; page works logged-out; no layout shift; responsive at 375/768/1280.
**Show me:** step-by-step visual checklist.

### T1.4 — Explore and post detail
**Goal:** browse, search, filter, read.
**Do:**
- `/explore`: search box (debounced), category filter (select or chips), sort (latest/popular), pagination (shadcn `Pagination`), state kept in the URL query string.
- `/posts/:id`: full post (image, title, category, tags, author card, date, counts), back link, 404 state. Like/comment/bookmark areas appear as disabled placeholders **only if** logged out they prompt login; real behavior comes in Phase 2.
- Page `<title>` per page.
**Done when:** SC pass; refresh keeps filters; invalid id shows 404 UI.
**Show me:** manual steps incl. direct URL open while logged out.

---

# PHASE 2 — User

### T2.1 — Auth pages
**Goal:** professional login/register.
**Do:**
- Rebuild `/login` and `/register` with shadcn `Card` + `Form`, react-hook-form + zod (name 2 to 50, valid email, password min 8 with at least a letter and a number, confirm password).
- Server errors mapped to fields or toast (e.g. email already used). Show/hide password toggle. Redirect to the page the user came from after login.
- Logout calls `POST /user/sign-out`, clears the Query cache, redirects home.
- Backend: validate bodies with zod; reject non-string email/password (NoSQL injection hardening); same generic message for wrong email or password.
**Done when:** SC pass; curl with `{"email":{"$ne":null},"password":"x"}` returns 400; logout really clears the cookie.
**Show me:** manual steps + curl output.

### T2.2 — Create, edit, delete posts (user dashboard)
**Goal:** the core loop feels great.
**Do:**
- `/dashboard`: "My posts" grid with status badge (published/hidden), edit/delete actions, "New post" button. Stats row (my posts, total likes, total comments) from existing data.
- Create/Edit in a page or dialog using one shared `PostForm` (title, description, category select, tags input (max 5), optional image with preview and remove). Edit prefilled; image replace supported.
- Delete via `AlertDialog`. After create/edit/delete: invalidate Query keys, toast, no manual reload.
- Ownership enforced on backend (already) and buttons hidden for non-owners.
**Done when:** SC pass; create text-only and image posts; edit swaps image; delete removes Cloudinary asset (verify in the checkpoint how).
**Show me:** manual steps for each action.

### T2.3 — Likes
**Do:**
- `Like` model `{ user, post }` with unique compound index. `POST /api/post/:id/like` toggles and returns `{ liked, likesCount }`; keep `Post.likesCount` in sync with `$inc` (atomic). `GET` post responses include `likedByMe` when logged in.
- UI: heart button with optimistic update and rollback on error; logged-out click opens a "Login to like" prompt.
**Done when:** SC pass; double-click does not double count; unlike works; curl proves 401 when logged out and idempotent toggling.

### T2.4 — Comments
**Do:**
- `Comment` model `{ post, author, text (1 to 500) }` + index on `post, createdAt`. Endpoints: `GET /api/post/:id/comments` (public, paginated), `POST` (auth), `DELETE /api/comment/:id` (author or admin). Keep `commentsCount` in sync.
- UI on post detail: list with avatars and relative time, form with character counter, delete with `AlertDialog`, empty and loading states.
**Done when:** SC pass; a user cannot delete another user's comment (403); admin can.

### T2.5 — Bookmarks (Saved)
**Do:**
- `Bookmark` model `{ user, post }` unique. `POST /api/post/:id/bookmark` toggle; `GET /api/bookmarks` (auth, paginated).
- UI: bookmark icon on card and detail; `/saved` page with empty state.
**Done when:** SC pass; saved posts survive refresh; hidden/deleted posts are filtered out gracefully.

### T2.6 — Profile
**Do:**
- Public `/u/:id`: avatar, name, bio, join date, their published posts (paginated), counts.
- `/settings`: edit name, bio, avatar (Cloudinary upload, replace destroys old), change password (current + new). Backend: `PUT /api/user/me`, `PUT /api/user/me/password`, `GET /api/user/:id` (public fields only; never email or password).
**Done when:** SC pass; avatar shows in navbar, cards and comments after update.

### T2.7 — Report content
**Do:**
- `Report` model `{ reporter, post, reason (enum), details, status: open|resolved|dismissed }`. A user can report a post once. `POST /api/post/:id/report`.
- UI: "Report" in a card/detail dropdown with a dialog (reason select + optional details). Cannot report own post.
**Done when:** SC pass; second report on same post returns a clear 409 message shown in a toast.

---

# PHASE 3 — Admin

### T3.1 — Admin layout and dashboard
**Do:**
- `/admin` with shadcn `Sidebar` layout (Dashboard, Users, Posts, Comments, Reports, Categories), breadcrumb, user menu. Guarded on frontend (`RoleRoute`) AND backend (`/api/admin/*` uses `authorize` + `requireRole("admin")`).
- `GET /api/admin/stats`: totals (users, posts, comments, open reports), new users and posts per day for the last 14 days, latest 5 users, latest 5 posts.
- Dashboard: stat cards, two shadcn charts, two "recent" lists. Skeletons and error states.
**Done when:** SC pass; a normal user gets 403 from the API and is redirected in the UI.

### T3.2 — Manage users
**Do:**
- Table (shadcn Data Table): avatar+name, email, role, status, joined, posts count; search, role/status filters, pagination, sorting.
- Actions via dropdown: promote/demote, ban/unban, delete (with `AlertDialog`). Backend: `GET /api/admin/users`, `PATCH /api/admin/users/:id/role`, `PATCH /api/admin/users/:id/ban`, `DELETE /api/admin/users/:id`.
- Safety rules enforced **on the backend**: admin cannot ban/demote/delete themselves; cannot remove the last admin; deleting a user also removes their posts' Cloudinary images (or states clearly what happens to their content; ask me which behavior I prefer before implementing).
**Done when:** SC pass; each safety rule is proven by a curl returning 400/403.

### T3.3 — Manage posts
**Do:**
- Admin table of ALL posts (incl. hidden): title, author, category, status, likes, comments, date; filters; hide/unhide, delete (Cloudinary destroy), open public page.
- `GET /api/admin/posts`, `PATCH /api/admin/posts/:id/status`, `DELETE /api/admin/posts/:id`.
**Done when:** SC pass; hidden post disappears from public list but the owner still sees it labelled "hidden".

### T3.4 — Moderation: comments and reports
**Do:**
- Reports page: tabs Open / Resolved / Dismissed; each row shows the post, reporter, reason, details, with actions: hide post, delete post, dismiss, resolve. Comments page: latest comments with delete.
- Endpoints under `/api/admin/reports` and `/api/admin/comments`.
**Done when:** SC pass; resolving a report records who/when (`resolvedBy`, `resolvedAt`).

### T3.5 — Manage categories
**Do:** CRUD for categories (name, auto slug, post count); cannot delete a category that has posts unless reassigning (state your approach); public category list updates immediately.
**Done when:** SC pass; slug uniqueness errors show as a friendly message.

---

# PHASE 4 — Quality and release

### T4.1 — Security hardening review
**Do:** audit every route for auth, role and ownership; zod on ALL inputs; file upload checks (type, size, count); cookie flags; rate limits on write endpoints; no PII in logs (remove leftover `console.log`); `helmet` config sane; confirm no secrets in git history of this branch.
**Show me:** a table `route | auth | role | validation | rate-limited | notes` and any fixes made.

### T4.2 — Tests
**Do:** backend tests with `bun test` + `supertest` + `mongodb-memory-server` (never the dev DB): auth (register/login/me/logout), posts (public list, create, update, delete, ownership 403), admin (403 for user, 200 for admin, safety rules), likes/comments basics. Add `bun run test` script.
**Done when:** tests pass; report count and the 5 most valuable cases.

### T4.3 — UX polish pass
**Do:** audit every page at 375/768/1280, light and dark; keyboard-only run through login, create post, delete post; fix contrast and focus issues; consistent empty/loading/error states; page titles; favicon; 404 and error boundary page.
**Show me:** checklist with PASS/FAIL per page.

### T4.4 — Docs and release prep
**Do:** root `README.md` (what it is, stack, setup, env vars, scripts, folder structure, roles), update `AGENTS.md` with the final conventions, complete `docs/PROGRESS.md`, make sure `.env.example` files are complete, add production build and start scripts, list deployment notes (env, CORS, cookie `secure`, Cloudinary).
**Done when:** a fresh clone can run following only the README (state how you verified).

---

## 7. Final acceptance (after T4.4)

- Visitor: home, explore, post detail, public profile, 404 all work logged-out.
- User: register, login, create/edit/delete post, like, comment, bookmark, report, edit profile, logout.
- Admin: dashboard, users, posts, comments, reports, categories, with all safety rules.
- SC pass, tests pass, 0 lint errors, no `any`, no `console.log`, no unused deps.
- `docs/PROGRESS.md` complete and accurate.
