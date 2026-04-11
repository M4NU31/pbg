# Punch - Site QA Tool

A self-hosted website QA and bug-reporting platform. Teams embed a lightweight widget on any site, click elements to report tasks with automatic screenshots, and manage everything on a Kanban board. Clients are invited by email and access the platform via magic link — no Google account required.

---

## Tech Stack

### Web App (`apps/web`)
| Layer | Technology |
|---|---|
| Framework | [Next.js 15](https://nextjs.org/) (App Router, standalone output) |
| Language | TypeScript 5 |
| Auth | [NextAuth.js v4](https://next-auth.js.org/) — Google OAuth + Email magic link |
| Database | MySQL 8 via [mysql2](https://github.com/sidorares/node-mysql2) (raw queries, no ORM) |
| UI | [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/) |
| Styling | [Tailwind CSS v3](https://tailwindcss.com/) |
| File storage | Local filesystem or [Cloudflare R2](https://www.cloudflare.com/products/r2/) |
| Email | [Brevo](https://www.brevo.com/) SMTP via Nodemailer |

### Embed Widget (`packages/embed`)
| Layer | Technology |
|---|---|
| Language | TypeScript |
| Build | [Vite](https://vitejs.dev/) (IIFE bundle) |
| DOM isolation | Shadow DOM |

### Screenshot Service
Separate service — see [ss_service repo](https://github.com/M4NU31/ss_service).

---

## Quick Start (Docker)

The fastest way to run the full stack locally:

```bash
git clone https://github.com/M4NU41/pbg.git punch-qa
cd punch-qa
cp .env.example .env   # fill in your values
docker compose up --build
```

The app will be available at [http://localhost:3000](http://localhost:3000).  
MySQL is included in the compose file and initialized automatically.

To also run the screenshot service, start [ss_service](https://github.com/M4NU41/ss_service) separately and set `SCREENSHOT_SERVICE_URL` in your `.env`.

---

## Manual Setup (without Docker)

### Prerequisites
- Node.js 20+
- npm 9+
- MySQL 8.0

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example apps/web/.env.local
```

Edit `apps/web/.env.local` with your values (see `.env.example` for all options).

### 3. Set up the database

```sql
-- In MySQL shell:
CREATE DATABASE punchbug CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Then run the schema:

```bash
# In phpMyAdmin or MySQL shell, run:
scripts/create-tables.sql
# Then run all migrate-vN.sql files in order
```

### 4. Run

```bash
npm run dev        # development
npm run build      # production build
npm start          # production server
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | MySQL connection string |
| `NEXTAUTH_URL` | Public URL of the app |
| `NEXTAUTH_SECRET` | Random secret (`openssl rand -base64 32`) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `BREVO_SMTP_LOGIN` | Brevo SMTP login (found in Brevo → Transactional → SMTP) |
| `BREVO_SMTP_KEY` | Brevo SMTP key |
| `EMAIL_FROM` | Sender address, e.g. `"Punch" <noreply@yourdomain.com>` |
| `STORAGE_PROVIDER` | `local` or `r2` |
| `LOCAL_UPLOAD_DIR` | Absolute path for local uploads (survives deploys) |
| `UPLOADS_STATIC_URL` | Public URL for local uploads (leave empty to proxy) |
| `R2_ENDPOINT` | Cloudflare R2 S3 endpoint |
| `R2_BUCKET` | R2 bucket name |
| `R2_ACCESS_KEY_ID` | R2 access key |
| `R2_SECRET_ACCESS_KEY` | R2 secret key |
| `R2_PUBLIC_URL` | R2 public bucket URL |
| `SCREENSHOT_SERVICE_URL` | URL of the ss_service instance |
| `NEXT_PUBLIC_APP_URL` | Public app URL (used in embed snippet) |

---

## Project Structure

```
punch-qa/
├── apps/web/               # Next.js application
│   ├── src/
│   │   ├── app/            # App Router pages + API routes
│   │   │   ├── (app)/      # Authenticated pages
│   │   │   ├── (auth)/     # Login page
│   │   │   └── api/        # REST endpoints
│   │   ├── components/     # React components
│   │   └── lib/            # DB, auth, storage, email utilities
│   └── public/
│       └── embed/          # Built embed widget (auto-generated)
├── packages/
│   └── embed/              # Shadow DOM widget source (Vite IIFE build)
├── scripts/                # SQL schema + migrations
├── docker-compose.yml      # Local dev (includes MySQL)
├── docker-compose.prod.yml # Production (external MySQL)
├── Dockerfile
└── .env.example
```

---

## User Roles

| Role | Description |
|---|---|
| `ADMIN` | Full access — manages projects, members, and clients |
| `PROJECT_MANAGER` | Creates projects, invites members and clients |
| `MEMBER` | Team member added to projects individually |
| `CLIENT` | External client — invited by email magic link, restricted view |

---

## Embed Widget

Add the snippet to any website to enable the QA widget:

```html
<script
  src="https://your-domain.com/embed.js"
  data-key="PROJECT_EMBED_KEY"
  defer
></script>
```

The embed key is shown during project creation and in project settings.

Logged-in users see all tasks pinned on the page. Admins and Project Managers can delete tasks directly from the widget.

---

## Client Access

Clients are invited by Admin or Project Manager from the **Clients** tab of a project. An invitation email is sent automatically with a 7-day magic link — no Google account needed. If the link expires, the PM can resend it from the same tab.
