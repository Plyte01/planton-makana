// src/app/(public)/blog/page.tsx
import { db } from "@/lib/db";
import { PostCard } from "@/components/post-card";

export default async function BlogPage() {
  const posts = await db.post.findMany({
    where: {
      isDeleted: false,
      published: true, // Only fetch published posts
    },
    orderBy: { createdAt: "desc" },
    include: {
      coverImage: true, // Include the cover image relation
    },
  });

  return (
    <section className="py-8">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl sm:text-4xl font-bold tracking-tight text-primary">
          Blog
        </h1>

        {posts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 py-24 text-center">
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
              No Posts Yet
            </h2>
            <p className="mt-2 text-muted-foreground">
              The blog is quiet for now. Check back soon for new articles!
            </p>
          </div>
        )}
      </div>
    </section>
  );
}