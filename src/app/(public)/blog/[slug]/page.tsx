// src/app/(public)/blog/[slug]/page.tsx
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// This tells Next.js to generate static pages for each post at build time
export async function generateStaticParams() {
  const posts = await db.post.findMany({
    where: { published: true, isDeleted: false },
    select: { slug: true },
  });
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

// Function to fetch the post data
async function getPost(slug: string) {
  const post = await db.post.findUnique({
    where: { slug: slug, published: true, isDeleted: false },
    include: { coverImage: true },
  });

  if (!post) {
    notFound();
  }
  return post;
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPost(params.slug);

  return (
    <article className="container max-w-3xl py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold leading-tight tracking-tighter md:text-5xl">
          {post.title}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Published on{" "}
          {new Date(post.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </header>

      {post.coverImage && (
        <div className="relative mb-8 h-72 w-full sm:h-96">
          <Image
            src={post.coverImage.url}
            alt={`Cover image for ${post.title}`}
            fill
            className="rounded-lg object-cover"
            priority
          />
        </div>
      )}

      <div className="prose prose-slate mx-auto dark:prose-invert">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
      </div>

      <footer className="mt-12">
        <h3 className="mb-2 text-lg font-semibold">Tags</h3>
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </footer>
    </article>
  );
}