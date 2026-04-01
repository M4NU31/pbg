export interface BrowserMeta {
  browserName: string;
  browserVersion: string;
  osName: string;
  osVersion: string;
  deviceType: string;
  screenWidth: number;
  screenHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  userAgent: string;
}

export function getBrowserMeta(): BrowserMeta {
  const ua = navigator.userAgent;
  const { browserName, browserVersion } = parseBrowser(ua);
  const { osName, osVersion } = parseOS(ua);
  const deviceType = getDeviceType();

  return {
    browserName,
    browserVersion,
    osName,
    osVersion,
    deviceType,
    screenWidth: screen.width,
    screenHeight: screen.height,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    userAgent: ua,
  };
}

function parseBrowser(ua: string): { browserName: string; browserVersion: string } {
  const browsers = [
    { name: "Chrome", pattern: /Chrome\/([0-9.]+)/ },
    { name: "Firefox", pattern: /Firefox\/([0-9.]+)/ },
    { name: "Safari", pattern: /Version\/([0-9.]+).*Safari/ },
    { name: "Edge", pattern: /Edg\/([0-9.]+)/ },
    { name: "Opera", pattern: /OPR\/([0-9.]+)/ },
  ];

  for (const b of browsers) {
    const match = ua.match(b.pattern);
    if (match) return { browserName: b.name, browserVersion: match[1].split(".")[0] };
  }

  return { browserName: "Unknown", browserVersion: "" };
}

function parseOS(ua: string): { osName: string; osVersion: string } {
  if (/Windows NT 10/.test(ua)) return { osName: "Windows", osVersion: "10/11" };
  if (/Windows NT/.test(ua)) return { osName: "Windows", osVersion: "Other" };
  if (/Mac OS X ([0-9_]+)/.test(ua)) {
    const v = ua.match(/Mac OS X ([0-9_]+)/)?.[1].replace(/_/g, ".") ?? "";
    return { osName: "macOS", osVersion: v };
  }
  if (/Android ([0-9.]+)/.test(ua)) {
    const v = ua.match(/Android ([0-9.]+)/)?.[1] ?? "";
    return { osName: "Android", osVersion: v };
  }
  if (/iPhone OS ([0-9_]+)/.test(ua)) {
    const v = ua.match(/iPhone OS ([0-9_]+)/)?.[1].replace(/_/g, ".") ?? "";
    return { osName: "iOS", osVersion: v };
  }
  if (/Linux/.test(ua)) return { osName: "Linux", osVersion: "" };
  return { osName: "Unknown", osVersion: "" };
}

function getDeviceType(): string {
  const ua = navigator.userAgent;
  if (/Mobi|Android.*Mobile|iPhone|iPod/.test(ua)) return "mobile";
  if (/iPad|Android(?!.*Mobile)/.test(ua)) return "tablet";
  return "desktop";
}
