"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Sidebar } from "./Sidebar";
import type { SystemRole } from "@/lib/auth-helpers";

interface AppShellProps {
  user: { name?: string | null; email?: string | null; image?: string | null };
  systemRole: SystemRole;
  avatarUrl: string;
  isClient: boolean;
  children: React.ReactNode;
}

export function AppShell({ user, systemRole, avatarUrl, isClient, children }: AppShellProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">

      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar — slides in on mobile, always visible on md+ */}
      <div className={[
        "fixed inset-y-0 left-0 z-50 transition-transform duration-200 ease-in-out",
        "md:relative md:translate-x-0 md:flex md:shrink-0",
        open ? "translate-x-0" : "-translate-x-full",
      ].join(" ")}>
        <Sidebar
          user={user}
          systemRole={systemRole}
          avatarUrl={avatarUrl}
          isClient={isClient}
          onClose={() => setOpen(false)}
        />
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-auto min-w-0 flex flex-col">
        {/* Mobile top bar */}
        <div className="flex items-center h-12 px-4 border-b bg-card shrink-0 md:hidden">
          <button
            onClick={() => setOpen(true)}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 ml-3">
            <img src="/logo.svg" alt="" className="h-5 w-5" />
            <span className="font-bold text-sm">Punch QA Tool</span>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
