import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bug, Users, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    description: string | null;
    _count: { tasks: number; members: number };
    owner: { name: string | null; image: string | null };
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base">{project.name}</CardTitle>
          <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
            <Link href={`/projects/${project.id}/settings`}>
              <Settings className="h-4 w-4" />
            </Link>
          </Button>
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
  );
}
