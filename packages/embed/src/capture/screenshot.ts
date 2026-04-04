import { toPng } from "html-to-image";

export interface CaptureResult {
  /** Full viewport screenshot as base64 PNG — this is what gets uploaded. */
  full: string;
  /** Thumbnail cropped to element area + context padding — shown in the form preview. */
  thumb: string;
}

const CONTEXT_PADDING = 140; // px of context around element in the thumbnail

export async function captureViewport(el: HTMLElement): Promise<CaptureResult> {
  // Scroll element to center of viewport before capturing
  el.scrollIntoView({ block: "center", inline: "center" });
  await new Promise<void>((r) => setTimeout(r, 220));

  // Capture the full visible document at 1x (pixelRatio:1 keeps it fast)
  let full: string;
  try {
    full = await toPng(document.documentElement, {
      cacheBust: true,
      pixelRatio: 1,
      skipFonts: false,
      filter: (node) =>
        !node.hasAttribute?.("data-punchbug-ignore") &&
        node.id !== "punchbug-root",
    });
  } catch {
    // Fallback: capture just the element if full-page fails (e.g. cross-origin resources)
    full = await toPng(el, {
      cacheBust: true,
      pixelRatio: 1,
      skipFonts: false,
      filter: (node) =>
        !node.hasAttribute?.("data-punchbug-ignore") &&
        node.id !== "punchbug-root",
    });
    return { full, thumb: full };
  }

  // Compute element position in viewport (after scrollIntoView)
  const rect = el.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Crop bounds for the thumbnail (element + context padding, clamped to viewport)
  const cx = Math.max(0, rect.left - CONTEXT_PADDING);
  const cy = Math.max(0, rect.top - CONTEXT_PADDING);
  const cw = Math.min(vw - cx, rect.width + CONTEXT_PADDING * 2);
  const ch = Math.min(vh - cy, rect.height + CONTEXT_PADDING * 2);

  try {
    const img = await loadImage(full);
    // html-to-image renders document.documentElement; its natural size maps to page dimensions.
    // After scrollIntoView the viewport sits at (scrollX, scrollY) within the full document.
    const docW = document.documentElement.scrollWidth;
    const docH = document.documentElement.scrollHeight;
    const scaleX = img.naturalWidth / docW;
    const scaleY = img.naturalHeight / docH;

    const sx = window.scrollX;
    const sy = window.scrollY;

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(cw);
    canvas.height = Math.round(ch);
    const ctx = canvas.getContext("2d")!;

    ctx.drawImage(
      img,
      Math.round((sx + cx) * scaleX),
      Math.round((sy + cy) * scaleY),
      Math.round(cw * scaleX),
      Math.round(ch * scaleY),
      0, 0,
      Math.round(cw),
      Math.round(ch)
    );

    const thumb = canvas.toDataURL("image/png");
    return { full, thumb };
  } catch {
    return { full, thumb: full };
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
