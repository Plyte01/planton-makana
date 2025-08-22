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

import { FileUp, CheckCircle } from "lucide-react";
import React, { useRef } from "react";

const resumeSchema = z.object({
  title: z.string().min(3, "Title is required."),
  fileUrl: z.string().url("A file must be uploaded."),
  publicId: z.string().min(1, "Public ID is missing."),
});


export function UploadResumeButton() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof resumeSchema>>({ resolver: zodResolver(resumeSchema) });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onSubmit = (values: z.infer<typeof resumeSchema>) => {
    startTransition(async () => {
      const result = await uploadResume(values);
      if (result.status === "success") {
        toast.success(result.message);
        setOpen(false);
        form.reset({ title: "", fileUrl: "", publicId: "" });
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
            <FormField name="title" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} placeholder="e.g., Q3 2025 - Web Developer" /></FormControl><FormMessage /></FormItem> )} />
            <FormField name="fileUrl" control={form.control} render={({ field }) => {
              const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0];
                if (file) {
                  const url = URL.createObjectURL(file);
                  field.onChange(url);
                  // Optionally, you can store the file object somewhere for upload to server
                }
              };
              return (
                <FormItem>
                  <FormLabel>Resume File (PDF/DOCX)</FormLabel>
                  <FormControl>
                    <>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.docx"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full"
                      >
                        {field.value ? <CheckCircle className="h-4 w-4 mr-2 text-green-500"/> : <FileUp className="h-4 w-4 mr-2" />}
                        {field.value ? "File Selected" : "Choose File"}
                      </Button>
                    </>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }} />
            
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
              <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : "Save Resume"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}