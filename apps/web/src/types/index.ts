export type TaskStatus = "BACKLOG" | "TODO" | "DOING" | "DONE" | "CLOSED";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type MemberRole = "ADMIN" | "PROJECT_MANAGER" | "MEMBER" | "CLIENT";
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
  priority?: string;      // LOW | MEDIUM | HIGH | CRITICAL — defaults to MEDIUM
  screenshot?: string;    // base64 PNG — full viewport screenshot (mutually exclusive with screenshotUrl)
  screenshotUrl?: string; // pre-built URL from screenshot server (mutually exclusive with screenshot)
  domSelector: string;
  pinX?: number; // page X coordinate (px) where user clicked
  pinY?: number; // page Y coordinate (px) where user clicked
  domHtml: string;
  pageUrl: string;
  columnId?: string;
  tagIds?: string[];
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
