# Changelog

All notable changes to Punch QA Tool are documented here.

---

## [Unreleased]

---

## [0.8.0] — 2026-04-03

### Added
- **Multi-step Create Project dialog** — 3-step wizard: project details (name, description, site URL) → embed script display → optional bulk member invite with Gmail-style tag input and autocomplete
- **Self-hosted site screenshots** — Puppeteer captures a screenshot of the project site after creation and saves it to `public/screenshots/{id}.jpg`; auto-retakes on first 404; retake button (hover overlay) for admins and owners
- **Dashboard project cards redesign** — site screenshot thumbnail, comment count, site URL link, action buttons in hover overlay
- **Responsive dashboard grid** — 1 column (mobile) → 2 (tablet) → 3 (laptop) → 4 (desktop)
- **Project search** — filters cards by name, description, or site URL in real time
- **Pagination** — maximum 12 projects per page with previous/next controls
- `siteUrl` field added to projects (migration v6)

### Fixed
- Member invite search restricted to `@punchteam.com` emails — removed clients and external users from suggestions

---

## [0.7.0] — 2026-03-28

### Added
- **Mobile-responsive layout** — collapsible sidebar with hamburger toggle, slide-in overlay with backdrop
- **Mobile board** — columns scroll horizontally with touch support; task panel is full-width on mobile

### Fixed
- Revoked client still appearing in Client Access list — now calls `router.refresh()` after revoke and handles orphaned `ProjectMember` rows with no invitation record
- Client DELETE API now removes `ProjectMember` regardless of stored role (previously required `role = 'CLIENT'` which old rows didn't have)
- Revoke button always visible for joined clients (was previously hidden when invitation record was missing)

---

## [0.6.0] — 2026-03-25

### Added
- **Element direct links** — each task stores the DOM selector of the reported element; a link opens the site and highlights the element with a blue outline that fades after 4 seconds
- **Page pins** — blue circle pins appear on the page at the reported element's position; click to open a compact TaskPanel overlay
- **TaskPanel** (embed widget) — shows task number, title, status/priority badges, screenshot thumbnail, reporter, and a "View in board" link
- **Screenshot lightbox** — task screenshots now open in a full-screen modal instead of expanding in-place

### Fixed
- React error #418 on task "Open site" button — replaced `<Button asChild><a>` with `onClick={() => window.open(...)}` to avoid hydration mismatch
- `html2canvas` replaced with `html-to-image` — fixes blank screenshots caused by unsupported `oklab`/`oklch` CSS color functions

---

## [0.5.0] — 2026-03-20

### Added
- **Embed widget overhaul** — renamed "Report a Bug" to "Report a Task"; removed guest name/email fields; added column selector dropdown; automatic element screenshot on submit
- Reporter name read from authenticated session and stored on the task
- `GET /api/embed/columns` — returns board columns for the embed key
- `GET /api/embed/tasks` — returns tasks for the current page URL (powers page pins)
- `POST /api/embed/auth-check` — returns `userName` and `userId` alongside `allowed`

### Fixed
- Embed build failure on Windows after `npm uninstall html2canvas` removed Vite from node_modules

---

## [0.4.0] — 2026-03-15

### Added
- **Client invitations** — admins can invite external users by email; clients sign in with Google and land directly on their project
- **CLIENT role** — enforced at API layer; clients can only view and interact with their own tasks; blocked from settings pages
- **Domain restriction** — `@punchteam.com` emails always get team roles; all other emails are forced to `CLIENT` regardless of DB value
- **Manage Users panel** — RANK1 admins can search users, view roles, and update system roles
- `ClientInvitation` table (migration v5)

---

## [0.3.0] — 2026-03-10

### Added
- **Comment editing and deletion** — authors can edit or delete their own comments
- **@mention support** in comments — type `@` for user autocomplete
- **Inline task editing** — edit title, description, priority, assignee directly in the task detail panel
- **Gravatar support** — fallback avatars for users without a profile image throughout the app

---

## [0.2.0] — 2026-03-05

### Added
- **Dynamic board columns** — rename, reorder (drag), add, and delete columns
- **Task archive** — archive and restore individual tasks; archived tasks panel accessible from board toolbar
- **Task permalinks** — shareable `?task=<id>` URLs open the task detail panel directly
- **Transfer ownership** — project owners can transfer ownership to any team member
- **Remove member** — owners/admins can remove team members with a confirmation dialog
- Gravatar in member invite autocomplete

---

## [0.1.0] — 2026-02-28

### Added
- Initial release: Punch QA Tool
- Google OAuth sign-in (NextAuth.js)
- Project creation with default Kanban columns (Backlog, Dev, Prod, Review, Done)
- Task creation with title, description, priority, assignee, and column
- Drag-and-drop task and column reordering
- Task detail panel with comments
- File attachment upload
- Member invite by email with autocomplete
- Project settings (rename, allowed domains, embed key regeneration)
- Archived projects page
- Dark/light theme toggle
- Embed widget: floating button, report form in Shadow DOM
- System roles: RANK1 (admin), RANK2 (PM), RANK3 (member)
