// src/components/admin/profile-form.tsx
"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { updateProfile } from "@/server/actions/profile";
import { User } from "@prisma/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
//import { ImageUpload } from "./image-upload"; // <-- IMPORT IMAGE UPLOAD
import { CustomUploader } from "./custom-uploader";

// Zod schema for client-side and server-side validation
const profileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    image: z.string().url("A valid image URL is required.").optional().or(z.literal('')),
    tagline: z.string().optional(),
    bio: z.string().optional(),
    skills: z.string().optional(),
    githubUrl: z.string().url("Please enter a valid URL.").optional().or(z.literal('')),
    linkedinUrl: z.string().url("Please enter a valid URL.").optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
    adminUser: User;
}

export function ProfileForm({ adminUser }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition();

  // Safely parse the socialLinks JSONB field
  const socialLinks = adminUser.socialLinks as { github?: string; linkedin?: string } | null;

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
        name: adminUser.name || "",
        image: adminUser.image || "", // <-- ADD IMAGE TO DEFAULTS
        tagline: adminUser.tagline || "",
        bio: adminUser.bio || "",
        skills: adminUser.skills?.join(", ") || "",
        githubUrl: socialLinks?.github || "",
        linkedinUrl: socialLinks?.linkedin || "",
    },
  });

  const onSubmit = (values: ProfileFormValues) => {
    startTransition(async () => {
      const result = await updateProfile(values);
      if (result.status === "success") {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>
          This information will be displayed on your public &quot;About Me&quot; page.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* --- ADD THE IMAGE UPLOAD FIELD --- */}
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Profile Photo</FormLabel>
                  <FormControl>
                    <CustomUploader
                      value={field.value ?? ""}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* --------------------------------- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField name="name" control={form.control} render={({ field }) => (
                    <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField name="tagline" control={form.control} render={({ field }) => (
                    <FormItem>
                        <FormLabel>Tagline</FormLabel>
                        <FormControl><Input {...field} placeholder="e.g., Full-Stack Developer" /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
            </div>

            <FormField name="bio" control={form.control} render={({ field }) => (
                <FormItem>
                    <FormLabel>Biography</FormLabel>
                    <FormControl><Textarea {...field} className="h-32" placeholder="Tell a little bit about yourself..." /></FormControl>
                    <FormDescription>A brief introduction that will appear on your &quot;About Me&quot; page.</FormDescription>
                    <FormMessage />
                </FormItem>
            )} />

            <FormField name="skills" control={form.control} render={({ field }) => (
                <FormItem>
                    <FormLabel>Skills</FormLabel>
                    <FormControl><Input {...field} placeholder="e.g., Next.js, TypeScript, Prisma" /></FormControl>
                    <FormDescription>Comma-separated list of your key skills and technologies.</FormDescription>
                    <FormMessage />
                </FormItem>
            )} />
            
            <div className="space-y-4 rounded-md border p-4">
                <h3 className="text-lg font-medium">Social Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField name="githubUrl" control={form.control} render={({ field }) => (
                        <FormItem>
                            <FormLabel>GitHub URL</FormLabel>
                            <FormControl><Input {...field} placeholder="https://github.com/your-username" /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField name="linkedinUrl" control={form.control} render={({ field }) => (
                        <FormItem>
                            <FormLabel>LinkedIn URL</FormLabel>
                            <FormControl><Input {...field} placeholder="https://linkedin.com/in/your-profile" /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
            </div>

            <div className="flex justify-end">
                <Button type="submit" disabled={isPending}>
                    {isPending ? "Saving Changes..." : "Save Changes"}
                </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}