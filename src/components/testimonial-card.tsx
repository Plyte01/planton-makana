// src/components/testimonial-card.tsx
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Testimonial } from "@prisma/client";
import Image from "next/image";
import { Star } from "lucide-react";

export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <Card className="h-full flex flex-col justify-between">
      <CardContent className="pt-6">
        <div className="flex gap-0.5 mb-2">
            {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-primary fill-primary" />)}
        </div>
        <blockquote className="italic text-muted-foreground">&quot;{testimonial.message}&quot;</blockquote>
      </CardContent>
      <CardHeader className="flex-row items-center gap-4">
        {testimonial.avatarUrl && (
          <div className="relative w-12 h-12 rounded-full overflow-hidden">
            <Image src={testimonial.avatarUrl} alt={testimonial.name} fill className="object-cover" />
          </div>
        )}
        <div>
          <p className="font-bold">{testimonial.name}</p>
          <p className="text-sm text-muted-foreground">{testimonial.role}{testimonial.company && `, ${testimonial.company}`}</p>
        </div>
      </CardHeader>
    </Card>
  );
}