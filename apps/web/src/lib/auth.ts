import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import nodemailer from "nodemailer";
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
      const existing = await query<{ id: string }>(
        `SELECT id FROM ProjectMember WHERE projectId = ? AND userId = ?`,
        [inv.projectId, userId]
      );
      if (existing.length === 0) {
        await execute(
          `INSERT INTO ProjectMember (id, projectId, userId, role, joinedAt) VALUES (?, ?, ?, 'CLIENT', NOW())`,
          [randomUUID(), inv.projectId, userId]
        );
      } else {
        // Ensure any pre-existing membership is downgraded to CLIENT
        await execute(
          `UPDATE ProjectMember SET role = 'CLIENT' WHERE id = ?`,
          [existing[0].id]
        );
      }
    }
  } catch {
    // Non-fatal
  }
}

const APP_NAME = "Punch - Site QA";
const FROM_EMAIL = process.env.EMAIL_FROM ?? `"${APP_NAME}" <noreply@punchteam.com>`;
const APP_URL = process.env.NEXTAUTH_URL ?? "https://punchteam.com";

function getTransporter() {
  return nodemailer.createTransport({
    host: "smtp.sendgrid.net",
    port: 587,
    secure: false,
    auth: {
      user: "apikey",
      pass: process.env.SENDGRID_API_KEY!,
    },
  });
}

export const authOptions: NextAuthOptions = {
  adapter: createMysql2AuthAdapter(),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    EmailProvider({
      from: FROM_EMAIL,
      sendVerificationRequest: async ({ identifier: email, url }) => {
        await getTransporter().sendMail({
          from: FROM_EMAIL,
          to: email,
          subject: `Sign in to ${APP_NAME}`,
          html: `
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#0f0f0f;border-radius:12px;color:#f4f4f5">
              <img src="${APP_URL}/logo.svg" alt="${APP_NAME}" width="48" style="margin-bottom:24px;display:block" />
              <h1 style="font-size:20px;font-weight:700;margin:0 0 8px">Sign in to ${APP_NAME}</h1>
              <p style="color:#a1a1aa;font-size:14px;margin:0 0 24px">Click the button below to sign in. This link expires in 24 hours and can only be used once.</p>
              <a href="${url}"
                 style="display:inline-block;background:#FF1449;color:#fff;font-weight:600;font-size:15px;padding:12px 28px;border-radius:8px;text-decoration:none">
                Sign in
              </a>
              <p style="color:#52525b;font-size:12px;margin:24px 0 0">If you didn't request this email, you can safely ignore it.</p>
            </div>
          `,
          text: `Sign in to ${APP_NAME}\n\nClick this link to sign in (expires in 24 hours):\n${url}\n\nIf you didn't request this, ignore this email.`,
        });
      },
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
    async signIn({ user, account, email: emailMeta }) {
      // For magic link requests the real email comes from user.email
      // (NextAuth creates/fetches the user before calling signIn)
      const email = (user.email ?? "").toLowerCase();

      // If somehow email is missing (edge case), allow through — token
      // validation at click-time will catch any abuse
      if (!email) return true;

      // Always allow the internal domain (both Google and magic link)
      if (email.endsWith(`@${ALLOWED_DOMAIN}`)) return true;

      // For magic link verification request: allow if invited
      // For Google OAuth: allow if invited
      const invited = await isClientInvited(email);
      if (!invited) {
        // Email provider: redirect to login with error
        // OAuth: same
        return "/login?error=DomainNotAllowed";
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        // user.id here is the real DB id — adapter has already created the user
        token.sub = user.id;

        const email = (user.email ?? "").toLowerCase();
        if (email.endsWith(`@${ALLOWED_DOMAIN}`)) {
          // Ensure internal users have a systemRole written to DB (default MEMBER)
          await execute(
            `UPDATE User SET systemRole = 'MEMBER' WHERE id = ? AND (systemRole IS NULL OR systemRole = '' OR systemRole NOT IN ('ADMIN','PROJECT_MANAGER','MEMBER'))`,
            [user.id]
          ).catch(() => {});
        } else {
          // Provision CLIENT memberships on first sign-in for non-internal users
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
