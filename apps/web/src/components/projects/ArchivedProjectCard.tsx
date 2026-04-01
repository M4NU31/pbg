"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Bug, ArchiveRestore, Trash2 } from "lucide-react";
import type { SystemRole } from "@/lib/auth-helpers";

interface ArchivedProjectCardProps {
  project: {
    id: string;
    name: string;
    description: string | null;
    ownerId: string;
    archivedAt: Date;
    taskCount: number;
    ownerName: string;
  };
  systemRole: SystemRole;
  currentUserId: string;
}

export function ArchivedProjectCard({ project, systemRole, currentUserId }: ArchivedProjectCardProps) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const isRank1 = systemRole === "RANK1";
  const isOwner = project.ownerId === currentUserId;
  const canRestore = isRank1 || (systemRole === "RANK2" && isOwner);
  const canDelete = isRank1 || (systemRole === "RANK2" && isOwner);

  async function handleRestore() {
    setLoading(true);
    await fetch(`/api/projects/${project.id}/archive`, { method: "DELETE" });
    setLoading(false);
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
      <Card className="opacity-80 hover:opacity-100 transition-opacity">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base">{project.name}</CardTitle>
            <div className="flex items-center gap-1 shrink-0">
              {canRestore && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={handleRestore}
                  disabled={loading}
                  title="Restore project"
                >
                  <ArchiveRestore className="h-4 w-4" />
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => setDeleteOpen(true)}
                  title="Delete permanently"
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
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Bug className="h-3.5 w-3.5" />
              {project.taskCount} tasks
            </span>
            <span className="text-xs">Owner: {project.ownerName}</span>
          </div>
        </CardContent>
      </Card>

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
