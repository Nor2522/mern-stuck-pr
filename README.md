# DevMotiv — Programmers' Motivation Platform

A full-stack **MERN** app where developers share motivational posts, react to
each other's posts (likes, comments, bookmarks), report bad content, and admins
moderate everything. Authentication is a JWT stored in an **httpOnly cookie**.

Two independent apps in one repo:

| Path       | App                                  | Runtime |
| ---------- | ------------------------------------ | ------- |
| `backend/` | Express 5 REST API (MongoDB/Mongoose) | Bun     |
| `client/`  | React 19 SPA (Vite)                   | Bun     |

## Features

**Visitor (logged out)**

- Home page with a hero, latest posts, category chips and a "How it works" section.
- `/explore` — search (debounced), category filter, latest/popular sort, pagination.
- `/posts/:id` — full post with author card, tags and comments.
- `/u/:id` — public profile (avatar, bio, join date, published posts).
- `/login`, `/register`, 404 page and a route error-boundary page.

**User (logged in)**

- Register / login / logout (httpOnly cookie session restored from `GET /user/me`).
- Dashboard (`/dashboard`): stats + your posts, create / edit / delete (image optional).
- Like, un-like, bookmark, comment (add/delete) and share posts.
- Report a post (reason enum + optional details).
- `/saved` — bookmarked posts.
- `/settings` — edit name + bio, upload avatar, change password.

**Admin (`role: "admin"`)**

- `/admin` dashboard: totals, 14-day charts, recent users/posts.
- Manage users (search/filter/sort, change role, ban/unban, delete → cascades their content).
- Manage posts (search/filter/sort, hide/publish, delete).
- Moderation: reports (resolve/dismiss) and comments (delete).
- Manage categories (create/rename/delete, reassign posts before delete).
- Safety rules are enforced server-side (no self role/ban/delete, last admin protected).

## Tech stack

- **Backend:** Express 5, Mongoose 9 (MongoDB), Zod validation, JWT
  (`jsonwebtoken`) in an httpOnly cookie, `bcrypt`, `helmet`, `express-rate-limit`,
  `cors`, `multer` + `cloudinary` for images, `dotenv`. Tests with `bun test` +
  `supertest` + `mongodb-memory-server`.
- **Client:** React 19, Vite, TypeScript, React Router, TanStack Query, Zustand-free
  context auth, react-hook-form + Zod, Tailwind CSS v4, shadcn/base-ui components,
  `sonner` toasts, `recharts`, `date-fns`, `lucide-react`.

## Project structure

```
.
├── backend/
│   ├── app.ts              # Express app (middleware + routes) — used by tests
│   ├── server.ts           # listen() + connectDB() entry point
│   ├── config/             # env (Zod), cors, cloudinary
│   ├── controllers/        # auth/user, post, like, comment, bookmark, report, admin
│   ├── middlewares/        # auth, optionalAuth, role, rate limit, validation, upload, errors
│   ├── models/             # user, post, category, comment, like, bookmark, report
│   ├── routes/             # auth, post, category, comment, bookmark, admin
│   ├── scripts/            # seed-admin, seed-categories, backfill, report-orphans
│   ├── tests/api.test.ts   # 12 API tests (in-memory MongoDB)
│   ├── validators/         # Zod schemas
│   └── .env.example
├── client/
│   ├── src/
│   │   ├── features/       # auth, posts, comments, admin (+ api hooks & components)
│   │   ├── pages/          # HomePage, ExplorePage, PostDetailPage, ProfilePage, Settings, admin/*
│   │   ├── components/     # layout (Navbar/Footer), ui/* (shadcn), shared widgets
│   │   ├── hooks/          # useAuth / AuthProvider, useDocumentTitle, ...
│   │   ├── lib/            # axios instance + interceptors (api.ts), image helpers
│   │   └── router.tsx      # routes + guards + errorElement
│   └── .env.example
└── docs/
    ├── BUILD_PLAN.md       # the task plan this repo was built against
    └── PROGRESS.md         # living log of what was done + evidence
```

## Prerequisites

- [Bun](https://bun.com) (used for both apps) — `bun --version`
- A MongoDB instance (local or Atlas)
- A Cloudinary account (image uploads)

## Getting started

Run the backend and the client in **two terminals**.

### 1. Backend

```bash
cd backend
bun install
cp .env.example .env      # then fill in the values (see below)
bun run seed:admin        # creates the first admin from ADMIN_EMAIL / ADMIN_PASSWORD
bun run seed:categories   # optional: seed the default categories
bun run dev               # tsx watch server.ts -> http://localhost:5000
```

Health check: `curl http://localhost:5000/api/health` → `{"success":true,...}`.

### 2. Client

```bash
cd client
bun install
cp .env.example .env      # optional in dev (see below)
bun run dev               # Vite -> http://localhost:5173
```

The Vite dev server proxies `/api` to `http://localhost:5000`, so the backend
**must** run on port 5000 for cookies/auth to work in development. If
`VITE_API_URL` is set, the client calls that URL directly instead (with
`withCredentials`, which the backend CORS config allows for localhost).

Open http://localhost:5173.

## Environment variables

### `backend/.env` (required — see `backend/.env.example`)

| Variable                | Required | Notes                                                                 |
| ----------------------- | -------- | --------------------------------------------------------------------- |
| `PORT`                  | no       | Defaults to `5000`. Keep 5000 for the Vite proxy / cookies.           |
| `MONGODB_URI`           | **yes**  | MongoDB connection string. Legacy `DB_URI` is also accepted.          |
| `JWT_SECRET`            | **yes**  | Long random string used to sign JWTs.                                 |
| `JWT_EXPIRES_IN`        | no       | Cookie/JWT lifetime, e.g. `30d` (default). Legacy `EXPIRE_IN` accepted. |
| `CLIENT_URL`            | no       | Allowed browser origin(s), comma-separated (default `http://localhost:5173`). In dev any `localhost` port is also allowed; in production **only** these exact origins are. |
| `CLOUDINARY_CLOUD_NAME` | **yes**  | Cloudinary credentials for image upload/destroy.                      |
| `CLOUDINARY_API_KEY`    | **yes**  |                                                                       |
| `CLOUDINARY_API_SECRET` | **yes**  |                                                                       |
| `ADMIN_EMAIL`           | no*      | Used by `bun run seed:admin` to create the first admin.               |
| `ADMIN_PASSWORD`        | no*      |                                                                       |

The backend validates the environment with Zod at startup and exits with a clear
message if anything required is missing.

### `client/.env` (optional in dev — see `client/.env.example`)

| Variable       | Required | Notes                                                                                     |
| -------------- | -------- | ----------------------------------------------------------------------------------------- |
| `VITE_API_URL` | no       | Base API URL, e.g. `http://localhost:5000/api`. Falls back to `http://localhost:5000/api`. |

## Scripts

### Backend (`cd backend`)

| Command                   | What it does                                              |
| ------------------------- | -------------------------------------------------------- |
| `bun run dev`             | Dev server (`tsx watch server.ts`) on port 5000.          |
| `bun run build`           | Bundles the API to `backend/dist/server.js` (`bun build`).|
| `bun run start`           | Runs the built bundle with `NODE_ENV=production`.         |
| `bun run test`            | `bun test` — 12 API tests on an in-memory MongoDB.        |
| `bunx tsc --noEmit`       | Type-check the backend.                                   |
| `bun run seed:admin`      | Create/refresh the admin user from `ADMIN_EMAIL`/`ADMIN_PASSWORD`. |
| `bun run seed:categories` | Upsert the default categories.                            |
| `bun run backfill:post-status` | Set missing post `status` fields (one-off migrations). |
| `bun run report:orphans`  | List posts without an author (diagnostic, read-only).     |

### Client (`cd client`)

| Command             | What it does                                     |
| ------------------- | ------------------------------------------------ |
| `bun run dev`       | Vite dev server on 5173 (falls back to 5174+).   |
| `bun run build`     | Type-check (`tsc -b`) + production build to `dist/`. |
| `bun run preview`   | Serve the built `dist/` locally.                 |
| `bun run lint`      | ESLint over the client.                           |

## API overview

All routes are under `/api`. Auth is the httpOnly `token` cookie (an
`Authorization: Bearer <jwt>` header is also accepted).

| Method + path                              | Access        | Purpose                                   |
| ------------------------------------------ | ------------- | ----------------------------------------- |
| `GET /health`                              | public        | Liveness probe.                            |
| `POST /user/sign-up`                       | public        | Register.                                  |
| `POST /user/login`                         | public        | Login (sets cookie).                       |
| `POST /user/sign-out`                      | public        | Logout (clears cookie).                    |
| `GET /user/me`                             | user          | Current session user.                      |
| `PUT /user/me`                             | user          | Update name/bio/avatar (multipart).        |
| `PUT /user/me/password`                    | user          | Change password.                           |
| `GET /user/:id`                            | public        | Public profile.                            |
| `GET /post`                                | public        | List posts (search/filter/sort/pagination).|
| `GET /post/:id`                            | public        | Post detail (adds liked/bookmarked for users). |
| `GET /post/user`, `GET /post/user/stats`   | user          | Current user's posts / dashboard stats.    |
| `POST /post`                               | user          | Create post (multipart image optional).    |
| `PUT /post/:id`, `DELETE /post/:id`        | user (owner)  | Update / delete own post.                  |
| `POST /post/:id/like`, `/bookmark`, `/report` | user       | Toggle like/bookmark, report post.         |
| `GET|POST /post/:id/comments`              | public / user | List / add comments.                       |
| `DELETE /comment/:id`                      | user (owner)  | Delete a comment.                          |
| `GET /bookmarks`                           | user          | Current user's saved posts.                |
| `GET /categories`                          | public        | List categories.                           |
| `GET /admin/stats`                         | admin         | Dashboard totals + 14-day series.          |
| `/admin/users` …                           | admin         | Users: list / role / ban / delete.         |
| `/admin/posts` …                           | admin         | Posts: list / status / delete.             |
| `/admin/reports`, `/admin/comments` …      | admin         | Moderation list / update / delete.         |
| `/admin/categories` …                      | admin         | Categories: list / create / rename / delete.|

## Tests

```bash
cd backend && bun run test
# 12 pass / 0 fail — runs against an in-memory MongoDB (never the dev DB)
```

There is no CI and no test runner for the client (verified via `bun run build`,
`bun run lint` and manual checks recorded in `docs/PROGRESS.md`).

## Production build & deployment notes

**Backend**

```bash
cd backend
bun install
bun run build            # -> backend/dist/server.js
NODE_ENV=production bun run start
```

- Set `NODE_ENV=production`. This strips error stack traces from responses and
  switches the auth cookie to `secure: true`, so **serve the API over HTTPS**.
- Set `CLIENT_URL` to the exact deployed frontend origin(s), comma-separated
  (e.g. `https://app.example.com`). In production only listed origins are
  allowed — there is no localhost wildcard.
- Point `MONGODB_URI` at your production database (e.g. MongoDB Atlas) and run
  `bun run seed:admin` + `bun run seed:categories` once.
- Provide all three `CLOUDINARY_*` variables; uploaded images live in Cloudinary
  and are destroyed on post/avatar delete.

**Client**

```bash
cd client
bun install
VITE_API_URL=https://api.example.com/api bun run build   # -> client/dist
bun run preview                                          # serve the build locally
```

Deploy the static `client/dist` to any static host and point `VITE_API_URL` at
the deployed API. Ensure the API's `CLIENT_URL` includes the frontend origin so
CORS + credentials work.

## Docs

- `docs/BUILD_PLAN.md` — the step-by-step plan the project was built against.
- `docs/PROGRESS.md` — what each task changed, with verification evidence.
- `AGENTS.md` — conventions for working in this repo.
