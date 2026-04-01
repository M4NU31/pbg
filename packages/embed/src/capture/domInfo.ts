export interface DomInfo {
  selector: string;
  outerHtml: string;
}

export function getDomInfo(el: Element): DomInfo {
  return {
    selector: getUniqueSelector(el),
    outerHtml: el.outerHTML.slice(0, 2000),
  };
}

function getUniqueSelector(el: Element): string {
  const parts: string[] = [];
  let current: Element | null = el;

  while (current && current !== document.body && current.nodeType === Node.ELEMENT_NODE) {
    let part = current.tagName.toLowerCase();

    if (current.id) {
      parts.unshift(`#${CSS.escape(current.id)}`);
      break;
    }

    const siblings = current.parentElement?.children;
    if (siblings && siblings.length > 1) {
      let idx = 1;
      for (let i = 0; i < siblings.length; i++) {
        if (siblings[i] === current) break;
        if (siblings[i].tagName === current.tagName) idx++;
      }

      const sameTagCount = Array.from(siblings).filter((s) => s.tagName === current!.tagName).length;
      if (sameTagCount > 1) {
        part += `:nth-of-type(${idx})`;
      }
    }

    parts.unshift(part);
    current = current.parentElement;

    if (parts.length >= 6) break;
  }

  return parts.join(" > ") || el.tagName.toLowerCase();
}
