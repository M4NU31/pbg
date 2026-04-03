import { toPng } from "html-to-image";

export async function captureElement(el: HTMLElement): Promise<string> {
  el.scrollIntoView({ block: "center", inline: "center" });
  // Allow scroll and repaint to settle
  await new Promise<void>((r) => setTimeout(r, 200));

  // html-to-image serializes the element's HTML/CSS into an SVG foreignObject
  // and renders it to canvas — no CSS parsing, so modern color functions
  // (oklab, oklch, etc.) pass through without errors.
  return toPng(el, {
    cacheBust: true,
    skipFonts: false,
    filter: (node) =>
      !node.hasAttribute?.("data-punchbug-ignore") &&
      node.id !== "punchbug-root",
  });
}
