// src/app/(public)/projects/[slug]/page.tsx
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Metadata } from 'next';
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Github, Link as LinkIcon } from "lucide-react";
import { absoluteUrl } from "@/lib/url"; // <-- 1. IMPORT
import ReactMarkdown from "react-markdown"; // <-- 2. IMPORT
import remarkGfm from "remark-gfm";

type Props = { params: { slug: string } };

export async function generateStaticParams() {
    const projects = await db.project.findMany({
        where: { isDeleted: false },
        select: { slug: true },
    });
    return projects.map((project) => ({
        slug: project.slug,
    }));
}

// Fetch a single project
async function getProject(slug: string) {
  const project = await db.project.findUnique({
    where: { slug, isDeleted: false },
    include: {
      coverImage: true,
      gallery: true,
      user: true, // <-- FIX: This line was missing
    },
  });
  if (!project) notFound();
  return project;
}

// Generate dynamic metadata for the project
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await getProject(params.slug);
  const title = project.seoTitle || project.title;
  const description = project.seoDesc || project.description;

  return {
    title,
    description,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      title,
      description,
      url: absoluteUrl(`/projects/${project.slug}`),
      type: 'website',
      images: project.coverImage ? [project.coverImage.url] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: project.coverImage ? [project.coverImage.url] : [],
    },
  };
}

// The actual page component
export default async function ProjectPage({ params }: Props) {
  const project = await getProject(params.slug);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CreativeWork", // A good schema type for a portfolio project
    "name": project.title,
    "description": project.description,
    "image": project.coverImage?.url,
    "author": {
      "@type": "Person",
      "name": project.user.name || "Planton Makana",
    },
    "dateCreated": project.createdAt.toISOString(),
    "url": absoluteUrl(`/projects/${project.slug}`),
  };

  return (
    <article className="container max-w-4xl py-8">
      {/* --- 5. ADD SCRIPT FOR STRUCTURED DATA --- */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      {project.coverImage && (
        <div className="relative mb-8 h-72 w-full sm:h-96">
          <Image src={project.coverImage.url} alt={project.title} fill className="rounded-lg object-cover" priority />
        </div>
      )}
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold leading-tight tracking-tighter md:text-5xl">{project.title}</h1>
        <p className="mt-2 text-lg text-muted-foreground">{project.description}</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {project.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}
        </div>
      </header>
      
      {/* --- 6. RENDER MARKDOWN CONTENT --- */}
      <div className="prose dark:prose-invert max-w-none mx-auto">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{project.content || ""}</ReactMarkdown>
      </div>

      {project.gallery.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-center mb-6">Gallery</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {project.gallery.map(image => (
              <div key={image.id} className="relative h-64 w-full">
                <Image src={image.url} alt="Project gallery image" fill className="rounded-md object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      <footer className="mt-12 flex justify-center gap-4">
        {project.liveUrl && <Button asChild><Link href={project.liveUrl} target="_blank" rel="noopener noreferrer"><LinkIcon className="mr-2 h-4 w-4"/>Live Site</Link></Button>}
        {project.repoUrl && <Button variant="secondary" asChild><Link href={project.repoUrl} target="_blank" rel="noopener noreferrer"><Github className="mr-2 h-4 w-4"/>GitHub</Link></Button>}
      </footer>
    </article>
  );
}