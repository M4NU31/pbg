"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Settings, Users, Bug, Archive, Trash2, MessageSquare, ExternalLink } from "lucide-react";
import type { SystemRole } from "@/lib/auth-helpers";

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    description: string | null;
    siteUrl: string | null;
    ownerId: string;
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

  const isRank1 = systemRole === "RANK1";
  const isOwner = project.ownerId === currentUserId;
  const canArchive = isRank1 || (systemRole === "RANK2" && isOwner);
  const canDelete = isRank1 || (systemRole === "RANK2" && isOwner);

  const thumbUrl = project.siteUrl
    ? `https://image.thum.io/get/width/480/crop/280/${project.siteUrl}`
    : null;

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
        <div className="relative w-full h-[140px] bg-muted overflow-hidden shrink-0">
          {thumbUrl ? (
            <img
              src={thumbUrl}
              alt={project.name}
              className="w-full h-full object-cover object-top"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground/40">
              <Bug className="h-10 w-10" />
            </div>
          )}
          {/* Action buttons overlay */}
          <div className="absolute top-2 right-2 flex items-center gap-1">
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
            {project.role !== "CLIENT" && (
              <Button variant="ghost" size="icon"
                className="h-7 w-7 bg-background/80 backdrop-blur-sm hover:bg-background"
                asChild>
                <Link href={`/projects/${project.id}/settings`}>
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
            <Link href={`/projects/${project.id}`}>Open Board</Link>
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
