"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

export function LoginForm() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [emailError, setEmailError] = useState("");

  useEffect(() => {
    if (status === "authenticated") router.replace(callbackUrl);
  }, [status, router, callbackUrl]);

  if (status === "loading" || status === "authenticated") return null;

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setEmailError("");
    if (!email.trim()) { setEmailError("Please enter your email."); return; }
    setSending(true);
    const res = await signIn("email", { email: email.trim(), redirect: false, callbackUrl: "/dashboard" });
    setSending(false);
    if (res?.error) {
      setEmailError("This email is not authorized. Ask your team to invite you first.");
    } else {
      setSent(true);
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm px-4">
      {/* Logo + app name */}
      <div className="flex flex-col items-center gap-2">
        <Image src="/logo.svg" alt="Punch - Site QA Tool logo" width={56} height={56} priority />
        <h1 className="text-2xl font-bold text-white tracking-tight">Punch - Site QA Tool</h1>
        <p className="text-sm text-zinc-400">Sign in to access your workspace</p>
      </div>

      {/* Card */}
      <div className="w-full rounded-xl bg-[#1e1e1e] border border-zinc-800 p-8 flex flex-col gap-5">
        <h2 className="text-lg font-semibold text-white text-center">Welcome Back</h2>

        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400 text-center">
            {error === "AccessDenied" || error === "DomainNotAllowed"
              ? "This account is not authorized. Contact your project manager to get access."
              : "An error occurred. Please try again."}
          </div>
        )}

        {/* Google — for internal team */}
        <button
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="flex items-center justify-center gap-3 w-full rounded-lg bg-[#FF1449] hover:bg-[#e0103f] transition-colors text-white font-semibold py-3 px-4"
        >
          <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Sign in with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-zinc-700" />
          <span className="text-xs text-zinc-500">or use your email</span>
          <div className="flex-1 h-px bg-zinc-700" />
        </div>

        {/* Magic link — for clients */}
        {sent ? (
          <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4 text-sm text-green-400 text-center">
            Check your inbox — we sent a sign-in link to <strong>{email}</strong>.
          </div>
        ) : (
          <form onSubmit={handleMagicLink} className="flex flex-col gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full rounded-lg bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 px-3 py-2.5 text-sm focus:outline-none focus:border-zinc-500 transition-colors"
              disabled={sending}
            />
            {emailError && (
              <p className="text-xs text-red-400">{emailError}</p>
            )}
            <button
              type="submit"
              disabled={sending}
              className="w-full rounded-lg bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 transition-colors text-white font-semibold py-2.5 px-4 text-sm"
            >
              {sending ? "Sending…" : "Send magic link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
