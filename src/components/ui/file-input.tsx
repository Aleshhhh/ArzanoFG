'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { UploadCloud } from 'lucide-react';

interface FileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FileInput = React.forwardRef<HTMLInputElement, FileInputProps>(
  ({ onFileChange, className, id, ...props }, ref) => {
    const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      e.stopPropagation();
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        const syntheticEvent = {
          target: { files } as unknown as EventTarget & HTMLInputElement,
        } as React.ChangeEvent<HTMLInputElement>;
        onFileChange(syntheticEvent);
      }
    };
    
    return (
      <div className={cn("flex items-center justify-center w-full", className)}>
        <label
          htmlFor={id}
          className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-secondary/50 hover:bg-secondary border-primary/50 hover:border-primary transition-colors"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
            <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
            <p className="mb-2 text-sm text-muted-foreground">
              <span className="font-semibold">Trascina un file</span> o clicca per caricare
            </p>
            <p className="text-xs text-muted-foreground">PNG, JPG, GIF (MAX. 800x400px)</p>
          </div>
          <input ref={ref} id={id} type="file" className="hidden" onChange={onFileChange} {...props} />
        </label>
      </div>
    );
  }
);
FileInput.displayName = 'FileInput';

export { FileInput };