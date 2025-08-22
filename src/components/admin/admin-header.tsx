// src/components/admin/admin-header.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { CircleUser, Menu, Power, Briefcase, GraduationCap, Star, User } from "lucide-react";
import { signOut, useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetTitle,SheetHeader } from "@/components/ui/sheet";

// Re-define NavLinks here or import from sidebar
const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/projects", label: "Projects" },
  { href: "/dashboard/posts", label: "Blog Posts" },
  { href: "/dashboard/resume", label: "Resume" },
  { href: "/dashboard/inbox", label: "Inbox" },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/experience", label: "Experience", icon: Briefcase }, // <-- ADD THIS
  { href: "/dashboard/education", label: "Education", icon: GraduationCap }, // <-- ADD THIS
  { href: "/dashboard/testimonials", label: "Testimonials", icon: Star }, // <-- ADD THIS
];

export function AdminHeader() {
  const { data: session } = useSession();

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 sm:px-6 lg:h-[60px] lg:px-8 w-full max-w-7xl mx-auto">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col w-64 max-w-full p-0 mt-14 sm:mt-[56px]">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
          </SheetHeader>
          <nav className="grid gap-2 text-lg font-medium p-4">
            <Link
              href="/"
              className="mb-4 flex items-center gap-2 text-lg font-semibold"
            >
              {/* --- LOGO CHANGE --- */}
              <Image 
                src="/logo.png" // <-- REPLACE WITH YOUR LOGO PATH
                alt="Planton CMS Logo" 
                width={32} 
                height={32}
                className="h-8 w-auto"
              />
              <span className="sr-only">Planton CMS</span>
            </Link>
            {NAV_LINKS.map(link => (
                <Link
                    key={link.href}
                    href={link.href}
                    className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground focus:bg-muted focus:text-primary transition-colors"
                >
                    {link.label}
                </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
      <div className="w-full flex-1">
        {/* Optional: Add a search bar or title here later */}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" className="rounded-full">
            <CircleUser className="h-5 w-5" />
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{session?.user?.name ?? 'My Account'}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled>Settings</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
            <Power className="mr-2 h-4 w-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}