// src/server/actions/resume.ts
"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import cloudinary from "@/lib/cloudinary";
import { MediaType } from "@prisma/client";

const resumeSchema = z.object({
    title: z.string().min(3, "Title is required."),
    fileUrl: z.string().url("A file must be uploaded."),
    publicId: z.string().min(1, "Public ID is missing."),
});

// Helper function to check for admin session
async function getAdminSession() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");
  return session;
}

// --- CORRECTED UPLOAD FUNCTION ---
export async function uploadResume(values: z.infer<typeof resumeSchema>) {
    const session = await getAdminSession();
    const validatedFields = resumeSchema.safeParse(values);
    if (!validatedFields.success) return { status: "error" as const, message: "Invalid form data." };

    const { title, fileUrl, publicId } = validatedFields.data;

    try {
        // Step 1: Create the Media record first.
        const newMedia = await db.media.create({
            data: {
                url: fileUrl,
                publicId: publicId,
                type: MediaType.PDF, // Or determine dynamically if needed
            }
        });

        // Step 2: Create the Resume record and link it using the NEW mediaId.
        await db.resume.create({
            data: {
                title: title,
                fileUrl: fileUrl, // Storing the URL directly is still convenient for the public page
                userId: session.user.id,
                mediaId: newMedia.id, // This is the correct foreign key
            }
        });

        revalidatePath('/(admin)/dashboard/resume');
        return { status: "success" as const, message: "Resume uploaded successfully." };
    } catch (error) {
        console.error("Upload Resume Error:", error);
        return { status: "error" as const, message: "Failed to save the resume to the database." };
    }
}


// --- CORRECTED DELETE FUNCTION ---
export async function deleteResume(id: string) {
    await getAdminSession();
    
    // Step 1: Find the resume AND its related media record to get the publicId.
    const resumeToDelete = await db.resume.findUnique({
        where: { id },
        include: {
            media: true, // This is the crucial part
        }
    });
    
    if (!resumeToDelete) {
        throw new Error("Resume not found.");
    }

    try {
        // Step 2: Use the CORRECT publicId to delete the file from Cloudinary.
        if (resumeToDelete.media?.publicId) {
            await cloudinary.api.delete_resources([resumeToDelete.media.publicId], { resource_type: 'raw' });
        }

        // Step 3: Delete the resume record. Because of the relation, Prisma may handle the media record deletion.
        // For explicitness, we will delete both.
        await db.resume.delete({ where: { id } });
        
        // Step 4: Also delete the associated media record from our database.
        if (resumeToDelete.mediaId) {
            await db.media.delete({ where: { id: resumeToDelete.mediaId } });
        }

        revalidatePath('/(admin)/dashboard/resume');
        return { status: "success" as const, message: "Resume deleted successfully." };
    } catch (error) {
        console.error("Delete Resume Error:", error);
        return { status: "error" as const, message: "Failed to delete the resume." };
    }
}

export async function setDefaultResume(id: string) {
    await getAdminSession();
    await db.$transaction([
        db.resume.updateMany({ where: { isDefault: true }, data: { isDefault: false } }),
        db.resume.update({ where: { id }, data: { isDefault: true } }),
    ]);
    revalidatePath('/(admin)/dashboard/resume');
    revalidatePath('/(public)/resume');
    return { status: "success" as const, message: "Default resume has been updated." };
}
