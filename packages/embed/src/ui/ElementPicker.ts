export interface PickResult {
  el: HTMLElement;
  /** Page X coordinate of the click (pageX = clientX + scrollX) */
  pageX: number;
  /** Page Y coordinate of the click (pageY = clientY + scrollY) */
  pageY: number;
}

export class ElementPicker {
  private hoveredEl: HTMLElement | null = null;
  private highlightOverlay: HTMLElement | null = null;
  private onPick: (result: PickResult) => void;
  private onCancel: () => void;

  constructor(onPick: (result: PickResult) => void, onCancel: () => void) {
    this.onPick = onPick;
    this.onCancel = onCancel;
    this.handleMouseOver = this.handleMouseOver.bind(this);
    this.handleMouseOut = this.handleMouseOut.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  start() {
    document.body.classList.add("pb-picking-active");
    document.addEventListener("mouseover", this.handleMouseOver, true);
    document.addEventListener("mouseout", this.handleMouseOut, true);
    document.addEventListener("click", this.handleClick, true);
    document.addEventListener("keydown", this.handleKeyDown, true);
  }

  stop() {
    document.body.classList.remove("pb-picking-active");
    document.removeEventListener("mouseover", this.handleMouseOver, true);
    document.removeEventListener("mouseout", this.handleMouseOut, true);
    document.removeEventListener("click", this.handleClick, true);
    document.removeEventListener("keydown", this.handleKeyDown, true);
    this.clearHighlight();
  }

  private highlight(el: HTMLElement) {
    this.clearHighlight();
    if (el.closest("#punchbug-root")) return;
    this.hoveredEl = el;

    const rect = el.getBoundingClientRect();

    // Use a fixed-position, pointer-events:none overlay so the host page layout
    // is never affected (no outline/border is set on the target element itself).
    const overlay = document.createElement("div");
    overlay.id = "pb-highlight-overlay";
    overlay.setAttribute("data-punchbug-ignore", "true");
    overlay.style.cssText = [
      "position:fixed",
      `top:${rect.top}px`,
      `left:${rect.left}px`,
      `width:${rect.width}px`,
      `height:${rect.height}px`,
      "pointer-events:none",
      "z-index:2147483645",
      "outline:2px solid hsl(348,100%,52%)",
      "outline-offset:2px",
      "border-radius:2px",
      "background:hsla(348,100%,52%,0.06)",
      "box-sizing:border-box",
    ].join(";");

    document.body.appendChild(overlay);
    this.highlightOverlay = overlay;
  }

  private clearHighlight() {
    this.highlightOverlay?.remove();
    this.highlightOverlay = null;
    this.hoveredEl = null;
  }

  private handleMouseOver(e: MouseEvent) {
    const el = e.target as HTMLElement;
    if (el && !el.closest("#punchbug-root") && el !== this.highlightOverlay) {
      this.highlight(el);
    }
  }

  private handleMouseOut(e: MouseEvent) {
    if (this.hoveredEl === e.target) {
      this.clearHighlight();
    }
  }

  private handleClick(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const el = e.target as HTMLElement;
    if (el && !el.closest("#punchbug-root") && el !== this.highlightOverlay) {
      this.clearHighlight();
      this.stop();
      this.onPick({
        el,
        pageX: e.clientX + window.scrollX,
        pageY: e.clientY + window.scrollY,
      });
    }
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      this.stop();
      this.onCancel();
    }
  }
}
