// src/components/admin/admin-sidebar.tsx
"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Briefcase, GraduationCap, Star, Pencil, Inbox, User } from "lucide-react";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/projects", label: "Projects", icon: Briefcase },
  { href: "/dashboard/posts", label: "Blog Posts", icon: Pencil },
  { href: "/dashboard/resume", label: "Resume", icon: FileText },
  { href: "/dashboard/inbox", label: "Inbox", icon: Inbox },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/experience", label: "Experience", icon: Briefcase }, // <-- ADD THIS
  { href: "/dashboard/education", label: "Education", icon: GraduationCap }, // <-- ADD THIS
  { href: "/dashboard/testimonials", label: "Testimonials", icon: Star }, // <-- ADD THIS
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    // --- THIS IS THE KEY CHANGE: hidden on mobile, flex on desktop ---
    <aside className="hidden border-r bg-muted/40 md:flex md:flex-col min-h-screen">
      <div className="flex h-14 items-center border-b px-4 sm:px-6 lg:h-[60px] lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          {/* --- LOGO CHANGE --- */}
          <Image 
            src="/logo.png" // <-- REPLACE WITH YOUR LOGO PATH
            alt="Planton CMS Logo" 
            width={32} 
            height={32}
            className="h-8 w-auto"
          />
          <span>Planton CMS</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {NAV_LINKS.map((link) => {
          const isActive = link.href === "/dashboard" 
            ? pathname === link.href 
            : pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${
                isActive ? "bg-muted text-primary" : ""
              }`}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}