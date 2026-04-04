"use client";

import { useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/hooks/use-toast";
import { ArchiveRestore, Trash2 } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "bg-slate-100 text-slate-600",
  MEDIUM: "bg-blue-100 text-blue-700",
  HIGH: "bg-orange-100 text-orange-700",
  CRITICAL: "bg-red-100 text-red-700",
};

interface ArchivedTasksViewProps {
  projectId: string;
  currentUserRole: string;
  onTaskClick: (taskId: string) => void;
}

export function ArchivedTasksView({ projectId, onTaskClick }: ArchivedTasksViewProps) {
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
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" });
    } finally {
      setLoading(null);
      setConfirmDelete(null);
    }
  }

  const taskToDelete = tasks.find((t) => t.id === confirmDelete);

  return (
    <div className="p-6 max-w-2xl space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Archived Tasks</h2>
        <p className="text-sm text-muted-foreground">{tasks.length} task{tasks.length !== 1 ? "s" : ""}</p>
      </div>

      {tasks.length === 0 && (
        <p className="text-sm text-muted-foreground py-8 text-center">No archived tasks</p>
      )}

      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/40 transition-colors"
          >
            <div
              className="flex-1 min-w-0 cursor-pointer"
              onClick={() => onTaskClick(task.id)}
            >
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
    </div>
  );
}
