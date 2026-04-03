"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Settings, Users, Bug, Archive, Trash2 } from "lucide-react";
import type { SystemRole } from "@/lib/auth-helpers";

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    description: string | null;
    ownerId: string;
    _count: { tasks: number; members: number };
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
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base">{project.name}</CardTitle>
            <div className="flex items-center gap-1 shrink-0">
              {project.role !== "CLIENT" && (
                <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                  <Link href={`/projects/${project.id}/settings`}>
                    <Settings className="h-4 w-4" />
                  </Link>
                </Button>
              )}
              {canArchive && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={() => setArchiveOpen(true)}
                  title="Archive project"
                >
                  <Archive className="h-4 w-4" />
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => setDeleteOpen(true)}
                  title="Delete project"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          {project.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <span className="flex items-center gap-1">
              <Bug className="h-3.5 w-3.5" />
              {project._count.tasks} tasks
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {project._count.members} members
            </span>
          </div>
          <Button asChild className="w-full" size="sm">
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
