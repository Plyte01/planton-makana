// src/app/(admin)/dashboard/experience/page.tsx
import { db } from "@/lib/db";
import { ExperienceDataTable, columns } from "@/components/admin/experience-data-table";
import { ExperienceForm } from "@/components/admin/experience-form";
import { Button } from "@/components/ui/button";

export default async function AdminExperiencePage() {
  // Fetch all experience records, sorted by the custom order field
  const experiences = await db.experience.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manage Work Experience</h1>
          <p className="text-muted-foreground">
            Add, edit, and reorder your professional roles.
          </p>
        </div>
        <ExperienceForm>
          <Button>Add Experience</Button>
        </ExperienceForm>
      </div>
      <ExperienceDataTable columns={columns} data={experiences} />
    </div>
  );
}