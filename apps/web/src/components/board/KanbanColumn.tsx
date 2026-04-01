"use client";

import { useState, useRef, useEffect } from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { TaskCard } from "./TaskCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, GripVertical, Pencil, Trash2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface BoardColumn {
  id: string;
  name: string;
  position: number;
}

interface KanbanColumnProps {
  column: BoardColumn;
  tasks: any[];
  dragHandleProps: any;
  canManage: boolean;
  onTaskClick: (taskId: string) => void;
  onAddTask: () => void;
  onRename: (newName: string) => void;
  onDelete: () => void;
}

const COLUMN_COLORS = [
  "bg-slate-500/10",
  "bg-blue-500/10",
  "bg-yellow-500/10",
  "bg-purple-500/10",
  "bg-green-500/10",
  "bg-rose-500/10",
  "bg-orange-500/10",
  "bg-cyan-500/10",
];

export function KanbanColumn({
  column,
  tasks,
  dragHandleProps,
  canManage,
  onTaskClick,
  onAddTask,
  onRename,
  onDelete,
}: KanbanColumnProps) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(column.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  function startEdit() {
    setEditName(column.name);
    setEditing(true);
  }

  function confirmEdit() {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== column.name) {
      onRename(trimmed);
    }
    setEditing(false);
  }

  function cancelEdit() {
    setEditName(column.name);
    setEditing(false);
  }

  const colorClass = COLUMN_COLORS[column.position % COLUMN_COLORS.length];

  return (
    <div className="flex flex-col w-72 shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 group">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {canManage && dragHandleProps && (
            <span
              {...dragHandleProps}
              className="cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-muted-foreground shrink-0"
            >
              <GripVertical className="h-4 w-4" />
            </span>
          )}

          {editing ? (
            <div className="flex items-center gap-1 flex-1">
              <Input
                ref={inputRef}
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") confirmEdit();
                  if (e.key === "Escape") cancelEdit();
                }}
                className="h-6 px-1 py-0 text-sm font-medium"
              />
              <Button variant="ghost" size="icon" className="h-5 w-5 shrink-0" onClick={confirmEdit}>
                <Check className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="icon" className="h-5 w-5 shrink-0" onClick={cancelEdit}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-1 min-w-0 flex-1">
              <h3 className="font-medium text-sm truncate">{column.name}</h3>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full shrink-0">
                {tasks.length}
              </span>
              {canManage && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={startEdit}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
          {canManage && !editing && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onAddTask}>
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Task list */}
      <Droppable droppableId={column.id} type="TASK">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "flex-1 rounded-lg p-2 min-h-[400px] transition-colors",
              colorClass,
              snapshot.isDraggingOver && "ring-2 ring-primary/30"
            )}
          >
            {tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(taskProvided, taskSnapshot) => (
                  <div
                    ref={taskProvided.innerRef}
                    {...taskProvided.draggableProps}
                    {...taskProvided.dragHandleProps}
                  >
                    <TaskCard
                      task={task}
                      index={index}
                      isDragging={taskSnapshot.isDragging}
                      onClick={() => onTaskClick(task.id)}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}

            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex items-center justify-center h-24 text-xs text-muted-foreground">
                Drop tasks here
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}
