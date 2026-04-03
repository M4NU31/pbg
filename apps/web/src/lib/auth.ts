import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { createMysql2AuthAdapter } from "./auth-adapter";
import { query, execute } from "./db";
import { randomUUID } from "crypto";

const ALLOWED_DOMAIN = "punchteam.com";

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
      const email = user.email ?? "";

      // Always allow the internal domain
      if (email.endsWith(`@${ALLOWED_DOMAIN}`)) return true;

      // Check if this email has a pending client invitation
      let invitations: { id: string; projectId: string }[] = [];
      try {
        invitations = await query<{ id: string; projectId: string }>(
          `SELECT id, projectId FROM ClientInvitation WHERE email = ?`,
          [email]
        );
      } catch {
        // Table may not exist yet during initial deploy
        return "/login?error=DomainNotAllowed";
      }

      if (invitations.length === 0) return "/login?error=DomainNotAllowed";

      // Provision CLIENT memberships for every invited project (idempotent)
      const userId = user.id;
      if (userId) {
        for (const inv of invitations) {
          try {
            const exists = await query(
              `SELECT id FROM ProjectMember WHERE projectId = ? AND userId = ?`,
              [inv.projectId, userId]
            );
            if (exists.length === 0) {
              await execute(
                `INSERT INTO ProjectMember (id, projectId, userId, role, joinedAt) VALUES (?, ?, ?, 'CLIENT', NOW())`,
                [randomUUID(), inv.projectId, userId]
              );
            }
          } catch {
            // Non-fatal — continue
          }
        }
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) token.sub = user.id;
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
