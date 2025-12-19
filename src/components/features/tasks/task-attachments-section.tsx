'use client';

import * as React from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, X, Download, FileText, Image, File } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export interface Attachment {
  id: string;
  name: string;
  url: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

interface TaskAttachmentsSectionProps {
  taskId: string;
  attachments: Attachment[];
  onUpload: (files: File[]) => Promise<void>;
  onDelete: (attachmentId: string) => Promise<void>;
  isUploading?: boolean;
}

export function TaskAttachmentsSection({
  taskId,
  attachments,
  onUpload,
  onDelete,
  isUploading = false,
}: TaskAttachmentsSectionProps) {
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onUpload,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/plain': ['.txt'],
      'text/csv': ['.csv'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="size-5 text-blue-500" />;
    if (mimeType === 'application/pdf') return <FileText className="size-5 text-red-500" />;
    if (mimeType.includes('word')) return <Icon icon="vscode-icons:file-type-word" className="size-5" />;
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return <Icon icon="vscode-icons:file-type-excel" className="size-5" />;
    return <File className="size-5 text-muted-foreground" />;
  };

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
          <Icon icon="solar:paperclip-linear" className="size-4 text-primary/70" />
          Attachments
          {attachments.length > 0 && (
            <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full">
              {attachments.length}
            </span>
          )}
        </h4>
      </div>

      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-xl p-4 transition-all cursor-pointer",
          "hover:border-primary/50 hover:bg-primary/5",
          isDragActive && "border-primary bg-primary/10",
          isUploading && "pointer-events-none opacity-50"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center py-2 text-center">
          {isUploading ? (
            <>
              <Loader2 className="size-6 animate-spin text-primary mb-2" />
              <span className="text-sm text-muted-foreground">Uploading...</span>
            </>
          ) : isDragActive ? (
            <>
              <Icon icon="solar:upload-linear" className="size-6 text-primary mb-2" />
              <span className="text-sm text-primary font-medium">Drop files here</span>
            </>
          ) : (
            <>
              <Icon icon="solar:cloud-upload-linear" className="size-6 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">
                Drag & drop files or <span className="text-primary">browse</span>
              </span>
              <span className="text-xs text-muted-foreground/60 mt-1">
                Max 10MB • Images, PDF, Docs, Excel
              </span>
            </>
          )}
        </div>
      </div>

      {/* Attachments List */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {attachments.map((attachment) => (
              <motion.div
                key={attachment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="group flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                {/* Icon */}
                <div className="size-10 rounded-lg bg-background flex items-center justify-center shrink-0 border">
                  {attachment.mimeType.startsWith('image/') ? (
                    <img
                      src={attachment.url}
                      alt={attachment.name}
                      className="size-10 rounded-lg object-cover"
                    />
                  ) : (
                    getFileIcon(attachment.mimeType)
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{attachment.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatSize(attachment.size)} • {formatDistanceToNow(new Date(attachment.createdAt), { addSuffix: true })}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    asChild
                  >
                    <a href={attachment.url} download={attachment.name} target="_blank" rel="noopener noreferrer">
                      <Download className="size-4" />
                    </a>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(attachment.id)}
                    disabled={deletingId === attachment.id}
                  >
                    {deletingId === attachment.id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <X className="size-4" />
                    )}
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

export default TaskAttachmentsSection;
