// src/app/(public)/projects/page.tsx
import { db } from "@/lib/db";
import { ProjectCard } from "@/components/project-card";

export default async function ProjectsPage() {
  const projects = await db.project.findMany({
    where: { isDeleted: false },
    orderBy: { createdAt: "desc" },
    include: {
      coverImage: true, // Include the related media record for the cover image
    },
  });

  return (
    <section className="py-16 md:py-24 animate-fade-in-up bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="mb-12 text-4xl sm:text-5xl font-extrabold tracking-tight text-primary drop-shadow-sm text-center">
          My Work
        </h1>

        {projects.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 py-24 text-center">
            <h2 className="text-2xl font-semibold tracking-tight">
              No Projects Yet
            </h2>
            <p className="mt-2 text-muted-foreground">
              New projects are on the way. Check back soon!
            </p>
          </div>
        )}
      </div>
    </section>
  );
}