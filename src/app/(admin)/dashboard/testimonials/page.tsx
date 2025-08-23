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
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4 sm:gap-0">
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
