export type { TaskStatus, Priority, MemberRole, ActivityType } from "@prisma/client";

export interface EmbedReportPayload {
  embedKey: string;
  title: string;
  description?: string;
  screenshot: string; // base64 PNG
  domSelector: string;
  domHtml: string;
  pageUrl: string;
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
