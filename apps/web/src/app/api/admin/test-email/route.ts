import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function GET(req: NextRequest) {
  const to = req.nextUrl.searchParams.get("to");
  if (!to) return NextResponse.json({ error: "?to=email required" }, { status: 400 });

  const config = {
    BREVO_SMTP_LOGIN: process.env.BREVO_SMTP_LOGIN ?? "(not set)",
    BREVO_SMTP_KEY: process.env.BREVO_SMTP_KEY ? "✓ set (" + process.env.BREVO_SMTP_KEY.slice(0, 6) + "…)" : "(not set)",
    EMAIL_FROM: process.env.EMAIL_FROM ?? "(not set)",
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? "(not set)",
  };

  if (!process.env.BREVO_SMTP_LOGIN || !process.env.BREVO_SMTP_KEY) {
    return NextResponse.json({ ok: false, error: "Missing env vars", config });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.BREVO_SMTP_LOGIN,
        pass: process.env.BREVO_SMTP_KEY,
      },
    });

    await transporter.verify();

    await transporter.sendMail({
      from: process.env.EMAIL_FROM ?? `"Punch - Site QA" <noreply@punchteam.com>`,
      to,
      subject: "Punch - SMTP test",
      text: "If you received this, SMTP is working correctly.",
      html: "<p>If you received this, <strong>SMTP is working correctly.</strong></p>",
    });

    return NextResponse.json({ ok: true, sentTo: to, config });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message, config }, { status: 500 });
  }
}
