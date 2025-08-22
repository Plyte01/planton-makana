// src/components/admin/experience-form.tsx
"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { createExperience, updateExperience } from "@/server/actions/experience";
import { Experience } from "@prisma/client";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";

// Zod schema for validation
const experienceSchema = z.object({
  title: z.string().min(2, "Title is required."),
  company: z.string().min(2, "Company is required."),
  location: z.string().optional(),
  startDate: z.date({ message: "A start date is required." }),
  endDate: z.date().optional(),
  description: z.string().optional(),
  order: z.number().default(0),
});

type ExperienceFormInputs = z.input<typeof experienceSchema>;
type ExperienceFormValues = z.output<typeof experienceSchema>;

interface ExperienceFormProps {
  experience?: Experience;
  children: React.ReactNode;
}

export function ExperienceForm({ experience, children }: ExperienceFormProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isCurrentJob, setIsCurrentJob] = useState(!experience?.endDate);
  const isEditMode = !!experience;

  const form = useForm<ExperienceFormInputs, unknown, ExperienceFormValues>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      title: experience?.title || "",
      company: experience?.company || "",
      location: experience?.location || "",
      startDate: experience?.startDate ? new Date(experience.startDate) : undefined,
      endDate: experience?.endDate ? new Date(experience.endDate) : undefined,
      description: experience?.description || "",
      order: experience?.order || 0,
    } as Partial<ExperienceFormInputs>,
  });

  const onSubmit = (values: ExperienceFormValues) => {
    // If it's a current job, ensure endDate is null
    const finalValues = isCurrentJob ? { ...values, endDate: undefined } : values;

    startTransition(async () => {
      const action = isEditMode
        ? updateExperience(experience.id, finalValues)
        : createExperience(finalValues);
      
      const result = await action;

      if (result.status === "success") {
        toast.success(result.message);
        setOpen(false);
        if (!isEditMode) form.reset();
      } else {
        if (result.errors) {
          // Handle field-specific errors
        }
        toast.error("An error occurred.");
      }
    });
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Experience" : "Add New Experience"}</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Update the details of your work experience." : "Fill in the details for a new work experience record."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField<ExperienceFormInputs> name="title" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Job Title</FormLabel><FormControl><Input name={field.name} ref={field.ref} onBlur={field.onBlur} onChange={field.onChange} value={typeof field.value === "string" ? field.value : ""} placeholder="Software Engineer" /></FormControl><FormMessage /></FormItem> )} />
              <FormField<ExperienceFormInputs> name="company" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Company</FormLabel><FormControl><Input name={field.name} ref={field.ref} onBlur={field.onBlur} onChange={field.onChange} value={typeof field.value === "string" ? field.value : ""} placeholder="Tech Corp" /></FormControl><FormMessage /></FormItem> )} />
            </div>
            <FormField<ExperienceFormInputs> name="location" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Location</FormLabel><FormControl><Input name={field.name} ref={field.ref} onBlur={field.onBlur} onChange={field.onChange} value={typeof field.value === "string" ? field.value : ""} placeholder="e.g., San Francisco, CA or Remote" /></FormControl><FormMessage /></FormItem> )} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <FormField<ExperienceFormInputs> control={form.control} name="startDate" render={({ field }) => (
                <FormItem className="flex flex-col"><FormLabel>Start Date</FormLabel>
                  <Popover><PopoverTrigger asChild>
                      <FormControl>
                        <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                          {field.value instanceof Date ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value as Date | undefined} onSelect={(d) => field.onChange(d ?? undefined)} initialFocus />
                  </PopoverContent></Popover><FormMessage />
                </FormItem>
              )} />
              
              <FormField<ExperienceFormInputs> control={form.control} name="endDate" render={({ field }) => (
                <FormItem className="flex flex-col"><FormLabel>End Date</FormLabel>
                  <Popover><PopoverTrigger asChild>
                      <FormControl>
                        <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")} disabled={isCurrentJob}>
                          {field.value instanceof Date && !isCurrentJob ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value as Date | undefined} onSelect={(d) => field.onChange(d ?? undefined)} disabled={(date) => date < ((form.getValues("startDate") as Date | undefined) || new Date())} initialFocus />
                  </PopoverContent></Popover><FormMessage />
                </FormItem>
              )} />
            </div>
            
            <div className="flex items-center space-x-2">
                <Checkbox id="isCurrentJob" checked={isCurrentJob} onCheckedChange={(checked) => setIsCurrentJob(!!checked)} />
                <label htmlFor="isCurrentJob" className="text-sm font-medium leading-none">I currently work here</label>
            </div>
            
            <FormField<ExperienceFormInputs> name="description" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea name={field.name} ref={field.ref} onBlur={field.onBlur} onChange={field.onChange} value={typeof field.value === "string" ? field.value : ""} placeholder="Describe your key responsibilities and achievements..." /></FormControl><FormDescription>Use bullet points (one per line) for best display.</FormDescription><FormMessage /></FormItem> )} />
            <FormField<ExperienceFormInputs> name="order" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Display Order</FormLabel><FormControl><Input type="number" name={field.name} ref={field.ref} onBlur={field.onBlur} value={typeof field.value === "number" ? field.value : Number(field.value ?? 0)} onChange={(e) => field.onChange(Number(e.target.value))} /></FormControl><FormDescription>A lower number (e.g., 1) will appear higher on the page.</FormDescription><FormMessage /></FormItem> )} />
            
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
              <Button type="submit" disabled={isPending}>
                {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Experience"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}