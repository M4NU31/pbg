// Prisma engine is not used at runtime — all DB access goes through mysql2 via @/lib/db.
// This stub prevents crashes if any stale import remains.
export const prisma = new Proxy({} as never, {
  get(_, prop) {
    throw new Error(
      `prisma.${String(prop)} was called but Prisma is disabled at runtime. Use @/lib/db instead.`
    );
  },
});
