import { ProjectForm } from "@/components/projects/ProjectForm";

export default function NewProjectPage() {
  return (
    <div className="p-8 max-w-xl">
      <h1 className="text-2xl font-bold mb-2">Create Project</h1>
      <p className="text-muted-foreground mb-8">
        A project holds all the bug reports and feedback for one website.
      </p>
      <ProjectForm />
    </div>
  );
}
