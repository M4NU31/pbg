"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Copy, RefreshCw, Check } from "lucide-react";
import { buildEmbedSnippet } from "@/lib/embed-snippet";

interface EmbedSnippetProps {
  embedKey: string;
  embedUrl: string;
}

export function EmbedSnippet({ embedKey, embedUrl }: EmbedSnippetProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [rotating, setRotating] = useState(false);

  const snippet = buildEmbedSnippet(embedKey, embedUrl);

  async function copySnippet() {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied to clipboard!" });
  }

  async function rotateKey() {
    if (!confirm("Rotate the embed key? The old key will stop working immediately.")) return;
    setRotating(true);
    try {
      const projectId = window.location.pathname.split("/")[2];
      const res = await fetch(`/api/projects/${projectId}/embed-key`, { method: "POST" });
      if (!res.ok) throw new Error();
      toast({ title: "Embed key rotated", description: "Update your site with the new snippet." });
      router.refresh();
    } catch {
      toast({ title: "Failed to rotate key", variant: "destructive" });
    } finally {
      setRotating(false);
    }
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-1">Embed Script</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Add this snippet to your website to start collecting bug reports.
      </p>
      <div className="relative">
        <pre className="bg-muted rounded-lg p-4 text-sm font-mono overflow-x-auto border">
          {snippet}
        </pre>
        <Button
          variant="outline"
          size="sm"
          className="absolute top-2 right-2"
          onClick={copySnippet}
        >
          {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <span className="text-xs text-muted-foreground font-mono">Key: {embedKey}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={rotateKey}
          disabled={rotating}
          className="text-xs h-7"
        >
          <RefreshCw className={`h-3 w-3 mr-1 ${rotating ? "animate-spin" : ""}`} />
          Rotate key
        </Button>
      </div>
    </div>
  );
}
