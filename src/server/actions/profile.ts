// src/server/actions/profile.ts
"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

const profileSchema = z.object({
    name: z.string().min(2, "Name is required."),
    image: z.string().url("A valid image URL is required.").optional().or(z.literal('')), // Your profile photo URL
    tagline: z.string().optional(),
    bio: z.string().optional(),
    skills: z.string().optional(),
    // For simplicity, we'll take social links as separate strings
    githubUrl: z.string().url().optional().or(z.literal('')),
    linkedinUrl: z.string().url().optional().or(z.literal('')),
});

export async function updateProfile(values: z.infer<typeof profileSchema>) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");

    const validatedFields = profileSchema.safeParse(values);
    if (!validatedFields.success) return { status: "error" as const, message: "Invalid data." };
    
    const { githubUrl, linkedinUrl, ...data } = validatedFields.data;

    // If a Cloudinary image URL is provided, persist it in Media table as well
    if (data.image && data.image.startsWith("http")) {
        try {
            const url = data.image;
            // naive publicId extraction similar to post actions
            const publicId = url.split('/').pop()?.split('.')[0] ?? '';
            if (publicId) {
                await db.media.upsert({
                    where: { publicId },
                    update: { url },
                    create: { url, type: "IMAGE", publicId },
                });
            }
        } catch (e) {
            // non-fatal; continue saving profile
            console.error("Profile image media save failed", e);
        }
    }

    await db.user.update({
        where: { id: session.user.id },
        data: {
            ...data,
            skills: data.skills?.split(',').map(s => s.trim()) || [],
            socialLinks: {
                github: githubUrl,
                linkedin: linkedinUrl,
            }
        }
    });

    revalidatePath("/(admin)/dashboard/profile");
    revalidatePath("/(public)/about"); // Revalidate the public about page
    revalidatePath("/(public)"); 
    return { status: "success" as const, message: "Profile updated successfully." };
}
