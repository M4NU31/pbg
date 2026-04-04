import { DomInfo } from "../capture/domInfo";
import { BrowserMeta } from "../capture/browserMeta";
import { BoardColumn, EmbedTag } from "../core/PunchBug";
import { submitReport } from "../api/reporter";

interface FormData {
  domInfo: DomInfo;
  screenshot: string;
  browserMeta: BrowserMeta;
  pageUrl: string;
  embedKey: string;
  apiUrl: string;
  columns: BoardColumn[];
  tags: EmbedTag[];
  reporterName?: string;
  onSuccess?: () => void;
}

export class ReportForm {
  private shadow: ShadowRoot;
  private overlay: HTMLElement;

  constructor(shadow: ShadowRoot, data: FormData) {
    this.shadow = shadow;
    this.overlay = this.render(data);
  }

  private render(data: FormData): HTMLElement {
    const overlay = document.createElement("div");
    overlay.className = "pb-overlay";

    const card = document.createElement("div");
    card.className = "pb-form-card";

    const columnSelect =
      data.columns.length > 0
        ? `<div class="pb-field">
            <label class="pb-label" for="pb-column">Add to column</label>
            <select class="pb-input" id="pb-column">
              ${data.columns.map((c) => `<option value="${c.id}">${c.name}</option>`).join("")}
            </select>
           </div>`
        : "";

    const tagSelect =
      data.tags.length > 0
        ? `<div class="pb-field">
            <label class="pb-label">Tags</label>
            <div class="pb-tags-grid" id="pb-tags">
              ${data.tags.map((t) => `
                <label class="pb-tag-option" style="--tag-color:${t.color}">
                  <input type="checkbox" class="pb-tag-cb" value="${t.id}" style="display:none" />
                  <span class="pb-tag-pill" data-tag-id="${t.id}" style="background:${t.color}22;color:${t.color};border:1px solid ${t.color}55">
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

      ${data.screenshot ? `<img class="pb-screenshot-preview" src="${data.screenshot}" alt="Element screenshot" />` : ""}

      <div class="pb-info-box">
        <div class="pb-info-row">
          <span>&#127760;</span>
          <span style="word-break:break-all">${data.pageUrl}</span>
        </div>
        <div class="pb-info-row">
          <span>&#128187;</span>
          <span>${data.browserMeta.browserName} ${data.browserMeta.browserVersion} &bull; ${data.browserMeta.osName} &bull; ${data.browserMeta.screenWidth}&#xd7;${data.browserMeta.screenHeight}</span>
        </div>
        <div class="pb-info-row">
          <span>&#128279;</span>
          <code style="font-size:11px">${data.domInfo.selector}</code>
        </div>
      </div>

      <div id="pb-report-form">
        <div class="pb-field">
          <label class="pb-label" for="pb-title">What happened? *</label>
          <input class="pb-input" id="pb-title" type="text" placeholder="Button not responding, layout broken, etc." />
        </div>
        <div class="pb-field">
          <label class="pb-label" for="pb-desc">More details</label>
          <textarea class="pb-textarea" id="pb-desc" placeholder="Steps to reproduce, expected vs actual behavior..."></textarea>
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

    // Event handlers
    const closeBtn = this.shadow.getElementById("pb-close");
    closeBtn?.addEventListener("click", () => this.close());

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) this.close();
    });

    // Tag pill toggle interaction
    if (data.tags.length > 0) {
      const tagPills = this.shadow.querySelectorAll<HTMLSpanElement>(".pb-tag-pill");
      tagPills.forEach((pill) => {
        pill.style.cursor = "pointer";
        pill.addEventListener("click", () => {
          const tagId = pill.dataset.tagId!;
          const cb = this.shadow.querySelector<HTMLInputElement>(`.pb-tag-cb[value="${tagId}"]`);
          if (!cb) return;
          cb.checked = !cb.checked;
          pill.style.opacity = cb.checked ? "1" : "0.5";
          pill.style.fontWeight = cb.checked ? "600" : "400";
        });
        // start unchecked / dimmed
        pill.style.opacity = "0.55";
      });
    }

    const submitBtn = this.shadow.getElementById("pb-submit") as HTMLButtonElement;
    submitBtn?.addEventListener("click", async () => {
      const title = (this.shadow.getElementById("pb-title") as HTMLInputElement).value.trim();
      if (!title) {
        (this.shadow.getElementById("pb-title") as HTMLInputElement).focus();
        return;
      }

      const description = (this.shadow.getElementById("pb-desc") as HTMLTextAreaElement).value.trim();
      const columnId = data.columns.length > 0
        ? (this.shadow.getElementById("pb-column") as HTMLSelectElement).value
        : undefined;

      const tagIds = data.tags.length > 0
        ? Array.from(this.shadow.querySelectorAll<HTMLInputElement>(".pb-tag-cb:checked")).map((cb) => cb.value)
        : [];

      submitBtn.disabled = true;
      submitBtn.textContent = "Submitting...";

      try {
        await submitReport(data.apiUrl, {
          embedKey: data.embedKey,
          title,
          description: description || undefined,
          screenshot: data.screenshot,
          domSelector: data.domInfo.selector,
          domHtml: data.domInfo.outerHtml,
          pageUrl: data.pageUrl,
          columnId,
          tagIds: tagIds.length > 0 ? tagIds : undefined,
          reporterName: data.reporterName,
          browserMeta: data.browserMeta,
        });

        const formEl = this.shadow.getElementById("pb-report-form");
        const successEl = this.shadow.getElementById("pb-success");
        if (formEl) formEl.style.display = "none";
        if (successEl) successEl.style.display = "block";

        data.onSuccess?.();
        setTimeout(() => this.close(), 3000);
      } catch (err) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit Task";
        alert("Failed to submit: " + (err instanceof Error ? err.message : "Unknown error"));
      }
    });

    return overlay;
  }

  close() {
    this.overlay.remove();
  }
}
