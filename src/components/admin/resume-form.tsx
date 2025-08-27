// src/components/admin/resume-form.tsx
"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { uploadResume } from "@/server/actions/resume";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { FileUp, CheckCircle, Loader2 } from "lucide-react";
import React, { useRef } from "react";

const resumeSchema = z.object({
  title: z.string().min(3, "Title is required."),
  fileUrl: z.string().url("A file must be uploaded."),
  publicId: z.string().min(1, "Public ID is missing."),
  originalFilename: z.string().min(1, "Original filename is missing."),
});

type ResumeFormValues = z.infer<typeof resumeSchema>;

export function UploadResumeButton() {
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const form = useForm<ResumeFormValues>({ resolver: zodResolver(resumeSchema), defaultValues: { title: "", fileUrl: "", publicId: "", originalFilename: "" } });
  const fileInputRef = useRef<HTMLInputElement>(null);
  //const [originalFilename, setOriginalFilename] = useState(""); // <-- State to hold the filename for display
  

  // --- THIS IS THE NEW UPLOAD LOGIC ---
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed. Please try again.');
      }

      const data = await response.json();
      
      // Set the returned URL and publicId into the form state
      form.setValue("fileUrl", data.secure_url, { shouldValidate: true });
      form.setValue("publicId", data.public_id, { shouldValidate: true });
      form.setValue("originalFilename", data.original_filename, { shouldValidate: true });
      //setOriginalFilename(data.original_filename); // <-- Store filename in state for UI
      toast.success(`File "${data.original_filename}" uploaded successfully!`);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message || "Something went wrong during upload.");
    } finally {
      setIsUploading(false);
    }
  };
  // ------------------------------------

  const onSubmit = (values: ResumeFormValues) => {
    startTransition(async () => {
      const result = await uploadResume(values);
      if (result.status === "success") {
        toast.success(result.message);
        setOpen(false);
        form.reset({ title: "", fileUrl: "", publicId: "" });
        //setOriginalFilename(""); // Clear filename state
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button>Upload New Resume</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Upload New Resume</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField name="title" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Resume Title</FormLabel><FormControl><Input {...field} placeholder="e.g., Q4 2025 - Engineering Focus" /></FormControl><FormMessage /></FormItem> )} />
            <FormItem>
              <FormLabel>Resume File (PDF/DOCX)</FormLabel>
              <FormControl>
                <>
                  <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFileChange} disabled={isUploading} />
                  <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()} className="w-full" disabled={isUploading}>
                    {isUploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : form.watch("fileUrl") ? <CheckCircle className="h-4 w-4 mr-2 text-green-500"/> : <FileUp className="h-4 w-4 mr-2" />}
                    {isUploading ? "Uploading..." : form.watch("fileUrl") ? "File Selected" : "Choose File"}
                  </Button>
                </>
              </FormControl>
              <FormMessage>{form.formState.errors.fileUrl?.message}</FormMessage>
            </FormItem>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
              <Button type="submit" disabled={isPending || isUploading || !form.watch("fileUrl")}>
                {isPending ? "Saving..." : "Save Resume"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}