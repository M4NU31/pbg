import nodemailer from "nodemailer";
import { createHash, randomBytes } from "crypto";
import { execute } from "./db";

const APP_NAME = "Punch - Site QA";
const FROM_EMAIL = process.env.EMAIL_FROM ?? `"${APP_NAME}" <noreply@punchteam.com>`;
const APP_URL = (process.env.NEXTAUTH_URL ?? "https://punchteam.com").replace(/\/$/, "");
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET ?? "";

function getTransporter() {
  return nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.BREVO_SMTP_LOGIN!,
      pass: process.env.BREVO_SMTP_KEY!,
    },
  });
}

/** Hash the token the same way NextAuth does (sha256(token + secret)) */
function hashToken(token: string): string {
  return createHash("sha256").update(`${token}${NEXTAUTH_SECRET}`).digest("hex");
}

/**
 * Generates a magic link token, stores it in VerificationToken, and sends
 * an invitation email to the client.
 *
 * Called by ADMIN or PROJECT_MANAGER when inviting a client to a project.
 */
export async function sendClientInvite(
  email: string,
  projectName: string,
  inviterName: string,
): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const hashed = hashToken(token);
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  // Delete any existing token for this email so the new one works cleanly
  await execute(`DELETE FROM VerificationToken WHERE identifier = ?`, [email]);

  await execute(
    `INSERT INTO VerificationToken (identifier, token, expires) VALUES (?, ?, ?)`,
    [email, hashed, expires],
  );

  const params = new URLSearchParams({
    callbackUrl: `${APP_URL}/dashboard`,
    token,
    email,
  });
  const magicUrl = `${APP_URL}/api/auth/callback/email?${params}`;

  await getTransporter().sendMail({
    from: FROM_EMAIL,
    to: email,
    subject: `You've been invited to ${projectName} on ${APP_NAME}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#0f0f0f;border-radius:12px;color:#f4f4f5">
        <img src="${APP_URL}/logo.svg" alt="${APP_NAME}" width="48" style="margin-bottom:24px;display:block" />
        <h1 style="font-size:20px;font-weight:700;margin:0 0 8px">You've been invited</h1>
        <p style="color:#a1a1aa;font-size:14px;margin:0 0 4px">
          <strong style="color:#f4f4f5">${inviterName}</strong> has invited you to review
          <strong style="color:#f4f4f5">${projectName}</strong> on ${APP_NAME}.
        </p>
        <p style="color:#a1a1aa;font-size:14px;margin:0 0 24px">
          Click the button below to access the project. This link expires in 7 days.
        </p>
        <a href="${magicUrl}"
           style="display:inline-block;background:#FF1449;color:#fff;font-weight:600;font-size:15px;padding:12px 28px;border-radius:8px;text-decoration:none">
          Accept invitation
        </a>
        <p style="color:#52525b;font-size:12px;margin:24px 0 0">
          If you weren't expecting this invitation, you can safely ignore this email.
        </p>
      </div>
    `,
    text: `${inviterName} has invited you to ${projectName} on ${APP_NAME}.\n\nClick to accept (expires in 7 days):\n${magicUrl}\n\nIf you weren't expecting this, ignore this email.`,
  });
}
