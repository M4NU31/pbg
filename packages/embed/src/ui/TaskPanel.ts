import type { EmbedTask } from "../core/PunchBug";

const PRIORITY_COLOR: Record<string, string> = {
  LOW: "#64748b", MEDIUM: "#f59e0b", HIGH: "#f97316", CRITICAL: "#ef4444",
};
const PRIORITY_OPTIONS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

interface Column { id: string; name: string; }
interface Member { id: string; name: string | null; }
interface Comment { id: string; body: string; authorName: string; createdAt: string; }

interface FullTask {
  id: string;
  taskNumber: number;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  columnId: string | null;
  columnName: string | null;
  projectSlug: string | null;
  screenshotUrl: string | null;
  pageUrl: string | null;
  guestName: string | null;
  creatorName: string | null;
  assigneeId: string | null;
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
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
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

    const header = document.createElement("div");
    header.className = "pb-panel-header";
    header.innerHTML = `
      <span style="font-size:12px;font-family:monospace;color:var(--pb-text-muted)">#${task.taskNumber}</span>
      <button class="pb-close-btn" id="pb-tpanel-close">&#x2715;</button>
    `;

    const body = document.createElement("div");
    body.className = "pb-panel-body";
    body.innerHTML = `
      <div class="pb-skeleton" style="height:24px;width:65%"></div>
      <div class="pb-meta-grid">
        <div class="pb-skeleton" style="height:56px;border-radius:6px"></div>
        <div class="pb-skeleton" style="height:56px;border-radius:6px"></div>
        <div class="pb-skeleton" style="height:56px;border-radius:6px"></div>
      </div>
      <div class="pb-skeleton" style="height:40px;border-radius:6px"></div>
      <div class="pb-skeleton" style="height:180px;border-radius:6px"></div>
    `;

    panel.appendChild(header);
    panel.appendChild(body);
    overlay.appendChild(panel);
    this.shadow.appendChild(overlay);
    this.overlay = overlay;

    this.shadow.getElementById("pb-tpanel-close")?.addEventListener("click", () => this.close());
    overlay.addEventListener("click", (e) => { if (e.target === overlay) this.close(); });

    // Fetch task + columns + members in parallel
    Promise.all([
      fetch(`${apiUrl}/api/embed/task/${task.id}?key=${encodeURIComponent(embedKey)}`).then(r => r.ok ? r.json() : Promise.reject()),
      fetch(`${apiUrl}/api/embed/columns?key=${encodeURIComponent(embedKey)}`).then(r => r.ok ? r.json() : []),
      fetch(`${apiUrl}/api/embed/members?key=${encodeURIComponent(embedKey)}`).then(r => r.ok ? r.json() : []),
    ])
      .then(([full, columns, members]: [FullTask, Column[], Member[]]) => {
        this.renderFull(body, full, columns, members, projectId, apiUrl, embedKey);
      })
      .catch(() => this.renderBasic(body, task, projectId, apiUrl));
  }

  private async patch(apiUrl: string, taskId: string, embedKey: string, data: Record<string, unknown>) {
    return fetch(`${apiUrl}/api/embed/task/${taskId}?key=${encodeURIComponent(embedKey)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  private renderFull(
    body: HTMLElement,
    task: FullTask,
    columns: Column[],
    members: Member[],
    projectId: string,
    apiUrl: string,
    embedKey: string
  ) {
    const reporter = task.creatorName || task.guestName || "Guest";
    const boardSlug = task.projectSlug ?? projectId;

    // ── Column select options ───────────────────────────────────────────────
    const colOptions = columns
      .map(c => `<option value="${esc(c.id)}"${c.id === task.columnId ? " selected" : ""}>${esc(c.name)}</option>`)
      .join("");

    // ── Priority select options ─────────────────────────────────────────────
    const priOptions = PRIORITY_OPTIONS
      .map(p => `<option value="${p}"${p === task.priority ? " selected" : ""}>${p}</option>`)
      .join("");

    // ── Assignee select options ─────────────────────────────────────────────
    const assigneeOptions = [
      `<option value=""${!task.assigneeId ? " selected" : ""}>Unassigned</option>`,
      ...members.map(m => `<option value="${esc(m.id)}"${m.id === task.assigneeId ? " selected" : ""}>${esc(m.name ?? m.id)}</option>`),
    ].join("");

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
      envBadges.push(`<a href="${task.pageUrl}" target="_blank" rel="noopener noreferrer" style="text-decoration:none"><span class="pb-badge-outline"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11" style="flex-shrink:0"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>${esc(task.pageUrl.replace(/^https?:\/\//, ""))}</span></a>`);
    }
    if (task.browserName) {
      envBadges.push(`<span class="pb-badge-outline"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11" style="flex-shrink:0"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>${esc(task.browserName)} ${esc(task.browserVersion ?? "")}</span>`);
    }
    if (task.osName) envBadges.push(`<span class="pb-badge-outline">${esc(task.osName)} ${esc(task.osVersion ?? "")}</span>`);
    if (task.screenWidth) envBadges.push(`<span class="pb-badge-outline">${task.screenWidth}×${task.screenHeight}</span>`);
    if (task.deviceType) envBadges.push(`<span class="pb-badge-outline">${esc(task.deviceType)}</span>`);
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

    // ── Comments list ───────────────────────────────────────────────────────
    const renderComments = (comments: Comment[]) =>
      comments.length
        ? comments.map(c => `
            <div class="pb-comment">
              <div class="pb-comment-meta">
                <span class="pb-comment-author">${esc(c.authorName)}</span>
                <span class="pb-comment-date">${timeAgo(c.createdAt)}</span>
              </div>
              <p class="pb-comment-body">${esc(c.body)}</p>
            </div>`).join("")
        : `<p class="pb-no-comments">No comments yet.</p>`;

    // ── Build HTML ──────────────────────────────────────────────────────────
    body.innerHTML = `
      <!-- Title (click-to-edit) -->
      <div id="pb-title-wrap">
        <h2 class="pb-title-display" id="pb-title-display">${esc(task.title)}</h2>
      </div>

      <!-- Column / Priority / Assignees -->
      <div class="pb-meta-grid">
        <div class="pb-meta-col">
          <label class="pb-section-label" style="margin-bottom:4px">Column</label>
          <select class="pb-select" id="pb-col-select">${colOptions}</select>
        </div>
        <div class="pb-meta-col">
          <label class="pb-section-label" style="margin-bottom:4px">Priority</label>
          <select class="pb-select" id="pb-pri-select">${priOptions}</select>
        </div>
        <div class="pb-meta-col">
          <label class="pb-section-label" style="margin-bottom:4px">Assignees</label>
          <select class="pb-select" id="pb-assignee-select">${assigneeOptions}</select>
        </div>
      </div>

      <!-- Description (click-to-edit) -->
      <div>
        <p class="pb-section-label">Description</p>
        <div id="pb-desc-wrap">
          <div class="pb-desc-display" id="pb-desc-display">
            ${task.description ? esc(task.description) : '<span class="pb-desc-placeholder">Click to add a description\u2026</span>'}
          </div>
        </div>
      </div>

      <!-- Reported by -->
      <div>
        <p class="pb-section-label">Reported by</p>
        <p style="font-size:13px;font-weight:500;color:var(--pb-text);margin:0">${esc(reporter)}</p>
        <p style="font-size:11px;color:var(--pb-text-muted);margin:3px 0 0">${timeAgo(task.createdAt)}</p>
      </div>

      ${screenshotHtml}
      ${envHtml}
      ${selectorHtml}

      <!-- Comments -->
      <div>
        <p class="pb-section-label" id="pb-comments-label">Comments (${task.comments.length})</p>
        <div class="pb-comments-list" id="pb-comments-list">${renderComments(task.comments)}</div>
        <div class="pb-comment-form">
          <textarea class="pb-comment-textarea" id="pb-comment-input" placeholder="Add a comment\u2026" rows="3"></textarea>
          <div class="pb-comment-actions">
            <button class="pb-post-btn" id="pb-post-comment">Post comment</button>
          </div>
        </div>
      </div>

      <!-- View in board -->
      <a class="pb-view-board-btn"
         href="${apiUrl}/projects/${boardSlug}?task=${task.taskNumber}"
         target="_blank" rel="noopener noreferrer">
        View in board \u2192
      </a>
    `;

    // ── Wire up: title inline edit ──────────────────────────────────────────
    const titleDisplay = this.shadow.getElementById("pb-title-display") as HTMLElement;
    const titleWrap = this.shadow.getElementById("pb-title-wrap") as HTMLElement;
    let currentTitle = task.title;

    titleDisplay.addEventListener("click", () => {
      const input = document.createElement("input");
      input.type = "text";
      input.className = "pb-title-input";
      input.value = currentTitle;
      titleWrap.replaceChildren(input);
      input.focus();

      const save = async () => {
        const val = input.value.trim() || currentTitle;
        currentTitle = val;
        const h2 = document.createElement("h2");
        h2.className = "pb-title-display";
        h2.id = "pb-title-display";
        h2.textContent = val;
        titleWrap.replaceChildren(h2);
        h2.addEventListener("click", () => save()); // re-bind via closure won't work cleanly — use direct re-attach
        if (val !== task.title) await this.patch(apiUrl, task.id, embedKey, { title: val });
      };
      input.addEventListener("blur", save);
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") { e.preventDefault(); input.blur(); }
        if (e.key === "Escape") { input.value = currentTitle; input.blur(); }
      });
    });

    // ── Wire up: description inline edit ───────────────────────────────────
    const descDisplay = this.shadow.getElementById("pb-desc-display") as HTMLElement;
    const descWrap = this.shadow.getElementById("pb-desc-wrap") as HTMLElement;
    let currentDesc = task.description ?? "";

    descDisplay.addEventListener("click", () => {
      const ta = document.createElement("textarea");
      ta.className = "pb-desc-textarea";
      ta.value = currentDesc;
      ta.rows = 4;
      descWrap.replaceChildren(ta);
      ta.focus();

      const save = async () => {
        const val = ta.value;
        currentDesc = val;
        const div = document.createElement("div");
        div.className = "pb-desc-display";
        div.id = "pb-desc-display";
        if (val) {
          div.style.whiteSpace = "pre-wrap";
          div.textContent = val;
        } else {
          div.innerHTML = '<span class="pb-desc-placeholder">Click to add a description\u2026</span>';
        }
        descWrap.replaceChildren(div);
        div.addEventListener("click", () => descDisplay.click());
        if (val !== (task.description ?? "")) await this.patch(apiUrl, task.id, embedKey, { description: val || null });
      };
      ta.addEventListener("blur", save);
      ta.addEventListener("keydown", (e) => {
        if (e.key === "Escape") { ta.value = currentDesc; ta.blur(); }
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) ta.blur();
      });
    });

    // ── Wire up: column select ──────────────────────────────────────────────
    this.shadow.getElementById("pb-col-select")?.addEventListener("change", (e) => {
      const val = (e.target as HTMLSelectElement).value;
      this.patch(apiUrl, task.id, embedKey, { columnId: val || null });
    });

    // ── Wire up: priority select ────────────────────────────────────────────
    this.shadow.getElementById("pb-pri-select")?.addEventListener("change", (e) => {
      const val = (e.target as HTMLSelectElement).value;
      this.patch(apiUrl, task.id, embedKey, { priority: val });
    });

    // ── Wire up: assignee select ────────────────────────────────────────────
    this.shadow.getElementById("pb-assignee-select")?.addEventListener("change", (e) => {
      const val = (e.target as HTMLSelectElement).value;
      this.patch(apiUrl, task.id, embedKey, { assigneeId: val || null });
    });

    // ── Wire up: screenshot expand ──────────────────────────────────────────
    if (task.screenshotUrl) {
      this.shadow.getElementById("pb-tp-expand")?.addEventListener("click", (e) => {
        e.stopPropagation();
        this.openLightbox(task.screenshotUrl!);
      });
      this.shadow.getElementById("pb-tp-sc-wrap")?.addEventListener("click", () => {
        this.openLightbox(task.screenshotUrl!);
      });
    }

    // ── Wire up: comment posting ────────────────────────────────────────────
    const commentInput = this.shadow.getElementById("pb-comment-input") as HTMLTextAreaElement | null;
    const postBtn = this.shadow.getElementById("pb-post-comment") as HTMLButtonElement | null;
    const commentsList = this.shadow.getElementById("pb-comments-list");
    const commentsLabel = this.shadow.getElementById("pb-comments-label");
    let commentCount = task.comments.length;

    postBtn?.addEventListener("click", async () => {
      const text = commentInput?.value.trim();
      if (!text || !commentInput) return;
      postBtn.disabled = true;
      postBtn.textContent = "Posting\u2026";
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
      } catch { /* keep text */ } finally {
        postBtn.disabled = false;
        postBtn.textContent = "Post comment";
      }
    });
  }

  private renderBasic(body: HTMLElement, task: EmbedTask, projectId: string, apiUrl: string) {
    const pc = PRIORITY_COLOR[task.priority] ?? "#64748b";
    body.innerHTML = `
      <h2 class="pb-title-display" style="cursor:default">${esc(task.title)}</h2>
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
      <a class="pb-view-board-btn" href="${apiUrl}/projects/${projectId}?task=${task.id}" target="_blank" rel="noopener noreferrer">View in board \u2192</a>
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
