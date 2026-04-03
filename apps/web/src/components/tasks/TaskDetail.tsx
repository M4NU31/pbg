"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import useSWR from "swr";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/hooks/use-toast";
import { formatRelativeTime } from "@/lib/utils";
import { X, Monitor, Globe, Maximize2, Paperclip, Archive, Trash2, Link2, ArchiveRestore, Pencil, Check, ExternalLink } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const PRIORITY_OPTIONS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

interface Member {
  id: string;
  name: string | null;
  image: string | null;
  email?: string;
}

interface TaskDetailProps {
  taskId: string;
  projectId: string;
  members: Member[];
  currentUserId: string;
  currentUserRole: string;
  onClose: () => void;
  onUpdate: () => void;
}

/** Renders comment text with mentions highlighted.
 *  Handles both structured @[Name](userId) and legacy plain @Name formats. */
function CommentBody({ body }: { body: string }) {
  // Match structured @[Name](userId) OR plain @Word mentions
  const pattern = /@\[([^\]]+)\]\([^)]+\)|@([\w][^\s@]*(?:\s[\w][^\s@]*)*)/g;
  const parts: React.ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(body)) !== null) {
    if (match.index > last) parts.push(body.slice(last, match.index));
    const name = match[1] ?? match[2];
    parts.push(
      <span key={match.index} className="text-primary font-semibold">
        @{name}
      </span>
    );
    last = match.index + match[0].length;
  }
  if (last < body.length) parts.push(body.slice(last));
  return <p className="text-sm whitespace-pre-wrap">{parts}</p>;
}

export function TaskDetail({ taskId, projectId, members, currentUserId, currentUserRole, onClose, onUpdate }: TaskDetailProps) {
  const { data: task, mutate } = useSWR(`/api/projects/${projectId}/tasks/${taskId}`, fetcher);
  const { data: columns = [] } = useSWR<{ id: string; name: string }[]>(
    `/api/projects/${projectId}/columns`,
    fetcher
  );

  // ── inline editing ──────────────────────────────────────────────
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const titleInputRef = useRef<HTMLInputElement>(null);

  const [editingDesc, setEditingDesc] = useState(false);
  const [descDraft, setDescDraft] = useState("");
  const descRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { if (editingTitle) titleInputRef.current?.focus(); }, [editingTitle]);
  useEffect(() => { if (editingDesc) descRef.current?.focus(); }, [editingDesc]);

  // ── comment @mention ─────────────────────────────────────────────
  const [comment, setComment] = useState("");
  const [mentionMap, setMentionMap] = useState<Record<string, string>>({}); // name → userId
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionStart, setMentionStart] = useState(-1);
  const [mentionIndex, setMentionIndex] = useState(0);
  const commentRef = useRef<HTMLTextAreaElement>(null);

  const mentionCandidates = mentionQuery !== "" || mentionStart >= 0
    ? members.filter(
        (m) => m.name && m.id !== currentUserId && m.name.toLowerCase().includes(mentionQuery.toLowerCase())
      )
    : [];

  const showMentions = mentionStart >= 0 && mentionCandidates.length > 0;

  function handleCommentChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value;
    setComment(val);
    const cursor = e.target.selectionStart ?? 0;
    const before = val.slice(0, cursor);
    const atMatch = before.match(/@([^\s@]*)$/);
    if (atMatch) {
      setMentionQuery(atMatch[1]);
      setMentionStart(cursor - atMatch[0].length);
      setMentionIndex(0);
    } else {
      setMentionStart(-1);
      setMentionQuery("");
    }
  }

  function insertMention(member: Member) {
    if (!member.name) return;
    const before = comment.slice(0, mentionStart);
    const after = comment.slice(mentionStart + 1 + mentionQuery.length);
    // Show clean @Name in textarea; keep name→id map to reconstruct on submit
    setComment(`${before}@${member.name} ${after}`);
    setMentionMap((prev) => ({ ...prev, [member.name!]: member.id }));
    setMentionStart(-1);
    setMentionQuery("");
    setTimeout(() => commentRef.current?.focus(), 0);
  }

  /** Expand @Name tokens to @[Name](userId) using mentionMap before sending */
  function buildCommentBody(raw: string): string {
    const names = Object.keys(mentionMap);
    if (!names.length) return raw;
    // Sort longest first so "Manuel Francia" matches before "Manuel"
    names.sort((a, b) => b.length - a.length);
    let result = raw;
    for (const name of names) {
      const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      result = result.replace(new RegExp(`@${escaped}`, "g"), `@[${name}](${mentionMap[name]})`);
    }
    return result;
  }

  function handleCommentKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (showMentions) {
      if (e.key === "ArrowDown") { e.preventDefault(); setMentionIndex((i) => Math.min(i + 1, mentionCandidates.length - 1)); return; }
      if (e.key === "ArrowUp") { e.preventDefault(); setMentionIndex((i) => Math.max(i - 1, 0)); return; }
      if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); insertMention(mentionCandidates[mentionIndex]); return; }
      if (e.key === "Escape") { setMentionStart(-1); setMentionQuery(""); return; }
    }
  }

  // ── misc state ───────────────────────────────────────────────────
  const [submittingComment, setSubmittingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentBody, setEditingCommentBody] = useState("");
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const [screenshotLightbox, setScreenshotLightbox] = useState(false);

  async function saveCommentEdit(commentId: string) {
    if (!editingCommentBody.trim()) return;
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks/${taskId}/comments/${commentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: editingCommentBody }),
      });
      if (!res.ok) throw new Error();
      setEditingCommentId(null);
      mutate();
    } catch {
      toast({ title: "Failed to update comment", variant: "destructive" });
    }
  }

  async function deleteComment(commentId: string) {
    setDeletingCommentId(commentId);
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks/${taskId}/comments/${commentId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      mutate();
    } catch {
      toast({ title: "Failed to delete comment", variant: "destructive" });
    } finally {
      setDeletingCommentId(null);
    }
  }
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape" && !editingTitle && !editingDesc) onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose, editingTitle, editingDesc]);

  // ── API helpers ──────────────────────────────────────────────────
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

  async function saveTitle() {
    const trimmed = titleDraft.trim();
    setEditingTitle(false);
    if (trimmed && trimmed !== task?.title) await updateTask({ title: trimmed });
  }

  async function saveDesc() {
    setEditingDesc(false);
    if (descDraft !== (task?.description ?? "")) await updateTask({ description: descDraft });
  }

  async function handleArchive() {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archive: !task?.archivedAt }),
      });
      if (!res.ok) throw new Error();
      toast({ title: task?.archivedAt ? "Task unarchived" : "Task archived" });
      onUpdate();
      onClose();
    } catch {
      toast({ title: "Action failed", variant: "destructive" });
    } finally {
      setActionLoading(false);
      setConfirmArchive(false);
    }
  }

  async function handleDelete() {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks/${taskId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast({ title: "Task deleted" });
      onUpdate();
      onClose();
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
    } finally {
      setActionLoading(false);
      setConfirmDelete(false);
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(`${window.location.origin}/projects/${projectId}?task=${taskId}`).then(() => {
      toast({ title: "Link copied to clipboard" });
    });
  }

  const directLink = task?.pageUrl && task?.domSelector
    ? `${task.pageUrl}${task.pageUrl.includes("?") ? "&" : "?"}pb_element=${encodeURIComponent(task.domSelector)}`
    : null;

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmittingComment(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks/${taskId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: buildCommentBody(comment) }),
      });
      if (!res.ok) throw new Error();
      setComment("");
      setMentionMap({});
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
      const res = await fetch(`/api/projects/${projectId}/tasks/${taskId}/attachments`, { method: "POST", body: formData });
      if (!res.ok) throw new Error();
      toast({ title: "File uploaded" });
      mutate();
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    }
    e.target.value = "";
  }

  // ── render ───────────────────────────────────────────────────────
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
      <div className="fixed inset-y-0 right-0 w-full md:w-[620px] bg-background border-l shadow-xl z-50 flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
          <span className="text-sm font-mono text-muted-foreground">#{task.taskNumber}</span>
          <div className="flex items-center gap-1">
            {directLink && (
              <Button variant="ghost" size="icon" className="h-8 w-8" title="View element on page"
                onClick={() => window.open(directLink, "_blank", "noopener,noreferrer")}>
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyLink} title="Copy link">
              <Link2 className="h-4 w-4" />
            </Button>
            {(currentUserRole !== "CLIENT" || task.creatorId === currentUserId || task.assigneeId === currentUserId) && (
              <>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setConfirmArchive(true)} title={task.archivedAt ? "Unarchive" : "Archive"}>
                  {task.archivedAt ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setConfirmDelete(true)} title="Delete">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-4 space-y-5">

            {/* Title — inline edit */}
            {editingTitle ? (
              <Input
                ref={titleInputRef}
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onBlur={saveTitle}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); saveTitle(); }
                  if (e.key === "Escape") { setEditingTitle(false); }
                }}
                className="text-lg font-semibold h-auto py-1 px-2"
              />
            ) : (
              <h2
                className="text-lg font-semibold leading-snug cursor-text hover:bg-muted/50 rounded px-2 py-1 -mx-2 transition-colors"
                onClick={() => { setTitleDraft(task.title); setEditingTitle(true); }}
                title="Click to edit title"
              >
                {task.title}
              </h2>
            )}

            {/* Column + Priority + Assignee */}
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">Column</label>
                <Select value={task.columnId ?? ""} onValueChange={(v) => updateTask({ columnId: v })}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="No column" /></SelectTrigger>
                  <SelectContent>
                    {columns.map((col) => <SelectItem key={col.id} value={col.id}>{col.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">Priority</label>
                <Select value={task.priority} onValueChange={(v) => updateTask({ priority: v })}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">Assignee</label>
                <Select value={task.assigneeId ?? "unassigned"} onValueChange={(v) => updateTask({ assigneeId: v === "unassigned" ? null : v })}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Unassigned" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {members.map((m) => <SelectItem key={m.id} value={m.id}>{m.name || m.id}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description — inline edit */}
            <div>
              <p className="text-xs text-muted-foreground mb-1">Description</p>
              {editingDesc ? (
                <Textarea
                  ref={descRef}
                  value={descDraft}
                  onChange={(e) => setDescDraft(e.target.value)}
                  onBlur={saveDesc}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") { setEditingDesc(false); }
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) saveDesc();
                  }}
                  rows={4}
                  className="resize-none text-sm"
                  placeholder="Add a description..."
                />
              ) : (
                <div
                  className="text-sm cursor-text hover:bg-muted/50 rounded px-2 py-1.5 -mx-2 transition-colors min-h-[2.5rem]"
                  onClick={() => { setDescDraft(task.description ?? ""); setEditingDesc(true); }}
                  title="Click to edit description"
                >
                  {task.description
                    ? <p className="whitespace-pre-wrap">{task.description}</p>
                    : <p className="text-muted-foreground italic">Click to add a description...</p>
                  }
                </div>
              )}
            </div>

            {/* Reporter */}
            <div>
              <p className="text-xs text-muted-foreground mb-1">Reported by</p>
              <p className="text-sm">
                {task.creator?.name || task.guestName || "Guest"}
                {task.guestEmail && <span className="text-muted-foreground"> ({task.guestEmail})</span>}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{formatRelativeTime(task.createdAt)}</p>
            </div>

            {/* Screenshot */}
            {task.screenshotUrl && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-muted-foreground">Screenshot</p>
                  <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setScreenshotLightbox(true)}>
                    <Maximize2 className="h-3 w-3 mr-1" />Expand
                  </Button>
                </div>
                <div className="relative rounded-md overflow-hidden border bg-muted max-h-48 cursor-zoom-in"
                  onClick={() => setScreenshotLightbox(true)}>
                  <img src={task.screenshotUrl} alt="Screenshot" className="w-full object-cover" style={{ maxHeight: "192px", objectFit: "cover" }} />
                </div>
              </div>
            )}

            {/* Environment */}
            {(task.browserName || task.pageUrl || task.osName) && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Environment</p>
                <div className="flex flex-wrap gap-2">
                  {task.pageUrl && (
                    <a href={directLink ?? task.pageUrl} target="_blank" rel="noopener noreferrer">
                      <Badge variant="outline" className="text-xs gap-1 cursor-pointer hover:bg-muted transition-colors">
                        <Globe className="h-3 w-3" />{task.pageUrl}
                      </Badge>
                    </a>
                  )}
                  {task.browserName && <Badge variant="outline" className="text-xs gap-1"><Monitor className="h-3 w-3" />{task.browserName} {task.browserVersion}</Badge>}
                  {task.osName && <Badge variant="outline" className="text-xs">{task.osName} {task.osVersion}</Badge>}
                  {task.screenWidth && <Badge variant="outline" className="text-xs">{task.screenWidth}×{task.screenHeight}</Badge>}
                  {task.deviceType && <Badge variant="outline" className="text-xs">{task.deviceType}</Badge>}
                </div>
              </div>
            )}

            {/* DOM selector */}
            {task.domSelector && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Element</p>
                <code className="text-xs bg-muted px-2 py-1 rounded font-mono block truncate">{task.domSelector}</code>
              </div>
            )}

            {/* Attachments */}
            {task.attachments?.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Attachments ({task.attachments.length})</p>
                <div className="space-y-1">
                  {task.attachments.map((att: any) => (
                    <a key={att.id} href={att.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                      <Paperclip className="h-3.5 w-3.5" />{att.filename}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Comments */}
            <div>
              <p className="text-xs text-muted-foreground mb-3">Comments ({task.comments?.length ?? 0})</p>
              <div className="space-y-4">
                {task.comments?.map((c: any) => {
                  const isOwn = c.author?.id === currentUserId;
                  const canDeleteComment = isOwn ||
                    currentUserRole === "OWNER" || currentUserRole === "ADMIN" ||
                    currentUserRole === "RANK1" || currentUserRole === "RANK2";
                  const isEditing = editingCommentId === c.id;
                  return (
                    <div key={c.id} className="flex gap-3 group">
                      <UserAvatar name={c.author?.name ?? c.guestName} email={c.author?.email} image={c.author?.image} className="h-7 w-7 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{c.author?.name || c.guestName || "Guest"}</span>
                          <span className="text-xs text-muted-foreground">{formatRelativeTime(c.createdAt)}</span>
                          {c.updatedAt !== c.createdAt && (
                            <span className="text-xs text-muted-foreground italic">(edited)</span>
                          )}
                          {(isOwn || canDeleteComment) && !isEditing && (
                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
                              {isOwn && (
                                <Button
                                  variant="ghost" size="icon" className="h-5 w-5"
                                  onClick={() => { setEditingCommentId(c.id); setEditingCommentBody(c.body); }}
                                  title="Edit comment"
                                >
                                  <Pencil className="h-3 w-3" />
                                </Button>
                              )}
                              <Button
                                variant="ghost" size="icon" className="h-5 w-5 text-destructive hover:text-destructive"
                                onClick={() => deleteComment(c.id)}
                                disabled={deletingCommentId === c.id}
                                title="Delete comment"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>

                        {isEditing ? (
                          <div className="space-y-1.5">
                            <Textarea
                              value={editingCommentBody}
                              onChange={(e) => setEditingCommentBody(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Escape") setEditingCommentId(null);
                                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) saveCommentEdit(c.id);
                              }}
                              rows={3}
                              className="resize-none text-sm"
                              autoFocus
                            />
                            <div className="flex gap-2">
                              <Button size="sm" className="h-7 text-xs" onClick={() => saveCommentEdit(c.id)} disabled={!editingCommentBody.trim()}>
                                <Check className="h-3 w-3 mr-1" />Save
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditingCommentId(null)}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <CommentBody body={c.body} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Comment form with @mention */}
              <form onSubmit={submitComment} className="mt-4 space-y-2">
                <div className="relative">
                  <Textarea
                    ref={commentRef}
                    placeholder="Add a comment… type @ to mention someone"
                    value={comment}
                    onChange={handleCommentChange}
                    onKeyDown={handleCommentKeyDown}
                    rows={3}
                    className="resize-none"
                  />

                  {/* @mention dropdown */}
                  {showMentions && (
                    <div className="absolute bottom-full left-0 mb-1 w-64 bg-popover border rounded-md shadow-lg z-10 overflow-hidden">
                      {mentionCandidates.map((m, i) => (
                        <button
                          key={m.id}
                          type="button"
                          className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-muted transition-colors ${i === mentionIndex ? "bg-muted" : ""}`}
                          onMouseDown={(e) => { e.preventDefault(); insertMention(m); }}
                          onMouseEnter={() => setMentionIndex(i)}
                        >
                          <UserAvatar name={m.name} email={m.email} image={m.image} className="h-6 w-6 shrink-0" />
                          <span className="truncate">{m.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button type="submit" size="sm" disabled={submittingComment || !comment.trim()}>
                    {submittingComment ? "Posting..." : "Post comment"}
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                    <Paperclip className="h-4 w-4 mr-1" />
                    Attach file
                  </Button>
                  <input ref={fileInputRef} type="file" className="hidden" onChange={uploadAttachment} />
                </div>
              </form>
            </div>

          </div>
        </div>
      </div>

      {/* Screenshot lightbox */}
      {screenshotLightbox && task?.screenshotUrl && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setScreenshotLightbox(false)}>
          <img src={task.screenshotUrl} alt="Screenshot" className="max-w-full max-h-full rounded-lg shadow-2xl object-contain" onClick={(e) => e.stopPropagation()} />
          <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-white hover:bg-white/20"
            onClick={() => setScreenshotLightbox(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={confirmArchive}
        onOpenChange={setConfirmArchive}
        title={task.archivedAt ? "Unarchive task?" : "Archive task?"}
        description={task.archivedAt ? "This will move the task back to the active board." : "This will hide the task from the board. You can unarchive it later."}
        confirmLabel={task.archivedAt ? "Unarchive" : "Archive"}
        variant="warning"
        loading={actionLoading}
        onConfirm={handleArchive}
      />

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete task?"
        description="This will permanently delete the task and all its comments and attachments. This cannot be undone."
        detail={`Task #${task.taskNumber}: ${task.title}`}
        confirmLabel="Delete"
        variant="danger"
        loading={actionLoading}
        onConfirm={handleDelete}
      />
    </>
  );
}
