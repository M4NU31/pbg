import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSystemRole } from "@/lib/auth-helpers";
import { Sidebar } from "@/components/layout/Sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    const hdrs = await headers();
    const pathname = hdrs.get("x-invoke-path") ?? "/dashboard";
    redirect(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
  }

  const systemRole = await getSystemRole(session.user.id, session.user.email);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar user={session.user} systemRole={systemRole} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
