// src/app/(public)/resume/page.tsx
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Download, FileText, XCircle } from "lucide-react";
import { slugify } from "@/lib/utils";

export default async function ResumePage() {
  const defaultResume = await db.resume.findFirst({
    where: {
      isDefault: true,
      isPublic: true,
      isDeleted: false,
    },
    orderBy: {
      createdAt: "desc", // Get the newest one if multiple are marked as default
    },
  });

  // --- FIXED CLOUDINARY DOWNLOAD TRANSFORMATION ---
  const createDownloadUrl = (url: string, title: string) => {
    if (!url) return "#";

    // Get extension (e.g., .pdf, .docx)
    const fileExtension = url.substring(url.lastIndexOf('.'));

    // Clean file title for filename
    const cleanFilename = slugify(title);
    const downloadFilename = `${cleanFilename}${fileExtension}`;

    // For RAW/DOC/PDF resources, safest is query param
    return `${url}?fl_attachment=${encodeURIComponent(downloadFilename)}`;
  };

  return (
    <section className="py-16 md:py-24 animate-fade-in-up bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="container">
        <h1 className="mb-12 text-4xl sm:text-5xl font-extrabold tracking-tight text-primary drop-shadow-sm text-center">
          Resume
        </h1>

        {defaultResume ? (
          <div className="rounded-lg border bg-card p-8 text-card-foreground shadow-sm animate-fade-in-up">
            <div className="flex flex-col items-center text-center md:flex-row md:text-left gap-8">
              <FileText className="mb-4 h-20 w-20 text-primary md:mb-0 md:mr-8" />
              <div className="flex-grow">
                <h2 className="text-2xl font-semibold">
                  {defaultResume.title}
                </h2>
                {defaultResume.description && (
                  <p className="mt-2 text-muted-foreground">
                    {defaultResume.description}
                  </p>
                )}
              </div>
              <Button asChild className="mt-6 w-full md:mt-0 md:w-auto">
                <a
                  href={createDownloadUrl(defaultResume.fileUrl, defaultResume.title)}
                  //target="_blank"
                  rel="noopener noreferrer"
                  download
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </a>
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 py-24 text-center animate-fade-in-up">
            <XCircle className="mb-4 h-12 w-12 text-muted-foreground" />
            <h2 className="text-2xl font-semibold tracking-tight">
              Resume Not Available
            </h2>
            <p className="mt-2 text-muted-foreground">
              A public resume has not been uploaded yet. Please check back
              later.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
