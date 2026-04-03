import html2canvas from "html2canvas";

function ignoreElements(el: Element): boolean {
  return el.hasAttribute("data-punchbug-ignore") || el.id === "punchbug-root";
}

export async function captureScreenshot(_ignoreSelector: string): Promise<string> {
  const canvas = await html2canvas(document.body, {
    useCORS: true,
    logging: false,
    ignoreElements,
  });
  return canvas.toDataURL("image/png");
}

export async function captureElement(el: HTMLElement): Promise<string> {
  el.scrollIntoView({ block: "center", inline: "center" });
  // Allow scroll to settle before capturing
  await new Promise<void>((r) => setTimeout(r, 120));
  const canvas = await html2canvas(el, {
    useCORS: true,
    logging: false,
    ignoreElements,
  });
  return canvas.toDataURL("image/png");
}
