// src/components/admin/testimonial-form.tsx
"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { createTestimonial, updateTestimonial } from "@/server/actions/testimonial";
import { Testimonial } from "@prisma/client";
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
//import { ImageUpload } from "./image-upload";
import { CustomUploader } from "./custom-uploader";


// Zod schema for validation
const testimonialSchema = z.object({
  name: z.string().min(2, "Author's name is required."),
  role: z.string().optional(),
  company: z.string().optional(),
  message: z.string().min(10, "The testimonial message is too short."),
  avatarUrl: z.string().url("A valid image URL is required.").optional().or(z.literal("")),
  order: z.number(),
});

type TestimonialFormValues = z.infer<typeof testimonialSchema>;

interface TestimonialFormProps {
  testimonial?: Testimonial;
  children: React.ReactNode;
}

export function TestimonialForm({ testimonial, children }: TestimonialFormProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isEditMode = !!testimonial;

  const form = useForm<TestimonialFormValues>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      name: testimonial?.name || "",
      role: testimonial?.role || "",
      company: testimonial?.company || "",
      message: testimonial?.message || "",
      avatarUrl: testimonial?.avatarUrl || "",
      order: testimonial?.order ?? 0,
    },
  });

  const onSubmit = (values: TestimonialFormValues) => {
    startTransition(async () => {
      const action = isEditMode
        ? updateTestimonial(testimonial.id, values)
        : createTestimonial(values);
      
      const result = await action;

      if (result.status === "success") {
        toast.success(result.message);
        setOpen(false);
        if (!isEditMode) form.reset();
      } else {
        // You can expand this to show field-specific errors
        toast.error("An error occurred.");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Testimonial" : "Add New Testimonial"}</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Update the details of this testimonial." : "Fill in the details for a new testimonial."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

            <FormField<TestimonialFormValues>
              control={form.control}
              name="avatarUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Author&apos;s Avatar</FormLabel>
                  <FormControl>
                    <CustomUploader
                      value={typeof field.value === "string" ? field.value : String(field.value ?? "")}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField<TestimonialFormValues> name="name" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Author&apos;s Name</FormLabel><FormControl><Input {...field} placeholder="Jane Doe" /></FormControl><FormMessage /></FormItem> )} />
              <FormField<TestimonialFormValues> name="role" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Role / Title</FormLabel><FormControl><Input {...field} placeholder="CEO" /></FormControl><FormMessage /></FormItem> )} />
            </div>

            <FormField<TestimonialFormValues> name="company" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Company</FormLabel><FormControl><Input {...field} placeholder="Tech Corp" /></FormControl><FormMessage /></FormItem> )} />

            <FormField<TestimonialFormValues> name="message" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Testimonial Message</FormLabel><FormControl><Textarea {...field} className="h-32" placeholder="Write the testimonial here..." /></FormControl><FormMessage /></FormItem> )} />
            
            <FormField<TestimonialFormValues> name="order" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Display Order</FormLabel><FormControl><Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} /></FormControl><FormDescription>Lower numbers appear higher on the page.</FormDescription><FormMessage /></FormItem> )} />
            
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
              <Button type="submit" disabled={isPending}>
                {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Testimonial"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}