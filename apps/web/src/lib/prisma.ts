import { PrismaClient } from "@prisma/client";
import { PrismaMysql } from "@prisma/adapter-mysql";
import mysql from "mysql2";

function createPool() {
  const dbUrl = process.env.DATABASE_URL!;
  const url = new URL(dbUrl);
  const socketPath = url.searchParams.get("socket");

  const config: mysql.PoolOptions = {
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.slice(1)),
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
  const adapter = new PrismaMysql(pool);
  globalForPrisma.prisma = new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma;
