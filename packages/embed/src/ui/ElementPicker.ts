export class ElementPicker {
  private hoveredEl: HTMLElement | null = null;
  private originalOutline: string = "";
  private onPick: (el: HTMLElement) => void;
  private onCancel: () => void;

  constructor(onPick: (el: HTMLElement) => void, onCancel: () => void) {
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
    // Avoid highlighting our own UI
    if (el.closest("#punchbug-root")) return;
    this.hoveredEl = el;
    this.originalOutline = el.style.outline;
    el.style.outline = "2px solid #3b82f6";
    el.style.outlineOffset = "2px";
  }

  private clearHighlight() {
    if (this.hoveredEl) {
      this.hoveredEl.style.outline = this.originalOutline;
      this.hoveredEl.style.outlineOffset = "";
      this.hoveredEl = null;
    }
  }

  private handleMouseOver(e: MouseEvent) {
    const el = e.target as HTMLElement;
    if (el && !el.closest("#punchbug-root")) {
      this.highlight(el);
    }
  }

  private handleMouseOut(e: MouseEvent) {
    const el = e.target as HTMLElement;
    if (this.hoveredEl === el) {
      this.clearHighlight();
    }
  }

  private handleClick(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const el = e.target as HTMLElement;
    if (el && !el.closest("#punchbug-root")) {
      this.clearHighlight();
      this.stop();
      this.onPick(el);
    }
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      this.stop();
      this.onCancel();
    }
  }
}
