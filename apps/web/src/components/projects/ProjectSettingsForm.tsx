"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

interface Project {
  id: string;
  name: string;
  description: string | null;
  allowedDomains: unknown; // Json in MySQL, cast to string[]
}

export function ProjectSettingsForm({ project }: { project: Project }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description ?? "");
  const [allowedDomains, setAllowedDomains] = useState(
    ((project.allowedDomains as string[]) ?? []).join(", ")
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const domains = allowedDomains
        .split(",")
        .map((d) => d.trim())
        .filter(Boolean);

      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, allowedDomains: domains }),
      });

      if (!res.ok) throw new Error("Failed to update project");

      toast({ title: "Settings saved" });
      router.refresh();
    } catch {
      toast({ title: "Error saving settings", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">General Settings</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Project Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="domains">Allowed Domains (optional)</Label>
          <Input
            id="domains"
            placeholder="example.com, staging.example.com"
            value={allowedDomains}
            onChange={(e) => setAllowedDomains(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Comma-separated. If set, only these domains can submit bug reports via the embed script.
          </p>
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </div>
  );
}
