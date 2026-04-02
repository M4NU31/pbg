"use client";

import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { X, ArchiveRestore, Trash2 } from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "bg-slate-100 text-slate-600",
  MEDIUM: "bg-blue-100 text-blue-700",
  HIGH: "bg-orange-100 text-orange-700",
  CRITICAL: "bg-red-100 text-red-700",
};

interface ArchivedTasksPanelProps {
  projectId: string;
  onClose: () => void;
  onRestored: () => void;
  onTaskClick: (taskId: string) => void;
}

export function ArchivedTasksPanel({ projectId, onClose, onRestored, onTaskClick }: ArchivedTasksPanelProps) {
  const { data: tasks = [], mutate } = useSWR<any[]>(
    `/api/projects/${projectId}/tasks?archived=true`,
    fetcher
  );

  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  async function unarchive(taskId: string) {
    setLoading(taskId);
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archive: false }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Task restored to board" });
      mutate();
      onRestored();
    } catch {
      toast({ title: "Failed to unarchive", variant: "destructive" });
    } finally {
      setLoading(null);
    }
  }

  async function deleteTask(taskId: string) {
    setLoading(taskId);
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks/${taskId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast({ title: "Task deleted" });
      mutate();
      onRestored();
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" });
    } finally {
      setLoading(null);
      setConfirmDelete(null);
    }
  }

  const taskToDelete = tasks.find((t) => t.id === confirmDelete);

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-[520px] bg-background border-l shadow-xl z-50 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
          <div>
            <h2 className="font-semibold">Archived Tasks</h2>
            <p className="text-xs text-muted-foreground">{tasks.length} task{tasks.length !== 1 ? "s" : ""}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {tasks.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-12">No archived tasks</p>
          )}
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/40 transition-colors"
            >
              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => { onClose(); onTaskClick(task.id); }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-muted-foreground">#{task.taskNumber}</span>
                  <Badge className={`text-xs px-1.5 py-0 border-0 ${PRIORITY_COLORS[task.priority] ?? ""}`}>
                    {task.priority}
                  </Badge>
                </div>
                <p className="text-sm font-medium leading-snug line-clamp-2">{task.title}</p>
                {task.archivedAt && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Archived {new Date(task.archivedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost" size="icon" className="h-7 w-7"
                  onClick={() => unarchive(task.id)}
                  disabled={loading === task.id}
                  title="Restore to board"
                >
                  <ArchiveRestore className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => setConfirmDelete(task.id)}
                  disabled={loading === task.id}
                  title="Delete permanently"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {confirmDelete && taskToDelete && (
        <ConfirmDialog
          open
          onOpenChange={(o) => !o && setConfirmDelete(null)}
          title="Delete task permanently?"
          description="This cannot be undone. All comments and attachments will also be deleted."
          detail={`Task #${taskToDelete.taskNumber}: ${taskToDelete.title}`}
          confirmLabel="Delete"
          variant="danger"
          loading={loading === confirmDelete}
          onConfirm={() => deleteTask(confirmDelete)}
        />
      )}
    </>
  );
}
