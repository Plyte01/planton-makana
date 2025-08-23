// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import AuthProvider from "@/components/auth-provider";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { absoluteUrl } from "@/lib/url";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(absoluteUrl()), 

  title: {
    default: "Planton Makana | Full-Stack Engineer & Portfolio",
    template: "%s | Planton Makana", // Added for better page titles
  },
  description:
    "Explore the professional portfolio of Planton Makana — Full-Stack Developer, Technologist, and Engineer. Showcasing projects, blogs, resume, and technical expertise in Next.js, Prisma, PostgreSQL, and cloud-native solutions.",
  keywords: [
    "Planton Makana",
    "Full Stack Developer",
    "Portfolio",
    "Next.js",
    "Prisma",
    "PostgreSQL",
    "Software Engineer",
    "Technologist",
    "Engineer",
    "CMS",
  ],
  authors: [{ name: "Planton Makana" }],
  openGraph: {
    title: "Planton Makana | Full-Stack Engineer & Portfolio",
    description:
      "Discover Planton Makana’s professional portfolio — featuring projects, blog posts, resume, and expertise in full-stack and cloud-native development.",
    url: absoluteUrl(),
    siteName: "Planton Makana Portfolio",
    images: [
      {
        url: absoluteUrl("/og-image.png"), // <- Replace with your logo/banner
        width: 1200,
        height: 630,
        alt: "Planton Makana Portfolio",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Planton Makana | Full-Stack Engineer & Portfolio",
    description:
      "Professional portfolio of Planton Makana showcasing full-stack projects, resume, and blog posts.",
    creator: "@plantonmakana", // <- Replace with your Twitter handle if any
    images: [absoluteUrl("/og-image.png")],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  alternates: {
    canonical: "/",
  },
  verification: {
    // --- THIS IS THE ADDED VERIFICATION KEY ---
    google: "_HsBMh7UClKN55s11Jl0b_HuiPc11iljJCFdxelymMI",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* JSON-LD Structured Data for Personal Portfolio */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Planton Makana",
              url: absoluteUrl(),
              sameAs: [
                "https://github.com/Plyte01",
                "https://linkedin.com/in/plantonmakana",
                "https://twitter.com/PlantonMakana",
              ],
              jobTitle: "Full-Stack Developer & Technologist",
              worksFor: {
                "@type": "Organization",
                name: "Independent Projects",
              },
            }),
          }}
        />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            //defaultTheme="system"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <SonnerToaster richColors position="bottom-right" />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
