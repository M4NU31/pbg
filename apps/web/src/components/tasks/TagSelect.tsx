"use client";

import { useRef, useEffect, useState } from "react";
import { Check, Tag as TagIcon, X } from "lucide-react";

export interface Tag {
  id: string;
  name: string;
  color: string;
}

interface TagSelectProps {
  tags: Tag[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  size?: "sm" | "default";
}

export function TagSelect({ tags, selectedIds, onChange, size = "default" }: TagSelectProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  function toggle(id: string) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  }

  const selected = tags.filter((t) => selectedIds.includes(t.id));
  const triggerH = size === "sm" ? "h-8" : "h-9";

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 w-full px-2 rounded-md border bg-background text-sm hover:bg-accent transition-colors ${triggerH} ${open ? "ring-2 ring-ring ring-offset-2" : ""}`}
      >
        {selected.length === 0 ? (
          <span className="text-muted-foreground flex items-center gap-1.5">
            <TagIcon className="h-3.5 w-3.5" />
            No tags
          </span>
        ) : (
          <div className="flex items-center gap-1 flex-wrap flex-1 min-w-0">
            {selected.map((t) => (
              <TagPill key={t.id} tag={t} onRemove={() => toggle(t.id)} />
            ))}
          </div>
        )}
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg border bg-popover shadow-lg overflow-hidden min-w-[180px]">
          {tags.length === 0 ? (
            <p className="text-xs text-muted-foreground px-3 py-3">No tags yet. Create tags in the Tags tab.</p>
          ) : (
            <>
              <div className="p-1.5 text-xs text-muted-foreground px-3 pt-2">Select tags</div>
              {tags.map((t) => {
                const isSelected = selectedIds.includes(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggle(t.id)}
                    className={`flex items-center gap-2.5 w-full px-3 py-2 text-left text-sm transition-colors hover:bg-accent ${isSelected ? "bg-primary/5" : ""}`}
                  >
                    <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
                    <span className="flex-1 truncate">{t.name}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                  </button>
                );
              })}
              {selectedIds.length > 0 && (
                <div className="border-t p-1.5">
                  <button
                    type="button"
                    onClick={() => onChange([])}
                    className="w-full text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded text-left"
                  >
                    Clear tags
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function TagPill({ tag, onRemove, size = "sm" }: { tag: Tag; onRemove?: () => void; size?: "sm" | "xs" }) {
  const textSz = size === "xs" ? "text-[10px]" : "text-xs";
  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full font-medium ${textSz} leading-none`}
      style={{ backgroundColor: `${tag.color}22`, color: tag.color, border: `1px solid ${tag.color}55` }}
    >
      {tag.name}
      {onRemove && (
        <button type="button" onClick={(e) => { e.stopPropagation(); onRemove(); }} className="opacity-70 hover:opacity-100">
          <X className="h-2.5 w-2.5" />
        </button>
      )}
    </span>
  );
}

/** Read-only row of tag pills */
export function TagPillRow({ tags, size = "sm" }: { tags: Tag[]; size?: "sm" | "xs" }) {
  if (!tags?.length) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((t) => <TagPill key={t.id} tag={t} size={size} />)}
    </div>
  );
}
