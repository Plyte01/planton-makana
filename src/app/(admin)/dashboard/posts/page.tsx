// src/app/(admin)/dashboard/posts/page.tsx
import { db } from "@/lib/db";
import { PostDataTable, columns } from "@/components/admin/post-data-table";
import { PostForm } from "@/components/admin/post-form"; // <-- IMPORT FORM
import { Button } from "@/components/ui/button";

export default async function AdminPostsPage() {
  const posts = await db.post.findMany({
    where: { isDeleted: false },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Manage Blog Posts</h1>
        {/* --- ADD BUTTON IS NOW FUNCTIONAL --- */}
        <PostForm>
          <Button>Create New Post</Button>
        </PostForm>
      </div>
      <PostDataTable columns={columns} data={posts} />
    </div>
  );
}