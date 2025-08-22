// src/components/contact-form.tsx
"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { submitContactForm } from "@/server/actions/contact";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const contactSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    email: z.string().email("Please enter a valid email address."),
    subject: z.string().optional(),
    message: z.string().min(10, "Message must be at least 10 characters."),
});

export function ContactForm() {
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", subject: "", message: "" },
  });

  const onSubmit = (values: z.infer<typeof contactSchema>) => {
    startTransition(async () => {
      const result = await submitContactForm(values);
      if (result.status === "success") {
        toast.success(result.message);
        form.reset();
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField name="name" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Your Name</FormLabel><FormControl><Input {...field} placeholder="John Doe" /></FormControl><FormMessage /></FormItem> )} />
          <FormField name="email" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Your Email</FormLabel><FormControl><Input {...field} placeholder="john.doe@example.com" /></FormControl><FormMessage /></FormItem> )} />
        </div>
        <FormField name="subject" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Subject</FormLabel><FormControl><Input {...field} placeholder="Project Inquiry" /></FormControl><FormMessage /></FormItem> )} />
        <FormField name="message" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Message</FormLabel><FormControl><Textarea {...field} className="h-40" placeholder="Tell me about your project..." /></FormControl><FormMessage /></FormItem> )} />
        <Button type="submit" disabled={isPending} className="w-full md:w-auto">
          {isPending ? "Sending..." : "Send Message"}
        </Button>
      </form>
    </Form>
  );
}