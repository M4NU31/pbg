import html2canvas from "html2canvas";

function ignoreElements(el: Element): boolean {
  return el.hasAttribute("data-punchbug-ignore") || el.id === "punchbug-root";
}

export async function captureElement(el: HTMLElement): Promise<string> {
  el.scrollIntoView({ block: "center", inline: "center" });
  // Allow scroll and repaint to settle
  await new Promise<void>((r) => setTimeout(r, 200));

  // Read element bounds AFTER scroll settles — coordinates are viewport-relative
  const rect = el.getBoundingClientRect();

  // Capture only the visible viewport (much more reliable than full-page)
  const canvas = await html2canvas(document.body, {
    useCORS: true,
    logging: false,
    scale: 1,
    ignoreElements,
    x: window.scrollX,
    y: window.scrollY,
    width: window.innerWidth,
    height: window.innerHeight,
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
  });

  // rect coords are viewport-relative and map 1:1 to the canvas at scale:1
  const padding = 20;
  const x = Math.max(0, Math.round(rect.left) - padding);
  const y = Math.max(0, Math.round(rect.top) - padding);
  const w = Math.min(canvas.width - x, Math.round(rect.width) + padding * 2);
  const h = Math.min(canvas.height - y, Math.round(rect.height) + padding * 2);

  const cropped = document.createElement("canvas");
  cropped.width = Math.max(1, w);
  cropped.height = Math.max(1, h);
  const ctx = cropped.getContext("2d")!;
  ctx.drawImage(canvas, x, y, w, h, 0, 0, w, h);

  return cropped.toDataURL("image/png");
}
