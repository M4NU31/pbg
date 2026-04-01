"use client";

import { useState, useCallback } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import useSWR from "swr";
import { KanbanColumn } from "./KanbanColumn";
import { TaskDetail } from "@/components/tasks/TaskDetail";
import { CreateTaskDialog } from "@/components/tasks/CreateTaskDialog";
import { Button } from "@/components/ui/button";
import { Plus, Settings } from "lucide-react";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface BoardColumn {
  id: string;
  name: string;
  position: number;
}

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
  const canManage = currentUserRole === "OWNER" || currentUserRole === "ADMIN" || currentUserRole === "RANK1";

  const { data: columns = [], mutate: mutateColumns } = useSWR<BoardColumn[]>(
    `/api/projects/${projectId}/columns`,
    fetcher
  );

  const { data: tasks = [], mutate: mutateTasks } = useSWR<any[]>(
    `/api/projects/${projectId}/tasks`,
    fetcher,
    { refreshInterval: 30000 }
  );

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [createInColumnId, setCreateInColumnId] = useState<string | null>(null);
  const [addingColumn, setAddingColumn] = useState(false);
  const [newColName, setNewColName] = useState("");
  const [addingColLoading, setAddingColLoading] = useState(false);

  const tasksByColumn = columns.reduce((acc, col) => {
    acc[col.id] = tasks.filter((t) => t.columnId === col.id);
    return acc;
  }, {} as Record<string, any[]>);

  const onDragEnd = useCallback(
    async (result: DropResult) => {
      const { destination, source, draggableId, type } = result;
      if (!destination) return;
      if (destination.droppableId === source.droppableId && destination.index === source.index) return;

      if (type === "COLUMN") {
        const newCols = Array.from(columns);
        const [removed] = newCols.splice(source.index, 1);
        newCols.splice(destination.index, 0, removed);
        mutateColumns(newCols, false);
        try {
          const res = await fetch(`/api/projects/${projectId}/columns/reorder`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderedIds: newCols.map((c) => c.id) }),
          });
          if (!res.ok) throw new Error();
        } catch {
          toast({ title: "Failed to reorder columns", variant: "destructive" });
          mutateColumns();
        }
        return;
      }

      // Task move
      const newColumnId = destination.droppableId;
      mutateTasks(
        tasks.map((t) => (t.id === draggableId ? { ...t, columnId: newColumnId } : t)),
        false
      );
      try {
        const res = await fetch(`/api/projects/${projectId}/tasks/${draggableId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ columnId: newColumnId }),
        });
        if (!res.ok) throw new Error();
      } catch {
        toast({ title: "Failed to move task", variant: "destructive" });
        mutateTasks();
      }
    },
    [columns, tasks, mutateColumns, mutateTasks, projectId]
  );

  async function handleRenameColumn(columnId: string, newName: string) {
    const prev = columns;
    mutateColumns(
      columns.map((c) => (c.id === columnId ? { ...c, name: newName } : c)),
      false
    );
    try {
      const res = await fetch(`/api/projects/${projectId}/columns/${columnId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });
      if (!res.ok) throw new Error();
    } catch {
      toast({ title: "Failed to rename column", variant: "destructive" });
      mutateColumns(prev, false);
    }
  }

  async function handleDeleteColumn(columnId: string) {
    const prev = columns;
    mutateColumns(columns.filter((c) => c.id !== columnId), false);
    try {
      const res = await fetch(`/api/projects/${projectId}/columns/${columnId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      mutateTasks();
    } catch {
      toast({ title: "Failed to delete column", variant: "destructive" });
      mutateColumns(prev, false);
    }
  }

  async function handleAddColumn() {
    if (!newColName.trim()) return;
    setAddingColLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/columns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newColName.trim() }),
      });
      if (!res.ok) throw new Error();
      await mutateColumns();
      setNewColName("");
      setAddingColumn(false);
    } catch {
      toast({ title: "Failed to add column", variant: "destructive" });
    } finally {
      setAddingColLoading(false);
    }
  }

  return (
    <>
      <div className="flex items-center justify-between px-8 py-3 border-b bg-muted/30">
        <div className="text-sm text-muted-foreground">{tasks.length} tasks total</div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setCreateInColumnId(columns[0]?.id ?? null)}>
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
          <Droppable droppableId="board" direction="horizontal" type="COLUMN">
            {(boardProvided) => (
              <div
                ref={boardProvided.innerRef}
                {...boardProvided.droppableProps}
                className="flex gap-4 p-6 h-full min-w-max items-start"
              >
                {columns.map((col, index) => (
                  <Draggable key={col.id} draggableId={col.id} index={index} isDragDisabled={!canManage}>
                    {(colProvided) => (
                      <div
                        ref={colProvided.innerRef}
                        {...colProvided.draggableProps}
                        className="flex flex-col w-72 shrink-0"
                      >
                        <KanbanColumn
                          column={col}
                          tasks={tasksByColumn[col.id] || []}
                          dragHandleProps={canManage ? colProvided.dragHandleProps : null}
                          canManage={canManage}
                          onTaskClick={setSelectedTaskId}
                          onAddTask={() => setCreateInColumnId(col.id)}
                          onRename={(name) => handleRenameColumn(col.id, name)}
                          onDelete={() => handleDeleteColumn(col.id)}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {boardProvided.placeholder}

                {canManage && (
                  <div className="flex flex-col w-72 shrink-0">
                    {addingColumn ? (
                      <div className="flex flex-col gap-2 p-3 rounded-lg border bg-card">
                        <Input
                          autoFocus
                          placeholder="Column name..."
                          value={newColName}
                          onChange={(e) => setNewColName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleAddColumn();
                            if (e.key === "Escape") { setAddingColumn(false); setNewColName(""); }
                          }}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleAddColumn} disabled={addingColLoading || !newColName.trim()}>
                            Add
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => { setAddingColumn(false); setNewColName(""); }}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full border-dashed text-muted-foreground"
                        onClick={() => setAddingColumn(true)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Column
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </Droppable>
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
          onUpdate={() => mutateTasks()}
        />
      )}

      {createInColumnId && (
        <CreateTaskDialog
          projectId={projectId}
          defaultColumnId={createInColumnId}
          members={members}
          onClose={() => setCreateInColumnId(null)}
          onCreated={() => { mutateTasks(); setCreateInColumnId(null); }}
        />
      )}
    </>
  );
}
