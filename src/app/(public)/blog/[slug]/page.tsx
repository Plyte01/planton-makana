// src/app/(public)/blog/[slug]/page.tsx
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Metadata } from 'next';
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { absoluteUrl } from "@/lib/url"; // <-- IMPORT THE UTILITY

type Props = { params: { slug: string } };

// Function to fetch the post data
async function getPost(slug: string) {
  const post = await db.post.findUnique({
    where: { slug: slug, published: true, isDeleted: false },
    include: {
      coverImage: true,
      author: true, // <-- ADD THIS LINE TO FIX THE ERROR
    },
  });

  if (!post) {
    notFound();
  }
  return post;
}

// --- ADD THIS DYNAMIC METADATA FUNCTION ---
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await db.post.findUnique({
    where: { slug: params.slug, published: true, isDeleted: false },
    include: {
      coverImage: true,
      author: true, // <-- FIX: Include author data
    },
  });

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  // Use the SEO fields from the CMS, falling back to the main fields
  const title = post.seoTitle || post.title;
  const description = post.seoDesc || post.excerpt || "A blog post by Planton Makana.";

  return {
    title: title, // This will be combined with "| Planton Makana" from the layout's title.template
    description: description,
    alternates: {
      canonical: absoluteUrl(`/blog/${post.slug}`),
    },
    openGraph: {
      title: title,
      description: description,
      url: absoluteUrl(`/blog/${post.slug}`),
      type: 'article',
      publishedTime: post.createdAt.toISOString(),
      // Use the post's cover image as the primary social sharing image
      images: post.coverImage ? [post.coverImage.url] : [], 
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      images: post.coverImage ? [post.coverImage.url] : [],
    },
  };
}

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

export default async function BlogPostPage({ params }: Props) {
  // It also uses the same, single getPost function. No redundant fetching!
  const post = await getPost(params.slug);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": absoluteUrl(`/blog/${post.slug}`),
    },
    "headline": post.title,
    "description": post.excerpt,
    "image": post.coverImage?.url,
    "author": {
      "@type": "Person",
      "name": post.author.name || "Planton Makana",
      "url": absoluteUrl("/about"), // <-- USE DYNAMIC URL
    },
    "publisher": {
        "@type": "Person",
        "name": "Planton Makana",
        "logo": {
            "@type": "ImageObject",
            "url": absoluteUrl("/logo.png"), // <-- USE DYNAMIC URL
        }
    },
    "datePublished": post.createdAt.toISOString(),
    "dateModified": post.updatedAt.toISOString(),
  };

  return (
    <article className="container max-w-3xl py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
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
          {' by '}
          <span className="font-medium text-primary">{post.author.name}</span>
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

      <div className="prose dark:prose-invert max-w-none">
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