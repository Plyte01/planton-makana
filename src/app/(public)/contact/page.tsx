// src/app/(public)/contact/page.tsx
import { ContactForm } from "@/components/contact-form";

export default function ContactPage() {
  return (
    <section className="py-16 md:py-24 animate-fade-in-up bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="mb-4 text-3xl sm:text-4xl font-bold tracking-tight text-primary">
            Get in Touch
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground">
            Have a project in mind or just want to say hello? I&apos;d love to hear from you.
          </p>
        </div>
        <ContactForm />
      </div>
    </section>
  );
}