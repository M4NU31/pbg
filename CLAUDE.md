# CLAUDE.md — Punch Site QA Tool (pbg)

This file gives Claude Code full context to continue development without prior conversation history.

---

## What This Project Is

Self-hosted website QA and bug-reporting platform (BugHerd-inspired). Teams embed a lightweight widget on any website, click elements to report tasks with automatic screenshots, and manage everything on a Kanban board. External clients are invited by email magic link and get restricted access.

**Companion service:** Screenshot capture lives in a separate repo → [ss_service](https://github.com/M4NU41/ss_service). It is a FastAPI + Playwright microservice. PBG calls it via `SCREENSHOT_SERVICE_URL`.

---

## Tech Stack

- **Framework:** Next.js 15, App Router, TypeScript, `output: "standalone"`
- **Auth:** NextAuth.js v4 — Google OAuth (internal team) + Email magic link (clients)
- **Database:** MySQL 8, raw queries via `mysql2` — NO Prisma at runtime (Prisma only for schema reference)
- **UI:** shadcn/ui + Radix UI + Tailwind CSS v3
- **Storage:** Local filesystem or Cloudflare R2 (`STORAGE_PROVIDER=local|r2`)
- **Email:** Brevo SMTP via Nodemailer (`lib/send-invite.ts`)
- **Embed widget:** `packages/embed` — Vite IIFE bundle, Shadow DOM isolation, TypeScript

---

## Monorepo Structure

```
apps/web/          → Next.js application
packages/embed/    → Embed widget (Vite build → public/embed/)
scripts/           → SQL schema + migrations (create-tables.sql, migrate-vN.sql)
Dockerfile         → Multi-stage: deps → embed → Next.js → runner
docker-compose.yml → Local dev with MySQL included
docker-compose.prod.yml → Production (external MySQL)
```

---

## Key Files

| File | Purpose |
|---|---|
| `apps/web/src/lib/auth.ts` | NextAuth config — Google + Email providers, signIn callback, JWT/session callbacks |
| `apps/web/src/lib/auth-adapter.ts` | Custom MySQL adapter for NextAuth (no Prisma at runtime) |
| `apps/web/src/lib/auth-helpers.ts` | `requireAuth()`, `requireProjectAccess()`, `canManageProject()` |
| `apps/web/src/lib/db.ts` | MySQL connection pool, `query()`, `queryOne()`, `execute()` |
| `apps/web/src/lib/storage.ts` | File upload/delete/resolve for local and R2 — `uploadFile()`, `deleteFile()`, `resolveUrl()`, `screenshotKey()`, `taskScreenshotKey()`, `attachmentKey()` |
| `apps/web/src/lib/send-invite.ts` | Generates magic link token (SHA-256 hash matching NextAuth), stores in `VerificationToken`, sends invite email via Brevo |
| `packages/embed/src/core/PunchBug.ts` | Main embed class — trigger button, pin management, 30s polling, config |
| `packages/embed/src/ui/TaskPanel.ts` | Task detail panel in Shadow DOM — full editing, comments, delete button |
| `packages/embed/src/ui/ElementPicker.ts` | Element highlight + click capture |
| `packages/embed/src/ui/styles.ts` | All Shadow DOM CSS — pb-dark/pb-light variables matching globals.css HSL values |
| `packages/embed/src/index.ts` | Entry point — auth-check, passes role/userId to PunchBug |

---

## Database

No ORM migrations — raw SQL files in `scripts/`. Production DB is on Hostinger MySQL 8.

**Important tables:**
- `User`, `Account`, `Session`, `VerificationToken` — NextAuth adapter tables
- `Project` — has `embedKey` (UUID), `slug`, `siteUrl`, `screenshotUrl`
- `Task` — has `taskNumber`, `pinX/Y`, `domSelector`, `screenshotUrl`, `priority`, `columnId`, `assigneeId`
- `ProjectMember` — roles: `ADMIN`, `PROJECT_MANAGER`, `MEMBER`, `CLIENT`
- `ClientInvitation` — email invitations for external clients
- `BoardColumn`, `Comment`, `Tag`, `TaskTag`, `Attachment`

When adding columns, create a new `scripts/migrate-vN.sql` file.

---

## User Roles

| Role | Access |
|---|---|
| `ADMIN` | Full access — all projects, members, clients, delete tasks from embed |
| `PROJECT_MANAGER` | Create projects, invite members/clients, delete tasks from embed |
| `MEMBER` | Team member, added per project |
| `CLIENT` | External client — invited by email, sees Tasks + Tags tabs only, no Members/Clients tabs |

`canManageProject(role)` in `auth-helpers.ts` returns `true` for ADMIN and PROJECT_MANAGER.

---

## Authentication Flow

**Internal team (Google):**
- Sign in with Google → `signIn` callback checks `@punchteam.com` domain → allowed

**Clients (magic link):**
1. ADMIN/PM invites client email from **Clients** tab
2. `POST /api/projects/[projectId]/clients` → inserts `ClientInvitation` → calls `sendClientInvite()`
3. `sendClientInvite()` in `lib/send-invite.ts`: generates random token → hashes with `sha256(token + NEXTAUTH_SECRET)` → stores in `VerificationToken` (7-day expiry) → sends email via Brevo
4. Client clicks link → NextAuth validates token → session created
5. PM can resend via `POST /api/projects/[projectId]/clients/resend`

**Session:** JWT strategy, 30-day default. `sameSite: none, secure: true` for cross-origin embed cookie.

---

## Embed Widget

**How it works:**
1. `<script src="/embed.js" data-key="EMBED_KEY">` loads the IIFE bundle
2. `index.ts` calls `/api/embed/auth-check?key=` with `credentials: "include"` → gets `allowed`, `userName`, `userId`, `role`
3. `new PunchBug(config)` mounts trigger button + fetches page tasks + starts 30s polling
4. Trigger click → ElementPicker → user clicks element → screenshot via ss_service → ReportForm → `POST /api/embed/report`
5. Task pins appear on the page colored by priority (LOW=gray, MEDIUM=amber, HIGH=orange, CRITICAL=red)
6. Pin click → TaskPanel.show() with full editing capabilities matching the dashboard

**Priority colors:** `LOW: #64748b, MEDIUM: #f59e0b, HIGH: #f97316, CRITICAL: #ef4444`

**Delete from embed:** Only shown for ADMIN/PROJECT_MANAGER. Calls `DELETE /api/embed/task/[taskId]?key=&userId=` which re-verifies role server-side.

---

## Storage

`STORAGE_PROVIDER=local` → files saved to `LOCAL_UPLOAD_DIR` (absolute path outside deploy folder on Hostinger: `/home/user/domains/domain/public_html/uploads`). Optionally served as static files via `UPLOADS_STATIC_URL`.

`STORAGE_PROVIDER=r2` → Cloudflare R2 with folder structure:
- `{slug}/screenshot.jpg` — project screenshot
- `{slug}/tasks/{taskNumber}-{suffix}.jpg` — task screenshots
- `{slug}/attached-files/{filename}` — attachments

Screenshot API returns JSON `{ ready, url }` (no 302 redirect) to avoid CORS issues.

---

## API Conventions

- All API routes use `requireAuth()` + `requireProjectAccess()` from `auth-helpers.ts`
- Embed routes use `?key=EMBED_KEY` instead of session (public endpoints)
- Embed routes that need user identity use `credentials: "include"` + `/api/embed/auth-check`
- CORS headers on all `/api/embed/*` routes: `Access-Control-Allow-Origin: *`

---

## Environment Variables

```env
DATABASE_URL=mysql://user:pass@host:3306/punchbug
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=<openssl rand -base64 32>
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
BREVO_SMTP_LOGIN=<login shown in Brevo → Transactional → SMTP>
BREVO_SMTP_KEY=<key generated in Brevo>
EMAIL_FROM="Punch - Site QA" <noreply@yourdomain.com>
STORAGE_PROVIDER=local|r2
LOCAL_UPLOAD_DIR=/absolute/path/to/uploads
UPLOADS_STATIC_URL=https://yourdomain.com/uploads
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
R2_BUCKET=punchbug
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_PUBLIC_URL=https://pub-<hash>.r2.dev
SCREENSHOT_SERVICE_URL=http://<ss_service_host>:8000
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_EMBED_URL=https://yourdomain.com/embed.js
```

---

## Running Locally

```bash
# Without Docker
npm install
cp .env.example apps/web/.env.local  # fill in values
npm run dev

# With Docker (MySQL included)
cp .env.example .env
docker compose up --build
```

---

## Deploying

```bash
# Production Docker (external MySQL)
docker compose -f docker-compose.prod.yml up --build -d

# Hostinger (current production — git push triggers deploy)
git push origin main
```

Current production: `https://darkgoldenrod-duck-369698.hostingersite.com`

---

## Conventions

- TypeScript strict — no `any` unless absolutely necessary
- Raw SQL queries — no ORM, no query builders
- No Prisma at runtime — only for schema reference in `apps/web/prisma/`
- shadcn/ui components live in `src/components/ui/`
- API routes in App Router format: `export async function GET/POST/PATCH/DELETE`
- Embed widget: all UI in Shadow DOM, styles in `ui/styles.ts`, no external CSS
- Do not add error handling for impossible cases — trust internal guarantees
- Do not add features beyond what is asked
