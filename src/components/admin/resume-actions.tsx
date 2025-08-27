// src/components/admin/resume-actions.tsx
"use client";
import { useTransition } from "react";
import { toast } from "sonner";
import { deleteResume, setDefaultResume } from "@/server/actions/resume";
import { Resume } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Trash2, CheckCircle, Star } from "lucide-react";
import { Download } from "lucide-react";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ResumeActionsProps {
    resume: Resume;
}

export function ResumeActions({ resume }: ResumeActionsProps) {
    const [isPending, startTransition] = useTransition();

    const onSetDefault = () => {
        startTransition(async () => {
            const result = await setDefaultResume(resume.id);
            if (result.status === "success") toast.success(result.message);
            else toast.error(result.message);
        });
    }
    
    const onDelete = () => {
        startTransition(async () => {
            const result = await deleteResume(resume.id);
            if (result.status === "success") toast.success(result.message);
            else toast.error(result.message);
        });
    }

    return (
        <div className="flex items-center gap-x-2">
            {/* Link to the dynamic download endpoint with the specific ID */}
            <Button variant="ghost" size="icon" asChild>
                <a href={`/api/download?id=${resume.id}`} title="Download this version">
                    <Download className="h-4 w-4" />
                </a>
            </Button>
            <Button 
                variant="outline" 
                size="sm" 
                onClick={onSetDefault} 
                disabled={isPending || resume.isDefault}
            >
                {resume.isDefault ? <CheckCircle className="h-4 w-4 mr-2" /> : <Star className="h-4 w-4 mr-2" />}
                {resume.isDefault ? "Default" : "Set as Default"}
            </Button>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon" disabled={isPending}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the resume &quot;{resume.title}&quot;.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={onDelete} disabled={isPending}>
                            {isPending ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}