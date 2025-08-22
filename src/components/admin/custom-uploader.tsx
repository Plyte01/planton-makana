// src/components/admin/custom-uploader.tsx
"use client";

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ImagePlus, Loader2, Trash } from 'lucide-react';
import Image from 'next/image';

interface CustomUploaderProps {
  value: string;
  onChange: (src: string) => void;
}

export function CustomUploader({ value, onChange }: CustomUploaderProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      onChange(data.secure_url);
      toast.success('Image uploaded successfully.');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error('Something went wrong during upload.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      {value && (
        <div className="relative w-48 h-48 rounded-md overflow-hidden">
          <div className="z-10 absolute top-2 right-2">
            <Button type="button" onClick={() => onChange('')} variant="destructive" size="icon">
              <Trash className="h-4 w-4" />
            </Button>
          </div>
          <Image fill className="object-cover" alt="Image preview" src={value} />
        </div>
      )}
      
      <div className="relative">
        <Button type="button" variant="secondary" disabled={isLoading} asChild>
          <label htmlFor="file-upload" className="cursor-pointer flex items-center">
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <ImagePlus className="h-4 w-4 mr-2" />
            )}
            {value ? 'Change Image' : 'Upload Image'}
          </label>
        </Button>
        <input
          id="file-upload"
          type="file"
          className="sr-only"
          onChange={handleFileChange}
          accept="image/*"
          disabled={isLoading}
        />
      </div>
    </div>
  );
}