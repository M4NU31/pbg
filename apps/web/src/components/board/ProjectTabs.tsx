"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { KanbanBoard } from "./KanbanBoard";
import { TagsManager } from "@/components/projects/TagsManager";
import { MembersTabView } from "@/components/projects/MembersTabView";
import { ArchivedTasksView } from "@/components/tasks/ArchivedTasksView";

type Tab = "tasks" | "archived" | "tags" | "members" | "clients";

interface User {
  id: string;
  name: string | null;
  image: string | null;
  email: string;
}

interface Member {
  id: string;
  role: string;
  user: User;
}

interface ProjectTabsProps {
  projectId: string;
  projectName: string;
  projectDescription: string | null;
  members: User[];
  allMembers: Member[];
  currentUserId: string;
  currentUserRole: string;
}

const TABS: { id: Tab; label: string }[] = [
  { id: "tasks", label: "Tasks" },
  { id: "archived", label: "Archived tasks" },
  { id: "tags", label: "Tags" },
  { id: "members", label: "Members" },
  { id: "clients", label: "Clients" },
];

export function ProjectTabs({
  projectId,
  projectName,
  projectDescription,
  members,
  allMembers,
  currentUserId,
  currentUserRole,
}: ProjectTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = (searchParams.get("tab") as Tab) || "tasks";
  const canManage = currentUserRole === "OWNER" || currentUserRole === "ADMIN" || currentUserRole === "RANK1";

  function setTab(tab: Tab) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    // Clear task param when switching tabs
    if (tab !== "tasks" && tab !== "archived") params.delete("task");
    router.replace(`?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="flex flex-col h-full">
      {/* Project header */}
      <div className="px-4 md:px-8 pt-4 pb-0 border-b bg-background">
        <div className="mb-3">
          <h1 className="text-xl font-bold">{projectName}</h1>
          {projectDescription && (
            <p className="text-sm text-muted-foreground">{projectDescription}</p>
          )}
        </div>
        {/* Tab bar */}
        <div className="flex items-center gap-0 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={`px-3 md:px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors -mb-px
                ${activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === "tasks" && (
          <KanbanBoard
            projectId={projectId}
            members={members}
            currentUserId={currentUserId}
            currentUserRole={currentUserRole}
          />
        )}
        {activeTab === "archived" && (
          <ArchivedTasksView
            projectId={projectId}
            currentUserRole={currentUserRole}
            onTaskClick={(taskId) => {
              const params = new URLSearchParams(searchParams.toString());
              params.set("tab", "tasks");
              params.set("task", taskId);
              router.replace(`?${params.toString()}`, { scroll: false });
            }}
          />
        )}
        {activeTab === "tags" && (
          <div className="flex-1 overflow-y-auto">
            <TagsManager projectId={projectId} canManage={canManage} />
          </div>
        )}
        {activeTab === "members" && (
          <div className="flex-1 overflow-y-auto">
            <MembersTabView
              projectId={projectId}
              allMembers={allMembers}
              currentUserId={currentUserId}
              currentUserRole={currentUserRole}
              filter="team"
            />
          </div>
        )}
        {activeTab === "clients" && (
          <div className="flex-1 overflow-y-auto">
            <MembersTabView
              projectId={projectId}
              allMembers={allMembers}
              currentUserId={currentUserId}
              currentUserRole={currentUserRole}
              filter="clients"
            />
          </div>
        )}
      </div>
    </div>
  );
}
