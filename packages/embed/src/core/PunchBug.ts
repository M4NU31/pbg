import { ElementPicker, PickResult } from "../ui/ElementPicker";
import { ReportForm } from "../ui/ReportForm";
import { TaskPanel } from "../ui/TaskPanel";
import { getDomInfo } from "../capture/domInfo";
import { getBrowserMeta } from "../capture/browserMeta";
import { captureViaServer, captureClick } from "../capture/screenshot";
import { EMBED_STYLES } from "../ui/styles";

export interface PunchBugConfig {
  embedKey: string;
  apiUrl: string;
  position?: "right" | "left" | "bottom-right" | "bottom-left";
  reporterName?: string;
  /** URL of the standalone screenshot server, e.g. http://localhost:3535 */
  screenshotServerUrl?: string;
}

export interface BoardColumn { id: string; name: string; }
export interface EmbedTag    { id: string; name: string; color: string; }

export interface EmbedTask {
  id: string;
  taskNumber: number;
  title: string;
  domSelector: string | null;
  screenshotUrl: string | null;
  status: string;
  priority: string;
  guestName: string | null;
  createdAt: string;
  pinX: number | null;
  pinY: number | null;
}

export class PunchBug {
  private config: PunchBugConfig;
  private hostEl: HTMLElement;
  private shadow: ShadowRoot;
  private triggerBtn: HTMLButtonElement;
  private picker: ElementPicker | null = null;
  private isPicking = false;
  private columns: BoardColumn[] = [];
  private tags: EmbedTag[] = [];
  private taskPanel: TaskPanel;
  private projectId = "";
  private pinCleanups: (() => void)[] = [];
  private ghostPin: HTMLElement | null = null;

  constructor(config: PunchBugConfig) {
    this.config = config;

    this.hostEl = document.createElement("div");
    this.hostEl.id = "punchbug-root";
    this.hostEl.setAttribute("data-punchbug-ignore", "true");
    document.body.appendChild(this.hostEl);

    // Global keyframe for ghost-pin drop animation (must live in main doc, not shadow DOM)
    if (!document.getElementById("pb-global-styles")) {
      const s = document.createElement("style");
      s.id = "pb-global-styles";
      s.textContent = `
        @keyframes pb-pin-drop {
          0%   { transform: translateY(-14px) scale(0.8); opacity: 0; }
          65%  { transform: translateY(4px)   scale(1.06); opacity: 1; }
          100% { transform: translateY(0)     scale(1);    opacity: 1; }
        }`;
      document.head.appendChild(s);
    }

    this.shadow = this.hostEl.attachShadow({ mode: "open" });

    const styleEl = document.createElement("style");
    styleEl.textContent = EMBED_STYLES;
    this.shadow.appendChild(styleEl);

    this.triggerBtn = document.createElement("button");
    this.triggerBtn.className = "pb-trigger";
    this.triggerBtn.setAttribute("data-punchbug-ignore", "true");
    this.triggerBtn.title = "Report a task";
    this.triggerBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83
                 M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"></path>
      </svg>
      <span>Report</span>
    `;
    this.shadow.appendChild(this.triggerBtn);
    this.triggerBtn.addEventListener("click", () => this.toggle());

    this.taskPanel = new TaskPanel(this.shadow);

    this.fetchColumns();
    this.fetchTags();
    this.fetchPageTasks();
  }

  // ── Data fetching ─────────────────────────────────────────────────────────

  private async fetchColumns() {
    try {
      const r = await fetch(`${this.config.apiUrl}/api/embed/columns?key=${encodeURIComponent(this.config.embedKey)}`);
      if (r.ok) this.columns = await r.json();
    } catch { /* non-fatal */ }
  }

  private async fetchTags() {
    try {
      const r = await fetch(`${this.config.apiUrl}/api/embed/tags?key=${encodeURIComponent(this.config.embedKey)}`);
      if (r.ok) this.tags = await r.json();
    } catch { /* non-fatal */ }
  }

  private async fetchPageTasks() {
    try {
      const pageUrl = encodeURIComponent(window.location.href);
      const r = await fetch(
        `${this.config.apiUrl}/api/embed/tasks?key=${encodeURIComponent(this.config.embedKey)}&pageUrl=${pageUrl}`
      );
      if (!r.ok) return;
      const data = await r.json();
      this.projectId = data.projectId;
      this.createPins(data.tasks as EmbedTask[]);
    } catch { /* non-fatal */ }
  }

  // ── Pins ──────────────────────────────────────────────────────────────────

  private createPins(tasks: EmbedTask[]) {
    this.pinCleanups.forEach((fn) => fn());
    this.pinCleanups = [];
    for (const task of tasks) {
      if (task.pinX !== null && task.pinY !== null) {
        this.createPinAtCoords(task);
      } else if (task.domSelector) {
        try {
          const el = document.querySelector(task.domSelector) as HTMLElement | null;
          if (el) this.createPinOnElement(el, task);
        } catch { /* skip */ }
      }
    }
  }

  private createPinAtCoords(task: EmbedTask) {
    const pin = this.buildPin(task.taskNumber);
    pin.style.position = "absolute";
    pin.style.top  = `${(task.pinY ?? 0) - 11}px`;
    pin.style.left = `${(task.pinX ?? 0) - 11}px`;
    document.body.appendChild(pin);
    pin.addEventListener("click", (e) => {
      e.stopPropagation();
      this.taskPanel.show(task, this.projectId, this.config.apiUrl);
    });
    this.pinCleanups.push(() => pin.remove());
  }

  private createPinOnElement(el: HTMLElement, task: EmbedTask) {
    const pin = this.buildPin(task.taskNumber);
    pin.style.position = "absolute";
    document.body.appendChild(pin);
    const reposition = () => {
      const r = el.getBoundingClientRect();
      pin.style.top  = `${r.top  + window.scrollY - 11}px`;
      pin.style.left = `${r.right + window.scrollX - 11}px`;
    };
    reposition();
    window.addEventListener("scroll", reposition, { passive: true });
    window.addEventListener("resize", reposition, { passive: true });
    pin.addEventListener("click", (e) => {
      e.stopPropagation();
      this.taskPanel.show(task, this.projectId, this.config.apiUrl);
    });
    this.pinCleanups.push(() => {
      window.removeEventListener("scroll", reposition);
      window.removeEventListener("resize", reposition);
      pin.remove();
    });
  }

  private buildPin(number: number): HTMLButtonElement {
    const pin = document.createElement("button");
    pin.setAttribute("data-punchbug-ignore", "true");
    pin.textContent = String(number);
    pin.style.cssText =
      "z-index:2147483644;background:hsl(348,100%,52%);color:#fff;" +
      "border:2.5px solid #fff;border-radius:50%;width:24px;height:24px;" +
      "font-size:10px;font-weight:700;cursor:pointer;display:flex;" +
      "align-items:center;justify-content:center;padding:0;" +
      "box-shadow:0 2px 8px rgba(0,0,0,0.4);font-family:sans-serif;" +
      "line-height:1;transition:transform 0.15s,background 0.15s;";
    pin.onmouseenter = () => { pin.style.transform = "scale(1.25)"; pin.style.background = "hsl(348,100%,42%)"; };
    pin.onmouseleave = () => { pin.style.transform = "";             pin.style.background = "hsl(348,100%,52%)"; };
    return pin;
  }

  private showGhostPin(pageX: number, pageY: number) {
    this.removeGhostPin();
    const pin = document.createElement("div");
    pin.setAttribute("data-punchbug-ignore", "true");
    pin.innerHTML = `
      <svg width="28" height="36" viewBox="0 0 28 36" fill="none">
        <path d="M14 0C6.27 0 0 6.27 0 14c0 9.33 14 22 14 22S28 23.33 28 14C28 6.27 21.73 0 14 0z"
              fill="hsl(348,100%,52%)" stroke="white" stroke-width="2"/>
        <circle cx="14" cy="14" r="5" fill="white"/>
      </svg>`;
    pin.style.cssText =
      `position:absolute;top:${pageY - 32}px;left:${pageX - 14}px;` +
      `z-index:2147483644;pointer-events:none;` +
      `filter:drop-shadow(0 3px 6px rgba(0,0,0,0.4));` +
      `animation:pb-pin-drop 0.25s cubic-bezier(0.34,1.56,0.64,1);`;
    document.body.appendChild(pin);
    this.ghostPin = pin;
  }

  private removeGhostPin() {
    this.ghostPin?.remove();
    this.ghostPin = null;
  }

  refreshPins() { this.fetchPageTasks(); }

  // ── Picking mode ──────────────────────────────────────────────────────────

  private toggle() { this.isPicking ? this.stopPicking() : this.startPicking(); }

  private startPicking() {
    this.isPicking = true;
    this.triggerBtn.classList.add("pb-active");
    this.triggerBtn.title = "Click anywhere — Esc to cancel";
    const span = this.triggerBtn.querySelector("span");
    if (span) span.textContent = "Cancel";
    this.picker = new ElementPicker((r) => this.onPicked(r), () => this.stopPicking());
    this.picker.start();
  }

  private stopPicking() {
    this.isPicking = false;
    this.triggerBtn.classList.remove("pb-active");
    this.triggerBtn.title = "Report a task";
    const span = this.triggerBtn.querySelector("span");
    if (span) span.textContent = "Report";
    this.picker?.stop();
    this.picker = null;
  }

  private async onPicked({ el, clientX, clientY, pageX, pageY }: PickResult) {
    this.stopPicking();

    // 1. Ghost pin appears instantly at click position
    this.showGhostPin(pageX, pageY);

    // 2. Open the form immediately (no screenshot yet — shows loading spinner)
    const form = new ReportForm(this.shadow, {
      domInfo:      getDomInfo(el),
      browserMeta:  getBrowserMeta(),
      pageUrl:      window.location.href,
      pinX:         pageX,
      pinY:         pageY,
      embedKey:     this.config.embedKey,
      apiUrl:       this.config.apiUrl,
      columns:      this.columns,
      tags:         this.tags,
      reporterName: this.config.reporterName,
      onSuccess:    () => { this.removeGhostPin(); this.refreshPins(); },
      onClose:      () => this.removeGhostPin(),
    });

    // 3. Capture screenshot in background, inject into form when ready
    this.captureScreenshot(clientX, clientY, pageX, pageY)
      .then(({ full, thumb }) => form.setScreenshot(full, thumb))
      .catch(() => form.setScreenshot(""));   // hide loader on failure
  }

  private async captureScreenshot(
    clientX: number, clientY: number,
    pageX:   number, pageY:   number
  ): Promise<{ full: string; thumb: string }> {
    const serverUrl = this.config.screenshotServerUrl;

    if (serverUrl) {
      // Preferred: server-side Puppeteer screenshot (accurate, handles all sites)
      try {
        const imageUrl = await captureViaServer(serverUrl, {
          url:           window.location.href,
          x:             pageX,
          y:             pageY,
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight,
        });
        // Server returns a URL; use it as both full and thumb
        // (the server already crops to the relevant area)
        return { full: imageUrl, thumb: imageUrl };
      } catch (err) {
        console.warn("PunchBug: screenshot server failed, falling back", err);
      }
    }

    // Fallback: client-side html-to-image
    return captureClick(clientX, clientY);
  }
}
