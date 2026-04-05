"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/ui/user-avatar";
import { toast } from "@/hooks/use-toast";
import { Copy, Check, ChevronRight, ChevronLeft, X, UserPlus, Loader2 } from "lucide-react";

interface SearchUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  avatarUrl: string;
}

interface InviteChip {
  email: string;
  user?: SearchUser;
}

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STEPS = ["Project Details", "Embed Script", "Invite Members"];

export function CreateProjectDialog({ open, onOpenChange }: CreateProjectDialogProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Step 1 fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [siteUrl, setSiteUrl] = useState("");

  // Step 2 - created project data
  const [createdProject, setCreatedProject] = useState<{ id: string; embedKey: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // Step 3 - member invite chips
  const [chips, setChips] = useState<InviteChip[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<SearchUser[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep(0);
        setName(""); setDescription(""); setSiteUrl("");
        setCreatedProject(null); setCopied(false);
        setChips([]); setInputValue(""); setSuggestions([]); setShowSuggestions(false);
      }, 200);
    }
  }, [open]);

  // Autocomplete debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (inputValue.trim().length < 1 || !createdProject) { setSuggestions([]); setShowSuggestions(false); return; }
    debounceRef.current = setTimeout(async () => {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(inputValue)}&projectId=${createdProject.id}`);
      if (res.ok) {
        const data: SearchUser[] = await res.json();
        const filtered = data.filter((u) => !chips.some((c) => c.email.toLowerCase() === u.email.toLowerCase()));
        setSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
      }
    }, 200);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [inputValue, createdProject, chips]);

  // Click-outside to close suggestions
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setShowSuggestions(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleCreateProject() {
    if (!name.trim() || !siteUrl.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || null, siteUrl: siteUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCreatedProject({ id: data.id, embedKey: data.embedKey });
      setStep(1);
    } catch (err) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Failed to create project", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  function embedScript() {
    if (!createdProject) return "";
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `<script src="${origin}/embed.js" data-key="${createdProject.embedKey}" defer></script>`;
  }

  function handleCopy() {
    navigator.clipboard.writeText(embedScript());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function addChip(user: SearchUser) {
    setChips((prev) => [...prev, { email: user.email, user }]);
    setInputValue("");
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  }

  function addEmailChip(email: string) {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || chips.some((c) => c.email.toLowerCase() === trimmed)) return;
    setChips((prev) => [...prev, { email: trimmed }]);
    setInputValue("");
  }

  function removeChip(email: string) {
    setChips((prev) => prev.filter((c) => c.email !== email));
  }

  function handleInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if ((e.key === "," || e.key === "Enter" || e.key === "Tab") && inputValue.trim()) {
      e.preventDefault();
      // If there's a focused suggestion, let Enter pick it — otherwise commit the typed email
      if (e.key === "Enter" && suggestions.length > 0 && showSuggestions) return;
      addEmailChip(inputValue.replace(/,$/, ""));
    }
    if (e.key === "Backspace" && !inputValue && chips.length > 0) {
      setChips((prev) => prev.slice(0, -1));
    }
  }

  async function handleInviteAll() {
    if (!createdProject || chips.length === 0) { finishAndClose(); return; }
    setInviteLoading(true);
    let failCount = 0;
    for (const chip of chips) {
      try {
        const res = await fetch(`/api/projects/${createdProject.id}/members`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: chip.email }),
        });
        if (!res.ok) failCount++;
      } catch { failCount++; }
    }
    setInviteLoading(false);
    if (failCount > 0) {
      toast({ title: `${failCount} invite(s) failed`, variant: "destructive" });
    } else {
      toast({ title: "Members invited!", description: `${chips.length} member(s) added to the project.` });
    }
    finishAndClose();
  }

  function finishAndClose() {
    onOpenChange(false);
    if (createdProject) {
      router.push(`/projects/${createdProject.id}`);
    } else {
      router.refresh();
    }
  }

  const embedCode = embedScript();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{STEPS[step]}</DialogTitle>
          <DialogDescription className="sr-only">Step {step + 1} of {STEPS.length}: {STEPS[step]}</DialogDescription>
        </DialogHeader>

        {/* Step indicators */}
        <div className="flex items-center gap-2 mb-2">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`flex items-center justify-center h-6 w-6 rounded-full text-xs font-semibold transition-colors ${
                i < step ? "bg-primary text-primary-foreground" :
                i === step ? "bg-primary text-primary-foreground" :
                "bg-muted text-muted-foreground"
              }`}>
                {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span className={`text-xs hidden sm:block ${i === step ? "text-foreground font-medium" : "text-muted-foreground"}`}>{label}</span>
              {i < STEPS.length - 1 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
            </div>
          ))}
        </div>

        {/* Step 1: Project Details */}
        {step === 0 && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="proj-name">Project Name <span className="text-destructive">*</span></Label>
              <Input
                id="proj-name"
                placeholder="My Website QA"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="proj-desc">Description</Label>
              <Textarea
                id="proj-desc"
                placeholder="What is this project about?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="proj-url">Site URL <span className="text-destructive">*</span></Label>
              <Input
                id="proj-url"
                type="url"
                placeholder="https://example.com"
                value={siteUrl}
                onChange={(e) => setSiteUrl(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button onClick={handleCreateProject} disabled={loading || !name.trim() || !siteUrl.trim()}>
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Create &amp; Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Embed Script */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Add this snippet to your site's <code className="text-xs bg-muted px-1 py-0.5 rounded">&lt;head&gt;</code> or before the closing <code className="text-xs bg-muted px-1 py-0.5 rounded">&lt;/body&gt;</code> tag.
            </p>
            <div className="relative">
              <pre className="bg-muted rounded-lg p-4 text-xs overflow-x-auto whitespace-pre-wrap break-all pr-12">
                {embedCode}
              </pre>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7"
                onClick={handleCopy}
                title="Copy to clipboard"
              >
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <div className="flex justify-between gap-2 pt-2">
              <Button variant="ghost" onClick={() => setStep(0)}>
                <ChevronLeft className="h-4 w-4 mr-1" />Back
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={finishAndClose}>Skip &amp; Finish</Button>
                <Button onClick={() => setStep(2)}>
                  Next: Invite Members <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Invite Members */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Search by name or email. Press <kbd className="text-xs bg-muted px-1 py-0.5 rounded">Enter</kbd> or <kbd className="text-xs bg-muted px-1 py-0.5 rounded">,</kbd> to add.
            </p>

            <div ref={wrapperRef} className="relative">
              {/* Tag input container */}
              <div
                className="min-h-[80px] flex flex-wrap gap-1.5 p-2 rounded-md border bg-background cursor-text focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
                onClick={() => inputRef.current?.focus()}
              >
                {chips.map((chip) => (
                  <span
                    key={chip.email}
                    className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs rounded-full px-2.5 py-1 max-w-[200px]"
                  >
                    {chip.user && (
                      <UserAvatar name={chip.user.name} email={chip.user.email} image={chip.user.image} className="h-4 w-4" />
                    )}
                    <span className="truncate">{chip.user?.name ?? chip.email}</span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeChip(chip.email); }}
                      className="ml-0.5 hover:text-destructive transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  placeholder={chips.length === 0 ? "Search by name or email…" : ""}
                  className="flex-1 min-w-[140px] outline-none bg-transparent text-sm placeholder:text-muted-foreground"
                  autoComplete="off"
                />
              </div>

              {/* Autocomplete dropdown */}
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg border bg-popover shadow-lg overflow-hidden">
                  {suggestions.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); addChip(user); }}
                      className="flex items-center gap-3 w-full px-3 py-2.5 text-left hover:bg-accent transition-colors"
                    >
                      <UserAvatar name={user.name} email={user.email} image={user.image} avatarUrl={user.avatarUrl} className="h-7 w-7" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{user.name ?? user.email}</p>
                        {user.name && <p className="text-xs text-muted-foreground truncate">{user.email}</p>}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-between gap-2 pt-2">
              <Button variant="ghost" onClick={() => setStep(1)}>
                <ChevronLeft className="h-4 w-4 mr-1" />Back
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={finishAndClose}>Skip</Button>
                <Button onClick={handleInviteAll} disabled={inviteLoading}>
                  {inviteLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UserPlus className="h-4 w-4 mr-2" />}
                  {chips.length > 0 ? `Invite ${chips.length} & Finish` : "Finish"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
