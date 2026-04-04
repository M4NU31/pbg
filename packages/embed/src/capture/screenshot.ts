import { toPng } from "html-to-image";

export interface CaptureResult {
  /** Full viewport/page screenshot as base64 PNG — stored on server. */
  full: string;
  /** Thumbnail cropped around the click position — shown in form preview. */
  thumb: string;
}

// px of context around the click point in the thumbnail
const THUMB_HALF_W = 220;
const THUMB_HALF_H = 160;

/**
 * Capture what the user was looking at when they clicked.
 *
 * @param clientX  Viewport X of the click (e.clientX)
 * @param clientY  Viewport Y of the click (e.clientY)
 *
 * Strategy:
 *  1. Do NOT scroll — the screenshot shows exactly what the user saw at click time.
 *  2. html-to-image captures document.documentElement.
 *     The resulting image may be either full-page (scrollWidth × scrollHeight)
 *     or viewport-sized (innerWidth × innerHeight) depending on the browser/library version.
 *     We detect which by comparing img.naturalHeight to window.innerHeight.
 *  3. Convert the click's viewport coordinates to image coordinates, then crop.
 */
export async function captureClick(
  clientX: number,
  clientY: number
): Promise<CaptureResult> {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Small delay so any synchronous DOM mutations (pin overlay etc.) settle.
  await new Promise<void>((r) => setTimeout(r, 80));

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
    return { full: "", thumb: "" };
  }

  try {
    const img = await loadImage(full);

    // ------------------------------------------------------------------
    // Detect whether html-to-image captured the full document or just
    // the visible viewport, then convert click → image coordinates.
    // ------------------------------------------------------------------
    const docW = document.documentElement.scrollWidth;
    const docH = document.documentElement.scrollHeight;
    const isFullPage = img.naturalHeight > vh * 1.2;

    let imgClickX: number;
    let imgClickY: number;

    if (isFullPage) {
      // Full page: position in image = (scrollX + clientX, scrollY + clientY) * scale
      const scaleX = img.naturalWidth / docW;
      const scaleY = img.naturalHeight / docH;
      imgClickX = (window.scrollX + clientX) * scaleX;
      imgClickY = (window.scrollY + clientY) * scaleY;
    } else {
      // Viewport only: position in image = click fraction × image dimensions
      imgClickX = (clientX / vw) * img.naturalWidth;
      imgClickY = (clientY / vh) * img.naturalHeight;
    }

    // Crop a rectangle centred on the click point
    const srcX = Math.max(0, Math.round(imgClickX - THUMB_HALF_W));
    const srcY = Math.max(0, Math.round(imgClickY - THUMB_HALF_H));
    const srcW = Math.min(img.naturalWidth - srcX, THUMB_HALF_W * 2);
    const srcH = Math.min(img.naturalHeight - srcY, THUMB_HALF_H * 2);

    const canvas = document.createElement("canvas");
    canvas.width = srcW;
    canvas.height = srcH;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, srcW, srcH);

    return { full, thumb: canvas.toDataURL("image/png") };
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
