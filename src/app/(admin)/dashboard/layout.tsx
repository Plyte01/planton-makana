// src/app/(admin)/dashboard/layout.tsx
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <AdminSidebar />
      <div className="flex flex-col w-full">
        <AdminHeader />
        <main className="flex flex-1 flex-col gap-4 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:gap-6 lg:py-6">
          {children}
        </main>
      </div>
    </div>
  );
}