# Changelog

All notable changes to Punch QA Tool are documented here.

---

## [Unreleased]

---

## [0.13.0] — 2026-04-10

### Added
- **Docker support** — multi-stage `Dockerfile` with standalone Next.js output; `docker-compose.yml` for local dev (includes MySQL 8); `docker-compose.prod.yml` for production with external database
- **Email magic link auth** — clients can now sign in via a 7-day magic link sent by the PM/Admin on invite; no Google account required
- **Resend invitation** — PM/Admin can resend magic link from the Clients tab (both pending and joined clients)
- **Role-based delete from embed** — ADMIN and PROJECT_MANAGER can delete tasks directly from the embed widget via a trash icon in the task panel header
- `next.config.ts`: added `output: "standalone"` and R2 image domain pattern

### Changed
- Login page now shows only Google button; clients receive their access link by email (no manual email input on login)
- `auth-check` endpoint now returns `role` and `userId` for the logged-in member, enabling role-based actions in the embed widget

### Fixed
- Tab bar overflow on small screens — added `overflow-x-auto overflow-y-hidden` to prevent vertical scrollbar from `-mb-px` active indicator
- Members and Clients tabs hidden from CLIENT role users

---

## [0.12.0] — 2026-04-07

### Added
- **Cloudflare R2 storage** — `STORAGE_PROVIDER=r2` stores all uploads (project screenshots, task screenshots, attachments) in R2 with slug-based folder structure: `{slug}/screenshot.jpg`, `{slug}/tasks/`, `{slug}/attached-files/`
- `deleteFile()` helper cleans up R2/local files when tasks or projects are deleted
- Screenshot API now returns JSON `{ ready, url }` instead of a 302 redirect to avoid CORS issues with cross-origin R2 URLs
- `/api/projects/[projectId]/screenshot/file` — serves local binary screenshots same-origin (no CORS)

### Changed
- All storage operations routed through unified `lib/storage.ts` with `uploadFile`, `deleteFile`, `resolveUrl`, `screenshotKey`, `taskScreenshotKey`, `attachmentKey`
- Upload directory (`LOCAL_UPLOAD_DIR`) now persists outside the deploy folder — survives redeployments on Hostinger

---

## [0.11.0] — 2026-04-05

### Added
- **Embed trigger redesign** — bottom-right position, horizontal layout, "Report Task" label, Punch logo inlined as base64, always dark
- **Priority-colored pins** — task pins match priority: LOW=gray, MEDIUM=amber, HIGH=orange, CRITICAL=red
- **Real-time pin updates** — 30-second polling refreshes pin colors and positions
- **Full task editing from embed** — column, priority, assignee dropdowns; inline title and description editing; comment posting — matches dashboard 1:1
- `/api/embed/members` — returns project members for assignee dropdown in embed widget
- PATCH handler on `/api/embed/task/[taskId]` — updates title, description, columnId, priority, assigneeId

### Fixed
- Click on trigger button now cancels element picking (ElementPicker detects `#punchbug-root`)
- Button label resets to "Report Task" after submitting a report
- Radix Select double-click closing panel — fixed with 150ms delay on `anyDropdownOpen` ref
- Escape key closes lightbox first, then panel (previously closed both simultaneously)

---

## [0.10.0] — 2026-04-03

### Added
- **Multi-step Create Project dialog** — 3-step wizard: project details → embed script → bulk member invite
- **Self-hosted site screenshots** — dedicated screenshot microservice (FastAPI + Playwright); screenshot stored persistently under `LOCAL_UPLOAD_DIR`
- **Dashboard redesign** — project cards with site screenshot thumbnail, comment count, site URL link, hover overlay actions
- **Responsive dashboard grid** — 1→2→3→4 columns based on viewport
- **Project search and pagination** — real-time search, 12 projects per page

---

## [0.9.0] — 2026-03-30

### Added
- **Client invitations** — ADMIN and PROJECT_MANAGER can invite external clients by email
- **CLIENT role** enforced at API layer — clients see only Tasks and Tags tabs, not Members or Clients
- `GET /api/embed/auth-check` — returns `allowed`, `userName`, `userId`, `role`
- Brevo SMTP integration via Nodemailer for transactional emails

---

## [0.8.0] — 2026-03-28

### Added
- **Mobile-responsive layout** — collapsible sidebar with hamburger toggle
- **Mobile board** — horizontal scroll with touch support

---

## [0.7.0] — 2026-03-25

### Added
- **Element direct links** — DOM selector stored per task; opens site and highlights the element
- **Page pins** — circle pins at reported element positions; click opens TaskPanel overlay
- **Screenshot lightbox** — full-screen modal for task screenshots

---

## [0.6.0] — 2026-03-20

### Added
- **Embed widget v2** — element picker, column selector, automatic screenshots via ss_service
- `GET /api/embed/columns`, `GET /api/embed/tasks`, `POST /api/embed/auth-check`

---

## [0.5.0] — 2026-03-15

### Added
- **Dynamic board columns** — rename, reorder, add, delete
- **Task archive** — archive and restore tasks
- **Task permalinks** — `?task=<number>` URLs
- **Transfer ownership**, **Remove member**

---

## [0.4.0] — 2026-03-10

### Added
- **Comment editing and deletion**
- **@mention support** in comments
- **Inline task editing** — title, description, priority, assignee

---

## [0.3.0] — 2026-03-05

### Added
- **Manage Users panel** — ADMIN can search users and update system roles
- Domain restriction — `@punchteam.com` always gets team roles

---

## [0.2.0] — 2026-02-28

### Added
- **Notifications** — in-app notification bell for task assignments and comments

---

## [0.1.0] — 2026-02-20

### Added
- Initial release
- Google OAuth sign-in (NextAuth.js)
- Project creation with default Kanban columns
- Task creation, drag-and-drop, task detail panel with comments
- File attachment upload
- Member invite by email with autocomplete
- Project settings and embed key
- Dark/light theme toggle
- Embed widget: floating button, report form in Shadow DOM
- System roles: ADMIN, PROJECT_MANAGER, MEMBER
