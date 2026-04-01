import html2canvas from "html2canvas";

export async function captureScreenshot(ignoreSelector: string): Promise<string> {
  const canvas = await html2canvas(document.body, {
    useCORS: true,
    logging: false,
    ignoreElements: (el) => {
      return (
        el.hasAttribute("data-punchbug-ignore") ||
        el.id === "punchbug-root"
      );
    },
  });
  return canvas.toDataURL("image/png");
}
