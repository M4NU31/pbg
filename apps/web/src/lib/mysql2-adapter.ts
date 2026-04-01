import type mysql from "mysql2/promise";

// Maps mysql2 field type IDs to Prisma ColumnType numbers
// See: https://github.com/mysqljs/mysql/blob/master/lib/protocol/constants/types.js
function mapFieldType(typeId: number): number {
  switch (typeId) {
    case 1:   // TINY (TINYINT / BOOL)
    case 2:   // SHORT
    case 3:   // LONG (INT)
    case 9:   // INT24
      return 0; // Int32
    case 8:   // LONGLONG (BIGINT)
      return 1; // Int64
    case 4:   // FLOAT
      return 2; // Float
    case 5:   // DOUBLE
      return 3; // Double
    case 0:   // DECIMAL
    case 246: // NEWDECIMAL
      return 4; // Numeric
    case 7:   // TIMESTAMP
    case 12:  // DATETIME
      return 10; // DateTime
    case 10:  // DATE
      return 8; // Date
    case 11:  // TIME
      return 9; // Time
    case 245: // JSON
      return 11; // Json
    case 252: // BLOB
    case 253: // VAR_STRING (VARCHAR)
    case 254: // STRING (CHAR / ENUM)
    default:
      return 7; // Text
  }
}

type Query = { sql: string; args: unknown[] };

async function doQuery(conn: mysql.Pool | mysql.PoolConnection, query: Query) {
  const [rows, fields] = await (conn as mysql.Pool).query({
    sql: query.sql,
    values: query.args,
    rowsAsArray: true,
  });
  const columnNames = (fields as mysql.FieldPacket[])?.map((f) => f.name) ?? [];
  const columnTypes = (fields as mysql.FieldPacket[])?.map(
    (f) => mapFieldType((f as unknown as { type: number }).type)
  ) ?? [];
  return { ok: true as const, value: { columnNames, columnTypes, rows: rows as unknown[][] } };
}

async function doExecute(conn: mysql.Pool | mysql.PoolConnection, query: Query) {
  const [result] = await (conn as mysql.Pool).query({ sql: query.sql, values: query.args });
  return { ok: true as const, value: (result as mysql.ResultSetHeader).affectedRows ?? 0 };
}

export function createMysql2Adapter(pool: mysql.Pool) {
  return {
    provider: "mysql" as const,

    queryRaw: (query: Query) => doQuery(pool, query),
    executeRaw: (query: Query) => doExecute(pool, query),

    async startTransaction() {
      const conn = await pool.getConnection();
      await conn.beginTransaction();
      return {
        ok: true as const,
        value: {
          provider: "mysql" as const,
          options: { usePhantomQuery: false },
          queryRaw: (q: Query) => doQuery(conn, q),
          executeRaw: (q: Query) => doExecute(conn, q),
          async commit() {
            await conn.commit();
            conn.release();
            return { ok: true as const, value: undefined };
          },
          async rollback() {
            await conn.rollback();
            conn.release();
            return { ok: true as const, value: undefined };
          },
        },
      };
    },

    async dispose() {
      await pool.end();
      return { ok: true as const, value: undefined };
    },
  };
}
