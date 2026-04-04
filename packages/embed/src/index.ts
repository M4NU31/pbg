import { PunchBug } from "./core/PunchBug";

async function checkAuth(apiUrl: string, embedKey: string): Promise<{ allowed: boolean; userName?: string }> {
  try {
    const url = new URL(apiUrl);
    const checkUrl = `${url.origin}/api/embed/auth-check?key=${encodeURIComponent(embedKey)}`;
    const res = await fetch(checkUrl, { credentials: "include" });
    if (!res.ok) return { allowed: false };
    const data = await res.json();
    return { allowed: data.allowed === true, userName: data.userName || undefined };
  } catch {
    return { allowed: false };
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

  const embedKey           = (scriptEl as HTMLElement).dataset.key;
  const position           = ((scriptEl as HTMLElement).dataset.position as any) || "right";
  const apiUrl             = (scriptEl as HTMLElement).dataset.apiUrl || getDefaultApiUrl();
  const screenshotServerUrl = (scriptEl as HTMLElement).dataset.screenshotServer || undefined;

  if (!embedKey) {
    console.warn("PunchBug: data-key attribute is required.");
    return;
  }

  const { allowed, userName } = await checkAuth(apiUrl, embedKey);
  if (!allowed) return;

  new PunchBug({ embedKey, apiUrl, position, reporterName: userName, screenshotServerUrl });
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

function highlightLinkedElement() {
  const selector = new URLSearchParams(window.location.search).get("pb_element");
  if (!selector) return;
  try {
    const el = document.querySelector(selector) as HTMLElement | null;
    if (!el) return;

    el.scrollIntoView({ block: "center", behavior: "smooth" });

    const box = document.createElement("div");
    box.setAttribute("data-punchbug-ignore", "true");
    box.style.cssText =
      "position:fixed;pointer-events:none;z-index:2147483645;" +
      "box-shadow:0 0 0 3px #3b82f6,0 0 0 8px rgba(59,130,246,0.2);" +
      "border-radius:3px;transition:opacity 0.4s ease";
    document.body.appendChild(box);

    function update() {
      const r = el!.getBoundingClientRect();
      box.style.top = r.top + "px";
      box.style.left = r.left + "px";
      box.style.width = r.width + "px";
      box.style.height = r.height + "px";
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });

    // Fade out after 4 s
    setTimeout(() => {
      box.style.opacity = "0";
      setTimeout(() => {
        box.remove();
        window.removeEventListener("scroll", update);
        window.removeEventListener("resize", update);
      }, 400);
    }, 4000);
  } catch {
    // Selector may not exist on this page — silently ignore
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => { highlightLinkedElement(); init(); });
} else {
  highlightLinkedElement();
  init();
}
