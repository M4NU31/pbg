"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import useSWR from "swr";
import { Bell, CheckCheck, UserCheck, AtSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "@/lib/date-utils";

interface Notification {
  id: string;
  type: "TASK_ASSIGNED" | "MENTION";
  read: number;
  actorName: string | null;
  taskId: string | null;
  projectId: string | null;
  commentId: string | null;
  taskTitle: string | null;
  createdAt: string;
}

interface NotifResponse {
  notifications: Notification[];
  unreadCount: number;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { data, mutate } = useSWR<NotifResponse>("/api/notifications", fetcher, {
    refreshInterval: 30000,
  });

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  async function markRead(id: string) {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    mutate();
  }

  async function markAllRead() {
    await fetch("/api/notifications/read-all", { method: "POST" });
    mutate();
  }

  function handleNotifClick(n: Notification) {
    if (!n.projectId || !n.taskId) return;
    markRead(n.id);
    setOpen(false);
    router.push(`/projects/${n.projectId}?tab=tasks&task=${n.taskId}`);
  }

  function getIcon(type: Notification["type"]) {
    if (type === "TASK_ASSIGNED") return <UserCheck className="h-3.5 w-3.5 text-primary shrink-0" />;
    return <AtSign className="h-3.5 w-3.5 text-blue-500 shrink-0" />;
  }

  function getText(n: Notification) {
    if (n.type === "TASK_ASSIGNED") {
      return <><span className="font-medium">{n.actorName}</span> assigned you to <span className="font-medium">{n.taskTitle}</span></>;
    }
    return <><span className="font-medium">{n.actorName}</span> mentioned you in <span className="font-medium">{n.taskTitle}</span></>;
  }

  return (
    <div ref={wrapperRef} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-lg border bg-popover shadow-lg z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <span className="font-semibold text-sm">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Bell className="h-8 w-8 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleNotifClick(n)}
                  className={`flex items-start gap-3 w-full px-4 py-3 text-left hover:bg-accent transition-colors border-b last:border-0 ${
                    !n.read ? "bg-primary/5" : ""
                  }`}
                >
                  <div className="mt-0.5">{getIcon(n.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs leading-relaxed text-foreground">{getText(n)}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {formatDistanceToNow(new Date(n.createdAt))}
                    </p>
                  </div>
                  {!n.read && (
                    <span className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t px-4 py-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-muted-foreground"
              onClick={() => { setOpen(false); router.push("/notifications"); }}
            >
              See all notifications
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
