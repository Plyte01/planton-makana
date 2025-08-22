// src/app/(admin)/dashboard/page.tsx

import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, FileText, Pencil, Users } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  // Securely fetch the session on the server
  const session = await getServerSession(authOptions);

  // Fetch all data concurrently for better performance
  const [projectCount, postCount, resumeCount, userCount] = await Promise.all([
    db.project.count({ where: { isDeleted: false } }),
    db.post.count({ where: { isDeleted: false, published: true } }), // Only count published posts
    db.resume.count({ where: { isDeleted: false } }),
    db.user.count(),
  ]);

  const stats = [
    {
      title: "Total Projects",
      count: projectCount,
      icon: Briefcase,
      href: "/dashboard/projects",
      description: "Manage your portfolio projects."
    },
    {
      title: "Published Posts",
      count: postCount,
      icon: Pencil,
      href: "/dashboard/posts",
      description: "Create and edit blog articles."
    },
    {
      title: "Resume Versions",
      count: resumeCount,
      icon: FileText,
      href: "/dashboard/resume",
      description: "Upload and manage resumes."
    },
    {
      title: "Total Users",
      count: userCount,
      icon: Users,
      href: "#", // No link for users yet
      description: "Registered users in the system."
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {session?.user?.name?.split(' ')[0] ?? "Admin"}!
        </h1>
        <p className="mt-2 text-muted-foreground">
          Here is a summary of your portfolio content.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link href={stat.href} key={stat.title} className={stat.href === "#" ? "pointer-events-none" : ""}>
            <Card className="transition-all hover:border-primary/80 hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.count}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* You can add more dashboard components here in the future, like "Recent Activity" or "Analytics" */}
    </div>
  );
}