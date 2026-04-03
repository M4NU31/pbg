import type { EmbedTask } from "../core/PunchBug";

const STATUS_COLOR: Record<string, string> = {
  BACKLOG: "#6b7280", TODO: "#3b82f6", DOING: "#f59e0b", DONE: "#10b981", CLOSED: "#6b7280",
};
const PRIORITY_COLOR: Record<string, string> = {
  LOW: "#6b7280", MEDIUM: "#3b82f6", HIGH: "#f59e0b", CRITICAL: "#ef4444",
};

export class TaskPanel {
  private shadow: ShadowRoot;
  private overlay: HTMLElement | null = null;

  constructor(shadow: ShadowRoot) {
    this.shadow = shadow;
  }

  show(task: EmbedTask, projectId: string, apiUrl: string) {
    this.close();

    const overlay = document.createElement("div");
    overlay.className = "pb-overlay";

    const card = document.createElement("div");
    card.className = "pb-form-card pb-task-panel";

    const sc = STATUS_COLOR[task.status] ?? "#6b7280";
    const pc = PRIORITY_COLOR[task.priority] ?? "#6b7280";

    card.innerHTML = `
      <div class="pb-form-header">
        <span style="font-size:12px;color:#6b7280;font-weight:600">#${task.taskNumber}</span>
        <button class="pb-close-btn" id="pb-tpanel-close">&#x2715;</button>
      </div>
      <p style="font-size:15px;font-weight:600;color:#111;margin:0 0 10px">${task.title}</p>
      <div style="display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap">
        <span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;background:${sc}22;color:${sc}">${task.status}</span>
        <span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;background:${pc}22;color:${pc}">${task.priority}</span>
      </div>
      ${task.screenshotUrl ? `<img src="${task.screenshotUrl}" alt="Screenshot" style="width:100%;max-height:140px;object-fit:cover;border-radius:6px;border:1px solid #e5e7eb;margin-bottom:12px" />` : ""}
      ${task.guestName ? `<p style="font-size:12px;color:#6b7280;margin:0 0 12px">Reported by <strong>${task.guestName}</strong></p>` : ""}
      <a href="${apiUrl}/projects/${projectId}?task=${task.id}" target="_blank" rel="noopener noreferrer"
         style="display:block;text-align:center;background:#3b82f6;color:white;border-radius:6px;padding:8px;font-size:13px;font-weight:600;text-decoration:none">
        View in board →
      </a>
    `;

    overlay.appendChild(card);
    this.shadow.appendChild(overlay);
    this.overlay = overlay;

    this.shadow.getElementById("pb-tpanel-close")?.addEventListener("click", () => this.close());
    overlay.addEventListener("click", (e) => { if (e.target === overlay) this.close(); });
  }

  close() {
    this.overlay?.remove();
    this.overlay = null;
  }
}
