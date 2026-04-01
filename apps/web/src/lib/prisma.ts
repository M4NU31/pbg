import { PrismaClient } from "@prisma/client";
import mysql from "mysql2/promise";
import { createMysql2Adapter } from "./mysql2-adapter";

const globalForPrisma = globalThis as unknown as {
  _prisma: PrismaClient | undefined;
};

function getClient(): PrismaClient {
  if (!globalForPrisma._prisma) {
    const url = new URL(process.env.DATABASE_URL!);
    const socketPath = url.searchParams.get("socket");

    const config: mysql.PoolOptions = {
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: decodeURIComponent(url.pathname.slice(1)),
      waitForConnections: true,
      connectionLimit: 10,
    };

    if (socketPath) {
      config.socketPath = socketPath;
    } else {
      config.host = url.hostname;
      config.port = parseInt(url.port || "3306", 10);
    }

    const pool = mysql.createPool(config);
    const adapter = createMysql2Adapter(pool);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    globalForPrisma._prisma = new PrismaClient({ adapter } as any);
  }
  return globalForPrisma._prisma;
}

// Lazy proxy — only initializes the client on first property access (i.e. first request),
// not at module evaluation time during the Next.js build.
export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop: string | symbol) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (getClient() as any)[prop];
  },
});
