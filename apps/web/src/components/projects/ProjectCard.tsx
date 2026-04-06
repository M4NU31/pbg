"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Settings, Users, Bug, Archive, Trash2, MessageSquare, ExternalLink, RefreshCw, Loader2 } from "lucide-react";
import type { SystemRole } from "@/lib/auth-helpers";

interface ProjectCardProps {
  project: {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    siteUrl: string | null;
    ownerId: string;
    screenshotAt: Date | null;
    screenshotUrl: string | null;
    _count: { tasks: number; members: number; comments: number };
    owner: { name: string | null; image: string | null };
    role: string;
  };
  systemRole: SystemRole;
  currentUserId: string;
}

export function ProjectCard({ project, systemRole, currentUserId }: ProjectCardProps) {
  const router = useRouter();
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [screenshotLoading, setScreenshotLoading] = useState(false);
  // screenshotAt null = capture not done yet → show spinner and poll
  const [isCapturing, setIsCapturing] = useState(!project.screenshotAt && !!project.siteUrl);
  const [imgSrc, setImgSrc] = useState<string | null>(project.screenshotUrl);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isCapturing || !project.siteUrl) return;

    fetch(`/api/projects/${project.id}/screenshot`, { method: "POST" }).catch(() => {});

    let attempts = 0;
    pollRef.current = setInterval(async () => {
      attempts++;
      try {
        // Poll the API just to check if the screenshot is ready.
        // Use HEAD-like check: if the endpoint returns ok, fetch the fresh URL from
        // the projects API so we get the direct R2/static URL (no redirect).
        const res = await fetch(`/api/projects/${project.id}/screenshot`);
        if (res.ok || res.redirected) {
          clearInterval(pollRef.current!);
          pollRef.current = null;
          setIsCapturing(false);
          // Fetch the updated project to get the direct screenshotUrl
          const proj = await fetch(`/api/projects`).then(r => r.json()).catch(() => null);
          const updated = Array.isArray(proj) ? proj.find((p: { id: string }) => p.id === project.id) : null;
          setImgSrc(updated?.screenshotUrl ?? res.url ?? `/api/projects/${project.id}/screenshot`);
        }
      } catch { /* keep polling */ }
      if (attempts >= 20) {
        clearInterval(pollRef.current!);
        pollRef.current = null;
        setIsCapturing(false);
      }
    }, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isAdmin = systemRole === "ADMIN";
  const isOwner = project.ownerId === currentUserId;
  const canArchive = isAdmin || (systemRole === "PROJECT_MANAGER" && isOwner);
  const canDelete = isAdmin;
  const canRetakeScreenshot =
    (isAdmin || systemRole === "PROJECT_MANAGER" || project.role === "PROJECT_MANAGER") &&
    !!project.siteUrl;

  const thumbSrc = imgSrc ?? `/api/projects/${project.id}/screenshot`;

  function handleImgError(e: React.SyntheticEvent<HTMLImageElement>) {
    // Only fires if screenshotAt was set but the file is somehow missing (edge case)
    (e.currentTarget as HTMLImageElement).style.display = "none";
  }

  async function handleRetakeScreenshot() {
    if (!project.siteUrl) return;
    setScreenshotLoading(true);
    setIsCapturing(true);
    try {
      await fetch(`/api/projects/${project.id}/screenshot`, { method: "POST" });
      // Poll until the new screenshot is ready
      let attempts = 0;
      const poll = setInterval(async () => {
        attempts++;
        try {
          const res = await fetch(`/api/projects/${project.id}/screenshot`);
          if (res.ok || res.redirected) {
            clearInterval(poll);
            const proj = await fetch(`/api/projects`).then(r => r.json()).catch(() => null);
            const updated = Array.isArray(proj) ? proj.find((p: { id: string }) => p.id === project.id) : null;
            setImgSrc(updated?.screenshotUrl ?? `/api/projects/${project.id}/screenshot?v=${Date.now()}`);
            setIsCapturing(false);
            setScreenshotLoading(false);
          }
        } catch { /* keep polling */ }
        if (attempts >= 20) { clearInterval(poll); setIsCapturing(false); setScreenshotLoading(false); }
      }, 3000);
    } catch {
      setIsCapturing(false);
      setScreenshotLoading(false);
    }
  }

  async function handleArchive() {
    setLoading(true);
    await fetch(`/api/projects/${project.id}/archive`, { method: "POST" });
    setLoading(false);
    setArchiveOpen(false);
    router.refresh();
  }

  async function handleDelete() {
    setLoading(true);
    await fetch(`/api/projects/${project.id}`, { method: "DELETE" });
    setLoading(false);
    setDeleteOpen(false);
    router.refresh();
  }

  return (
    <>
      <Card className="hover:shadow-md transition-shadow overflow-hidden flex flex-col">
        {/* Site screenshot thumbnail */}
        <div className="relative w-full h-[200px] bg-muted overflow-hidden shrink-0 group">
          <img
            key={imgKey}
            src={thumbSrc}
            alt={project.name}
            className="w-full h-full object-cover object-top"
            loading="lazy"
            onError={handleImgError}
          />
          {/* Fallback icon sits behind the image */}
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30 -z-10">
            <Bug className="h-10 w-10" />
          </div>
          {/* Capturing spinner — shown while polling for a new screenshot */}
          {isCapturing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-muted/80 backdrop-blur-sm">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Capturing screenshot…</span>
            </div>
          )}
          {/* Action buttons overlay — visible on hover */}
          <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {project.siteUrl && (
              <a
                href={project.siteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center h-7 w-7 rounded-md bg-background/80 backdrop-blur-sm text-foreground hover:bg-background transition-colors"
                title="Open site"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
            {canRetakeScreenshot && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 bg-background/80 backdrop-blur-sm hover:bg-background text-muted-foreground hover:text-foreground"
                onClick={handleRetakeScreenshot}
                disabled={screenshotLoading}
                title="Retake screenshot"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${screenshotLoading ? "animate-spin" : ""}`} />
              </Button>
            )}
            {project.role !== "CLIENT" && (
              <Button variant="ghost" size="icon"
                className="h-7 w-7 bg-background/80 backdrop-blur-sm hover:bg-background"
                asChild>
                <Link href={`/projects/${project.slug}/settings`}>
                  <Settings className="h-3.5 w-3.5" />
                </Link>
              </Button>
            )}
            {canArchive && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 bg-background/80 backdrop-blur-sm hover:bg-background text-muted-foreground hover:text-foreground"
                onClick={() => setArchiveOpen(true)}
                title="Archive project"
              >
                <Archive className="h-3.5 w-3.5" />
              </Button>
            )}
            {canDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 bg-background/80 backdrop-blur-sm hover:bg-background text-muted-foreground hover:text-destructive"
                onClick={() => setDeleteOpen(true)}
                title="Delete project"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>

        <CardContent className="p-4 flex flex-col flex-1">
          <div className="mb-1">
            <h3 className="font-semibold text-sm leading-tight truncate">{project.name}</h3>
            {project.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{project.description}</p>
            )}
            {project.siteUrl && (
              <a
                href={project.siteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-foreground truncate block mt-0.5 max-w-full"
              >
                {project.siteUrl.replace(/^https?:\/\//, "")}
              </a>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2 mb-3">
            <span className="flex items-center gap-1">
              <Bug className="h-3 w-3" />
              {project._count.tasks}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {project._count.comments}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {project._count.members}
            </span>
          </div>

          <Button asChild className="w-full mt-auto" size="sm">
            <Link href={`/projects/${project.slug}`}>Open Board</Link>
          </Button>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={archiveOpen}
        onOpenChange={setArchiveOpen}
        title={`Archive "${project.name}"?`}
        description="The project will be hidden from the dashboard and moved to Archived Projects. You can restore it at any time."
        confirmLabel="Archive"
        variant="warning"
        loading={loading}
        onConfirm={handleArchive}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Delete "${project.name}"?`}
        description="This will permanently delete the project and all its tasks, comments, and attachments. This action cannot be undone."
        confirmLabel="Delete permanently"
        variant="danger"
        loading={loading}
        onConfirm={handleDelete}
      />
    </>
  );
}
