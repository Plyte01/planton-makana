// src/app/(public)/page.tsx

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { ProjectCard } from "@/components/project-card";
import { PostCard } from "@/components/post-card";
import { TestimonialCard } from "@/components/testimonial-card"; 
import Image from "next/image";

async function getAdminProfile() {
  const admin = await db.user.findFirst({ where: { role: 'ADMIN' } });
  if (!admin) throw new Error("Admin profile not found.");
  return admin;
}

export default async function HomePage() {
  // Fetch admin profile, featured projects, and recent posts concurrently
  const [admin, projects, posts, testimonials] = await Promise.all([
    getAdminProfile(),
    db.project.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { coverImage: true },
    }),
    db.post.findMany({
      where: { isDeleted: false, published: true },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { coverImage: true },
    }),
    db.testimonial.findMany({ // New data fetch
      orderBy: { order: 'asc' },
    }),
  ]);

  const profileImage = admin.image && admin.image.startsWith("http") ? admin.image : "/logo.png";

  return (
    <>
      {/* --- Modern Hero Section with Admin Data --- */}
      <section className="relative flex flex-col items-center justify-center py-16 md:py-32 bg-gradient-to-br from-primary/10 via-background to-secondary/10 animate-fade-in">
        <div className="absolute inset-0 pointer-events-none select-none opacity-30 blur-2xl z-0" aria-hidden>
          <div className="w-full h-full bg-gradient-to-tr from-blue-200 via-purple-200 to-pink-200 dark:from-blue-900 dark:via-purple-900 dark:to-pink-900" />
        </div>
        <div className="relative z-10 w-full max-w-5xl flex flex-col md:flex-row items-center md:items-start justify-center gap-10 md:gap-16 px-4">
          {/* Left: Profile Image */}
          <div className="flex-shrink-0 flex justify-center md:justify-start w-full md:w-auto mb-8 md:mb-0">
            <div className="relative border-4 border-primary/30 bg-background shadow-lg overflow-hidden rounded-xl max-w-[320px] max-h-[480px] w-full h-auto">
              <Image
                src={profileImage}
                alt={admin.name || "Admin"}
                width={800}
                height={1200}
                className="w-full h-auto object-cover"
                priority
              />
            </div>
          </div>
          {/* Right: Hero Content */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left w-full">
            <h1 className="text-5xl font-extrabold tracking-tight text-primary drop-shadow-sm sm:text-6xl md:text-7xl animate-fade-in-up">
              {admin.name}
            </h1>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl text-secondary-foreground animate-fade-in-up delay-100">
              {admin.tagline}
            </h2>
            <p className="mt-6 text-lg leading-8 text-muted-foreground animate-fade-in-up delay-200 max-w-xl">
              {admin.bio}
            </p>
            <div className="mt-10 flex flex-wrap items-center md:justify-start justify-center gap-4 animate-fade-in-up delay-300">
              <Button asChild size="lg">
                <Link href="/projects">View My Work</Link>
              </Button>
              <Button variant="outline" asChild size="lg">
                <Link href="/resume">Download Resume</Link>
              </Button>
              <Button variant="ghost" asChild size="lg">
                <Link href="/contact">Contact Me</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* --- Featured Projects Section --- */}
      {projects.length > 0 && (
        <section className="py-16 md:py-20 bg-muted/50 dark:bg-muted/20 animate-fade-in-up">
          <div className="container">
            <div className="text-center">
              <h2 className="text-4xl font-bold tracking-tight">Featured Projects</h2>
              <p className="mt-2 text-lg text-muted-foreground">A selection of my recent work.</p>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
            <div className="mt-14 text-center">
              <Button asChild variant="outline" size="lg">
                <Link href="/projects">View All Projects</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      {testimonials.length > 0 && (
        <section className="py-12 md:py-16 bg-muted/50 dark:bg-muted/20">
          <div className="container">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight">What People Are Saying</h2>
              <p className="mt-2 text-muted-foreground">Testimonials from colleagues and clients.</p>
            </div>
            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map(testimonial => (
                <TestimonialCard key={testimonial.id} testimonial={testimonial} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* --- Recent Posts Section --- */}
      {posts.length > 0 && (
        <section className="py-16 md:py-20 animate-fade-in-up">
          <div className="container">
            <div className="text-center">
              <h2 className="text-4xl font-bold tracking-tight">Recent Posts</h2>
              <p className="mt-2 text-lg text-muted-foreground">My latest thoughts and tutorials.</p>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
            <div className="mt-14 text-center">
              <Button asChild variant="outline" size="lg">
                <Link href="/blog">Read All Posts</Link>
              </Button>
            </div>
          </div>
        </section>
      )}
    </>
  );
}