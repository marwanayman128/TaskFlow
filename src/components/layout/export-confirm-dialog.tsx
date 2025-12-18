"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Download, FileText, Table2 } from "lucide-react";

interface ExportConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  exportInfo: {
    rowCount: number;
    columnCount: number;
    estimatedSize: string;
    filename: string;
  };
}

export function ExportConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title = "Export Data",
  description = "Are you sure you want to export this data?",
  exportInfo,
}: ExportConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg border border-border/60 bg-muted/50 p-4 space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Export Details</h4>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Table2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Rows:</span>
                <span className="font-medium text-foreground">{exportInfo.rowCount.toLocaleString()}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Table2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Columns:</span>
                <span className="font-medium text-foreground">{exportInfo.columnCount}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">File Size:</span>
                <span className="font-medium text-foreground">{exportInfo.estimatedSize}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Format:</span>
                <span className="font-medium text-foreground">CSV</span>
              </div>
            </div>

            <div className="pt-2 border-t border-border/40">
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <FileText className="h-3 w-3 mt-0.5" />
                <span>File: <span className="font-mono text-foreground">{exportInfo.filename}</span></span>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            The file will be downloaded to your default downloads folder.
          </p>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="gap-2">
            <Download className="h-4 w-4" />
            Download CSV
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
