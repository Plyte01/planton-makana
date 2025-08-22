// src/components/post-card.tsx
import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Prisma } from "@prisma/client";

// Define the type for our post prop including the related coverImage
type PostWithCoverImage = Prisma.PostGetPayload<{
  include: { coverImage: true };
}>;

interface PostCardProps {
  post: PostWithCoverImage;
}

export function PostCard({ post }: PostCardProps) {
  const postUrl = `/blog/${post.slug}`;

  return (
    <article>
      <Link href={postUrl}>
        <Card className="group flex h-full flex-col overflow-hidden transition-all hover:border-primary">
          <div className="relative h-48 w-full overflow-hidden">
            <Image
              src={post.coverImage?.url ?? "/placeholder.svg"}
              alt={`Cover image for ${post.title}`}
              fill
              className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          <CardHeader>
            <CardTitle className="group-hover:text-primary">
              {post.title}
            </CardTitle>
            <CardDescription>
              {new Date(post.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-sm text-muted-foreground">{post.excerpt}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </Link>
    </article>
  );
}