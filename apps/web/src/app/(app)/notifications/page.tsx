import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";
import { NotificationsClient } from "@/components/notifications/NotificationsClient";

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const rows = await query<Record<string, unknown>>(
    `SELECT id, \`type\`, \`read\`, actorName, taskId, projectId, commentId, taskTitle, createdAt
     FROM Notification
     WHERE userId = ?
     ORDER BY createdAt DESC
     LIMIT 50`,
    [session.user.id]
  );

  return <NotificationsClient initialNotifications={rows as any[]} userId={session.user.id} />;
}
