"use client";

import { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { formatRelativeTime } from "@/lib/utils";
import { X, Monitor, Globe, Maximize2, Paperclip, ChevronDown } from "lucide-react";
import Image from "next/image";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const PRIORITY_OPTIONS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const STATUS_OPTIONS = ["BACKLOG", "TODO", "DOING", "DONE", "CLOSED"];

interface TaskDetailProps {
  taskId: string;
  projectId: string;
  members: { id: string; name: string | null; image: string | null }[];
  currentUserId: string;
  currentUserRole: string;
  onClose: () => void;
  onUpdate: () => void;
}

export function TaskDetail({ taskId, projectId, members, currentUserId, onClose, onUpdate }: TaskDetailProps) {
  const { data: task, mutate } = useSWR(
    `/api/projects/${projectId}/tasks/${taskId}`,
    fetcher
  );

  const [comment, setComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [screenshotExpanded, setScreenshotExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  async function updateTask(data: Record<string, unknown>) {
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      mutate();
      onUpdate();
    } catch {
      toast({ title: "Failed to update task", variant: "destructive" });
    }
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmittingComment(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks/${taskId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: comment }),
      });
      if (!res.ok) throw new Error();
      setComment("");
      mutate();
    } catch {
      toast({ title: "Failed to post comment", variant: "destructive" });
    } finally {
      setSubmittingComment(false);
    }
  }

  async function uploadAttachment(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks/${taskId}/attachments`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error();
      toast({ title: "File uploaded" });
      mutate();
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    }
    e.target.value = "";
  }

  if (!task) {
    return (
      <div className="fixed inset-y-0 right-0 w-[600px] bg-background border-l shadow-xl z-50 flex items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-[620px] bg-background border-l shadow-xl z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
          <span className="text-sm font-mono text-muted-foreground">#{task.taskNumber}</span>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-4 space-y-6">
            {/* Title */}
            <h2 className="text-lg font-semibold leading-snug">{task.title}</h2>

            {/* Status + Priority row */}
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">Status</label>
                <Select value={task.status} onValueChange={(v) => updateTask({ status: v })}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">Priority</label>
                <Select value={task.priority} onValueChange={(v) => updateTask({ priority: v })}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">Assignee</label>
                <Select
                  value={task.assigneeId ?? "unassigned"}
                  onValueChange={(v) => updateTask({ assigneeId: v === "unassigned" ? null : v })}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {members.map((m) => (
                      <SelectItem key={m.id} value={m.id}>{m.name || m.id}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            {task.description && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Description</p>
                <p className="text-sm whitespace-pre-wrap">{task.description}</p>
              </div>
            )}

            {/* Reporter */}
            <div>
              <p className="text-xs text-muted-foreground mb-1">Reported by</p>
              <p className="text-sm">
                {task.creator?.name || task.guestName || "Guest"}
                {task.guestEmail && (
                  <span className="text-muted-foreground"> ({task.guestEmail})</span>
                )}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{formatRelativeTime(task.createdAt)}</p>
            </div>

            {/* Screenshot */}
            {task.screenshotUrl && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-muted-foreground">Screenshot</p>
                  <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setScreenshotExpanded(!screenshotExpanded)}>
                    <Maximize2 className="h-3 w-3 mr-1" />
                    {screenshotExpanded ? "Collapse" : "Expand"}
                  </Button>
                </div>
                <div className={`relative rounded-md overflow-hidden border bg-muted ${screenshotExpanded ? "" : "max-h-48"}`}>
                  <img
                    src={task.screenshotUrl}
                    alt="Screenshot"
                    className="w-full object-cover"
                    style={screenshotExpanded ? {} : { maxHeight: "192px", objectFit: "cover" }}
                  />
                </div>
              </div>
            )}

            {/* Browser / OS info */}
            {(task.browserName || task.pageUrl || task.osName) && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Environment</p>
                <div className="flex flex-wrap gap-2">
                  {task.pageUrl && (
                    <Badge variant="outline" className="text-xs gap-1">
                      <Globe className="h-3 w-3" />
                      {task.pageUrl}
                    </Badge>
                  )}
                  {task.browserName && (
                    <Badge variant="outline" className="text-xs gap-1">
                      <Monitor className="h-3 w-3" />
                      {task.browserName} {task.browserVersion}
                    </Badge>
                  )}
                  {task.osName && (
                    <Badge variant="outline" className="text-xs">
                      {task.osName} {task.osVersion}
                    </Badge>
                  )}
                  {task.screenWidth && (
                    <Badge variant="outline" className="text-xs">
                      {task.screenWidth}×{task.screenHeight}
                    </Badge>
                  )}
                  {task.deviceType && (
                    <Badge variant="outline" className="text-xs">{task.deviceType}</Badge>
                  )}
                </div>
              </div>
            )}

            {/* DOM selector */}
            {task.domSelector && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Element</p>
                <code className="text-xs bg-muted px-2 py-1 rounded font-mono block truncate">
                  {task.domSelector}
                </code>
              </div>
            )}

            {/* Attachments */}
            {task.attachments?.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Attachments ({task.attachments.length})</p>
                <div className="space-y-1">
                  {task.attachments.map((att: any) => (
                    <a
                      key={att.id}
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <Paperclip className="h-3.5 w-3.5" />
                      {att.filename}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Comments */}
            <div>
              <p className="text-xs text-muted-foreground mb-3">
                Comments ({task.comments?.length ?? 0})
              </p>
              <div className="space-y-4">
                {task.comments?.map((c: any) => (
                  <div key={c.id} className="flex gap-3">
                    <UserAvatar
                      name={c.author?.name ?? c.guestName}
                      email={c.author?.email}
                      image={c.author?.image}
                      className="h-7 w-7 shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{c.author?.name || c.guestName || "Guest"}</span>
                        <span className="text-xs text-muted-foreground">{formatRelativeTime(c.createdAt)}</span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{c.body}</p>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={submitComment} className="mt-4 space-y-2">
                <Textarea
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
                <div className="flex items-center gap-2">
                  <Button type="submit" size="sm" disabled={submittingComment || !comment.trim()}>
                    {submittingComment ? "Posting..." : "Post comment"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip className="h-4 w-4 mr-1" />
                    Attach file
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={uploadAttachment}
                  />
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
