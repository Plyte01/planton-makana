// src/server/actions/resume.ts
"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import cloudinary from "@/lib/cloudinary";

const resumeSchema = z.object({
    title: z.string().min(3, "Title is required."),
    fileUrl: z.string().url("A file must be uploaded."),
    publicId: z.string().min(1, "Public ID is missing."),
});

// This is a placeholder for the real action that would handle file uploads
export async function uploadResume(values: z.infer<typeof resumeSchema>) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { status: "error", message: "Unauthorized" };

    const validatedFields = resumeSchema.safeParse(values);
    if (!validatedFields.success) return { status: "error", message: "Invalid data." };

    await db.resume.create({
        data: {
            ...validatedFields.data,
            userId: session.user.id,
            mediaId: validatedFields.data.publicId,
        }
    });
    revalidatePath('/(admin)/dashboard/resume');
    return { status: "success", message: "Resume uploaded." };
}

export async function deleteResume(id: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { status: "error", message: "Unauthorized" };

    const resumeToDelete = await db.resume.findUnique({ where: { id } });
    if (resumeToDelete?.mediaId) {
        // Use 'destroy' for images/videos, 'delete_resources' for raw files
        await cloudinary.api.delete_resources([resumeToDelete.mediaId], { resource_type: 'raw' });
    }

    await db.resume.delete({ where: { id }});
    revalidatePath('/(admin)/dashboard/resume');
    return { status: "success", message: "Resume deleted successfully." };
}

export async function setDefaultResume(id: string) {
    // ... permission checks
    // Use a transaction to ensure atomicity
    await db.$transaction([
        // Set all other resumes to not be the default
        db.resume.updateMany({ where: { isDefault: true }, data: { isDefault: false } }),
        // Set the selected resume as the default
        db.resume.update({ where: { id }, data: { isDefault: true } }),
    ]);
    revalidatePath('/(admin)/dashboard/resume');
    revalidatePath('/(public)/resume');
    return { status: "success", message: "Default resume updated." };
}