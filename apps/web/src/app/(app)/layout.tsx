import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSystemRole } from "@/lib/auth-helpers";
import { gravatarUrl } from "@/lib/gravatar";
import { AppShell } from "@/components/layout/AppShell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    const hdrs = await headers();
    const pathname = hdrs.get("x-invoke-path") ?? "/dashboard";
    redirect(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
  }

  const systemRole = await getSystemRole(session.user.id, session.user.email);
  const avatarUrl = session.user.image ?? gravatarUrl(session.user.email ?? "");
  const isClient = !session.user.email?.endsWith("@punchteam.com");

  return (
    <AppShell user={session.user} systemRole={systemRole} avatarUrl={avatarUrl} isClient={isClient}>
      {children}
    </AppShell>
  );
}
