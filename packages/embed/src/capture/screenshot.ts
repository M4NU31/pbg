import html2canvas from "html2canvas";

function ignoreElements(el: Element): boolean {
  return el.hasAttribute("data-punchbug-ignore") || el.id === "punchbug-root";
}

export async function captureElement(el: HTMLElement): Promise<string> {
  el.scrollIntoView({ block: "center", inline: "center" });
  // Allow scroll and repaint to settle
  await new Promise<void>((r) => setTimeout(r, 200));

  // Read viewport-relative coords after scroll settles
  const rect = el.getBoundingClientRect();

  // Render only the visible viewport.
  // x/y tell html2canvas where in the document to start (= current scroll position).
  // allowTaint:true is critical — without it, cross-origin images cause toDataURL()
  // to throw a SecurityError that gets caught silently, producing a blank screenshot.
  const canvas = await html2canvas(document.body, {
    useCORS: true,
    allowTaint: true,
    logging: false,
    scale: 1,
    ignoreElements,
    x: window.scrollX,
    y: window.scrollY,
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // At scale:1, viewport-relative rect coords map 1:1 to canvas coords
  const padding = 20;
  const x = Math.max(0, Math.round(rect.left) - padding);
  const y = Math.max(0, Math.round(rect.top) - padding);
  const w = Math.min(canvas.width - x, Math.round(rect.width) + padding * 2);
  const h = Math.min(canvas.height - y, Math.round(rect.height) + padding * 2);

  if (w <= 0 || h <= 0) return "";

  const cropped = document.createElement("canvas");
  cropped.width = w;
  cropped.height = h;
  const ctx = cropped.getContext("2d")!;
  ctx.drawImage(canvas, x, y, w, h, 0, 0, w, h);
  return cropped.toDataURL("image/png");
}
