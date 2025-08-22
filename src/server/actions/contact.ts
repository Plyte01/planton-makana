// src/server/actions/contact.ts
"use server";
import { z } from "zod";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

const contactSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    email: z.string().email("Please enter a valid email address."),
    subject: z.string().optional(),
    message: z.string().min(10, "Message must be at least 10 characters."),
});

export async function submitContactForm(values: z.infer<typeof contactSchema>) {
    const validatedFields = contactSchema.safeParse(values);
    if (!validatedFields.success) {
        return { status: "error" as const, message: "Invalid form data. Please check your entries." };
    }

    try {
        await db.contactMessage.create({ data: validatedFields.data });
        revalidatePath("/(admin)/dashboard/inbox"); // So the admin sees the new message
        return { status: "success" as const, message: "Thank you! Your message has been sent successfully." };
    } catch (error) {
        console.error("Contact Form Error:", error);
        return { status: "error" as const, message: "Something went wrong on our end. Please try again later." };
    }
}