"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, UserCheck, AtSign, CheckCheck } from "lucide-react";
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

export function NotificationsClient({
  initialNotifications,
  userId: _userId,
}: {
  initialNotifications: Notification[];
  userId: string;
}) {
  const router = useRouter();
  const [notifications, setNotifications] = useState(initialNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  async function markRead(id: string) {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: 1 } : n))
    );
  }

  async function markAllRead() {
    await fetch("/api/notifications/read-all", { method: "POST" });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: 1 })));
  }

  function handleClick(n: Notification) {
    if (!n.projectId || !n.taskId) return;
    markRead(n.id);
    router.push(`/projects/${n.projectId}?task=${n.taskId}`);
  }

  function getIcon(type: Notification["type"]) {
    if (type === "TASK_ASSIGNED")
      return <UserCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />;
    return <AtSign className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />;
  }

  function getText(n: Notification) {
    if (n.type === "TASK_ASSIGNED") {
      return (
        <>
          <span className="font-medium">{n.actorName}</span> assigned you to{" "}
          <span className="font-medium">{n.taskTitle}</span>
        </>
      );
    }
    return (
      <>
        <span className="font-medium">{n.actorName}</span> mentioned you in{" "}
        <span className="font-medium">{n.taskTitle}</span>
      </>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Bell className="h-12 w-12 text-muted-foreground/30 mb-3" />
          <h2 className="text-lg font-semibold">No notifications</h2>
          <p className="text-muted-foreground text-sm mt-1">
            You'll be notified when tasks are assigned to you or someone mentions you.
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => handleClick(n)}
              className={`flex items-start gap-4 w-full p-4 rounded-lg text-left transition-colors hover:bg-accent border ${
                !n.read ? "bg-primary/5 border-primary/10" : "bg-card border-border"
              }`}
            >
              {getIcon(n.type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm leading-relaxed">{getText(n)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(n.createdAt))}
                </p>
              </div>
              {!n.read && (
                <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
