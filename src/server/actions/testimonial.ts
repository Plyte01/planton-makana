// src/server/actions/testimonial.ts
"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

const testimonialSchema = z.object({
  name: z.string().min(2, "Author's name is required."),
  role: z.string().optional(),
  company: z.string().optional(),
  message: z.string().min(10, "Message is too short."),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  order: z.coerce.number().default(0),
});

async function getAdminSession() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");
  return session;
}

export async function createTestimonial(values: z.infer<typeof testimonialSchema>) {
    const session = await getAdminSession();
    const validatedFields = testimonialSchema.safeParse(values);
    if (!validatedFields.success) return { status: "error" as const, errors: validatedFields.error.flatten().fieldErrors };
    
    await db.testimonial.create({ data: { ...validatedFields.data, userId: session.user.id } });
    revalidatePath("/(admin)/dashboard/testimonials");
    revalidatePath("/(public)"); // Revalidate home page
    return { status: "success" as const, message: "Testimonial added successfully." };
}

export async function updateTestimonial(id: string, values: z.infer<typeof testimonialSchema>) {
    await getAdminSession();
    const validatedFields = testimonialSchema.safeParse(values);
    if (!validatedFields.success) return { status: "error" as const, errors: validatedFields.error.flatten().fieldErrors };
    
    await db.testimonial.update({ where: { id }, data: validatedFields.data });
    revalidatePath("/(admin)/dashboard/testimonials");
    revalidatePath("/(public)");
    return { status: "success" as const, message: "Testimonial updated successfully." };
}

export async function deleteTestimonial(id: string) {
    await getAdminSession();
    await db.testimonial.delete({ where: { id } });
    revalidatePath("/(admin)/dashboard/testimonials");
    revalidatePath("/(public)");
    return { status: "success" as const, message: "Testimonial deleted." };
}