"use client";

import { useState, useCallback } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import useSWR from "swr";
import { KanbanColumn } from "./KanbanColumn";
import { TaskDetail } from "@/components/tasks/TaskDetail";
import { CreateTaskDialog } from "@/components/tasks/CreateTaskDialog";
import { Button } from "@/components/ui/button";
import { Plus, Settings } from "lucide-react";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";

const STATUSES = [
  { key: "BACKLOG", label: "Backlog", color: "bg-slate-100" },
  { key: "TODO", label: "To Do", color: "bg-blue-50" },
  { key: "DOING", label: "In Progress", color: "bg-yellow-50" },
  { key: "DONE", label: "Done", color: "bg-green-50" },
  { key: "CLOSED", label: "Closed", color: "bg-gray-100" },
] as const;

type TaskStatus = (typeof STATUSES)[number]["key"];

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface User {
  id: string;
  name: string | null;
  image: string | null;
  email?: string;
}

interface KanbanBoardProps {
  projectId: string;
  members: User[];
  currentUserId: string;
  currentUserRole: string;
}

export function KanbanBoard({ projectId, members, currentUserId, currentUserRole }: KanbanBoardProps) {
  const { data: tasks = [], mutate } = useSWR<any[]>(
    `/api/projects/${projectId}/tasks`,
    fetcher,
    { refreshInterval: 30000 }
  );

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [createInStatus, setCreateInStatus] = useState<TaskStatus | null>(null);

  const tasksByStatus = STATUSES.reduce((acc, { key }) => {
    acc[key] = tasks.filter((t) => t.status === key);
    return acc;
  }, {} as Record<TaskStatus, any[]>);

  const onDragEnd = useCallback(
    async (result: DropResult) => {
      const { destination, source, draggableId } = result;
      if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) return;

      const newStatus = destination.droppableId as TaskStatus;

      // Optimistic update
      mutate(
        tasks.map((t) => (t.id === draggableId ? { ...t, status: newStatus } : t)),
        false
      );

      try {
        const res = await fetch(`/api/projects/${projectId}/tasks/${draggableId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });
        if (!res.ok) throw new Error();
      } catch {
        toast({ title: "Failed to move task", variant: "destructive" });
        mutate(); // Revert
      }
    },
    [tasks, mutate, projectId]
  );

  return (
    <>
      <div className="flex items-center justify-between px-8 py-3 border-b bg-muted/30">
        <div className="text-sm text-muted-foreground">{tasks.length} tasks total</div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setCreateInStatus("BACKLOG")}>
            <Plus className="h-4 w-4 mr-1" />
            Add Task
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/projects/${projectId}/settings`}>
              <Settings className="h-4 w-4 mr-1" />
              Settings
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 p-6 h-full min-w-max">
            {STATUSES.map(({ key, label, color }) => (
              <KanbanColumn
                key={key}
                status={key}
                label={label}
                color={color}
                tasks={tasksByStatus[key]}
                onTaskClick={setSelectedTaskId}
                onAddTask={() => setCreateInStatus(key)}
              />
            ))}
          </div>
        </DragDropContext>
      </div>

      {selectedTaskId && (
        <TaskDetail
          taskId={selectedTaskId}
          projectId={projectId}
          members={members}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
          onClose={() => setSelectedTaskId(null)}
          onUpdate={() => mutate()}
        />
      )}

      {createInStatus && (
        <CreateTaskDialog
          projectId={projectId}
          defaultStatus={createInStatus}
          members={members}
          onClose={() => setCreateInStatus(null)}
          onCreated={() => { mutate(); setCreateInStatus(null); }}
        />
      )}
    </>
  );
}
