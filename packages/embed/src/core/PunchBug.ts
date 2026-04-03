import { ElementPicker } from "../ui/ElementPicker";
import { ReportForm } from "../ui/ReportForm";
import { TaskPanel } from "../ui/TaskPanel";
import { getDomInfo } from "../capture/domInfo";
import { getBrowserMeta } from "../capture/browserMeta";
import { captureElement } from "../capture/screenshot";
import { EMBED_STYLES } from "../ui/styles";

export interface PunchBugConfig {
  embedKey: string;
  apiUrl: string;
  position?: "right" | "left" | "bottom-right" | "bottom-left";
  reporterName?: string;
}

export interface BoardColumn {
  id: string;
  name: string;
}

export interface EmbedTask {
  id: string;
  taskNumber: number;
  title: string;
  domSelector: string;
  screenshotUrl: string | null;
  status: string;
  priority: string;
  guestName: string | null;
  createdAt: string;
}

export class PunchBug {
  private config: PunchBugConfig;
  private hostEl: HTMLElement;
  private shadow: ShadowRoot;
  private triggerBtn: HTMLButtonElement;
  private picker: ElementPicker | null = null;
  private isPicking = false;
  private columns: BoardColumn[] = [];
  private taskPanel: TaskPanel;
  private projectId = "";
  private pinCleanups: (() => void)[] = [];

  constructor(config: PunchBugConfig) {
    this.config = config;

    this.hostEl = document.createElement("div");
    this.hostEl.id = "punchbug-root";
    this.hostEl.setAttribute("data-punchbug-ignore", "true");
    document.body.appendChild(this.hostEl);

    this.shadow = this.hostEl.attachShadow({ mode: "open" });

    const styleEl = document.createElement("style");
    styleEl.textContent = EMBED_STYLES;
    this.shadow.appendChild(styleEl);

    this.triggerBtn = document.createElement("button");
    this.triggerBtn.className = "pb-trigger";
    this.triggerBtn.setAttribute("data-punchbug-ignore", "true");
    this.triggerBtn.setAttribute("title", "Report a task");
    this.triggerBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"></path>
      </svg>
      <span>Report Task</span>
    `;

    this.shadow.appendChild(this.triggerBtn);
    this.triggerBtn.addEventListener("click", () => this.toggle());

    this.taskPanel = new TaskPanel(this.shadow);

    this.fetchColumns();
    this.fetchPageTasks();
  }

  private async fetchColumns() {
    try {
      const res = await fetch(
        `${this.config.apiUrl}/api/embed/columns?key=${encodeURIComponent(this.config.embedKey)}`
      );
      if (res.ok) this.columns = await res.json();
    } catch { /* non-fatal */ }
  }

  private async fetchPageTasks() {
    try {
      const pageUrl = encodeURIComponent(window.location.href);
      const res = await fetch(
        `${this.config.apiUrl}/api/embed/tasks?key=${encodeURIComponent(this.config.embedKey)}&pageUrl=${pageUrl}`
      );
      if (!res.ok) return;
      const data = await res.json();
      this.projectId = data.projectId;
      this.createPins(data.tasks as EmbedTask[]);
    } catch { /* non-fatal */ }
  }

  private createPins(tasks: EmbedTask[]) {
    // Remove any existing pins first
    this.pinCleanups.forEach((fn) => fn());
    this.pinCleanups = [];

    for (const task of tasks) {
      try {
        const el = document.querySelector(task.domSelector) as HTMLElement | null;
        if (!el) continue;
        this.createPin(el, task);
      } catch { /* element may not exist on this page */ }
    }
  }

  private createPin(el: HTMLElement, task: EmbedTask) {
    const pin = document.createElement("button");
    pin.setAttribute("data-punchbug-ignore", "true");
    pin.textContent = String(task.taskNumber);
    pin.style.cssText =
      "position:absolute;z-index:2147483644;background:#3b82f6;color:#fff;" +
      "border:2px solid #fff;border-radius:50%;width:22px;height:22px;" +
      "font-size:10px;font-weight:700;cursor:pointer;display:flex;" +
      "align-items:center;justify-content:center;padding:0;" +
      "box-shadow:0 2px 6px rgba(0,0,0,0.35);font-family:sans-serif;" +
      "line-height:1;transition:transform 0.15s,background 0.15s;";

    pin.onmouseenter = () => { pin.style.transform = "scale(1.2)"; pin.style.background = "#2563eb"; };
    pin.onmouseleave = () => { pin.style.transform = ""; pin.style.background = "#3b82f6"; };
    document.body.appendChild(pin);

    const updatePos = () => {
      const rect = el.getBoundingClientRect();
      pin.style.top = `${rect.top + window.scrollY - 11}px`;
      pin.style.left = `${rect.right + window.scrollX - 11}px`;
    };
    updatePos();
    window.addEventListener("scroll", updatePos, { passive: true });
    window.addEventListener("resize", updatePos, { passive: true });

    pin.addEventListener("click", (e) => {
      e.stopPropagation();
      this.taskPanel.show(task, this.projectId, this.config.apiUrl);
    });

    this.pinCleanups.push(() => {
      window.removeEventListener("scroll", updatePos);
      window.removeEventListener("resize", updatePos);
      pin.remove();
    });
  }

  /** Called after a new task is submitted so pins refresh without page reload */
  refreshPins() {
    this.fetchPageTasks();
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
    this.triggerBtn.title = "Report a task";
    this.picker?.stop();
    this.picker = null;
  }

  private async onElementPicked(el: HTMLElement) {
    this.stopPicking();

    const domInfo = getDomInfo(el);
    const browserMeta = getBrowserMeta();
    const pageUrl = window.location.href;

    let screenshot = "";
    try {
      screenshot = await captureElement(el);
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
      columns: this.columns,
      reporterName: this.config.reporterName,
      onSuccess: () => this.refreshPins(),
    });
  }
}
