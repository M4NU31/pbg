import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { createMysql2AuthAdapter } from "./auth-adapter";
import { query, execute } from "./db";
import { randomUUID } from "crypto";

const ALLOWED_DOMAIN = "punchteam.com";

async function isClientInvited(email: string): Promise<boolean> {
  try {
    const rows = await query(
      `SELECT id FROM ClientInvitation WHERE LOWER(email) = LOWER(?)`,
      [email]
    );
    return rows.length > 0;
  } catch {
    return false;
  }
}

async function provisionClientMemberships(userId: string, email: string) {
  try {
    const invitations = await query<{ id: string; projectId: string }>(
      `SELECT id, projectId FROM ClientInvitation WHERE LOWER(email) = LOWER(?)`,
      [email]
    );
    for (const inv of invitations) {
      const existing = await query(
        `SELECT id FROM ProjectMember WHERE projectId = ? AND userId = ?`,
        [inv.projectId, userId]
      );
      if (existing.length === 0) {
        await execute(
          `INSERT INTO ProjectMember (id, projectId, userId, role, joinedAt) VALUES (?, ?, ?, 'CLIENT', NOW())`,
          [randomUUID(), inv.projectId, userId]
        );
      }
    }
  } catch {
    // Non-fatal
  }
}

export const authOptions: NextAuthOptions = {
  adapter: createMysql2AuthAdapter(),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "none",
        path: "/",
        secure: true,
      },
    },
  },
  callbacks: {
    async signIn({ user }) {
      const email = (user.email ?? "").toLowerCase();

      // Always allow the internal domain
      if (email.endsWith(`@${ALLOWED_DOMAIN}`)) return true;

      // Allow if they have a pending client invitation
      const invited = await isClientInvited(email);
      if (!invited) return "/login?error=DomainNotAllowed";

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        // user.id here is the real DB id — adapter has already created the user
        token.sub = user.id;

        // Provision CLIENT memberships on first sign-in for non-internal users
        const email = (user.email ?? "").toLowerCase();
        if (!email.endsWith(`@${ALLOWED_DOMAIN}`)) {
          await provisionClientMemberships(user.id, email);
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user && token.sub) session.user.id = token.sub;
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
};
