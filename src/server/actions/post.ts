// src/server/actions/post.ts
"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import cloudinary from "@/lib/cloudinary";

// Base schema for post properties, now including all fields
const postSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  slug: z.string().min(3, "Slug must be at least 3 characters.").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug can only contain lowercase letters, numbers, and hyphens."),
  excerpt: z.string().min(10, "Excerpt must be at least 10 characters.").max(160, "Excerpt cannot exceed 160 characters."),
  content: z.string().min(20, "Content must be at least 20 characters."),
  tags: z.string().min(1, "Please enter at least one tag."),
  published: z.boolean().default(false),
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

// --- CREATE POST ---
export async function createPost(values: z.infer<typeof postSchema>) {
  try {
    const session = await getAdminSession();
    const validatedFields = postSchema.safeParse(values);

    if (!validatedFields.success) {
      return { status: "error" as const, errors: validatedFields.error.flatten().fieldErrors };
    }

    const { tags, coverImageUrl, ...data } = validatedFields.data;
    
    // Extract public_id from the full Cloudinary URL
    const publicId = coverImageUrl.split('/').pop()?.split('.')[0] ?? '';

    const newMedia = await db.media.create({
      data: {
        url: coverImageUrl,
        type: "IMAGE",
        publicId: publicId,
      }
    });

    await db.post.create({
      data: {
        ...data,
        tags: tags.split(',').map(tag => tag.trim()),
        authorId: session.user.id,
        coverImageId: newMedia.id,
      },
    });

    revalidatePath("/(admin)/dashboard/posts");
    revalidatePath("/(public)/blog");
    return { status: "success" as const, message: "Post created successfully." };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint failed")) {
      return { status: "error" as const, errors: { slug: ["This slug is already in use."] } };
    }
    console.error("Create Post Error:", error);
    return { status: "error" as const, message: "An unexpected error occurred." };
  }
}

// --- UPDATE POST ---
export async function updatePost(id: string, values: z.infer<typeof postSchema>) {
  try {
    await getAdminSession();
    const validatedFields = postSchema.safeParse(values);

    if (!validatedFields.success) {
      return { status: "error" as const, errors: validatedFields.error.flatten().fieldErrors };
    }
    
    const { tags, coverImageUrl, ...data } = validatedFields.data;
    
    const existingPost = await db.post.findUnique({
      where: { id },
      include: { coverImage: true }
    });

    if (!existingPost) {
      throw new Error("Post not found.");
    }

    let coverImageId = existingPost.coverImageId;
    // If a new image URL is provided AND it's different from the old one
    if (coverImageUrl && existingPost.coverImage?.url !== coverImageUrl) {
        
        // 1. Delete the OLD image from Cloudinary
        if (existingPost.coverImage?.publicId) {
            await cloudinary.uploader.destroy(existingPost.coverImage.publicId);
        }
        
        // 2. Delete the OLD Media record from our DB
        if (existingPost.coverImageId) {
            await db.media.delete({ where: { id: existingPost.coverImageId }});
        }

        // 3. Create the NEW Media record for the new image
        const newPublicId = coverImageUrl.split('/').pop()?.split('.')[0] ?? '';
        const newMedia = await db.media.create({
            data: { url: coverImageUrl, type: "IMAGE", publicId: newPublicId }
        });
        coverImageId = newMedia.id;
    }
    
    const updatedPost = await db.post.update({
      where: { id },
      data: {
        ...data,
        tags: tags.split(',').map(tag => tag.trim()),
        coverImageId: coverImageId,
      },
    });

    revalidatePath("/(admin)/dashboard/posts");
    revalidatePath(`/(public)/blog/${updatedPost.slug}`);
    revalidatePath("/(public)/blog");
    return { status: "success" as const, message: "Post updated successfully." };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint failed")) {
      return { status: "error" as const, errors: { slug: ["This slug is already in use."] } };
    }
    console.error("Update Post Error:", error);
    return { status: "error" as const, message: "Failed to update post." };
  }
}

// --- DELETE POST (Soft Delete) ---
export async function deletePost(id: string) {
  try {
    await getAdminSession();
    
    // We don't delete the image from Cloudinary on a soft delete.
    // The image remains in case the post is restored.
    
    await db.post.update({
      where: { id },
      data: { isDeleted: true, published: false }, // Also unpublish when soft deleting
    });

    revalidatePath("/(admin)/dashboard/posts");
    revalidatePath("/(public)/blog");
    return { status: "success" as const, message: "Post moved to trash." };
  } catch (error) {
    console.error("Delete Post Error:", error);
    return { status: "error" as const, message: "Failed to delete post." };
  }
}

/*
// --- HARD DELETE POST (For reference or a "permanent delete" feature) ---
export async function hardDeletePost(id: string) {
    try {
        await getAdminSession();

        const postToDelete = await db.post.findUnique({
            where: { id },
            include: { coverImage: true }
        });

        if (postToDelete?.coverImage?.publicId) {
            await cloudinary.uploader.destroy(postToDelete.coverImage.publicId);
        }

        await db.post.delete({ where: { id } });

        if (postToDelete?.coverImageId) {
            await db.media.delete({ where: { id: postToDelete.coverImageId } });
        }

        revalidatePath("/(admin)/dashboard/posts");
        revalidatePath("/(public)/blog");
        return { status: "success" as const, message: "Post permanently deleted." };
    } catch (error) {
        console.error("Hard Delete Post Error:", error);
        return { status: "error" as const, message: "Failed to permanently delete post." };
    }
}
*/