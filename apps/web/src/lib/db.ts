import mysql from "mysql2/promise";

const globalForDb = globalThis as unknown as { _pool: mysql.Pool | undefined };

export function getPool(): mysql.Pool {
  if (!globalForDb._pool) {
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
    globalForDb._pool = mysql.createPool(config);
  }
  return globalForDb._pool;
}

export async function query<T = Record<string, unknown>>(
  sql: string,
  params?: unknown[]
): Promise<T[]> {
  const [rows] = await getPool().query(sql, params ?? []);
  return rows as T[];
}

export async function queryOne<T = Record<string, unknown>>(
  sql: string,
  params?: unknown[]
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}

export async function execute(
  sql: string,
  params?: unknown[]
): Promise<mysql.ResultSetHeader> {
  const [result] = await getPool().execute(sql, params ?? []);
  return result as mysql.ResultSetHeader;
}

export async function withTransaction<T>(
  fn: (conn: mysql.PoolConnection) => Promise<T>
): Promise<T> {
  const conn = await getPool().getConnection();
  await conn.beginTransaction();
  try {
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function connQuery<T = Record<string, unknown>>(
  conn: mysql.PoolConnection,
  sql: string,
  params?: unknown[]
): Promise<T[]> {
  const [rows] = await conn.query(sql, params ?? []);
  return rows as T[];
}

export async function connQueryOne<T = Record<string, unknown>>(
  conn: mysql.PoolConnection,
  sql: string,
  params?: unknown[]
): Promise<T | null> {
  const rows = await connQuery<T>(conn, sql, params);
  return rows[0] ?? null;
}

export async function connExecute(
  conn: mysql.PoolConnection,
  sql: string,
  params?: unknown[]
): Promise<mysql.ResultSetHeader> {
  const [result] = await conn.execute(sql, params ?? []);
  return result as mysql.ResultSetHeader;
}

export function parseJson(val: unknown): unknown[] {
  if (typeof val === "string") {
    try {
      return JSON.parse(val);
    } catch {
      return [];
    }
  }
  return Array.isArray(val) ? val : [];
}
