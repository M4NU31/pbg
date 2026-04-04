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

export class ReportForm {
  private shadow: ShadowRoot;
  private overlay: HTMLElement;
  /** The full screenshot (data-URL or server URL) set asynchronously */
  private screenshotFull = "";
  private opts: FormOptions;

  constructor(shadow: ShadowRoot, opts: FormOptions) {
    this.shadow = shadow;
    this.opts   = opts;
    this.overlay = this.render(opts);
  }

  // ── Public: inject screenshot after async capture ───────────────────────

  /**
   * Called when the screenshot is ready.
   * `full`  — data-URL or server URL (sent to report API)
   * `thumb` — data-URL for the preview thumbnail (optional; falls back to full)
   */
  setScreenshot(full: string, thumb?: string) {
    this.screenshotFull = full;

    const loader  = this.shadow.getElementById("pb-sc-loader");
    const wrap    = this.shadow.getElementById("pb-sc-wrap") as HTMLElement | null;
    const preview = this.shadow.getElementById("pb-sc-img")  as HTMLImageElement | null;

    if (!full) {
      // Screenshot failed — just hide the loader
      loader?.remove();
      return;
    }

    const displaySrc = thumb || full;
    if (preview) preview.src = displaySrc;

    if (loader) loader.style.display  = "none";
    if (wrap)   wrap.style.display    = "block";

    // Wire expand button now that we have the full image
    if (full) {
      this.shadow.getElementById("pb-sc-expand")?.addEventListener("click", () => {
        this.openLightbox(full);
      });
    }
  }

  // ── Private: render ──────────────────────────────────────────────────────

  private render(opts: FormOptions): HTMLElement {
    const overlay = document.createElement("div");
    overlay.className = "pb-overlay";

    const card = document.createElement("div");
    card.className = "pb-form-card";

    const columnSelect = opts.columns.length > 0
      ? `<div class="pb-field">
           <label class="pb-label" for="pb-column">Add to column</label>
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

    card.innerHTML = `
      <div class="pb-form-header">
        <h2 class="pb-form-title">Report a Task</h2>
        <button class="pb-close-btn" id="pb-close">&#x2715;</button>
      </div>

      <!-- Screenshot area: loader shown first, image injected async -->
      <div id="pb-sc-loader" class="pb-sc-loader">
        <span class="pb-sc-spinner"></span>
        <span style="font-size:12px;color:#9ca3af;margin-left:8px">Capturing screenshot…</span>
      </div>
      <div id="pb-sc-wrap" class="pb-screenshot-wrap" style="display:none">
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

      <div class="pb-info-box">
        <div class="pb-info-row">
          <span>&#127760;</span>
          <span style="word-break:break-all">${opts.pageUrl}</span>
        </div>
        <div class="pb-info-row">
          <span>&#128187;</span>
          <span>${opts.browserMeta.browserName} ${opts.browserMeta.browserVersion}
                &bull; ${opts.browserMeta.osName}
                &bull; ${opts.browserMeta.screenWidth}&#xd7;${opts.browserMeta.screenHeight}</span>
        </div>
        <div class="pb-info-row">
          <span>&#128279;</span>
          <code style="font-size:11px">${opts.domInfo.selector}</code>
        </div>
      </div>

      <div id="pb-report-form">
        <div class="pb-field">
          <label class="pb-label" for="pb-title">What happened? *</label>
          <input class="pb-input" id="pb-title" type="text"
                 placeholder="Button not responding, layout broken, etc." />
        </div>
        <div class="pb-field">
          <label class="pb-label" for="pb-desc">More details</label>
          <textarea class="pb-textarea" id="pb-desc"
                    placeholder="Steps to reproduce, expected vs actual behavior…"></textarea>
        </div>
        ${columnSelect}
        ${tagSelect}
        <button class="pb-submit-btn" id="pb-submit">Submit Task</button>
      </div>

      <div id="pb-success" style="display:none" class="pb-success">
        <div class="pb-success-icon">&#127881;</div>
        <div class="pb-success-title">Task reported!</div>
        <p class="pb-success-text">Thanks — the team will look into it.</p>
      </div>
    `;

    overlay.appendChild(card);
    this.shadow.appendChild(overlay);

    // Close handlers
    const doClose = () => this.close(opts.onClose);
    this.shadow.getElementById("pb-close")?.addEventListener("click", doClose);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) doClose(); });

    // Tag pills
    this.shadow.querySelectorAll<HTMLSpanElement>(".pb-tag-pill").forEach((pill) => {
      pill.style.opacity = "0.55";
      pill.addEventListener("click", () => {
        const cb = this.shadow.querySelector<HTMLInputElement>(
          `.pb-tag-cb[value="${pill.dataset.tagId}"]`
        );
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
      const columnId    = opts.columns.length > 0
        ? (this.shadow.getElementById("pb-column") as HTMLSelectElement).value
        : undefined;
      const tagIds = opts.tags.length > 0
        ? Array.from(this.shadow.querySelectorAll<HTMLInputElement>(".pb-tag-cb:checked")).map((c) => c.value)
        : [];

      submitBtn.disabled   = true;
      submitBtn.textContent = "Submitting…";

      try {
        // If screenshotFull is a server URL (http…), pass it as screenshotUrl.
        // If it's a data-URL (base64), pass it as screenshot for upload.
        const isServerUrl = this.screenshotFull.startsWith("http");
        await submitReport(opts.apiUrl, {
          embedKey:      opts.embedKey,
          title,
          description:   description || undefined,
          screenshot:    isServerUrl ? undefined        : this.screenshotFull,
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
        (this.shadow.getElementById("pb-sc-loader")?.remove());
        (this.shadow.getElementById("pb-sc-wrap") as HTMLElement | null)?.remove();

        opts.onSuccess?.();
        setTimeout(() => this.close(), 3000);
      } catch (err) {
        submitBtn.disabled   = false;
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
