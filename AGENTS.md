# AGENTS.md

MERN app: `backend/` (Express API) + `client/` (React SPA). Two independent apps —
there is no workspace tooling or root scripts.

## Commands (run from each app dir)
- Backend dev: `cd backend && bun run dev`  # tsx watch server.ts
- Client dev:  `cd client && bun run dev`   # Vite, port 5173
- Client lint: `cd client && bun run lint`
- Client typecheck+build: `cd client && bun run build`  # tsc -b && vite build
- Do NOT run scripts from repo root: root `package.json` has no scripts (only stray multer deps).
- No tests and no CI exist anywhere. Backend has no lint/typecheck script.

## Setup / wiring
- Backend reads `backend/.env` via `dotenv` (`backend/config/env.ts`). Loads with `bun run dev`.
  Needs `PORT`, `DB_URI`, `JWT_SECRET`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
- Client dev server proxies `/api` -> `http://localhost:5000` (`client/vite.config.ts`).
  Backend CORS is hardcoded to `http://localhost:5173`, so the backend must run on 5000 for cookies/auth to work.
- Auth: JWT in httpOnly cookie `token` (also accepts `Authorization: Bearer`). Client also mirrors user to
  localStorage keys `userData` / `expiretionTime` (`client/src/hooks/useUser.tsx`).
- Client import alias `@` -> `client/src` (shadcn `base-nova` style; add UI via `client/components.json`).

## Conventions / gotchas
- Code comments and user-facing message strings are in **Somali** — keep that style when editing.
- Imports mix `./x.ts` and `./x`; both work under `moduleResolution: bundler`. Match the surrounding file.
- Root `README.md` is stale (`bun run index.ts` does not exist).
- Current rough edges (verify before relying on): `auth.route.ts` maps `/sign-out` to `register`;
  `PUT /api/post/` calls `updatePost` which reads `req.params.id`, but the route has no `:id`;
  `controllers/user.controller.ts` is empty.

## Rules for the agent
- Never read, print, or edit `.env` files or any secrets.
- Ask before installing any new package; verify it exists on npm first.
- Ask before running any shell command that deletes or overwrites files.
- Never commit or push unless the user explicitly asks.
- Make small, focused changes; one task at a time.
- After changes, run `cd client && bun run build` and report the real output.
