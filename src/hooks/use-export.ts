"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  ExportColumn,
  getExportPreview,
  downloadCSV,
} from "@/lib/export-utils";

interface UseExportOptions {
  filename: string;
  tableName: string; // For audit logging
  columns: ExportColumn[];
  successMessage?: string;
  errorMessage?: string;
}

interface UseExportReturn {
  isExportDialogOpen: boolean;
  exportInfo: {
    rowCount: number;
    columnCount: number;
    estimatedSize: string;
    filename: string;
  } | null;
  handleExport: (data: any[]) => void;
  confirmExport: () => void;
  cancelExport: () => void;
}

/**
 * Custom hook for handling data export with confirmation dialog
 * 
 * @example
 * const { handleExport, isExportDialogOpen, exportInfo, confirmExport, cancelExport } = useExport({
 *   filename: 'users-export.csv',
 *   columns: [
 *     { key: 'id', label: 'User ID' },
 *     { key: 'name', label: 'Name' },
 *   ],
 * });
 */
export function useExport({
  filename,
  tableName,
  columns,
  successMessage = "Data exported successfully",
  errorMessage = "Failed to export data",
}: UseExportOptions): UseExportReturn {
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [csvContent, setCsvContent] = useState<string>("");
  const [exportInfo, setExportInfo] = useState<{
    rowCount: number;
    columnCount: number;
    estimatedSize: string;
    filename: string;
  } | null>(null);

  /**
   * Prepare export and show confirmation dialog
   */
  const handleExport = (data: any[]) => {
    try {
      if (!data || data.length === 0) {
        toast.error("No data to export");
        return;
      }

      // Generate preview
      const preview = getExportPreview(data, columns);
      
      // Store CSV content and info
      setCsvContent(preview.csvContent);
      setExportInfo({
        rowCount: preview.rowCount,
        columnCount: preview.columnCount,
        estimatedSize: preview.estimatedSize,
        filename,
      });

      // Show confirmation dialog
      setIsExportDialogOpen(true);
    } catch (error) {
      console.error("Export error:", error);
      toast.error(errorMessage);
    }
  };

  /**
   * Confirm and download the export
   */
  const confirmExport = async () => {
    try {
      if (!csvContent || !exportInfo) {
        toast.error("No data to export");
        return;
      }

      // Download the file
      downloadCSV(csvContent, filename);
      
      // Log the export action to audit
      try {
        await fetch('/api/v1/audit/export', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tableName,
            recordCount: exportInfo.rowCount,
            fileSize: exportInfo.estimatedSize,
            fileName: filename,
          }),
        });
      } catch (auditError) {
        // Don't fail the export if audit logging fails
        console.error('Failed to log export to audit:', auditError);
      }
      
      // Close dialog
      setIsExportDialogOpen(false);
      
      // Show success message
      toast.success(successMessage);
      
      // Clear state
      setCsvContent("");
      setExportInfo(null);
    } catch (error) {
      console.error("Download error:", error);
      toast.error(errorMessage);
    }
  };

  /**
   * Cancel the export
   */
  const cancelExport = () => {
    setIsExportDialogOpen(false);
    setCsvContent("");
    setExportInfo(null);
  };

  return {
    isExportDialogOpen,
    exportInfo,
    handleExport,
    confirmExport,
    cancelExport,
  };
}
