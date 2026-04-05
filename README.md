# Punch - Site QA Tool

A self-hosted website QA and bug-reporting tool inspired by BugHerd. Teams embed a lightweight widget on any site, click elements to report tasks with automatic screenshots, and manage everything on a Kanban board. Clients can be granted restricted access to view and comment on their own tasks.

---

## Tech Stack

### Web App (`apps/web`)
| Layer | Technology |
|---|---|
| Framework | [Next.js 15](https://nextjs.org/) (App Router) |
| Language | TypeScript 5 |
| Auth | [NextAuth.js v4](https://next-auth.js.org/) — Google OAuth only |
| Database | MySQL 8 via [mysql2](https://github.com/sidorares/node-mysql2) (raw queries, no ORM at runtime) |
| Schema tooling | [Prisma 5](https://www.prisma.io/) (for schema definition and migrations only) |
| UI components | [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/) primitives |
| Styling | [Tailwind CSS v3](https://tailwindcss.com/) |
| Drag-and-drop | [@hello-pangea/dnd](https://github.com/hello-pangea/dnd) |
| Data fetching | [SWR](https://swr.vercel.app/) (client-side) |
| Screenshots | [thum.io](https://www.thum.io/) — fetched once on project creation, cached locally on disk |
| File storage | Local filesystem (`public/uploads/`) or [Cloudinary](https://cloudinary.com/) |

### Embed Widget (`packages/embed`)
| Layer | Technology |
|---|---|
| Language | TypeScript |
| Build tool | [Vite](https://vitejs.dev/) (IIFE bundle) |
| DOM isolation | Shadow DOM |
| Screenshot capture | [html-to-image](https://github.com/bubkoo/html-to-image) |

### Monorepo
- npm workspaces (`apps/*`, `packages/*`)
- Root scripts wire together web + embed builds

---

## Prerequisites

- **Node.js** 18.17 or later
- **npm** 9 or later
- **MySQL 8.0** running locally or remotely
- **Google OAuth credentials** — create a project at [console.cloud.google.com](https://console.cloud.google.com), enable the Google+ API, and add an OAuth 2.0 client ID

---

## Installation

### 1. Clone the repository

```bash
git clone <repo-url> punch-qa
cd punch-qa
```

### 2. Install dependencies

```bash
npm install
```

This installs all workspace dependencies including Puppeteer (which downloads Chromium automatically, ~170 MB).

### 3. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.example apps/web/.env.local
```

Edit `apps/web/.env.local`:

```env
# MySQL connection string
DATABASE_URL="mysql://user:password@localhost:3306/punchbug"

# NextAuth — generate a secret: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# Google OAuth (from console.cloud.google.com)
GOOGLE_CLIENT_ID="your-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-secret"

# File storage: "local" or "cloudinary"
STORAGE_PROVIDER="local"
LOCAL_UPLOAD_DIR="public/uploads"

# Public URLs (used by embed widget)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_EMBED_URL="http://localhost:3000/embed.js"
```

If using Cloudinary instead of local storage, also add:

```env
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
```

### 4. Set up the database

Create the database in MySQL, then run the Prisma migration to create all tables:

```bash
# Create the database (run in MySQL shell)
CREATE DATABASE punchbug CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Push the schema
npm run db:migrate
```

Then run all incremental SQL migrations in order:

```bash
# In phpMyAdmin or MySQL shell, run each file in scripts/ in order:
# scripts/migrate-v2.sql
# scripts/migrate-v3.sql
# ...
# scripts/migrate-v6.sql
```

### 5. Create required directories

```bash
mkdir -p apps/web/public/uploads
mkdir -p apps/web/public/screenshots
```

---

## Running the Project

### Development

```bash
npm run dev
```

Starts the Next.js dev server on [http://localhost:3000](http://localhost:3000).

To also watch the embed widget for changes in a separate terminal:

```bash
npm run dev --workspace=packages/embed
```

### Production build

```bash
npm run build
```

This builds the embed widget first, then the Next.js app.

```bash
npm start
```

---

## Project Structure

```
punch-qa/
├── apps/
│   └── web/                  # Next.js application
│       ├── src/
│       │   ├── app/          # App Router pages and API routes
│       │   │   ├── (app)/    # Authenticated app pages
│       │   │   ├── api/      # REST API endpoints
│       │   │   └── embed/    # Embed widget pages
│       │   ├── components/   # React components
│       │   │   ├── board/    # Kanban board
│       │   │   ├── layout/   # Sidebar, AppShell
│       │   │   ├── projects/ # Dashboard, project cards
│       │   │   ├── tasks/    # Task detail, create dialog
│       │   │   └── ui/       # shadcn/ui primitives
│       │   └── lib/          # DB client, auth helpers, screenshot utility
│       ├── prisma/           # Schema definition
│       ├── public/
│       │   ├── screenshots/  # Auto-captured site screenshots (gitignored)
│       │   └── uploads/      # Uploaded attachments (gitignored)
│       └── next.config.ts
├── packages/
│   └── embed/                # Client-side widget (compiled to public/embed.js)
│       └── src/
│           ├── core/         # PunchBug main class, pin management
│           ├── ui/           # ReportForm, TaskPanel (Shadow DOM)
│           ├── api/          # API calls from widget
│           └── capture/      # Element screenshot via html-to-image
├── scripts/                  # Incremental SQL migrations (v2–v6)
├── .env.example
└── package.json
```

---

## User Roles

| Role | Description |
|---|---|
| `RANK1` | System admin — full access to all projects and the user management panel |
| `RANK2` | Project manager — can create projects, manage members |
| `RANK3` | Regular team member — added to projects individually |
| `CLIENT` | External client — invited by email, restricted to their own tasks |

Within a project, members also have a project-level role (`OWNER`, `ADMIN`, `MEMBER`).

---

## Embed Widget

Add the snippet to any website to enable the QA widget:

```html
<script src="https://your-domain.com/embed.js" data-key="PROJECT_EMBED_KEY" defer></script>
```

The embed key is shown during project creation and in project settings.

---

## Environment Notes

- **Google OAuth redirect URI** must be set to `{NEXTAUTH_URL}/api/auth/callback/google` in the Google Cloud Console.
- Screenshots are fetched from thum.io on first project creation and cached in `apps/web/public/screenshots/` as static files. No additional system dependencies required. This directory is gitignored.
