import type { EmbedTask } from "../core/PunchBug";

const PRIORITY_COLOR: Record<string, string> = {
  LOW: "#64748b", MEDIUM: "#f59e0b", HIGH: "#f97316", CRITICAL: "#ef4444",
};

interface Comment {
  id: string;
  body: string;
  authorName: string;
  createdAt: string;
}

interface FullTask {
  id: string;
  taskNumber: number;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  columnName: string | null;
  projectSlug: string | null;
  screenshotUrl: string | null;
  pageUrl: string | null;
  guestName: string | null;
  creatorName: string | null;
  assigneeName: string | null;
  createdAt: string;
  browserName: string | null;
  browserVersion: string | null;
  osName: string | null;
  osVersion: string | null;
  deviceType: string | null;
  screenWidth: number | null;
  screenHeight: number | null;
  domSelector: string | null;
  comments: Comment[];
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

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
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
      <span style="font-size:12px;font-family:monospace;color:var(--pb-text-muted)">#${task.taskNumber}</span>
      <button class="pb-close-btn" id="pb-tpanel-close">&#x2715;</button>
    `;

    // Body — skeleton while loading
    const body = document.createElement("div");
    body.className = "pb-panel-body";
    body.innerHTML = `
      <div class="pb-skeleton" style="height:24px;width:65%"></div>
      <div class="pb-meta-grid">
        <div class="pb-skeleton" style="height:56px;border-radius:6px"></div>
        <div class="pb-skeleton" style="height:56px;border-radius:6px"></div>
        <div class="pb-skeleton" style="height:56px;border-radius:6px"></div>
      </div>
      <div>
        <div class="pb-skeleton" style="height:12px;width:80px;margin-bottom:8px"></div>
        <div class="pb-skeleton" style="height:16px;width:100%"></div>
      </div>
      <div class="pb-skeleton" style="height:180px;border-radius:6px"></div>
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
      .then((full: FullTask) => this.renderFull(body, full, projectId, apiUrl, embedKey))
      .catch(() => this.renderBasic(body, task, projectId, apiUrl));
  }

  private renderFull(body: HTMLElement, task: FullTask, projectId: string, apiUrl: string, embedKey: string) {
    const pc = PRIORITY_COLOR[task.priority] ?? "#64748b";
    const reporter = task.creatorName || task.guestName || "Guest";
    const boardSlug = task.projectSlug ?? projectId;

    // ── Screenshot ──────────────────────────────────────────────────────────
    const screenshotHtml = task.screenshotUrl ? `
      <div>
        <div class="pb-section-header">
          <p class="pb-section-label" style="margin:0">Screenshot</p>
          <button class="pb-expand-text-btn" id="pb-tp-expand">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11">
              <polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline>
              <line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line>
            </svg>
            Expand
          </button>
        </div>
        <div class="pb-screenshot-wrap" id="pb-tp-sc-wrap" style="margin-top:8px">
          <img class="pb-screenshot-preview" src="${task.screenshotUrl}" alt="Screenshot" />
        </div>
      </div>` : "";

    // ── Environment badges ──────────────────────────────────────────────────
    const envBadges: string[] = [];
    if (task.pageUrl) {
      envBadges.push(`<a href="${task.pageUrl}" target="_blank" rel="noopener noreferrer" style="text-decoration:none">
        <span class="pb-badge-outline">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11" style="flex-shrink:0"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          ${esc(task.pageUrl.replace(/^https?:\/\//, ""))}
        </span>
      </a>`);
    }
    if (task.browserName) {
      envBadges.push(`<span class="pb-badge-outline">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11" style="flex-shrink:0"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
        ${esc(task.browserName)} ${esc(task.browserVersion ?? "")}
      </span>`);
    }
    if (task.osName) {
      envBadges.push(`<span class="pb-badge-outline">${esc(task.osName)} ${esc(task.osVersion ?? "")}</span>`);
    }
    if (task.screenWidth) {
      envBadges.push(`<span class="pb-badge-outline">${task.screenWidth}×${task.screenHeight}</span>`);
    }
    if (task.deviceType) {
      envBadges.push(`<span class="pb-badge-outline">${esc(task.deviceType)}</span>`);
    }
    const envHtml = envBadges.length ? `
      <div>
        <p class="pb-section-label">Environment</p>
        <div class="pb-env-row">${envBadges.join("")}</div>
      </div>` : "";

    // ── DOM selector ────────────────────────────────────────────────────────
    const selectorHtml = task.domSelector ? `
      <div>
        <p class="pb-section-label">Element</p>
        <code class="pb-code">${esc(task.domSelector)}</code>
      </div>` : "";

    // ── Comments ────────────────────────────────────────────────────────────
    const renderComments = (comments: Comment[]) =>
      comments.length
        ? comments.map((c) => `
            <div class="pb-comment">
              <div class="pb-comment-meta">
                <span class="pb-comment-author">${esc(c.authorName)}</span>
                <span class="pb-comment-date">${timeAgo(c.createdAt)}</span>
              </div>
              <p class="pb-comment-body">${esc(c.body)}</p>
            </div>`).join("")
        : `<p class="pb-no-comments">No comments yet.</p>`;

    body.innerHTML = `
      <!-- Title -->
      <h2 style="font-size:17px;font-weight:600;color:var(--pb-text);margin:0;line-height:1.4">${esc(task.title)}</h2>

      <!-- Column | Priority | Assignees — 3-col grid matching dashboard -->
      <div class="pb-meta-grid">
        <div class="pb-meta-col">
          <p class="pb-section-label">Column</p>
          <span class="pb-meta-value">${task.columnName ? esc(task.columnName) : "—"}</span>
        </div>
        <div class="pb-meta-col">
          <p class="pb-section-label">Priority</p>
          <span class="pb-badge" style="background:${pc}22;color:${pc};border-color:${pc}44">${task.priority}</span>
        </div>
        <div class="pb-meta-col">
          <p class="pb-section-label">Assignees</p>
          <span class="pb-meta-value">${task.assigneeName ? esc(task.assigneeName) : "Unassigned"}</span>
        </div>
      </div>

      <!-- Description -->
      ${task.description ? `
      <div>
        <p class="pb-section-label">Description</p>
        <p style="font-size:13px;color:var(--pb-text);line-height:1.6;margin:0;white-space:pre-wrap">${esc(task.description)}</p>
      </div>` : ""}

      <!-- Reported by -->
      <div>
        <p class="pb-section-label">Reported by</p>
        <p style="font-size:13px;font-weight:500;color:var(--pb-text);margin:0">${esc(reporter)}</p>
        <p style="font-size:11px;color:var(--pb-text-muted);margin:3px 0 0">${timeAgo(task.createdAt)}</p>
      </div>

      <!-- Screenshot -->
      ${screenshotHtml}

      <!-- Environment -->
      ${envHtml}

      <!-- Element -->
      ${selectorHtml}

      <!-- Comments -->
      <div>
        <p class="pb-section-label" id="pb-comments-label">Comments (${task.comments.length})</p>
        <div class="pb-comments-list" id="pb-comments-list">${renderComments(task.comments)}</div>

        <!-- Comment form -->
        <div class="pb-comment-form" id="pb-comment-form">
          <textarea
            class="pb-comment-textarea"
            id="pb-comment-input"
            placeholder="Add a comment…"
            rows="3"
          ></textarea>
          <div class="pb-comment-actions">
            <button class="pb-post-btn" id="pb-post-comment">Post comment</button>
          </div>
        </div>
      </div>

      <!-- View in board -->
      <a class="pb-view-board-btn"
         href="${apiUrl}/projects/${boardSlug}?task=${task.taskNumber}"
         target="_blank" rel="noopener noreferrer">
        View in board →
      </a>
    `;

    // Wire up screenshot expand
    if (task.screenshotUrl) {
      this.shadow.getElementById("pb-tp-expand")?.addEventListener("click", (e) => {
        e.stopPropagation();
        this.openLightbox(task.screenshotUrl!);
      });
      this.shadow.getElementById("pb-tp-sc-wrap")?.addEventListener("click", () => {
        this.openLightbox(task.screenshotUrl!);
      });
    }

    // Wire up comment posting
    const commentInput = this.shadow.getElementById("pb-comment-input") as HTMLTextAreaElement | null;
    const postBtn = this.shadow.getElementById("pb-post-comment") as HTMLButtonElement | null;
    const commentsList = this.shadow.getElementById("pb-comments-list");
    const commentsLabel = this.shadow.getElementById("pb-comments-label");
    let commentCount = task.comments.length;

    postBtn?.addEventListener("click", async () => {
      const text = commentInput?.value.trim();
      if (!text || !commentInput) return;
      postBtn.disabled = true;
      postBtn.textContent = "Posting…";
      try {
        const res = await fetch(
          `${apiUrl}/api/embed/task/${task.id}/comments?key=${encodeURIComponent(embedKey)}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ body: text, guestName: reporter }),
          }
        );
        if (!res.ok) throw new Error();
        const newComment: Comment = await res.json();
        commentInput.value = "";
        commentCount++;
        if (commentsLabel) commentsLabel.textContent = `Comments (${commentCount})`;
        if (commentsList) {
          // Remove "No comments yet" if present
          const noComments = commentsList.querySelector(".pb-no-comments");
          if (noComments) noComments.remove();
          const div = document.createElement("div");
          div.className = "pb-comment";
          div.innerHTML = `
            <div class="pb-comment-meta">
              <span class="pb-comment-author">${esc(newComment.authorName)}</span>
              <span class="pb-comment-date">just now</span>
            </div>
            <p class="pb-comment-body">${esc(newComment.body)}</p>
          `;
          commentsList.appendChild(div);
        }
      } catch {
        // silently fail — keep text in input
      } finally {
        postBtn.disabled = false;
        postBtn.textContent = "Post comment";
      }
    });
  }

  private renderBasic(body: HTMLElement, task: EmbedTask, projectId: string, apiUrl: string) {
    const pc = PRIORITY_COLOR[task.priority] ?? "#64748b";
    body.innerHTML = `
      <h2 style="font-size:17px;font-weight:600;color:var(--pb-text);margin:0">${esc(task.title)}</h2>
      <div class="pb-meta-grid">
        <div class="pb-meta-col">
          <p class="pb-section-label">Priority</p>
          <span class="pb-badge" style="background:${pc}22;color:${pc};border-color:${pc}44">${task.priority}</span>
        </div>
      </div>
      ${task.guestName ? `
      <div>
        <p class="pb-section-label">Reported by</p>
        <p style="font-size:13px;color:var(--pb-text);margin:0">${esc(task.guestName)}</p>
      </div>` : ""}
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
