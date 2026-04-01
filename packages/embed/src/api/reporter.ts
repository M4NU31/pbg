export interface ReportPayload {
  embedKey: string;
  title: string;
  description?: string;
  screenshot: string;
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

export async function submitReport(
  apiUrl: string,
  payload: ReportPayload
): Promise<{ taskId: string; taskNumber: number; message: string }> {
  const res = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to submit report");
  }

  return res.json();
}
