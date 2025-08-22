// src/components/public-navbar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "./theme-toggle";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
  { href: "/resume", label: "Resume" },
  { href: "/contact", label: "Contact" },
  { href: "/about", label: "About" },
  
];

export function PublicNavbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const NavLink = ({ href, label }: { href: string; label: string }) => {
    const isActive = pathname === href;
    return (
      <Link
        href={href}
        className={`text-sm font-medium transition-colors hover:text-primary ${
          isActive ? "text-primary" : "text-muted-foreground"
        }`}
      >
        {label}
      </Link>
    );
  };
  
  const MobileNavLink = ({ href, label }: { href: string; label: string }) => (
    <Link 
      href={href} 
      className="block py-2 text-lg"
      onClick={() => setIsMobileMenuOpen(false)} // Close menu on click
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 flex h-14 items-center">
        {/* Desktop Nav */}
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2 min-w-0">
            {/* --- LOGO CHANGE (Desktop) --- */}
            <Image 
              src="/logo.png" // <-- REPLACE WITH YOUR LOGO PATH
              alt="Planton Makana Logo" 
              width={32} 
              height={32}
              className="h-8 w-auto min-w-0"
            />
            <span className="hidden font-bold sm:inline-block truncate">
              Planton Makana
            </span>
          </Link>
          <nav className="flex items-center space-x-4 md:space-x-6 text-sm font-medium">
            {NAV_LINKS.map((link) => (
              <NavLink key={link.href} {...link} />
            ))}
          </nav>
        </div>

        {/* Mobile Nav */}
        <div className="flex w-full items-center justify-between md:hidden">
          <Link href="/" className="flex items-center space-x-2 min-w-0">
             {/* --- LOGO CHANGE (Mobile) --- */}
            <Image 
              src="/logo.png" // <-- REPLACE WITH YOUR LOGO PATH
              alt="Planton Makana Logo" 
              width={32} 
              height={32}
              className="h-8 w-auto min-w-0"
            />
            <span className="font-bold truncate">Planton Makana</span>
          </Link>
          
          <div className="flex items-center gap-x-2">
            <ThemeToggle />
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="focus:bg-muted focus:text-primary">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64 max-w-full p-0 mt-14 sm:mt-[56px]">
                <div className="flex flex-col space-y-2 p-4">
                  {NAV_LINKS.map((link) => (
                    <MobileNavLink key={`mobile-${link.href}`} {...link} />
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        
        <div className="hidden flex-1 items-center justify-end space-x-4 md:flex">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}