// src/server/actions/inbox.ts
"use server";

import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { MessageStatus } from "@prisma/client";

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");
}

export async function updateMessageStatus(id: string, status: MessageStatus) {
  try {
    await checkAdmin();
    await db.contactMessage.update({ where: { id }, data: { status } });
    revalidatePath("/(admin)/dashboard/inbox");
    return { status: "success" as const, message: `Message marked as ${status.toLowerCase()}.` };
  } catch {
    return { status: "error" as const, message: "Failed to update status." };
  }
}

export async function deleteMessage(id: string) {
    try {
        await checkAdmin();
        await db.contactMessage.delete({ where: { id } });
        revalidatePath("/(admin)/dashboard/inbox");
        return { status: "success" as const, message: "Message deleted." };
    } catch (error) {
        console.error(error);
        return { status: "error" as const, message: "Failed to delete message." };
    }
}