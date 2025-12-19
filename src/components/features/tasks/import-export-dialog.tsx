'use client';

import * as React from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Download, Upload, FileJson, FileSpreadsheet, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ImportExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

export function ImportExportDialog({ open, onOpenChange, onComplete }: ImportExportDialogProps) {
  const [activeTab, setActiveTab] = React.useState<'export' | 'import'>('export');
  
  // Export state
  const [exportFormat, setExportFormat] = React.useState<'json' | 'csv'>('json');
  const [exportOptions, setExportOptions] = React.useState({
    tasks: true,
    lists: true,
    boards: true,
    tags: true,
  });
  const [isExporting, setIsExporting] = React.useState(false);

  // Import state
  const [importFile, setImportFile] = React.useState<File | null>(null);
  const [isImporting, setIsImporting] = React.useState(false);
  const [importProgress, setImportProgress] = React.useState(0);
  const [importResult, setImportResult] = React.useState<{
    success: boolean;
    results?: {
      tasks: { created: number; errors: number };
      lists: { created: number; errors: number };
      tags: { created: number; errors: number };
    };
  } | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => {
      if (files.length > 0) {
        setImportFile(files[0]);
        setImportResult(null);
      }
    },
    accept: {
      'application/json': ['.json'],
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
  });

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const include = Object.entries(exportOptions)
        .filter(([_, v]) => v)
        .map(([k]) => k)
        .join(',');

      const response = await fetch(`/api/v1/export?format=${exportFormat}&include=${include}`);
      
      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `taskflow-export-${Date.now()}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Data exported successfully!');
    } catch (error) {
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    if (!importFile) return;

    setIsImporting(true);
    setImportProgress(10);

    try {
      const formData = new FormData();
      formData.append('file', importFile);

      setImportProgress(30);

      const response = await fetch('/api/v1/import', {
        method: 'POST',
        body: formData,
      });

      setImportProgress(80);

      if (!response.ok) throw new Error('Import failed');

      const result = await response.json();
      setImportResult(result);
      setImportProgress(100);

      if (result.success) {
        toast.success('Data imported successfully!');
        onComplete?.();
      }
    } catch (error) {
      toast.error('Failed to import data');
      setImportResult({ success: false });
    } finally {
      setIsImporting(false);
    }
  };

  const resetImport = () => {
    setImportFile(null);
    setImportResult(null);
    setImportProgress(0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Import / Export Data</DialogTitle>
          <DialogDescription>
            Export your data for backup or import from another source
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'export' | 'import')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export" className="flex items-center gap-2">
              <Download className="size-4" />
              Export
            </TabsTrigger>
            <TabsTrigger value="import" className="flex items-center gap-2">
              <Upload className="size-4" />
              Import
            </TabsTrigger>
          </TabsList>

          {/* Export Tab */}
          <TabsContent value="export" className="space-y-4 mt-4">
            {/* Format Selection */}
            <div className="space-y-2">
              <Label>Export Format</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setExportFormat('json')}
                  className={`p-3 rounded-lg border-2 transition-all flex items-center gap-3 ${
                    exportFormat === 'json'
                      ? 'border-primary bg-primary/5'
                      : 'border-transparent bg-muted/50 hover:bg-muted'
                  }`}
                >
                  <FileJson className="size-6 text-blue-500" />
                  <div className="text-left">
                    <p className="font-medium text-sm">JSON</p>
                    <p className="text-xs text-muted-foreground">Full data backup</p>
                  </div>
                </button>
                <button
                  onClick={() => setExportFormat('csv')}
                  className={`p-3 rounded-lg border-2 transition-all flex items-center gap-3 ${
                    exportFormat === 'csv'
                      ? 'border-primary bg-primary/5'
                      : 'border-transparent bg-muted/50 hover:bg-muted'
                  }`}
                >
                  <FileSpreadsheet className="size-6 text-green-500" />
                  <div className="text-left">
                    <p className="font-medium text-sm">CSV</p>
                    <p className="text-xs text-muted-foreground">Tasks only</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Data Selection */}
            {exportFormat === 'json' && (
              <div className="space-y-2">
                <Label>Include</Label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(exportOptions).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                      <Checkbox
                        id={`export-${key}`}
                        checked={value}
                        onCheckedChange={(checked) =>
                          setExportOptions(prev => ({ ...prev, [key]: !!checked }))
                        }
                      />
                      <Label htmlFor={`export-${key}`} className="text-sm capitalize cursor-pointer">
                        {key}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button
              className="w-full"
              onClick={handleExport}
              disabled={isExporting || !Object.values(exportOptions).some(Boolean)}
            >
              {isExporting ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="size-4 mr-2" />
                  Export Data
                </>
              )}
            </Button>
          </TabsContent>

          {/* Import Tab */}
          <TabsContent value="import" className="space-y-4 mt-4">
            {!importFile ? (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  isDragActive
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/20 hover:border-primary/50'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="size-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  Drag & drop a file or <span className="text-primary">browse</span>
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Supports JSON and CSV files
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Selected File */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  {importFile.name.endsWith('.json') ? (
                    <FileJson className="size-8 text-blue-500" />
                  ) : (
                    <FileSpreadsheet className="size-8 text-green-500" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{importFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(importFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  {!isImporting && !importResult && (
                    <Button variant="ghost" size="sm" onClick={resetImport}>
                      Change
                    </Button>
                  )}
                </div>

                {/* Progress */}
                {isImporting && (
                  <div className="space-y-2">
                    <Progress value={importProgress} />
                    <p className="text-xs text-center text-muted-foreground">
                      Importing data...
                    </p>
                  </div>
                )}

                {/* Results */}
                {importResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg ${
                      importResult.success ? 'bg-green-500/10' : 'bg-destructive/10'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      {importResult.success ? (
                        <Check className="size-5 text-green-500" />
                      ) : (
                        <AlertCircle className="size-5 text-destructive" />
                      )}
                      <span className="font-medium">
                        {importResult.success ? 'Import Complete' : 'Import Failed'}
                      </span>
                    </div>
                    
                    {importResult.results && (
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="text-center p-2 rounded bg-background/50">
                          <p className="text-lg font-bold text-green-600">
                            {importResult.results.tasks.created}
                          </p>
                          <p className="text-xs text-muted-foreground">Tasks</p>
                        </div>
                        <div className="text-center p-2 rounded bg-background/50">
                          <p className="text-lg font-bold text-blue-600">
                            {importResult.results.lists.created}
                          </p>
                          <p className="text-xs text-muted-foreground">Lists</p>
                        </div>
                        <div className="text-center p-2 rounded bg-background/50">
                          <p className="text-lg font-bold text-purple-600">
                            {importResult.results.tags.created}
                          </p>
                          <p className="text-xs text-muted-foreground">Tags</p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {!isImporting && !importResult && (
                  <Button className="w-full" onClick={handleImport}>
                    <Upload className="size-4 mr-2" />
                    Import Data
                  </Button>
                )}

                {importResult && (
                  <Button variant="outline" className="w-full" onClick={resetImport}>
                    Import Another File
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export default ImportExportDialog;
