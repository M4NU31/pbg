import { toPng } from "html-to-image";

export interface CaptureResult {
  /** Full screenshot — either a data-URL (html-to-image) or a server URL. */
  full: string;
  /** Thumbnail cropped around click position (data-URL). Equals `full` if crop failed. */
  thumb: string;
}

const THUMB_HALF_W = 220;
const THUMB_HALF_H = 160;

// ---------------------------------------------------------------------------
// Primary path: screenshot server (Puppeteer-quality, reliable)
// ---------------------------------------------------------------------------

export interface ServerCaptureOptions {
  url: string;
  x: number;
  y: number;
  delay?: number;
  viewportWidth?: number;
  viewportHeight?: number;
}

/**
 * Ask the screenshot server to capture the page at (x, y) and return a
 * base64 data URL of the cropped image.
 * Throws if the server is unreachable or returns an error.
 */
export async function captureViaServer(
  serverUrl: string,
  opts: ServerCaptureOptions
): Promise<string> {
  const res = await fetch(`${serverUrl.replace(/\/$/, "")}/screenshot/task`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url:       opts.url,
      x:         opts.x,
      y:         opts.y,
      viewport: {
        width:  opts.viewportWidth  ?? window.innerWidth,
        height: opts.viewportHeight ?? window.innerHeight,
      },
      delay_ms:  opts.delay ?? 1500,
      crop_size: { width: 480, height: 320 },
      format:    "jpeg",
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { detail?: string }).detail ?? `Server error ${res.status}`);
  }

  // Service returns raw image bytes — convert to base64 data URL
  const buffer = await res.arrayBuffer();
  const bytes  = new Uint8Array(buffer);
  let binary   = "";
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return `data:image/jpeg;base64,${btoa(binary)}`;
}

// ---------------------------------------------------------------------------
// Fallback path: html-to-image (client-side, less reliable)
// ---------------------------------------------------------------------------

/**
 * Capture the page using html-to-image, cropped around the click position.
 * Does NOT scroll — captures exactly what the user was looking at.
 */
export async function captureClick(
  clientX: number,
  clientY: number
): Promise<CaptureResult> {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

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
    const isFullPage = img.naturalHeight > vh * 1.2;

    let imgClickX: number, imgClickY: number;
    if (isFullPage) {
      const docW  = document.documentElement.scrollWidth;
      const docH  = document.documentElement.scrollHeight;
      imgClickX   = (window.scrollX + clientX) * (img.naturalWidth  / docW);
      imgClickY   = (window.scrollY + clientY) * (img.naturalHeight / docH);
    } else {
      imgClickX = (clientX / vw) * img.naturalWidth;
      imgClickY = (clientY / vh) * img.naturalHeight;
    }

    const srcX = Math.max(0, Math.round(imgClickX - THUMB_HALF_W));
    const srcY = Math.max(0, Math.round(imgClickY - THUMB_HALF_H));
    const srcW = Math.min(img.naturalWidth  - srcX, THUMB_HALF_W * 2);
    const srcH = Math.min(img.naturalHeight - srcY, THUMB_HALF_H * 2);

    const canvas = document.createElement("canvas");
    canvas.width  = srcW;
    canvas.height = srcH;
    canvas.getContext("2d")!.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, srcW, srcH);

    return { full, thumb: canvas.toDataURL("image/png") };
  } catch {
    return { full, thumb: full };
  }
}

/**
 * Fallback: capture the clicked element (or its nearest meaningful container)
 * using html-to-image. Avoids full-page scroll-position issues entirely.
 */
export async function captureElement(el: HTMLElement): Promise<CaptureResult> {
  // Walk up to find a container that gives reasonable context (min 200px wide)
  let target: HTMLElement = el;
  let current = el.parentElement;
  while (current && current.tagName !== "BODY") {
    const r = current.getBoundingClientRect();
    if (r.width >= 200 && r.height >= 60) { target = current; break; }
    current = current.parentElement;
  }

  try {
    const full = await toPng(target, {
      cacheBust: true,
      pixelRatio: 1,
      skipFonts: false,
      filter: (node) =>
        !node.hasAttribute?.("data-punchbug-ignore") &&
        node.id !== "punchbug-root",
    });
    return { full, thumb: full };
  } catch {
    return { full: "", thumb: "" };
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload  = () => resolve(img);
    img.onerror = reject;
    img.src     = src;
  });
}
