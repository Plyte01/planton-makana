// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import AuthProvider from "@/components/auth-provider";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Planton Makana | Professional Portfolio",
  description: "A full-stack portfolio and CMS built with Next.js, Prisma, and PostgreSQL.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
            <SonnerToaster richColors position="bottom-right" /> {/* <-- REPLACE TOASTER */}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}