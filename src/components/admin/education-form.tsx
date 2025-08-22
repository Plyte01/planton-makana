// src/components/admin/education-form.tsx
"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { createEducation, updateEducation } from "@/server/actions/education";
import { Education } from "@prisma/client";
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
const educationSchema = z.object({
  school: z.string().min(2, "School name is required."),
  degree: z.string().min(2, "Degree is required."),
  field: z.string().optional(),
  startDate: z.date({ message: "A start date is required." }),
  endDate: z.date().optional(),
  grade: z.string().optional(),
  description: z.string().optional(),
  order: z.number().default(0),
});

type EducationFormInputs = z.input<typeof educationSchema>;
type EducationFormValues = z.output<typeof educationSchema>;

interface EducationFormProps {
  education?: Education;
  children: React.ReactNode;
}

export function EducationForm({ education, children }: EducationFormProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isCurrent, setIsCurrent] = useState(!education?.endDate);
  const isEditMode = !!education;

  const form = useForm<EducationFormInputs, unknown, EducationFormValues>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      school: education?.school || "",
      degree: education?.degree || "",
      field: education?.field || "",
      startDate: education?.startDate ? new Date(education.startDate) : undefined,
      endDate: education?.endDate ? new Date(education.endDate) : undefined,
      grade: education?.grade || "",
      description: education?.description || "",
      order: education?.order || 0,
    } as Partial<EducationFormInputs>,
  });

  const onSubmit = (values: EducationFormValues) => {
    const finalValues = isCurrent ? { ...values, endDate: undefined } : values;

    startTransition(async () => {
      const action = isEditMode
        ? updateEducation(education.id, finalValues)
        : createEducation(finalValues);
      
      const result = await action;

      if (result.status === "success") {
        toast.success(result.message);
        setOpen(false);
        if (!isEditMode) form.reset();
      } else {
        if (result.errors) {
            // This is where you would handle field-specific errors if the server action returned them
            for (const [field, messages] of Object.entries(result.errors)) {
                form.setError(field as keyof EducationFormValues, { type: 'manual', message: messages.join(', ') });
            }
        }
        toast.error(result.message || "An error occurred.");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Education" : "Add New Education"}</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Update the details of your education record." : "Fill in the details for a new education record."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField<EducationFormInputs> name="school" control={form.control} render={({ field }) => ( <FormItem><FormLabel>School / University</FormLabel><FormControl><Input name={field.name} ref={field.ref} onBlur={field.onBlur} onChange={field.onChange} value={typeof field.value === "string" ? field.value : ""} /></FormControl><FormMessage /></FormItem> )} />
              <FormField<EducationFormInputs> name="degree" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Degree</FormLabel><FormControl><Input name={field.name} ref={field.ref} onBlur={field.onBlur} onChange={field.onChange} value={typeof field.value === "string" ? field.value : ""} /></FormControl><FormMessage /></FormItem> )} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField<EducationFormInputs> name="field" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Field of Study</FormLabel><FormControl><Input name={field.name} ref={field.ref} onBlur={field.onBlur} onChange={field.onChange} value={typeof field.value === "string" ? field.value : ""} /></FormControl><FormMessage /></FormItem> )} />
                <FormField<EducationFormInputs> name="grade" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Grade</FormLabel><FormControl><Input name={field.name} ref={field.ref} onBlur={field.onBlur} onChange={field.onChange} value={typeof field.value === "string" ? field.value : ""} /></FormControl><FormMessage /></FormItem> )} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <FormField<EducationFormInputs> control={form.control} name="startDate" render={({ field }) => (
                <FormItem className="flex flex-col"><FormLabel>Start Date</FormLabel>
                  <Popover><PopoverTrigger asChild>
                    <FormControl><Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{field.value instanceof Date ? format(field.value, "PPP") : <span>Pick a date</span>}</Button></FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value as Date | undefined} onSelect={(d) => field.onChange(d ?? undefined)} /></PopoverContent></Popover><FormMessage />
                </FormItem>
              )} />
              
              <FormField<EducationFormInputs> control={form.control} name="endDate" render={({ field }) => (
                <FormItem className="flex flex-col"><FormLabel>End Date</FormLabel>
                  <Popover><PopoverTrigger asChild>
                    <FormControl><Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")} disabled={isCurrent}><CalendarIcon className="mr-2 h-4 w-4" />{field.value instanceof Date && !isCurrent ? format(field.value, "PPP") : <span>Pick a date</span>}</Button></FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value as Date | undefined} onSelect={(d) => field.onChange(d ?? undefined)} disabled={(date) => date < ((form.getValues("startDate") as Date | undefined) || new Date())} /></PopoverContent></Popover><FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="flex items-center space-x-2">
                <Checkbox id="isCurrent" checked={isCurrent} onCheckedChange={(checked) => setIsCurrent(!!checked)} />
                <label htmlFor="isCurrent" className="text-sm font-medium">I am currently studying here</label>
            </div>

            <FormField<EducationFormInputs> name="description" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Description / Activities</FormLabel><FormControl><Textarea name={field.name} ref={field.ref} onBlur={field.onBlur} onChange={field.onChange} value={typeof field.value === "string" ? field.value : ""} /></FormControl><FormMessage /></FormItem> )} />
            <FormField<EducationFormInputs> name="order" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Display Order</FormLabel><FormControl><Input type="number" name={field.name} ref={field.ref} onBlur={field.onBlur} value={typeof field.value === "number" ? field.value : Number(field.value ?? 0)} onChange={(e) => field.onChange(Number(e.target.value))} /></FormControl><FormDescription>Lower numbers appear higher on the page.</FormDescription><FormMessage /></FormItem> )} />
            
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
              <Button type="submit" disabled={isPending}>
                {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Education"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}