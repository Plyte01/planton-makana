// src/components/public-footer.tsx
import Link from "next/link";
import { Github, Linkedin, Mail } from "lucide-react";

export function PublicFooter() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="border-t w-full bg-background/80 backdrop-blur">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between py-8 gap-4">
        <div className="flex flex-col items-center md:items-start">
          <p className="text-center md:text-left text-sm text-muted-foreground">
          &copy; {currentYear} Planton Makana. All Rights Reserved.
        </p>
        <nav className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <Link href="/" className="hover:underline">Home</Link>
            <Link href="/about" className="hover:underline">About</Link>
            <Link href="/projects" className="hover:underline">Projects</Link>
            <Link href="/blog" className="hover:underline">Blog</Link>
            <Link href="/contact" className="hover:underline">Contact</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <a href="https://github.com/plantonmakana" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="text-muted-foreground hover:text-primary transition-colors">
            <Github className="h-5 w-5" />
          </a>
          <a href="https://linkedin.com/in/plantonmakana" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-muted-foreground hover:text-primary transition-colors">
            <Linkedin className="h-5 w-5" />
          </a>
          <a href="mailto:planton@example.com" aria-label="Email" className="text-muted-foreground hover:text-primary transition-colors">
            <Mail className="h-5 w-5" />
          </a>
        </div>
      </div>
    </footer>
  );
}