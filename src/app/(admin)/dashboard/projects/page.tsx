// src/app/(admin)/projects/page.tsx
import { db } from "@/lib/db";
import { ProjectForm } from "@/components/admin/project-form";
import { ProjectDataTable, columns } from "@/components/admin/project-data-table";
import { Button } from "@/components/ui/button";

export default async function AdminProjectsPage() {
  const projects = await db.project.findMany({
    where: { isDeleted: false },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4 sm:gap-0">
        <h1 className="text-xl sm:text-2xl font-bold">Manage Projects</h1>
        <ProjectForm>
          <Button>Add New Project</Button>
        </ProjectForm>
      </div>
      <ProjectDataTable columns={columns} data={projects} />
    </div>
  );
}
