export type TaskStatus = "BACKLOG" | "TODO" | "DOING" | "DONE" | "CLOSED";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type MemberRole = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";
export type ActivityType =
  | "TASK_CREATED"
  | "STATUS_CHANGED"
  | "PRIORITY_CHANGED"
  | "ASSIGNEE_CHANGED"
  | "COMMENT_ADDED"
  | "ATTACHMENT_ADDED"
  | "TITLE_CHANGED";

export interface EmbedReportPayload {
  embedKey: string;
  title: string;
  description?: string;
  screenshot: string; // base64 PNG
  domSelector: string;
  domHtml: string;
  pageUrl: string;
  columnId?: string;
  reporterName?: string;
  guestName?: string;
  guestEmail?: string;
  browserMeta: {
    browserName: string;
    browserVersion: string;
    osName: string;
    osVersion: string;
    deviceType: string;
    screenWidth: number;
    screenHeight: number;
    viewportWidth: number;
    viewportHeight: number;
    userAgent: string;
  };
}
