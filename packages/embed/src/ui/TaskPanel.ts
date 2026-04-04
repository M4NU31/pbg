import type { EmbedTask } from "../core/PunchBug";

const STATUS_COLOR: Record<string, string> = {
  BACKLOG: "#6b7280", TODO: "hsl(348,100%,52%)", DOING: "#f59e0b", DONE: "#10b981", CLOSED: "#6b7280",
};
const PRIORITY_COLOR: Record<string, string> = {
  LOW: "#6b7280", MEDIUM: "hsl(348,100%,52%)", HIGH: "#f59e0b", CRITICAL: "#ef4444",
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

    const screenshotHtml = task.screenshotUrl
      ? `<div class="pb-screenshot-wrap">
           <img class="pb-screenshot-preview pb-screenshot-task" src="${task.screenshotUrl}" alt="Screenshot" />
           <button class="pb-screenshot-expand" id="pb-tp-expand" title="View full screenshot">
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
               <polyline points="15 3 21 3 21 9"></polyline>
               <polyline points="9 21 3 21 3 15"></polyline>
               <line x1="21" y1="3" x2="14" y2="10"></line>
               <line x1="3" y1="21" x2="10" y2="14"></line>
             </svg>
           </button>
         </div>`
      : "";

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
      ${screenshotHtml}
      ${task.guestName ? `<p style="font-size:12px;color:#6b7280;margin:0 0 12px">Reported by <strong>${task.guestName}</strong></p>` : ""}
      <a href="${apiUrl}/projects/${projectId}?task=${task.id}" target="_blank" rel="noopener noreferrer"
         style="display:block;text-align:center;background:hsl(348,100%,52%);color:white;border-radius:6px;padding:8px;font-size:13px;font-weight:600;text-decoration:none">
        View in board →
      </a>
    `;

    overlay.appendChild(card);
    this.shadow.appendChild(overlay);
    this.overlay = overlay;

    this.shadow.getElementById("pb-tpanel-close")?.addEventListener("click", () => this.close());
    overlay.addEventListener("click", (e) => { if (e.target === overlay) this.close(); });

    // Expand screenshot to lightbox
    if (task.screenshotUrl) {
      this.shadow.getElementById("pb-tp-expand")?.addEventListener("click", () => {
        this.openLightbox(task.screenshotUrl!);
      });
    }
  }

  private openLightbox(src: string) {
    const lb = document.createElement("div");
    lb.className = "pb-lightbox";
    const img = document.createElement("img");
    img.className = "pb-lightbox-img";
    img.src = src;
    const closeBtn = document.createElement("button");
    closeBtn.className = "pb-lightbox-close";
    closeBtn.innerHTML = "&#x2715;";
    closeBtn.addEventListener("click", () => lb.remove());
    lb.addEventListener("click", (e) => { if (e.target === lb) lb.remove(); });
    lb.appendChild(closeBtn);
    lb.appendChild(img);
    this.shadow.appendChild(lb);
  }

  close() {
    this.overlay?.remove();
    this.overlay = null;
  }
}
