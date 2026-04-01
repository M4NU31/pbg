import { ElementPicker } from "../ui/ElementPicker";
import { ReportForm } from "../ui/ReportForm";
import { getDomInfo } from "../capture/domInfo";
import { getBrowserMeta } from "../capture/browserMeta";
import { captureScreenshot } from "../capture/screenshot";
import { EMBED_STYLES } from "../ui/styles";

export interface PunchBugConfig {
  embedKey: string;
  apiUrl: string;
  position?: "right" | "left" | "bottom-right" | "bottom-left";
}

export class PunchBug {
  private config: PunchBugConfig;
  private hostEl: HTMLElement;
  private shadow: ShadowRoot;
  private triggerBtn: HTMLButtonElement;
  private picker: ElementPicker | null = null;
  private isPicking = false;

  constructor(config: PunchBugConfig) {
    this.config = config;

    // Create isolated shadow DOM host
    this.hostEl = document.createElement("div");
    this.hostEl.id = "punchbug-root";
    this.hostEl.setAttribute("data-punchbug-ignore", "true");
    document.body.appendChild(this.hostEl);

    this.shadow = this.hostEl.attachShadow({ mode: "open" });

    // Inject styles
    const styleEl = document.createElement("style");
    styleEl.textContent = EMBED_STYLES;
    this.shadow.appendChild(styleEl);

    // Create trigger button
    this.triggerBtn = document.createElement("button");
    this.triggerBtn.className = "pb-trigger";
    this.triggerBtn.setAttribute("data-punchbug-ignore", "true");
    this.triggerBtn.setAttribute("title", "Report a bug");
    this.triggerBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"></path>
      </svg>
      <span>Report Bug</span>
    `;

    this.shadow.appendChild(this.triggerBtn);
    this.triggerBtn.addEventListener("click", () => this.toggle());
  }

  private toggle() {
    if (this.isPicking) {
      this.stopPicking();
    } else {
      this.startPicking();
    }
  }

  private startPicking() {
    this.isPicking = true;
    this.triggerBtn.classList.add("pb-active");
    this.triggerBtn.title = "Click any element — press Esc to cancel";

    this.picker = new ElementPicker(
      (el) => this.onElementPicked(el),
      () => this.stopPicking()
    );
    this.picker.start();
  }

  private stopPicking() {
    this.isPicking = false;
    this.triggerBtn.classList.remove("pb-active");
    this.triggerBtn.title = "Report a bug";
    this.picker?.stop();
    this.picker = null;
  }

  private async onElementPicked(el: HTMLElement) {
    this.stopPicking();

    const domInfo = getDomInfo(el);
    const browserMeta = getBrowserMeta();
    const pageUrl = window.location.href;

    // Capture screenshot before showing form
    let screenshot = "";
    try {
      screenshot = await captureScreenshot("#punchbug-root");
    } catch (e) {
      console.warn("PunchBug: screenshot failed", e);
    }

    new ReportForm(this.shadow, {
      domInfo,
      screenshot,
      browserMeta,
      pageUrl,
      embedKey: this.config.embedKey,
      apiUrl: this.config.apiUrl,
    });
  }
}
