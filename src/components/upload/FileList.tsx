"use client";

import { FilePreview } from "./FilePreview";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface FileListProps {
  files: Array<{
    url: string;
    name: string;
    size: number;
    type?: string;
  }>;
  onRemove?: (index: number) => void;
  showRemove?: boolean;
  maxHeight?: string;
  className?: string;
}

export function FileList({
  files,
  onRemove,
  showRemove = true,
  maxHeight = "400px",
  className,
}: FileListProps) {
  if (files.length === 0) {
    return null;
  }

  return (
    <ScrollArea className={cn("w-full", className)} style={{ maxHeight }}>
      <div className="space-y-2">
        {files.map((file, index) => (
          <FilePreview
            key={`${file.url}-${index}`}
            file={file}
            onRemove={onRemove ? () => onRemove(index) : undefined}
            showRemove={showRemove}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
