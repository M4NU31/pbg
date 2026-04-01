import { PrismaClient } from "@prisma/client";
import mysql from "mysql2/promise";
import { createMysql2Adapter } from "./mysql2-adapter";

function createPool(): mysql.Pool {
  const dbUrl = process.env.DATABASE_URL!;
  const url = new URL(dbUrl);
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

  return mysql.createPool(config);
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

if (!globalForPrisma.prisma) {
  const pool = createPool();
  const adapter = createMysql2Adapter(pool);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  globalForPrisma.prisma = new PrismaClient({ adapter } as any);
}

export const prisma = globalForPrisma.prisma;
