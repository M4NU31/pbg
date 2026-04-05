import type { EmbedTask } from "../core/PunchBug";

const STATUS_COLOR: Record<string, string> = {
  BACKLOG: "#64748b", TODO: "hsl(348,100%,52%)", DOING: "#f59e0b", DONE: "#10b981", CLOSED: "#475569",
};
const PRIORITY_COLOR: Record<string, string> = {
  LOW: "#64748b", MEDIUM: "#f59e0b", HIGH: "#f97316", CRITICAL: "#ef4444",
};

interface FullTask {
  id: string;
  taskNumber: number;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  columnName: string | null;
  screenshotUrl: string | null;
  pageUrl: string | null;
  guestName: string | null;
  createdAt: string;
  browserName: string | null;
  browserVersion: string | null;
  osName: string | null;
  osVersion: string | null;
  deviceType: string | null;
  screenWidth: number | null;
  screenHeight: number | null;
  domSelector: string | null;
  comments: { id: string; body: string; authorName: string; createdAt: string }[];
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export class TaskPanel {
  private shadow: ShadowRoot;
  private overlay: HTMLElement | null = null;

  constructor(shadow: ShadowRoot) {
    this.shadow = shadow;
  }

  show(task: EmbedTask, projectId: string, apiUrl: string, embedKey: string) {
    this.close();

    const overlay = document.createElement("div");
    overlay.className = "pb-overlay";

    const panel = document.createElement("div");
    panel.className = "pb-panel";

    // Header
    const header = document.createElement("div");
    header.className = "pb-panel-header";
    header.innerHTML = `
      <span style="font-size:12px;font-weight:700;color:#475569;letter-spacing:0.05em">#${task.taskNumber}</span>
      <button class="pb-close-btn" id="pb-tpanel-close">&#x2715;</button>
    `;

    // Body — skeleton while loading
    const body = document.createElement("div");
    body.className = "pb-panel-body";
    body.innerHTML = `
      <div class="pb-skeleton" style="height:22px;width:70%"></div>
      <div style="display:flex;gap:8px">
        <div class="pb-skeleton" style="height:20px;width:80px;border-radius:9999px"></div>
        <div class="pb-skeleton" style="height:20px;width:80px;border-radius:9999px"></div>
      </div>
      <div class="pb-skeleton" style="height:180px;border-radius:8px"></div>
    `;

    panel.appendChild(header);
    panel.appendChild(body);
    overlay.appendChild(panel);
    this.shadow.appendChild(overlay);
    this.overlay = overlay;

    this.shadow.getElementById("pb-tpanel-close")?.addEventListener("click", () => this.close());
    overlay.addEventListener("click", (e) => { if (e.target === overlay) this.close(); });

    // Fetch full task detail
    fetch(`${apiUrl}/api/embed/task/${task.id}?key=${encodeURIComponent(embedKey)}`)
      .then((r) => r.ok ? r.json() : Promise.reject(r.status))
      .then((full: FullTask) => this.renderFull(body, full, projectId, apiUrl))
      .catch(() => {
        // Fallback to basic info if fetch fails
        this.renderBasic(body, task, projectId, apiUrl);
      });
  }

  private renderFull(body: HTMLElement, task: FullTask, projectId: string, apiUrl: string) {
    const sc = STATUS_COLOR[task.status]   ?? "#64748b";
    const pc = PRIORITY_COLOR[task.priority] ?? "#64748b";

    const screenshotHtml = task.screenshotUrl
      ? `<div>
           <div class="pb-section-label">Screenshot</div>
           <div class="pb-screenshot-wrap" id="pb-tp-sc-wrap">
             <img class="pb-screenshot-preview" src="${task.screenshotUrl}" alt="Screenshot" id="pb-tp-sc-img" />
             <button class="pb-screenshot-expand" id="pb-tp-expand" title="View full screenshot">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                 <polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline>
                 <line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line>
               </svg>
             </button>
           </div>
         </div>`
      : "";

    const envHtml = (task.browserName || task.pageUrl)
      ? `<div>
           <div class="pb-section-label">Environment</div>
           <div class="pb-info-box">
             ${task.pageUrl ? `<div class="pb-info-row"><span class="pb-info-icon">&#127760;</span><span class="pb-info-val">${task.pageUrl}</span></div>` : ""}
             ${task.browserName ? `<div class="pb-info-row"><span class="pb-info-icon">&#128187;</span><span class="pb-info-val">${task.browserName} ${task.browserVersion ?? ""} &bull; ${task.osName ?? ""} ${task.osVersion ?? ""} &bull; ${task.screenWidth ?? "?"}&#xd7;${task.screenHeight ?? "?"} &bull; ${task.deviceType ?? ""}</span></div>` : ""}
             ${task.domSelector ? `<div class="pb-info-row"><span class="pb-info-icon">&#128279;</span><code style="font-size:11px;color:#94a3b8">${task.domSelector}</code></div>` : ""}
           </div>
         </div>`
      : "";

    const commentsHtml = task.comments.length > 0
      ? task.comments.map((c) => `
          <div class="pb-comment">
            <div class="pb-comment-author">${c.authorName}</div>
            <div class="pb-comment-body">${c.body.replace(/</g, "&lt;")}</div>
            <div class="pb-comment-date">${timeAgo(c.createdAt)}</div>
          </div>`).join("")
      : `<p class="pb-no-comments">No comments yet.</p>`;

    body.innerHTML = `
      <!-- Title -->
      <h2 style="font-size:16px;font-weight:700;color:#f1f5f9;margin:0;line-height:1.4">${task.title}</h2>

      <!-- Badges -->
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${task.columnName ? `<span style="font-size:11px;font-weight:600;padding:3px 10px;border-radius:9999px;background:#1e293b;color:#94a3b8;border:1px solid #334155">${task.columnName}</span>` : ""}
        <span class="pb-badge" style="background:${sc}22;color:${sc};border-color:${sc}44">${task.status}</span>
        <span class="pb-badge" style="background:${pc}22;color:${pc};border-color:${pc}44">${task.priority}</span>
      </div>

      <!-- Description -->
      ${task.description ? `<div>
        <div class="pb-section-label">Description</div>
        <p style="font-size:13px;color:#cbd5e1;line-height:1.6;margin:0;white-space:pre-wrap">${task.description.replace(/</g, "&lt;")}</p>
      </div>` : ""}

      <!-- Reporter -->
      ${task.guestName ? `<div style="font-size:12px;color:#64748b">
        Reported by <strong style="color:#94a3b8">${task.guestName}</strong> &bull; ${timeAgo(task.createdAt)}
      </div>` : ""}

      <!-- Screenshot -->
      ${screenshotHtml}

      <!-- Environment -->
      ${envHtml}

      <!-- Comments -->
      <div>
        <div class="pb-section-label">Comments (${task.comments.length})</div>
        <div style="display:flex;flex-direction:column;gap:8px">${commentsHtml}</div>
      </div>

      <!-- View in board -->
      <a class="pb-view-board-btn"
         href="${apiUrl}/projects/${projectId}?task=${task.id}"
         target="_blank" rel="noopener noreferrer">
        View in board →
      </a>
    `;

    // Expand screenshot
    if (task.screenshotUrl) {
      this.shadow.getElementById("pb-tp-expand")?.addEventListener("click", () => {
        this.openLightbox(task.screenshotUrl!);
      });
    }
  }

  private renderBasic(body: HTMLElement, task: EmbedTask, projectId: string, apiUrl: string) {
    const sc = STATUS_COLOR[task.status]   ?? "#64748b";
    const pc = PRIORITY_COLOR[task.priority] ?? "#64748b";

    body.innerHTML = `
      <h2 style="font-size:16px;font-weight:700;color:#f1f5f9;margin:0">${task.title}</h2>
      <div style="display:flex;gap:8px">
        <span class="pb-badge" style="background:${sc}22;color:${sc};border-color:${sc}44">${task.status}</span>
        <span class="pb-badge" style="background:${pc}22;color:${pc};border-color:${pc}44">${task.priority}</span>
      </div>
      ${task.guestName ? `<p style="font-size:12px;color:#64748b;margin:0">Reported by <strong style="color:#94a3b8">${task.guestName}</strong></p>` : ""}
      <a class="pb-view-board-btn"
         href="${apiUrl}/projects/${projectId}?task=${task.id}"
         target="_blank" rel="noopener noreferrer">
        View in board →
      </a>
    `;
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
