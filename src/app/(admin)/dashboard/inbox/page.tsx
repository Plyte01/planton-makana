// src/app/(admin)/dashboard/inbox/page.tsx
import { db } from "@/lib/db";
import { InboxDataTable, columns } from "@/components/admin/inbox-data-table";

export default async function AdminInboxPage() {
  const messages = await db.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Inbox</h1>
        <p className="text-muted-foreground">Manage messages from your contact form.</p>
      </div>
      <InboxDataTable columns={columns} data={messages} />
    </div>
  );
}