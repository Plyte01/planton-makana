// src/app/(admin)/dashboard/profile/page.tsx
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/admin/profile-form";
import { notFound } from "next/navigation";

export default async function AdminProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin"); // Should be handled by middleware, but good practice

  const adminUser = await db.user.findUnique({
    where: { id: session.user.id },
  });

  // If for some reason the user in the session doesn't exist in the DB
  if (!adminUser) {
    return notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edit Your Profile</h1>
        <p className="text-muted-foreground">
          Make changes to your public &quot;About Me&quot; page here.
        </p>
      </div>
      {/* 
        The page's only job is to pass the fetched data to the form.
        The form component itself handles the update logic.
      */}
      <ProfileForm adminUser={adminUser} />
    </div>
  );
}