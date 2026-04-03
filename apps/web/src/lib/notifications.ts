import { execute } from "@/lib/db";
import { randomUUID } from "crypto";

type NotifType = "TASK_ASSIGNED" | "MENTION";

interface CreateNotifParams {
  userId: string;
  type: NotifType;
  actorName: string;
  taskId: string;
  projectId: string;
  taskTitle: string;
  commentId?: string;
}

export async function createNotification(p: CreateNotifParams) {
  // Never notify yourself
  if (!p.userId) return;
  await execute(
    `INSERT INTO Notification (id, userId, type, actorName, taskId, projectId, commentId, taskTitle, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [randomUUID(), p.userId, p.type, p.actorName, p.taskId, p.projectId, p.commentId ?? null, p.taskTitle]
  );
}

/** Parse @[Name](userId) mention syntax and return unique userIds */
export function parseMentions(body: string): string[] {
  const pattern = /@\[([^\]]+)\]\(([^)]+)\)/g;
  const ids = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(body)) !== null) {
    ids.add(m[2]);
  }
  return Array.from(ids);
}
