"use client";

import { useRef, useEffect, useState } from "react";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Check, UserPlus } from "lucide-react";

interface Member {
  id: string;
  name: string | null;
  image: string | null;
  email?: string;
}

interface AssigneeSelectProps {
  members: Member[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  max?: number;
  size?: "sm" | "default";
}

export function AssigneeSelect({ members, selectedIds, onChange, max = 3, size = "default" }: AssigneeSelectProps) {
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
    } else if (selectedIds.length < max) {
      onChange([...selectedIds, id]);
    }
  }

  const selected = members.filter((m) => selectedIds.includes(m.id));

  const triggerH = size === "sm" ? "h-8" : "h-9";
  const avatarSz = size === "sm" ? "h-5 w-5" : "h-6 w-6";

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 w-full px-2 rounded-md border bg-background text-sm hover:bg-accent transition-colors ${triggerH} ${open ? "ring-2 ring-ring ring-offset-2" : ""}`}
      >
        {selected.length === 0 ? (
          <span className="text-muted-foreground flex items-center gap-1.5">
            <UserPlus className="h-3.5 w-3.5" />
            Unassigned
          </span>
        ) : (
          <div className="flex items-center gap-1 flex-1 min-w-0">
            {/* Overlapping avatar stack */}
            <div className="flex items-center">
              {selected.map((m, i) => (
                <div key={m.id} className={i > 0 ? "-ml-1.5" : ""} style={{ zIndex: selected.length - i }}>
                  <UserAvatar name={m.name} email={m.email} image={m.image} className={`${avatarSz} ring-2 ring-background`} />
                </div>
              ))}
            </div>
            <span className="text-xs truncate text-foreground ml-1">
              {selected.map((m) => m.name ?? m.email).join(", ")}
            </span>
          </div>
        )}
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg border bg-popover shadow-lg overflow-hidden min-w-[180px]">
          <div className="p-1.5 text-xs text-muted-foreground px-3 pt-2">
            Select up to {max}
          </div>
          {members.map((m) => {
            const isSelected = selectedIds.includes(m.id);
            const isDisabled = !isSelected && selectedIds.length >= max;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => !isDisabled && toggle(m.id)}
                className={`flex items-center gap-2.5 w-full px-3 py-2 text-left text-sm transition-colors
                  ${isDisabled ? "opacity-40 cursor-not-allowed" : "hover:bg-accent"}
                  ${isSelected ? "bg-primary/5" : ""}`}
              >
                <UserAvatar name={m.name} email={m.email} image={m.image} className="h-6 w-6 shrink-0" />
                <span className="flex-1 truncate">{m.name ?? m.email}</span>
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
                Clear assignees
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Avatar stack for read-only display (task cards, etc.) */
export function AssigneeStack({ assignees, size = "sm" }: { assignees: { id: string; name: string | null; email?: string; image: string | null }[]; size?: "sm" | "xs" }) {
  if (!assignees?.length) return null;
  const sz = size === "xs" ? "h-5 w-5" : "h-6 w-6";
  return (
    <div className="flex items-center">
      {assignees.slice(0, 3).map((a, i) => (
        <div key={a.id} className={i > 0 ? "-ml-1.5" : ""} style={{ zIndex: 3 - i }} title={a.name ?? a.email ?? ""}>
          <UserAvatar name={a.name} email={a.email} image={a.image} className={`${sz} ring-2 ring-card`} />
        </div>
      ))}
    </div>
  );
}
