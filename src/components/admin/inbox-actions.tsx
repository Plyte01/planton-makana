// src/components/admin/inbox-actions.tsx
"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { deleteMessage, updateMessageStatus } from "@/server/actions/inbox";
import { ContactMessage, MessageStatus } from "@prisma/client";
import { MoreHorizontal, Archive, Eye, Trash2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface InboxActionsProps {
  message: ContactMessage;
}

export function InboxActions({ message }: InboxActionsProps) {
  const [isPending, startTransition] = useTransition();

  // Handler for updating the message status (e.g., to READ or ARCHIVED)
  const handleStatusUpdate = (status: MessageStatus) => {
    startTransition(async () => {
      const result = await updateMessageStatus(message.id, status);
      if (result.status === "success") {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  // Handler for deleting the message
  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteMessage(message.id);
      if (result.status === "success") {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    // We nest the components to allow their triggers to work inside the dropdown
    <Dialog>
      <AlertDialog>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            
            {/* Trigger for the View Message Dialog */}
            <DialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Eye className="mr-2 h-4 w-4" />
                View Message
              </DropdownMenuItem>
            </DialogTrigger>

            {/* Action to Archive the message */}
            <DropdownMenuItem
              onClick={() => handleStatusUpdate(MessageStatus.ARCHIVED)}
              disabled={isPending || message.status === 'ARCHIVED'}
            >
              <Archive className="mr-2 h-4 w-4" />
              Archive
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Trigger for the Delete Alert Dialog */}
            <AlertDialogTrigger asChild>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onSelect={(e) => e.preventDefault()}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </AlertDialogTrigger>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* This is the content for the Delete confirmation */}
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              message from &quot;{message.name}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isPending}>
              {isPending ? "Deleting..." : "Continue"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* This is the content for the View Message dialog */}
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Message from: {message.name}</DialogTitle>
          <DialogDescription>
            Received on {new Date(message.createdAt).toLocaleString()}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p>
            <strong className="font-semibold">From:</strong> {message.email}
          </p>
          <p>
            <strong className="font-semibold">Subject:</strong>{" "}
            {message.subject || "No Subject Provided"}
          </p>
          <div className="space-y-2">
            <p className="font-semibold">Message:</p>
            <div className="p-4 bg-muted rounded-md whitespace-pre-wrap text-sm">
              <p>{message.message}</p>
            </div>
          </div>
          {message.status === 'NEW' && (
            <Button
              onClick={() => handleStatusUpdate(MessageStatus.READ)}
              disabled={isPending}
            >
              <Mail className="mr-2 h-4 w-4" />
              Mark as Read
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}