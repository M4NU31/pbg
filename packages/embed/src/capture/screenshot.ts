import html2canvas from "html2canvas";

function ignoreElements(el: Element): boolean {
  return el.hasAttribute("data-punchbug-ignore") || el.id === "punchbug-root";
}

export async function captureElement(el: HTMLElement): Promise<string> {
  el.scrollIntoView({ block: "center", inline: "center" });
  // Allow scroll and layout to settle
  await new Promise<void>((r) => setTimeout(r, 150));

  const rect = el.getBoundingClientRect();
  const scrollX = window.scrollX;
  const scrollY = window.scrollY;

  // Capture full page so we get accurate rendering, then crop
  const fullCanvas = await html2canvas(document.body, {
    useCORS: true,
    logging: false,
    ignoreElements,
    scrollX: 0,
    scrollY: 0,
    windowWidth: document.documentElement.scrollWidth,
    windowHeight: document.documentElement.scrollHeight,
    width: document.documentElement.scrollWidth,
    height: document.documentElement.scrollHeight,
  });

  const padding = 20;
  const x = Math.max(0, rect.left + scrollX - padding);
  const y = Math.max(0, rect.top + scrollY - padding);
  const w = Math.min(fullCanvas.width - x, rect.width + padding * 2);
  const h = Math.min(fullCanvas.height - y, rect.height + padding * 2);

  const cropped = document.createElement("canvas");
  cropped.width = w;
  cropped.height = h;
  const ctx = cropped.getContext("2d")!;
  ctx.drawImage(fullCanvas, x, y, w, h, 0, 0, w, h);

  return cropped.toDataURL("image/png");
}
