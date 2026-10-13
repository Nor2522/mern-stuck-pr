# AGENTS.md

MERN app: `backend/` (Express API) + `client/` (React SPA). Two independent apps —
there is no workspace tooling or root scripts.

## Commands (run from each app dir)
- Backend dev: `cd backend && bun run dev`  # tsx watch server.ts, port 5000
- Backend tests: `cd backend && bun run test`  # bun test; 12 tests, in-memory MongoDB
- Backend types: `cd backend && bunx tsc --noEmit`
- Backend prod build/run: `cd backend && bun run build` (-> `dist/server.js`) then `bun run start`
- Client dev:  `cd client && bun run dev`   # Vite; 5173, may fall back to 5174+ if taken
- Client lint: `cd client && bun run lint`
- Client typecheck+build: `cd client && bun run build`  # tsc -b && vite build
- Do NOT run scripts from repo root: root `package.json` has no scripts (only stray multer deps).
- No CI exists; the client has no test runner (verify via build + lint).

## Setup / wiring
- Backend reads `backend/.env` via `dotenv` (`backend/config/env.ts`). Loads with `bun run dev`.
  Needs `PORT`, `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_URL`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`,
  plus `ADMIN_EMAIL` / `ADMIN_PASSWORD` for `seed:admin`. Legacy `DB_URI` / `EXPIRE_IN` are still accepted.
- Client dev server proxies `/api` -> `http://localhost:5000` (`client/vite.config.ts`); the backend must run on 5000 for cookies/auth to work.
- CORS (`backend/config/cors.ts`, credentials enabled — never `*`): `CLIENT_URL` is a comma-separated list of
  exact allowed origins, e.g. `http://localhost:5173,http://localhost:5174`. In development any
  `http://localhost:<port>` / `http://127.0.0.1:<port>` is also allowed (Vite falls back to 5174+); in
  production **only** the listed origins are allowed. Preflight handles GET/POST/PUT/PATCH/DELETE with JSON,
  multipart and Authorization headers.
- Auth: JWT in httpOnly cookie `token` (also accepts `Authorization: Bearer`). Client also mirrors user to
  localStorage keys `userData` / `expiretionTime` (`client/src/hooks/useUser.tsx`).
- Client import alias `@` -> `client/src` (shadcn `base-nova` style; add UI via `client/components.json`).

## Conventions / gotchas
- Code comments and user-facing message strings are in **English** — keep that style when editing.
- Imports mix `./x.ts` and `./x`; both work under `moduleResolution: bundler`. Match the surrounding file.
- Root `README.md` is the source of truth for setup / env / scripts / deployment; keep it in sync.
- `docs/BUILD_PLAN.md` is the task plan; `docs/PROGRESS.md` is the living log (update it per task).
- Deployment: `NODE_ENV=production` strips error `stack`s and sets the auth cookie `secure`
  (HTTPS only); production CORS allows **only** the exact `CLIENT_URL` origins.
- Known limitations: no CI; the client has no automated tests (build + lint + manual checks only).

## Rules for the agent
- Never read, print, or edit `.env` files or any secrets.
- Ask before installing any new package; verify it exists on npm first.
- Ask before running any shell command that deletes or overwrites files.
- Never commit or push unless the user explicitly asks.
- Make small, focused changes; one task at a time.
- After changes, run `cd client && bun run build` and report the real output.
