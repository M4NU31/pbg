import { DomInfo } from "../capture/domInfo";
import { BrowserMeta } from "../capture/browserMeta";
import { BoardColumn, EmbedTag } from "../core/PunchBug";
import { submitReport } from "../api/reporter";

interface FormOptions {
  domInfo: DomInfo;
  browserMeta: BrowserMeta;
  pageUrl: string;
  pinX: number;
  pinY: number;
  embedKey: string;
  apiUrl: string;
  columns: BoardColumn[];
  tags: EmbedTag[];
  reporterName?: string;
  onSuccess?: () => void;
  onClose?: () => void;
}

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;

export class ReportForm {
  private shadow: ShadowRoot;
  private overlay: HTMLElement;
  private screenshotFull = "";
  private opts: FormOptions;

  constructor(shadow: ShadowRoot, opts: FormOptions) {
    this.shadow = shadow;
    this.opts   = opts;
    this.overlay = this.render(opts);
  }

  setScreenshot(full: string, thumb?: string) {
    this.screenshotFull = full;

    const loader  = this.shadow.getElementById("pb-sc-loader");
    const wrap    = this.shadow.getElementById("pb-sc-wrap") as HTMLElement | null;
    const preview = this.shadow.getElementById("pb-sc-img")  as HTMLImageElement | null;

    if (!full) { loader?.remove(); return; }

    const displaySrc = thumb || full;
    if (preview) preview.src = displaySrc;
    if (loader) loader.style.display = "none";
    if (wrap)   wrap.style.display   = "block";

    if (full) {
      this.shadow.getElementById("pb-sc-expand")?.addEventListener("click", () => {
        this.openLightbox(full);
      });
    }
  }

  private render(opts: FormOptions): HTMLElement {
    const overlay = document.createElement("div");
    overlay.className = "pb-overlay";

    const panel = document.createElement("div");
    panel.className = "pb-panel";

    // ── Header ──────────────────────────────────────────────────────────────
    const header = document.createElement("div");
    header.className = "pb-panel-header";
    header.innerHTML = `
      <h2 class="pb-panel-title">Report a Task</h2>
      <button class="pb-close-btn" id="pb-close">&#x2715;</button>
    `;

    // ── Body ─────────────────────────────────────────────────────────────────
    const body = document.createElement("div");
    body.className = "pb-panel-body";

    const columnSelect = opts.columns.length > 0
      ? `<div class="pb-field">
           <label class="pb-label" for="pb-column">Column</label>
           <select class="pb-input" id="pb-column">
             ${opts.columns.map((c) => `<option value="${c.id}">${c.name}</option>`).join("")}
           </select>
         </div>`
      : "";

    const tagSelect = opts.tags.length > 0
      ? `<div class="pb-field">
           <label class="pb-label">Tags</label>
           <div class="pb-tags-grid" id="pb-tags">
             ${opts.tags.map((t) => `
               <label class="pb-tag-option">
                 <input type="checkbox" class="pb-tag-cb" value="${t.id}" style="display:none" />
                 <span class="pb-tag-pill" data-tag-id="${t.id}"
                       style="background:${t.color}22;color:${t.color};border:1px solid ${t.color}55">
                   ${t.name}
                 </span>
               </label>`).join("")}
           </div>
         </div>`
      : "";

    body.innerHTML = `
      <!-- Screenshot loader -->
      <div id="pb-sc-loader" class="pb-sc-loader">
        <span class="pb-sc-spinner"></span>
        <span>Capturing screenshot…</span>
      </div>
      <div id="pb-sc-wrap" style="display:none">
        <div class="pb-screenshot-wrap">
          <img id="pb-sc-img" class="pb-screenshot-preview" alt="Screenshot" />
          <button class="pb-screenshot-expand" id="pb-sc-expand" title="View full screenshot">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
              <polyline points="15 3 21 3 21 9"></polyline>
              <polyline points="9 21 3 21 3 15"></polyline>
              <line x1="21" y1="3" x2="14" y2="10"></line>
              <line x1="3" y1="21" x2="10" y2="14"></line>
            </svg>
          </button>
        </div>
      </div>

      <!-- Environment info -->
      <div class="pb-info-box">
        <div class="pb-info-row">
          <span class="pb-info-icon">&#127760;</span>
          <span class="pb-info-val" style="word-break:break-all">${opts.pageUrl}</span>
        </div>
        <div class="pb-info-row">
          <span class="pb-info-icon">&#128187;</span>
          <span class="pb-info-val">${opts.browserMeta.browserName} ${opts.browserMeta.browserVersion} &bull; ${opts.browserMeta.osName} &bull; ${opts.browserMeta.screenWidth}&#xd7;${opts.browserMeta.screenHeight}</span>
        </div>
        <div class="pb-info-row">
          <span class="pb-info-icon">&#128279;</span>
          <code style="font-size:11px;color:#94a3b8">${opts.domInfo.selector}</code>
        </div>
      </div>

      <!-- Form fields -->
      <div id="pb-report-form">
        <div class="pb-field">
          <label class="pb-label" for="pb-title">What happened? <span style="color:hsl(348,100%,52%)">*</span></label>
          <input class="pb-input" id="pb-title" type="text" placeholder="Button not responding, layout broken…" />
        </div>
        <div class="pb-field">
          <label class="pb-label" for="pb-desc">More details</label>
          <textarea class="pb-textarea" id="pb-desc" placeholder="Steps to reproduce, expected vs actual…"></textarea>
        </div>
        <div class="pb-form-row">
          <div class="pb-field" style="margin-bottom:0">
            <label class="pb-label" for="pb-priority">Priority</label>
            <select class="pb-input" id="pb-priority">
              <option value="LOW">Low</option>
              <option value="MEDIUM" selected>Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
          ${opts.columns.length > 0 ? `<div class="pb-field" style="margin-bottom:0">
            <label class="pb-label" for="pb-column">Column</label>
            <select class="pb-input" id="pb-column">
              ${opts.columns.map((c) => `<option value="${c.id}">${c.name}</option>`).join("")}
            </select>
          </div>` : "<div></div>"}
        </div>
        ${tagSelect}
        <button class="pb-submit-btn" id="pb-submit" style="margin-top:16px">Submit Task</button>
      </div>

      <div id="pb-success" style="display:none" class="pb-success">
        <div class="pb-success-icon">&#127881;</div>
        <div class="pb-success-title">Task reported!</div>
        <p class="pb-success-text">Thanks — the team will look into it.</p>
      </div>
    `;

    panel.appendChild(header);
    panel.appendChild(body);
    overlay.appendChild(panel);
    this.shadow.appendChild(overlay);

    // Close handlers
    const doClose = () => this.close(opts.onClose);
    this.shadow.getElementById("pb-close")?.addEventListener("click", doClose);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) doClose(); });

    // Tag pills
    this.shadow.querySelectorAll<HTMLSpanElement>(".pb-tag-pill").forEach((pill) => {
      pill.style.opacity = "0.55";
      pill.addEventListener("click", () => {
        const cb = this.shadow.querySelector<HTMLInputElement>(`.pb-tag-cb[value="${pill.dataset.tagId}"]`);
        if (!cb) return;
        cb.checked = !cb.checked;
        pill.style.opacity    = cb.checked ? "1"   : "0.55";
        pill.style.fontWeight = cb.checked ? "600" : "400";
      });
    });

    // Submit
    const submitBtn = this.shadow.getElementById("pb-submit") as HTMLButtonElement;
    submitBtn?.addEventListener("click", async () => {
      const title = (this.shadow.getElementById("pb-title") as HTMLInputElement).value.trim();
      if (!title) { (this.shadow.getElementById("pb-title") as HTMLInputElement).focus(); return; }

      const description = (this.shadow.getElementById("pb-desc") as HTMLTextAreaElement).value.trim();
      const priority    = (this.shadow.getElementById("pb-priority") as HTMLSelectElement).value;
      const columnId    = opts.columns.length > 0
        ? (this.shadow.getElementById("pb-column") as HTMLSelectElement).value
        : undefined;
      const tagIds = opts.tags.length > 0
        ? Array.from(this.shadow.querySelectorAll<HTMLInputElement>(".pb-tag-cb:checked")).map((c) => c.value)
        : [];

      submitBtn.disabled    = true;
      submitBtn.textContent = "Submitting…";

      try {
        const isServerUrl = this.screenshotFull.startsWith("http");
        await submitReport(opts.apiUrl, {
          embedKey:      opts.embedKey,
          title,
          description:   description || undefined,
          priority,
          screenshot:    isServerUrl ? undefined           : this.screenshotFull,
          screenshotUrl: isServerUrl ? this.screenshotFull : undefined,
          domSelector:   opts.domInfo.selector,
          domHtml:       opts.domInfo.outerHtml,
          pageUrl:       opts.pageUrl,
          columnId,
          tagIds:        tagIds.length > 0 ? tagIds : undefined,
          reporterName:  opts.reporterName,
          browserMeta:   opts.browserMeta,
          pinX:          opts.pinX,
          pinY:          opts.pinY,
        });

        (this.shadow.getElementById("pb-report-form") as HTMLElement).style.display = "none";
        (this.shadow.getElementById("pb-success")      as HTMLElement).style.display = "block";
        this.shadow.getElementById("pb-sc-loader")?.remove();
        (this.shadow.getElementById("pb-sc-wrap") as HTMLElement | null)?.remove();

        opts.onSuccess?.();
        setTimeout(() => this.close(), 3000);
      } catch (err) {
        submitBtn.disabled    = false;
        submitBtn.textContent = "Submit Task";
        alert("Failed to submit: " + (err instanceof Error ? err.message : "Unknown error"));
      }
    });

    return overlay;
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

  close(onClose?: () => void) {
    this.overlay.remove();
    onClose?.();
  }
}
