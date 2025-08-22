// src/components/admin/image-upload.tsx
"use client";

import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ImagePlus, Trash } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
  value: string;
  onChange: (src: string) => void;
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onChange(url);
    }
  };

  return (
    <div className="flex items-center gap-4">
      {value && (
        <div className="relative w-[200px] h-[200px] rounded-md overflow-hidden">
          <div className="z-10 absolute top-2 right-2">
            <Button type="button" onClick={() => onChange("")} variant="destructive" size="icon">
              <Trash className="h-4 w-4" />
            </Button>
          </div>
          <Image
            fill
            className="object-cover"
            alt="Uploaded image"
            src={value}
          />
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        type="button"
        variant="secondary"
        onClick={() => fileInputRef.current?.click()}
        className={value ? "hidden" : "flex"}
      >
        <ImagePlus className="h-4 w-4 mr-2" />
        Upload Image
      </Button>
    </div>
  );
}