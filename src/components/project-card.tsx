// src/components/project-card.tsx
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link as LinkIcon, Github } from "lucide-react";
import { Prisma } from "@prisma/client";

// Define the type for our project prop including the related coverImage
type ProjectWithCoverImage = Prisma.ProjectGetPayload<{
  include: { coverImage: true };
}>;

interface ProjectCardProps {
  project: ProjectWithCoverImage;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <CardHeader>
        <CardTitle>{project.title}</CardTitle>
        <CardDescription>{project.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="relative mb-4 h-48 w-full">
          <Image
            src={project.coverImage?.url ?? "/placeholder.svg"}
            alt={`Cover image for ${project.title}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-x-2 pt-4">
        {project.liveUrl && (
          <Button variant="outline" asChild>
            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
              <LinkIcon className="mr-2 h-4 w-4" />
              Live Site
            </a>
          </Button>
        )}
        {project.repoUrl && (
          <Button asChild>
            <a href={project.repoUrl} target="_blank" rel="noopener noreferrer">
              <Github className="mr-2 h-4 w-4" />
              GitHub
            </a>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}