import { PunchBug } from "./core/PunchBug";

async function checkAuth(apiUrl: string, embedKey: string): Promise<boolean> {
  try {
    const url = new URL(apiUrl);
    const checkUrl = `${url.origin}/api/embed/auth-check?key=${encodeURIComponent(embedKey)}`;
    const res = await fetch(checkUrl, { credentials: "include" });
    if (!res.ok) return false;
    const data = await res.json();
    return data.allowed === true;
  } catch {
    return false;
  }
}

async function init() {
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

  const allowed = await checkAuth(apiUrl, embedKey);
  if (!allowed) return;

  new PunchBug({ embedKey, apiUrl, position });
}

function getDefaultApiUrl(): string {
  // Try to infer from script src
  const scripts = document.querySelectorAll("script[src*='punchbug']");
  if (scripts.length > 0) {
    const src = (scripts[0] as HTMLScriptElement).src;
    try {
      const url = new URL(src);
      return url.origin;
    } catch {}
  }
  // Fallback
  return "https://punchteam.com";
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
