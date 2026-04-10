# ── Stage 1: Install dependencies ────────────────────────────────────────────
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/embed/package.json ./packages/embed/

RUN npm ci

# ── Stage 2: Build embed bundle ───────────────────────────────────────────────
FROM node:20-alpine AS embed-builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY packages/embed ./packages/embed
COPY package.json ./

RUN cd packages/embed && npx vite build

# ── Stage 3: Build Next.js app ────────────────────────────────────────────────
FROM node:20-alpine AS web-builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=embed-builder /app/packages/embed/dist ./packages/embed/dist
COPY apps/web ./apps/web
COPY package.json ./

# Copy built embed into public so Next.js bundles it
RUN cp -r packages/embed/dist/. apps/web/public/embed/ 2>/dev/null || true

WORKDIR /app/apps/web

ENV NEXT_TELEMETRY_DISABLED=1
# Dummy values so Next.js can build without real secrets
ENV NEXTAUTH_SECRET=build-time-placeholder
ENV NEXTAUTH_URL=http://localhost:3000
ENV DATABASE_URL=mysql://user:pass@localhost:3306/punchbug

RUN npm run build

# ── Stage 4: Production runner ────────────────────────────────────────────────
FROM node:20-alpine AS runner
RUN apk add --no-cache dumb-init
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Standalone output + static assets
COPY --from=web-builder --chown=nextjs:nodejs /app/apps/web/.nextbuild/standalone ./
COPY --from=web-builder --chown=nextjs:nodejs /app/apps/web/.nextbuild/static ./.next/static
COPY --from=web-builder --chown=nextjs:nodejs /app/apps/web/public ./public

# Persistent uploads directory
RUN mkdir -p /app/uploads && chown nextjs:nodejs /app/uploads

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
