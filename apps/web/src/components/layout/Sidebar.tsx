"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { LayoutDashboard, LogOut, Moon, Sun, Archive, Users } from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SystemRole } from "@/lib/auth-helpers";

interface SidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  systemRole: SystemRole;
  avatarUrl?: string;
  isClient?: boolean;
}

export function Sidebar({ user, systemRole, avatarUrl, isClient = false }: SidebarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    ...(!isClient ? [{ href: "/archived", icon: Archive, label: "Archived Projects" }] : []),
    ...(systemRole === "RANK1" ? [{ href: "/admin/users", icon: Users, label: "Manage Users" }] : []),
  ];


  return (
    <aside className="flex flex-col w-60 border-r bg-card h-full">
      <div className="flex items-center gap-2 px-6 py-5 border-b">
        <img src="/logo.svg" alt="" className="h-6 w-6" />
        <span className="font-bold text-lg">Punch QA Tool</span>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              pathname === href || pathname.startsWith(href + "/")
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t">
        <div className="flex items-center gap-3 px-2 py-2">
          <UserAvatar name={user.name} email={user.email} image={user.image} avatarUrl={avatarUrl} className="h-8 w-8" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              title="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => signOut({ callbackUrl: "/login" })}
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
