// src/server/actions/experience.ts
"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

const experienceSchema = z.object({
  title: z.string().min(2, "Title is required."),
  company: z.string().min(2, "Company is required."),
  location: z.string().optional(),
  startDate: z.date().refine((date) => date instanceof Date && !isNaN(date.getTime()), {
    message: "Start date is required.",
  }),
  endDate: z.date().optional(),
  description: z.string().optional(),
  order: z.coerce.number().default(0),
});

async function getAdminSession() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");
  return session;
}

export async function createExperience(values: z.infer<typeof experienceSchema>) {
  const session = await getAdminSession();
  const validatedFields = experienceSchema.safeParse(values);
  if (!validatedFields.success) return { status: "error" as const, errors: validatedFields.error.flatten().fieldErrors };
  
  await db.experience.create({ data: { ...validatedFields.data, userId: session.user.id } });
  revalidatePath("/(admin)/dashboard/experience");
  revalidatePath("/(public)/about");
  return { status: "success" as const, message: "Experience added successfully." };
}

export async function updateExperience(id: string, values: z.infer<typeof experienceSchema>) {
  await getAdminSession();
  const validatedFields = experienceSchema.safeParse(values);
  if (!validatedFields.success) return { status: "error" as const, errors: validatedFields.error.flatten().fieldErrors };
  
  await db.experience.update({ where: { id }, data: validatedFields.data });
  revalidatePath("/(admin)/dashboard/experience");
  revalidatePath("/(public)/about");
  return { status: "success" as const, message: "Experience updated successfully." };
}

export async function deleteExperience(id: string) {
  await getAdminSession();
  await db.experience.delete({ where: { id } });
  revalidatePath("/(admin)/dashboard/experience");
  revalidatePath("/(public)/about");
  return { status: "success" as const, message: "Experience deleted." };
}