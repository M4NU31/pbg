import { PunchBug } from "./core/PunchBug";

function init() {
  // Find the <script> tag that loaded this bundle
  const scripts = document.querySelectorAll("script[data-key]");
  let scriptEl: Element | null = null;

  // Try current script first
  if (document.currentScript && (document.currentScript as HTMLScriptElement).dataset.key) {
    scriptEl = document.currentScript;
  } else if (scripts.length > 0) {
    scriptEl = scripts[scripts.length - 1];
  }

  if (!scriptEl) {
    console.warn("PunchBug: No script tag with data-key found.");
    return;
  }

  const embedKey = (scriptEl as HTMLElement).dataset.key;
  const position = ((scriptEl as HTMLElement).dataset.position as any) || "right";
  const apiUrl = (scriptEl as HTMLElement).dataset.apiUrl || getDefaultApiUrl();

  if (!embedKey) {
    console.warn("PunchBug: data-key attribute is required.");
    return;
  }

  new PunchBug({ embedKey, apiUrl, position });
}

function getDefaultApiUrl(): string {
  // Try to infer from script src
  const scripts = document.querySelectorAll("script[src*='punchbug']");
  if (scripts.length > 0) {
    const src = (scripts[0] as HTMLScriptElement).src;
    try {
      const url = new URL(src);
      return `${url.origin}/api/embed/report`;
    } catch {}
  }
  // Fallback
  return "https://punchteam.com/api/embed/report";
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
