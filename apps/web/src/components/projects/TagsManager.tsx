"use client";

import { useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const PRESET_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444",
  "#f97316", "#eab308", "#22c55e", "#14b8a6",
  "#3b82f6", "#64748b",
];

interface Tag { id: string; name: string; color: string; }

interface TagsManagerProps {
  projectId: string;
  canManage: boolean;
}

export function TagsManager({ projectId, canManage }: TagsManagerProps) {
  const { data: tags = [], mutate } = useSWR<Tag[]>(
    `/api/projects/${projectId}/tags`,
    fetcher
  );

  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
  const [addLoading, setAddLoading] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function handleAdd() {
    if (!newName.trim()) return;
    setAddLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), color: newColor }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Tag created" });
      setNewName("");
      setNewColor(PRESET_COLORS[0]);
      setAdding(false);
      mutate();
    } catch {
      toast({ title: "Failed to create tag", variant: "destructive" });
    } finally {
      setAddLoading(false);
    }
  }

  function startEdit(tag: Tag) {
    setEditingId(tag.id);
    setEditName(tag.name);
    setEditColor(tag.color);
  }

  async function saveEdit() {
    if (!editName.trim() || !editingId) return;
    setEditLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/tags/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim(), color: editColor }),
      });
      if (!res.ok) throw new Error();
      setEditingId(null);
      mutate();
    } catch {
      toast({ title: "Failed to update tag", variant: "destructive" });
    } finally {
      setEditLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/tags/${deleteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast({ title: "Tag deleted" });
      mutate();
    } catch {
      toast({ title: "Failed to delete tag", variant: "destructive" });
    } finally {
      setDeleteLoading(false);
      setDeleteId(null);
    }
  }

  const tagToDelete = tags.find((t) => t.id === deleteId);

  return (
    <div className="p-6 max-w-xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Tags</h2>
        <p className="text-sm text-muted-foreground">Organize tasks with color-coded labels.</p>
      </div>

      <div className="space-y-2">
        {tags.length === 0 && !adding && (
          <p className="text-sm text-muted-foreground py-4 text-center">No tags yet.</p>
        )}

        {tags.map((tag) => (
          <div key={tag.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
            {editingId === tag.id ? (
              <>
                <ColorPicker value={editColor} onChange={setEditColor} />
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveEdit();
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  className="h-8 text-sm flex-1"
                  autoFocus
                />
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={saveEdit} disabled={editLoading}>
                  <Check className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingId(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <span className="h-4 w-4 rounded-full shrink-0" style={{ backgroundColor: tag.color }} />
                <span
                  className="flex-1 text-sm font-medium px-1.5 py-0.5 rounded-full"
                  style={{ backgroundColor: `${tag.color}22`, color: tag.color, border: `1px solid ${tag.color}55` }}
                >
                  {tag.name}
                </span>
                {canManage && (
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startEdit(tag)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon" variant="ghost"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(tag.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}

        {adding && (
          <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
            <ColorPicker value={newColor} onChange={setNewColor} />
            <Input
              autoFocus
              placeholder="Tag name..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd();
                if (e.key === "Escape") { setAdding(false); setNewName(""); }
              }}
              className="h-8 text-sm flex-1"
            />
            <Button size="sm" onClick={handleAdd} disabled={addLoading || !newName.trim()}>Add</Button>
            <Button size="sm" variant="ghost" onClick={() => { setAdding(false); setNewName(""); }}>Cancel</Button>
          </div>
        )}
      </div>

      {canManage && !adding && (
        <Button variant="outline" className="w-full border-dashed" onClick={() => setAdding(true)}>
          <Plus className="h-4 w-4 mr-1" />
          New Tag
        </Button>
      )}

      {deleteId && tagToDelete && (
        <ConfirmDialog
          open
          onOpenChange={(o) => !o && setDeleteId(null)}
          title="Delete tag?"
          description="This will remove the tag from all tasks that use it."
          detail={`Tag: ${tagToDelete.name}`}
          confirmLabel="Delete"
          variant="danger"
          loading={deleteLoading}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}

function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <div className="flex items-center gap-1 shrink-0">
      {PRESET_COLORS.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className="h-5 w-5 rounded-full transition-transform hover:scale-110 focus:outline-none"
          style={{
            backgroundColor: c,
            outline: value === c ? `2px solid ${c}` : undefined,
            outlineOffset: value === c ? "2px" : undefined,
          }}
        />
      ))}
    </div>
  );
}
