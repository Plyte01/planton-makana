// src/app/(admin)/dashboard/testimonials/page.tsx
import { db } from "@/lib/db";
import { TestimonialDataTable, columns } from "@/components/admin/testimonial-data-table";
import { TestimonialForm } from "@/components/admin/testimonial-form";
import { Button } from "@/components/ui/button";

export default async function AdminTestimonialsPage() {
  // Fetch all testimonial records, sorted by the custom order field
  const testimonials = await db.testimonial.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manage Testimonials</h1>
          <p className="text-muted-foreground">
            Add, edit, and reorder testimonials from colleagues and clients.
          </p>
        </div>
        <TestimonialForm>
          <Button>Add Testimonial</Button>
        </TestimonialForm>
      </div>
      <TestimonialDataTable columns={columns} data={testimonials} />
    </div>
  );
}