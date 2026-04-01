"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserAvatar } from "@/components/ui/user-avatar";
import { MessageSquare, Paperclip, Monitor, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

const PRIORITY_COLORS = {
  LOW: "bg-slate-100 text-slate-600",
  MEDIUM: "bg-blue-100 text-blue-700",
  HIGH: "bg-orange-100 text-orange-700",
  CRITICAL: "bg-red-100 text-red-700",
};

interface TaskCardProps {
  task: any;
  index: number;
  isDragging?: boolean;
  onClick: () => void;
}

export function TaskCard({ task, isDragging, onClick }: TaskCardProps) {
  return (
    <div className="mb-2">
      <Card
        className={cn(
          "cursor-pointer hover:shadow-md transition-shadow border",
          isDragging && "shadow-lg rotate-1"
        )}
        onClick={onClick}
      >
        <CardContent className="p-3 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <span className="text-xs text-muted-foreground font-mono">#{task.taskNumber}</span>
            <Badge
              className={cn("text-xs px-1.5 py-0 border-0", PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS])}
            >
              {task.priority}
            </Badge>
          </div>

          <p className="text-sm font-medium leading-snug line-clamp-2">{task.title}</p>

          {(task.pageUrl || task.browserName) && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {task.pageUrl && (
                <span className="flex items-center gap-1 truncate">
                  <Globe className="h-3 w-3 shrink-0" />
                  <span className="truncate">{new URL(task.pageUrl).hostname}</span>
                </span>
              )}
              {task.browserName && (
                <span className="flex items-center gap-1">
                  <Monitor className="h-3 w-3 shrink-0" />
                  {task.browserName}
                </span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {task._count?.comments > 0 && (
                <span className="flex items-center gap-0.5">
                  <MessageSquare className="h-3 w-3" />
                  {task._count.comments}
                </span>
              )}
              {task._count?.attachments > 0 && (
                <span className="flex items-center gap-0.5">
                  <Paperclip className="h-3 w-3" />
                  {task._count.attachments}
                </span>
              )}
            </div>
            {task.assignee && (
              <UserAvatar
                name={task.assignee.name}
                email={task.assignee.email}
                image={task.assignee.image}
                className="h-5 w-5"
              />
            )}
            {!task.assignee && (task.guestName || task.guestEmail) && (
              <Avatar className="h-5 w-5">
                <AvatarFallback className="text-[10px] bg-purple-100 text-purple-700">G</AvatarFallback>
              </Avatar>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
