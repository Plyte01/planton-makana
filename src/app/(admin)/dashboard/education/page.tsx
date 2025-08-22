// src/app/(admin)/dashboard/education/page.tsx
import { db } from "@/lib/db";
import { EducationDataTable, columns } from "@/components/admin/education-data-table";
import { EducationForm } from "@/components/admin/education-form";
import { Button } from "@/components/ui/button";

export default async function AdminEducationPage() {
  // Fetch all education records, sorted by the custom order field
  const educations = await db.education.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manage Education</h1>
          <p className="text-muted-foreground">
            Add, edit, and reorder your educational background.
          </p>
        </div>
        <EducationForm>
          <Button>Add Education</Button>
        </EducationForm>
      </div>
      <EducationDataTable columns={columns} data={educations} />
    </div>
  );
}