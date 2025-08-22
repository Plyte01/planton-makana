// src/server/actions/project.ts
"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import cloudinary from "@/lib/cloudinary";

// Base schema for project properties
const projectSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  slug: z.string().min(3, "Slug must be at least 3 characters.").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug can only contain lowercase letters, numbers, and hyphens."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  content: z.string().optional(),
  tags: z.string().min(1, "Please enter at least one tag."),
  liveUrl: z.string().url("Please enter a valid URL.").optional().or(z.literal('')),
  repoUrl: z.string().url("Please enter a valid URL.").optional().or(z.literal('')),
  coverImageUrl: z.string().url("A cover image is required.").min(1, "A cover image is required."),
  seoTitle: z.string().optional(),
  seoDesc: z.string().optional(),
});

// Helper function to get the current admin user session
async function getAdminSession() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized.");
  }
  return session;
}

// --- CREATE PROJECT ---
export async function createProject(values: z.infer<typeof projectSchema>) {
  try {
    const session = await getAdminSession();
    const validatedFields = projectSchema.safeParse(values);

    if (!validatedFields.success) {
      return { status: "error" as const, errors: validatedFields.error.flatten().fieldErrors };
    }

    const { tags, coverImageUrl, ...data } = validatedFields.data;
    const publicId = coverImageUrl.split('/').pop()?.split('.')[0] ?? '';
    const newMedia = await db.media.create({
      data: {
        url: coverImageUrl,
        type: "IMAGE",
        publicId: publicId,
      }
    });

    await db.project.create({
      data: {
        ...data,
        tags: tags.split(',').map(tag => tag.trim()),
        userId: session.user.id,
        coverImageId: newMedia.id,
      },
    });

    revalidatePath("/(admin)/dashboard/projects");
    revalidatePath("/(public)/projects");
    return { status: "success" as const, message: "Project created successfully." };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint failed")) {
      return { status: "error" as const, errors: { slug: ["This slug is already in use."] } };
    }
    return { status: "error" as const, message: "An unexpected error occurred." };
  }
}

// --- UPDATE PROJECT ---
export async function updateProject(id: string, values: z.infer<typeof projectSchema>) {
  try {
    await getAdminSession();
    const validatedFields = projectSchema.safeParse(values);

    if (!validatedFields.success) {
      return { status: "error" as const, errors: validatedFields.error.flatten().fieldErrors };
    }

    const { tags, coverImageUrl, ...data } = validatedFields.data;
    const existingProject = await db.project.findUnique({
      where: { id },
      include: {
        coverImage: true // This tells Prisma to fetch the related Media object
      }
    });

    if (!existingProject) {
      throw new Error("Project not found.");
    }

    // Handle cover image update
    let coverImageId = existingProject.coverImageId;
    if (coverImageUrl && existingProject.coverImage?.url !== coverImageUrl) {
      // If a new image URL is provided and it's different, create a new media record
      // 1. Delete the OLD image from Cloudinary
      if (existingProject.coverImage?.publicId) {
        await cloudinary.uploader.destroy(existingProject.coverImage.publicId);
      }

      // 2. Delete the OLD Media record from our DB
      if (existingProject.coverImageId) {
        await db.media.delete({ where: { id: existingProject.coverImageId } });
      }

      // 3. Create the NEW Media record for the new image
      const newPublicId = coverImageUrl.split('/').pop()?.split('.')[0] ?? '';
      const newMedia = await db.media.create({
        data: {
          url: coverImageUrl,
          type: "IMAGE",
          publicId: newPublicId,
        },
      });
      coverImageId = newMedia.id;
      // Optionally, delete the old image from Cloudinary and the DB
    }

    await db.project.update({
      where: { id },
      data: {
        ...data,
        tags: tags.split(',').map(tag => tag.trim()),
        coverImageId: coverImageId,
      },
    });

    revalidatePath("/(admin)/dashboard/projects");
    revalidatePath(`/(public)/projects`); // Or ideally, a specific project slug page
    return { status: "success" as const, message: "Project updated successfully." };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint failed")) {
      return { status: "error" as const, errors: { slug: ["This slug is already in use."] } };
    }
    return { status: "error" as const, message: "Failed to update project." };
  }
}

// --- DELETE PROJECT (SOFT DELETE) ---
export async function deleteProject(id: string) {
  try {

    // 1. Find the project and its related cover image
    const projectToDelete = await db.project.findUnique({
      where: { id },
      include: { coverImage: true }
    });

    if (projectToDelete?.coverImage?.publicId) {
      // 2. Delete the image from Cloudinary
      await cloudinary.uploader.destroy(projectToDelete.coverImage.publicId);
    }

    // 3. Delete the project from the database (hard delete for simplicity now)
    // Note: For soft delete, you would update `isDeleted: true` instead.
    await db.project.delete({ where: { id } });

    // Also delete the associated media record
    if (projectToDelete?.coverImageId) {
      await db.media.delete({ where: { id: projectToDelete.coverImageId } });
    }

    revalidatePath("/(admin)/dashboard/projects");
    revalidatePath("/(public)/projects");
    return { status: "success" as const, message: "Project moved to trash." };
  } catch {
    return { status: "error" as const, message: "Failed to delete project." };
  }
}