FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Copy workspace manifests
COPY package.json package-lock.json* ./
COPY apps/web/package.json ./apps/web/
COPY packages/embed/package.json ./packages/embed/

RUN npm ci

# Build embed script
FROM base AS embed-builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY packages/embed ./packages/embed
COPY apps/web/public ./apps/web/public
COPY package.json ./
RUN cd packages/embed && npx vite build

# Build Next.js
FROM base AS web-builder
RUN apk add --no-cache openssl
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=embed-builder /app/apps/web/public/embed ./apps/web/public/embed
COPY apps/web ./apps/web
COPY package.json ./

WORKDIR /app/apps/web
RUN npx prisma generate
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx next build

# Production image
FROM base AS runner
RUN apk add --no-cache openssl
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=web-builder /app/apps/web/public ./public
COPY --from=web-builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=web-builder --chown=nextjs:nodejs /app/apps/web/.next/static ./.next/static

# Copy Prisma client
COPY --from=web-builder /app/apps/web/node_modules/.prisma ./node_modules/.prisma
COPY --from=web-builder /app/apps/web/prisma ./prisma

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
