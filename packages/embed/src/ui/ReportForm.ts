import { DomInfo } from "../capture/domInfo";
import { BrowserMeta } from "../capture/browserMeta";
import { submitReport } from "../api/reporter";

interface FormData {
  domInfo: DomInfo;
  screenshot: string;
  browserMeta: BrowserMeta;
  pageUrl: string;
  embedKey: string;
  apiUrl: string;
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

    card.innerHTML = `
      <div class="pb-form-header">
        <h2 class="pb-form-title">Report a Bug</h2>
        <button class="pb-close-btn" id="pb-close">&#x2715;</button>
      </div>

      ${data.screenshot ? `<img class="pb-screenshot-preview" src="${data.screenshot}" alt="Screenshot" />` : ""}

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
        <div class="pb-form-row">
          <div class="pb-field">
            <label class="pb-label" for="pb-name">Your name</label>
            <input class="pb-input" id="pb-name" type="text" placeholder="Jane Doe" />
          </div>
          <div class="pb-field">
            <label class="pb-label" for="pb-email">Your email</label>
            <input class="pb-input" id="pb-email" type="email" placeholder="jane@example.com" />
          </div>
        </div>
        <button class="pb-submit-btn" id="pb-submit">Submit Bug Report</button>
      </div>

      <div id="pb-success" style="display:none" class="pb-success">
        <div class="pb-success-icon">&#127881;</div>
        <div class="pb-success-title">Bug reported!</div>
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

    const submitBtn = this.shadow.getElementById("pb-submit") as HTMLButtonElement;
    submitBtn?.addEventListener("click", async () => {
      const title = (this.shadow.getElementById("pb-title") as HTMLInputElement).value.trim();
      if (!title) {
        (this.shadow.getElementById("pb-title") as HTMLInputElement).focus();
        return;
      }

      const description = (this.shadow.getElementById("pb-desc") as HTMLTextAreaElement).value.trim();
      const guestName = (this.shadow.getElementById("pb-name") as HTMLInputElement).value.trim();
      const guestEmail = (this.shadow.getElementById("pb-email") as HTMLInputElement).value.trim();

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
          guestName: guestName || undefined,
          guestEmail: guestEmail || undefined,
          browserMeta: data.browserMeta,
        });

        const formEl = this.shadow.getElementById("pb-report-form");
        const successEl = this.shadow.getElementById("pb-success");
        if (formEl) formEl.style.display = "none";
        if (successEl) successEl.style.display = "block";

        setTimeout(() => this.close(), 3000);
      } catch (err) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit Bug Report";
        alert("Failed to submit: " + (err instanceof Error ? err.message : "Unknown error"));
      }
    });

    return overlay;
  }

  close() {
    this.overlay.remove();
  }
}
