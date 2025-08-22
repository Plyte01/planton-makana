// src/app/(public)/about/page.tsx
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Github, Linkedin, Briefcase, GraduationCap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

async function getAdminProfile() {
  const admin = await db.user.findFirst({
    where: { role: 'ADMIN' },
    include: {
      experiences: { orderBy: { order: 'asc' } },
      educations: { orderBy: { order: 'asc' } },
    }
  });
  if (!admin) throw new Error("Admin profile not found.");
  return admin;
}

export default async function AboutPage() {
  const admin = await getAdminProfile();
  const socialLinks = admin.socialLinks as { github?: string; linkedin?: string } | null;
  const profileImage = admin.image && admin.image.startsWith("http") ? admin.image : "/logo.png";

  // Helper to format dates for display
  const formatDate = (date: Date) => new Date(date).getFullYear();

  return (
    <section className="py-16 md:py-24 animate-fade-in-up bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
          <div className="relative w-44 h-44 sm:w-56 sm:h-56 md:w-72 md:h-72 rounded-full overflow-hidden shadow-lg flex-shrink-0 border-4 border-primary/30 bg-background">
            <Image src={profileImage} alt={admin.name || "Admin"} fill className="object-cover" priority />
          </div>
          <div className="text-center md:text-left w-full">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-primary drop-shadow-sm animate-fade-in-up">
              {admin.name}
            </h1>
            <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-secondary-foreground animate-fade-in-up delay-100">
              {admin.tagline}
            </h2>
            <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-3 sm:gap-5 animate-fade-in-up delay-200">
              {socialLinks?.github && <Button variant="outline" asChild><Link href={socialLinks.github} target="_blank"><Github className="mr-2 h-4 w-4" /> GitHub</Link></Button>}
              {socialLinks?.linkedin && <Button variant="outline" asChild><Link href={socialLinks.linkedin} target="_blank"><Linkedin className="mr-2 h-4 w-4" /> LinkedIn</Link></Button>}
            </div>
          </div>
        </div>
        {/* --- BIO & SKILLS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="md:col-span-2">
                <h3 className="text-2xl font-bold mb-4">About Me</h3>
                <div className="prose dark:prose-invert max-w-none"><p>{admin.bio}</p></div>
            </div>
            <div>
                <h3 className="text-2xl font-bold mb-4">My Skills</h3>
                <div className="flex flex-wrap gap-2">
                    {admin.skills.map(skill => <Badge key={skill}>{skill}</Badge>)}
                </div>
            </div>
        </div>

        {/* --- EXPERIENCE TIMELINE --- */}
        {admin.experiences.length > 0 && (
          <div>
            <h3 className="text-3xl font-bold mb-8 text-center">Work Experience</h3>
            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
              {admin.experiences.map(job => (
                <div key={job.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-background bg-card group-odd:order-1 group-odd:ml-auto group-even:mr-auto text-primary shrink-0">
                    <Briefcase className="w-5 h-5"/>
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-card border p-4 rounded-lg shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                        <h4 className="font-bold text-lg">{job.title}</h4>
                        <time className="text-sm text-muted-foreground shrink-0">{formatDate(job.startDate)} - {job.endDate ? formatDate(job.endDate) : 'Present'}</time>
                    </div>
                    <p className="font-medium text-primary">{job.company}</p>
                    <p className="text-sm text-muted-foreground">{job.location}</p>
                    {job.description && <p className="mt-2 text-sm text-muted-foreground">{job.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- EDUCATION TIMELINE --- */}
        {admin.educations.length > 0 && (
          <div>
            <h3 className="text-3xl font-bold mb-8 text-center">Education</h3>
            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
              {admin.educations.map(edu => (
                <div key={edu.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-background bg-card group-odd:order-1 group-odd:ml-auto group-even:mr-auto text-primary shrink-0">
                    <GraduationCap className="w-5 h-5"/>
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-card border p-4 rounded-lg shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                        <h4 className="font-bold text-lg">{edu.degree}</h4>
                        <time className="text-sm text-muted-foreground shrink-0">{formatDate(edu.startDate)} - {edu.endDate ? formatDate(edu.endDate) : 'Present'}</time>
                    </div>
                    <p className="font-medium text-primary">{edu.school}</p>
                    <p className="text-sm text-muted-foreground">{edu.field}</p>
                    {edu.grade && <p className="mt-1 text-sm text-muted-foreground">Grade: {edu.grade}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Skills */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold mb-4">My Skills</h3>
          <div className="flex flex-wrap gap-2">
            {admin.skills.map(skill => <Badge key={skill}>{skill}</Badge>)}
          </div>
        </div>
      </div>
    </section>
  );
}
