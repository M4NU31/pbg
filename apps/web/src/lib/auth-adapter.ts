import type { Adapter } from "next-auth/adapters";
import { randomUUID } from "crypto";
import { queryOne, execute } from "./db";

type CreateUserData = { name?: string | null; email: string; emailVerified?: Date | null; image?: string | null };
type UpdateUserData = { id: string; name?: string | null; email?: string; emailVerified?: Date | null; image?: string | null };
type LinkAccountData = {
  userId: string; type: string; provider: string; providerAccountId: string;
  refresh_token?: string | null; access_token?: string | null; expires_at?: number | null;
  token_type?: string | null; scope?: string | null; id_token?: string | null; session_state?: string | null;
};
type CreateSessionData = { sessionToken: string; userId: string; expires: Date };
type UpdateSessionData = { sessionToken: string; expires?: Date };
type CreateVerificationTokenData = { identifier: string; token: string; expires: Date };
type UseVerificationTokenData = { identifier: string; token: string };

export function createMysql2AuthAdapter(): Adapter {
  return {
    async createUser(user: CreateUserData) {
      const id = randomUUID();
      await execute(
        `INSERT INTO User (id, name, email, emailVerified, image, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
        [id, user.name ?? null, user.email, user.emailVerified ?? null, user.image ?? null]
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const created = await queryOne<any>(`SELECT * FROM User WHERE id = ?`, [id]);
      return created!;
    },

    async getUser(id: string) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return queryOne<any>(`SELECT * FROM User WHERE id = ?`, [id]);
    },

    async getUserByEmail(email: string) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return queryOne<any>(`SELECT * FROM User WHERE email = ?`, [email]);
    },

    async getUserByAccount({ providerAccountId, provider }: { providerAccountId: string; provider: string }) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return queryOne<any>(
        `SELECT u.* FROM User u JOIN Account a ON u.id = a.userId WHERE a.provider = ? AND a.providerAccountId = ?`,
        [provider, providerAccountId]
      );
    },

    async updateUser(user: UpdateUserData) {
      const sets: string[] = [];
      const vals: unknown[] = [];
      if (user.name !== undefined) { sets.push("name = ?"); vals.push(user.name); }
      if (user.email !== undefined) { sets.push("email = ?"); vals.push(user.email); }
      if (user.emailVerified !== undefined) { sets.push("emailVerified = ?"); vals.push(user.emailVerified); }
      if (user.image !== undefined) { sets.push("image = ?"); vals.push(user.image); }
      sets.push("updatedAt = NOW()");
      vals.push(user.id);
      await execute(`UPDATE User SET ${sets.join(", ")} WHERE id = ?`, vals);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updated = await queryOne<any>(`SELECT * FROM User WHERE id = ?`, [user.id]);
      return updated!;
    },

    async linkAccount(account: LinkAccountData): Promise<void> {
      const id = randomUUID();
      await execute(
        `INSERT INTO Account (id, userId, type, provider, providerAccountId, refresh_token, access_token, expires_at, token_type, scope, id_token, session_state) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id, account.userId, account.type, account.provider, account.providerAccountId,
          account.refresh_token ?? null, account.access_token ?? null, account.expires_at ?? null,
          account.token_type ?? null, account.scope ?? null, account.id_token ?? null, account.session_state ?? null,
        ]
      );
    },

    async createSession({ sessionToken, userId, expires }: CreateSessionData) {
      const id = randomUUID();
      await execute(
        `INSERT INTO Session (id, sessionToken, userId, expires) VALUES (?, ?, ?, ?)`,
        [id, sessionToken, userId, expires]
      );
      return { sessionToken, userId, expires };
    },

    async getSessionAndUser(sessionToken: string) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const session = await queryOne<any>(`SELECT * FROM Session WHERE sessionToken = ?`, [sessionToken]);
      if (!session) return null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const user = await queryOne<any>(`SELECT * FROM User WHERE id = ?`, [session.userId]);
      if (!user) return null;
      return { session: { ...session, expires: new Date(session.expires) }, user };
    },

    async updateSession({ sessionToken, expires }: UpdateSessionData) {
      if (expires) {
        await execute(`UPDATE Session SET expires = ? WHERE sessionToken = ?`, [expires, sessionToken]);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const session = await queryOne<any>(`SELECT * FROM Session WHERE sessionToken = ?`, [sessionToken]);
      return session ? { ...session, expires: new Date(session.expires) } : null;
    },

    async deleteSession(sessionToken: string) {
      await execute(`DELETE FROM Session WHERE sessionToken = ?`, [sessionToken]);
    },

    async createVerificationToken({ identifier, expires, token }: CreateVerificationTokenData) {
      await execute(
        `INSERT INTO VerificationToken (identifier, token, expires) VALUES (?, ?, ?)`,
        [identifier, token, expires]
      );
      return { identifier, expires, token };
    },

    async useVerificationToken({ identifier, token }: UseVerificationTokenData) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const vt = await queryOne<any>(
        `SELECT * FROM VerificationToken WHERE identifier = ? AND token = ?`,
        [identifier, token]
      );
      if (!vt) return null;
      await execute(`DELETE FROM VerificationToken WHERE identifier = ? AND token = ?`, [identifier, token]);
      return { ...vt, expires: new Date(vt.expires) };
    },
  };
}
