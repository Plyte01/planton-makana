// src/components/admin/project-form.tsx
"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { createProject, updateProject } from "@/server/actions/project";
import { Project } from "@prisma/client";

import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
  DialogTrigger, DialogFooter, DialogClose
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
//import { ImageUpload } from "./image-upload";
import { CustomUploader } from "./custom-uploader";
import { GalleryUpload } from "./gallery-upload";
import { slugify } from "@/lib/utils";

const projectSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  slug: z.string().min(3, "Slug must be at least 3 characters.").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug can only contain lowercase letters, numbers, and hyphens."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  content: z.string().optional(),
  tags: z.string().min(1, "Please enter at least one tag."),
  liveUrl: z.string().url("Please enter a valid URL.").optional().or(z.literal('')),
  repoUrl: z.string().url("Please enter a valid URL.").optional().or(z.literal('')),
  coverImageUrl: z.string().url("A cover image is required.").min(1, "A cover image is required."),
  gallery: z.array(z.string().url()).optional(),
  seoTitle: z.string().optional(),
  seoDesc: z.string().optional(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  // To make the component reusable for both create and edit
  project?: Project & { coverImage?: { url: string } | null };
  children: React.ReactNode;
}

export function ProjectForm({ project, children }: ProjectFormProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isEditMode = !!project;

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: project?.title || "",
      slug: project?.slug || "",
      description: project?.description || "",
      content: project?.content || "",
      tags: project?.tags.join(", ") || "",
      liveUrl: project?.liveUrl || "",
      repoUrl: project?.repoUrl || "",
      coverImageUrl: project?.coverImage?.url || "",
      gallery: [],
      seoTitle: project?.seoTitle || "",
      seoDesc: project?.seoDesc || "",
    },
  });

  // Auto-generate slug from title
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "title" && value.title) {
        form.setValue("slug", slugify(value.title));
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const onSubmit = (values: ProjectFormValues) => {
    startTransition(async () => {
      const action = isEditMode
        ? updateProject(project.id, values)
        : createProject(values);
      
      const result = await action;

      if (result.status === "success") {
        toast.success(result.message);
        setOpen(false);
        if (!isEditMode) form.reset();
      } else {
        if (result.errors) {
          for (const [field, messages] of Object.entries(result.errors)) {
            form.setError(field as keyof ProjectFormValues, { type: 'manual', message: messages.join(', ') });
          }
        }
        toast.error(result.message || "An error occurred.");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Project" : "Create New Project"}</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Update the details of your project." : "Fill in the details to add a new project."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pr-2">
            <FormField control={form.control} name="coverImageUrl" render={({ field }) => (
                <FormItem><FormLabel>Cover Image</FormLabel><FormControl><CustomUploader value={field.value ?? ""} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>
            )} />
            {/* GalleryUpload for project gallery (multi-image) */}
            <FormField control={form.control} name="gallery" render={({ field }) => (
              <FormItem>
                <FormLabel>Gallery</FormLabel>
                <FormControl>
                  <GalleryUpload value={field.value ?? []} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="title" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
              <FormField name="slug" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Slug</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
            </div>
            <FormField name="description" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Short Description (Excerpt)</FormLabel><FormControl><Textarea {...field} className="h-24" /></FormControl><FormMessage /></FormItem> )} />
            <FormField name="content" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Full Content (Markdown)</FormLabel><FormControl><Textarea {...field} className="h-40" /></FormControl><FormMessage /></FormItem> )} />
            <FormField name="tags" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Tags</FormLabel><FormControl><Input {...field} /></FormControl><FormDescription>Comma-separated (e.g., Next.js, TypeScript).</FormDescription><FormMessage /></FormItem> )} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="liveUrl" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Live URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
              <FormField name="repoUrl" control={form.control} render={({ field }) => ( <FormItem><FormLabel>GitHub URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
            </div>
             <div className="space-y-4 rounded-md border p-4">
                <h3 className="text-lg font-medium">SEO</h3>
                <FormField name="seoTitle" control={form.control} render={({ field }) => ( <FormItem><FormLabel>SEO Title</FormLabel><FormControl><Input {...field} /></FormControl><FormDescription>If empty, the project title will be used.</FormDescription><FormMessage /></FormItem> )} />
                <FormField name="seoDesc" control={form.control} render={({ field }) => ( <FormItem><FormLabel>SEO Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormDescription>If empty, the project description will be used.</FormDescription><FormMessage /></FormItem> )} />
             </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
              <Button type="submit" disabled={isPending}>
                {isPending ? (isEditMode ? "Saving Changes..." : "Creating Project...") : (isEditMode ? "Save Changes" : "Create Project")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}