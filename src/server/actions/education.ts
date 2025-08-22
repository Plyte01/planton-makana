// src/server/actions/education.ts
"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

const educationSchema = z.object({
  school: z.string().min(2, "School name is required."),
  degree: z.string().min(2, "Degree is required."),
  field: z.string().optional(),
  startDate: z.date().refine((date) => !!date, { message: "Start date is required." }),
  endDate: z.date().optional(),
  grade: z.string().optional(),
  description: z.string().optional(),
  order: z.coerce.number().default(0),
});

async function getAdminSession() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");
  return session;
}

export async function createEducation(values: z.infer<typeof educationSchema>) {
  const session = await getAdminSession();
  const validatedFields = educationSchema.safeParse(values);
  if (!validatedFields.success) return { status: "error" as const, errors: validatedFields.error.flatten().fieldErrors };

  await db.education.create({ data: { ...validatedFields.data, userId: session.user.id } });
  revalidatePath("/(admin)/dashboard/education");
  revalidatePath("/(public)/about");
  return { status: "success" as const, message: "Education added successfully." };
}

export async function updateEducation(id: string, values: z.infer<typeof educationSchema>) {
  await getAdminSession();
  const validatedFields = educationSchema.safeParse(values);
  if (!validatedFields.success) return { status: "error" as const, errors: validatedFields.error.flatten().fieldErrors };

  await db.education.update({ where: { id }, data: validatedFields.data });
  revalidatePath("/(admin)/dashboard/education");
  revalidatePath("/(public)/about");
  return { status: "success" as const, message: "Education updated successfully." };
}

export async function deleteEducation(id: string) {
  await getAdminSession();
  await db.education.delete({ where: { id } });
  revalidatePath("/(admin)/dashboard/education");
  revalidatePath("/(public)/about");
  return { status: "success" as const, message: "Education deleted." };
}