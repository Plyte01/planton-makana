// src/components/admin/post-form.tsx
"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { createPost, updatePost } from "@/server/actions/post";
import { Post } from "@prisma/client";
import { Loader2 } from "lucide-react";

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
import { Switch } from "@/components/ui/switch";
import { CustomUploader } from "./custom-uploader";
import { GalleryUpload } from "./gallery-upload";
import { slugify } from "@/lib/utils";

// Zod schema defines the validated data shape
const postSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  slug: z.string().min(3, "Slug must be at least 3 characters.").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug can only contain lowercase letters, numbers, and hyphens."),
  excerpt: z.string().min(10, "Excerpt must be at least 10 characters.").max(160, "Excerpt cannot exceed 160 characters."),
  content: z.string().min(20, "Content must be at least 20 characters."),
  tags: z.string().min(1, "Please enter at least one tag."),
  published: z.boolean().default(false),
  coverImageUrl: z.string().url("A cover image is required.").min(1, "A cover image is required."),
  gallery: z.array(z.string().url()).optional(),
  seoTitle: z.string().optional(),
  seoDesc: z.string().optional(),
});

// Use z.input and z.output for precise type control
type PostFormInputs = z.input<typeof postSchema>;
type PostFormValues = z.output<typeof postSchema>;

interface PostFormProps {
  post?: Post & { coverImage?: { url: string } | null, gallery?: { url: string }[] };
  children: React.ReactNode;
}

export function PostForm({ post, children }: PostFormProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isEditMode = !!post;

  const form = useForm<PostFormInputs, unknown, PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: post?.title || "",
      slug: post?.slug || "",
      excerpt: post?.excerpt || "",
      content: post?.content || "",
      tags: post?.tags.join(", ") || "",
      published: post?.published ?? false,
      coverImageUrl: post?.coverImage?.url || "",
      gallery: post?.gallery?.map(img => img.url) || [],
      seoTitle: post?.seoTitle || "",
      seoDesc: post?.seoDesc || "",
    },
  });

  // Auto-generate slug from title
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      // Only update slug if the form is NOT in edit mode to avoid overwriting a custom slug
      if (name === "title" && value.title && !isEditMode) {
        form.setValue("slug", slugify(value.title));
      }
    });
    return () => subscription.unsubscribe();
  }, [form, isEditMode]);

  const onSubmit = (values: PostFormValues) => {
    startTransition(async () => {
      const action = isEditMode
        ? updatePost(post.id, values)
        : createPost(values);
      
      const result = await action;

      if (result.status === "success") {
        toast.success(result.message);
        setOpen(false);
        if (!isEditMode) form.reset();
      } else {
        if (result.errors) {
          for (const [field, messages] of Object.entries(result.errors)) {
            form.setError(field as keyof PostFormValues, { type: 'manual', message: (messages as string[]).join(', ') });
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
          <DialogTitle>{isEditMode ? "Edit Post" : "Create New Post"}</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Update the details of your blog post." : "Fill in the details for a new post."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pr-2">
            <FormField control={form.control} name="coverImageUrl" render={({ field }) => (
                <FormItem><FormLabel>Cover Image</FormLabel><FormControl><CustomUploader value={field.value ?? ""} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>
            )} />
            
            <FormField control={form.control} name="gallery" render={({ field }) => (
              <FormItem><FormLabel>Gallery</FormLabel><FormControl><GalleryUpload value={field.value ?? []} onChange={(urls) => field.onChange(urls)} /></FormControl><FormMessage /></FormItem>
            )} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="title" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
              <FormField name="slug" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Slug</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
            </div>
            <FormField name="excerpt" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Excerpt</FormLabel><FormControl><Textarea {...field} className="h-24" /></FormControl><FormMessage /></FormItem> )} />
            <FormField name="content" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Full Content (Markdown)</FormLabel><FormControl><Textarea {...field} className="h-40" /></FormControl><FormMessage /></FormItem> )} />
            <FormField name="tags" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Tags</FormLabel><FormControl><Input {...field} /></FormControl><FormDescription>Comma-separated (e.g., Next.js, Tutorial).</FormDescription><FormMessage /></FormItem> )} />
            
            <FormField name="published" control={form.control} render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5"><FormLabel>Published</FormLabel><FormDescription>Make this post visible to the public.</FormDescription></div>
                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
              </FormItem>
            )} />

            <div className="space-y-4 rounded-md border p-4">
              <h3 className="text-lg font-medium">SEO</h3>
              <FormField name="seoTitle" control={form.control} render={({ field }) => ( <FormItem><FormLabel>SEO Title</FormLabel><FormControl><Input {...field} /></FormControl><FormDescription>If empty, the post title will be used.</FormDescription><FormMessage /></FormItem> )} />
              <FormField name="seoDesc" control={form.control} render={({ field }) => ( <FormItem><FormLabel>SEO Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormDescription>If empty, the post excerpt will be used.</FormDescription><FormMessage /></FormItem> )} />
            </div>

            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
              <Button type="submit" disabled={isPending}>
                {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : (isEditMode ? "Save Changes" : "Create Post")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}