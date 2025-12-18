"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { PaginationControls } from "@/components/layout/pagination-controls";
import { DynamicAnimation } from "@/components/layout/dynamic-animation";
import { 
  MoreVertical, Filter, RefreshCcw, Download, RotateCcw, Search, X, SlidersHorizontal,
  Check, Columns, LucideIcon, ChevronDown, ChevronRight, Pencil, Copy, Printer,
  Save, XCircle, Trash2, FileSpreadsheet, ArrowUpDown, ArrowUp, ArrowDown, Pin, PinOff,
  Calendar, BookmarkPlus, Settings2, Plus,
} from "lucide-react";
import { toast } from "sonner";
import { format, subDays, startOfWeek, startOfMonth, startOfYear } from "date-fns";

// =============================================
// TYPES
// =============================================

export interface ColumnDef<T> {
  key: string;
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  sortable?: boolean;
  filterable?: boolean;
  hidden?: boolean;
  width?: string;
  minWidth?: string;
  render?: (value: unknown, row: T) => React.ReactNode;
  // NEW: Enhanced features
  editable?: boolean;
  editType?: "text" | "number" | "select" | "date";
  editOptions?: { value: string; label: string }[];
  pinned?: "left" | "right";
  aggregate?: "sum" | "avg" | "count" | "min" | "max";
  cellClassName?: string | ((value: unknown, row: T) => string);
  groupBy?: boolean;
}

export interface TableFilterOption {
  key: string;
  label: string;
  type: "select" | "search" | "date" | "checkbox" | "dateRange";
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export interface ActionItem<T> {
  label: string;
  icon?: LucideIcon;
  onClick: (row: T) => void;
  variant?: "default" | "destructive";
  separator?: boolean;
  hidden?: (row: T) => boolean;
  disabled?: boolean | ((row: T) => boolean);
}

export interface BulkAction<T> {
  label: string;
  icon?: LucideIcon;
  onClick: (rows: T[]) => void;
  variant?: "default" | "destructive";
  requireConfirm?: boolean;
  confirmMessage?: string;
}

export interface QuickFilter {
  key: string;
  label: string;
  value: string;
  icon?: LucideIcon;
}

export interface DateRangePreset {
  label: string;
  getValue: () => { from: Date; to: Date };
}

export interface SavedView {
  id: string;
  name: string;
  columns: string[];
  filters: Record<string, string>;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface DataTableProps<T extends { id: string }> {
  // Core
  data: T[];
  columns: ColumnDef<T>[];
  loading?: boolean;
  
  // Pagination
  totalItems?: number;
  currentPage?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
  onItemsPerPageChange?: (perPage: number) => void;
  
  // Header
  title?: string;
  description?: string;
  
  // Row Actions
  actions?: ActionItem<T>[];
  onRefresh?: () => void;
  onAdd?: () => void;
  addButtonLabel?: string;
  
  // Selection & Export
  selectable?: boolean;
  onExport?: (selectedRows: T[]) => void;
  exportFilename?: string;
  
  // Filtering
  filters?: TableFilterOption[];
  onFilterChange?: (filters: Record<string, string>) => void;
  advancedFilters?: React.ReactNode;
  onAdvancedFiltersOpen?: () => void;
  quickFilters?: QuickFilter[];
  dateRangePresets?: DateRangePreset[];
  
  // Empty state
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  emptyStateAnimation?: string;
  emptyStateAction?: React.ReactNode;
  
  // NEW: Enhanced Props
  bulkActions?: BulkAction<T>[];
  onInlineEdit?: (row: T, key: string, value: unknown) => Promise<void>;
  onRowClick?: (row: T) => void;
  rowHoverCard?: (row: T) => React.ReactNode;
  stickyHeader?: boolean;
  stickyFirstColumn?: boolean;
  showFooterAggregates?: boolean;
  groupByColumn?: string;
  onGroupChange?: (groupBy: string | null) => void;
  savedViews?: SavedView[];
  onSaveView?: (view: Omit<SavedView, "id">) => void;
  onDeleteView?: (viewId: string) => void;
  enableKeyboardNav?: boolean;
  enableCopyCell?: boolean;
  enablePrint?: boolean;
  className?: string;
}

// =============================================
// DEFAULT DATE RANGE PRESETS
// =============================================

const defaultDatePresets: DateRangePreset[] = [
  { label: "Today", getValue: () => ({ from: new Date(), to: new Date() }) },
  { label: "Yesterday", getValue: () => ({ from: subDays(new Date(), 1), to: subDays(new Date(), 1) }) },
  { label: "Last 7 Days", getValue: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
  { label: "Last 30 Days", getValue: () => ({ from: subDays(new Date(), 30), to: new Date() }) },
  { label: "This Week", getValue: () => ({ from: startOfWeek(new Date()), to: new Date() }) },
  { label: "This Month", getValue: () => ({ from: startOfMonth(new Date()), to: new Date() }) },
  { label: "This Year", getValue: () => ({ from: startOfYear(new Date()), to: new Date() }) },
];

// =============================================
// HELPER COMPONENTS
// =============================================

export function TableEmptyState({
  title, description, animationUrl = "/animations/people-looking-through-binoculars-illustration-2025-10-20-23-53-14-utc.json",
  action, onClearFilters, hasFilters,
}: {
  title: string; description: string; animationUrl?: string;
  action?: React.ReactNode; onClearFilters?: () => void; hasFilters?: boolean;
}) {
  return (
    <TableRow>
      <TableCell colSpan={100} className="h-[400px]">
        <div className="flex flex-col items-center justify-center text-center py-8 animate-in fade-in-50 duration-500">
          <DynamicAnimation animationUrl={animationUrl} />
          <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
          <p className="text-muted-foreground max-w-sm mb-6 text-base">{description}</p>
          <div className="flex items-center gap-2">
            {hasFilters && onClearFilters && (
              <Button variant="outline" onClick={onClearFilters} className="rounded-full">
                <RotateCcw className="mr-2 h-4 w-4" />Clear Filters
              </Button>
            )}
            {action}
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function TableLoadingSkeleton({ columns, rows = 5 }: { columns: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow key={rowIndex}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <TableCell key={colIndex}><Skeleton className="h-4 w-full" /></TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

// Inline Edit Cell
function InlineEditCell<T>({
  value, row, column, onSave, onCancel,
}: {
  value: unknown; row: T; column: ColumnDef<T>;
  onSave: (newValue: unknown) => void; onCancel: () => void;
}) {
  const [editValue, setEditValue] = React.useState(String(value ?? ""));
  
  const handleSave = () => {
    const finalValue = column.editType === "number" ? Number(editValue) : editValue;
    onSave(finalValue);
  };

  return (
    <div className="flex items-center gap-1">
      {column.editType === "select" && column.editOptions ? (
        <Select value={editValue} onValueChange={setEditValue}>
          <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {column.editOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          type={column.editType === "number" ? "number" : column.editType === "date" ? "date" : "text"}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="h-7 text-xs"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") onCancel();
          }}
        />
      )}
      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleSave}>
        <Check className="h-3 w-3 text-green-600" />
      </Button>
      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={onCancel}>
        <X className="h-3 w-3 text-red-600" />
      </Button>
    </div>
  );
}

// Quick Filter Chips
function QuickFilterChips({
  filters, activeFilter, onSelect,
}: {
  filters: QuickFilter[]; activeFilter: string | null; onSelect: (key: string | null) => void;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {filters.map((f) => (
        <Badge
          key={f.key}
          variant={activeFilter === f.key ? "default" : "outline"}
          className="cursor-pointer hover:bg-primary/10 transition-colors"
          onClick={() => onSelect(activeFilter === f.key ? null : f.key)}
        >
          {f.icon && <f.icon className="h-3 w-3 mr-1" />}
          {f.label}
        </Badge>
      ))}
    </div>
  );
}

// =============================================
// EXPORT UTILITIES
// =============================================

export function exportToCSV<T extends Record<string, unknown>>(
  data: T[], columns: ColumnDef<T>[], filename: string = "export"
) {
  if (data.length === 0) { toast.error("No data to export"); return; }
  const visibleColumns = columns.filter((col) => !col.hidden);
  const headers = visibleColumns.map((col) => col.header);
  const rows = data.map((row) => visibleColumns.map((col) => {
    const value = typeof col.accessor === "function" ? col.accessor(row) : row[col.accessor as string];
    if (React.isValidElement(value) || value === null || value === undefined) return "";
    const strValue = String(value);
    return strValue.includes(",") || strValue.includes('"') ? `"${strValue.replace(/"/g, '""')}"` : strValue;
  }));
  const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${format(new Date(), "yyyy-MM-dd")}.csv`;
  link.click();
  toast.success(`Exported ${data.length} records to CSV`);
}

export function exportToExcel<T extends Record<string, unknown>>(
  data: T[], columns: ColumnDef<T>[], filename: string = "export"
) {
  // Simple Excel XML format
  if (data.length === 0) { toast.error("No data to export"); return; }
  const visibleColumns = columns.filter((col) => !col.hidden);
  const headers = visibleColumns.map((col) => `<th>${col.header}</th>`).join("");
  const rows = data.map((row) => {
    const cells = visibleColumns.map((col) => {
      const value = typeof col.accessor === "function" ? col.accessor(row) : row[col.accessor as string];
      return `<td>${value ?? ""}</td>`;
    }).join("");
    return `<tr>${cells}</tr>`;
  }).join("");
  const html = `<table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
  const blob = new Blob([html], { type: "application/vnd.ms-excel" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${format(new Date(), "yyyy-MM-dd")}.xls`;
  link.click();
  toast.success(`Exported ${data.length} records to Excel`);
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
  toast.success("Copied to clipboard");
}

function printTable<T extends Record<string, unknown>>(data: T[], columns: ColumnDef<T>[], title: string) {
  const visibleColumns = columns.filter((col) => !col.hidden);
  const headers = visibleColumns.map((col) => `<th style="border:1px solid #ddd;padding:8px;text-align:left">${col.header}</th>`).join("");
  const rows = data.map((row) => {
    const cells = visibleColumns.map((col) => {
      const value = typeof col.accessor === "function" ? col.accessor(row) : row[col.accessor as string];
      return `<td style="border:1px solid #ddd;padding:8px">${value ?? ""}</td>`;
    }).join("");
    return `<tr>${cells}</tr>`;
  }).join("");
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(`
      <html><head><title>${title}</title></head>
      <body style="font-family:sans-serif">
        <h1>${title}</h1>
        <table style="border-collapse:collapse;width:100%">
          <thead><tr style="background:#f5f5f5">${headers}</tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  }
}

// =============================================
// MAIN DATA TABLE COMPONENT
// =============================================

export function ReusableDataTable<T extends { id: string }>({
  data, columns, loading = false,
  totalItems, currentPage = 1, itemsPerPage = 10,
  onPageChange, onItemsPerPageChange,
  title, description, actions, onRefresh, onAdd, addButtonLabel,
  selectable = false, onExport, exportFilename = "export",
  filters = [], onFilterChange, advancedFilters, onAdvancedFiltersOpen,
  quickFilters = [], dateRangePresets = defaultDatePresets,
  emptyStateTitle = "No data found", emptyStateDescription = "Try adjusting your filters.",
  emptyStateAnimation, emptyStateAction,
  bulkActions = [], onInlineEdit, onRowClick, rowHoverCard,
  stickyHeader = false, stickyFirstColumn = false, showFooterAggregates = false,
  groupByColumn, savedViews = [], onSaveView, onDeleteView,
  enableKeyboardNav = false, enableCopyCell = false, enablePrint = false,
  className,
}: DataTableProps<T>) {
  // State
  const [selectedRows, setSelectedRows] = React.useState<Set<string>>(new Set());
  const [filterPopoverOpen, setFilterPopoverOpen] = React.useState(false);
  const [filterValues, setFilterValues] = React.useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = React.useState("");
  const [visibleColumns, setVisibleColumns] = React.useState<Set<string>>(
    new Set(columns.filter((c) => !c.hidden).map((c) => c.key))
  );
  const [sortBy, setSortBy] = React.useState<string | null>(null);
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("asc");
  const [editingCell, setEditingCell] = React.useState<{ rowId: string; columnKey: string } | null>(null);
  const [pinnedColumns, setPinnedColumns] = React.useState<Set<string>>(new Set());
  const [activeQuickFilter, setActiveQuickFilter] = React.useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = React.useState<Set<string>>(new Set());
  const [focusedCell, setFocusedCell] = React.useState<{ row: number; col: number } | null>(null);
  const tableRef = React.useRef<HTMLTableElement>(null);

  // Calculations
  const total = totalItems ?? data.length;
  const totalPages = Math.ceil(total / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, total);

  // Filter & Sort data
  const processedData = React.useMemo(() => {
    let result = [...data];
    
    // Quick filter
    if (activeQuickFilter && quickFilters.length > 0) {
      const qf = quickFilters.find((f) => f.key === activeQuickFilter);
      if (qf) result = result.filter((row) => String((row as Record<string, unknown>)[qf.key]) === qf.value);
    }
    
    // Search & filters
    if (searchQuery || Object.keys(filterValues).length > 0) {
      result = result.filter((row) => {
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const matches = columns.some((col) => {
            const value = typeof col.accessor === "function" ? col.accessor(row) : (row as Record<string, unknown>)[col.accessor as string];
            return String(value ?? "").toLowerCase().includes(query);
          });
          if (!matches) return false;
        }
        for (const [key, value] of Object.entries(filterValues)) {
          if (value && value !== "all" && String(row[key as keyof T]) !== value) return false;
        }
        return true;
      });
    }
    
    // Sort
    if (sortBy) {
      result.sort((a, b) => {
        const aVal = (a as Record<string, unknown>)[sortBy];
        const bVal = (b as Record<string, unknown>)[sortBy];
        const comparison = String(aVal ?? "").localeCompare(String(bVal ?? ""), undefined, { numeric: true });
        return sortOrder === "asc" ? comparison : -comparison;
      });
    }
    
    return result;
  }, [data, searchQuery, filterValues, sortBy, sortOrder, activeQuickFilter, quickFilters, columns]);

  // Group data if needed
  const groupedData = React.useMemo(() => {
    if (!groupByColumn) return null;
    const groups = new Map<string, T[]>();
    processedData.forEach((row) => {
      const key = String((row as Record<string, unknown>)[groupByColumn] ?? "Ungrouped");
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(row);
    });
    return groups;
  }, [processedData, groupByColumn]);

  // Calculate aggregates
  const aggregates = React.useMemo(() => {
    if (!showFooterAggregates) return {};
    const result: Record<string, number> = {};
    columns.forEach((col) => {
      if (col.aggregate) {
        const values = processedData.map((row) => {
          const val = typeof col.accessor === "function" ? col.accessor(row) : (row as Record<string, unknown>)[col.accessor as string];
          return typeof val === "number" ? val : parseFloat(String(val)) || 0;
        });
        switch (col.aggregate) {
          case "sum": result[col.key] = values.reduce((a, b) => a + b, 0); break;
          case "avg": result[col.key] = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0; break;
          case "count": result[col.key] = values.length; break;
          case "min": result[col.key] = Math.min(...values); break;
          case "max": result[col.key] = Math.max(...values); break;
        }
      }
    });
    return result;
  }, [processedData, columns, showFooterAggregates]);

  // Active filter count
  const activeFiltersCount = React.useMemo(() => {
    let count = searchQuery ? 1 : 0;
    Object.values(filterValues).forEach((v) => { if (v && v !== "all") count++; });
    if (activeQuickFilter) count++;
    return count;
  }, [searchQuery, filterValues, activeQuickFilter]);

  // Selection handlers
  const handleSelectAll = React.useCallback(() => {
    if (selectedRows.size === processedData.length) setSelectedRows(new Set());
    else setSelectedRows(new Set(processedData.map((row) => row.id)));
  }, [processedData, selectedRows.size]);

  const handleSelectRow = React.useCallback((id: string) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  // Sort handler
  const handleSort = React.useCallback((columnKey: string) => {
    if (sortBy === columnKey) {
      setSortOrder((prev) => prev === "asc" ? "desc" : "asc");
    } else {
      setSortBy(columnKey);
      setSortOrder("asc");
    }
  }, [sortBy]);

  // Export handler
  const handleExport = React.useCallback((type: "csv" | "excel" = "csv") => {
    const rowsToExport = selectedRows.size > 0 ? processedData.filter((row) => selectedRows.has(row.id)) : processedData;
    if (onExport) { onExport(rowsToExport); return; }
    if (type === "excel") exportToExcel(rowsToExport as unknown as Record<string, unknown>[], columns as ColumnDef<Record<string, unknown>>[], exportFilename);
    else exportToCSV(rowsToExport as unknown as Record<string, unknown>[], columns as ColumnDef<Record<string, unknown>>[], exportFilename);
  }, [selectedRows, processedData, onExport, columns, exportFilename]);

  // Bulk action handler
  const handleBulkAction = React.useCallback((action: BulkAction<T>) => {
    const selectedItems = processedData.filter((row) => selectedRows.has(row.id));
    if (selectedItems.length === 0) { toast.error("No rows selected"); return; }
    if (action.requireConfirm) {
      if (!window.confirm(action.confirmMessage || `Are you sure you want to ${action.label.toLowerCase()} ${selectedItems.length} items?`)) return;
    }
    action.onClick(selectedItems);
    setSelectedRows(new Set());
  }, [processedData, selectedRows]);

  // Inline edit handler
  const handleInlineEdit = React.useCallback(async (row: T, key: string, value: unknown) => {
    if (onInlineEdit) {
      try {
        await onInlineEdit(row, key, value);
        toast.success("Updated successfully");
      } catch (error) {
        toast.error("Failed to update");
      }
    }
    setEditingCell(null);
  }, [onInlineEdit]);

  // Reset filters
  const handleResetFilters = React.useCallback(() => {
    setSearchQuery("");
    setFilterValues({});
    setActiveQuickFilter(null);
    setSortBy(null);
    setSelectedRows(new Set());
    onFilterChange?.({});
    toast.success("Filters reset");
  }, [onFilterChange]);

  // Keyboard navigation
  React.useEffect(() => {
    if (!enableKeyboardNav || !focusedCell) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const { row, col } = focusedCell;
      switch (e.key) {
        case "ArrowUp": if (row > 0) setFocusedCell({ row: row - 1, col }); break;
        case "ArrowDown": if (row < processedData.length - 1) setFocusedCell({ row: row + 1, col }); break;
        case "ArrowLeft": if (col > 0) setFocusedCell({ row, col: col - 1 }); break;
        case "ArrowRight": if (col < displayedColumns.length - 1) setFocusedCell({ row, col: col + 1 }); break;
        case "Enter": {
          const currentRow = processedData[row];
          const currentCol = displayedColumns[col];
          if (currentCol?.editable && onInlineEdit) setEditingCell({ rowId: currentRow.id, columnKey: currentCol.key });
          break;
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enableKeyboardNav, focusedCell, processedData]);

  // Get cell value
  const getCellValue = (row: T, column: ColumnDef<T>) => {
    const value = typeof column.accessor === "function" ? column.accessor(row) : (row as Record<string, unknown>)[column.accessor as string];
    return column.render ? column.render(value, row) : value as React.ReactNode;
  };

  const displayedColumns = columns.filter((col) => visibleColumns.has(col.key));
  const pinnedLeftCols = displayedColumns.filter((col) => pinnedColumns.has(col.key));
  const unpinnedCols = displayedColumns.filter((col) => !pinnedColumns.has(col.key));

  // Loading skeleton
  if (loading) {
    return (
      <Card className={cn("rounded-3xl border border-border/60 main-gradient-primary-bg", className)}>
        <CardHeader>
          <Skeleton className="h-6 w-32 mb-2" /><Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl border border-border/40 overflow-hidden">
            <Table><TableHeader><TableRow>
              {selectable && <TableHead className="w-12"><Skeleton className="h-4 w-4" /></TableHead>}
              {columns.slice(0, 5).map((_, i) => <TableHead key={i}><Skeleton className="h-4 w-20" /></TableHead>)}
            </TableRow></TableHeader>
            <TableBody><TableLoadingSkeleton columns={selectable ? 6 : 5} rows={5} /></TableBody></Table>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("rounded-3xl border border-border/60 main-gradient-primary-bg", className)}>
      <CardHeader>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              {title && <CardTitle className="text-lg font-semibold">{title}</CardTitle>}
              <CardDescription>
                {description ?? `${processedData.length} of ${total} record${total !== 1 ? "s" : ""}`}
                {activeFiltersCount > 0 && <span className="text-primary"> (filtered)</span>}
                {selectedRows.size > 0 && <span className="ml-2 text-primary font-medium">• {selectedRows.size} selected</span>}
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Add Button */}
              {onAdd && (
                <Button variant="default" size="sm" className="rounded-full" onClick={onAdd}>
                  <Plus className="mr-2 h-4 w-4" />{addButtonLabel || "Add"}
                </Button>
              )}

              {/* Bulk Actions */}
              {selectedRows.size > 0 && bulkActions.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="default" size="sm" className="rounded-full">
                      Bulk Actions ({selectedRows.size})<ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {bulkActions.map((action, i) => (
                      <DropdownMenuItem key={i} onClick={() => handleBulkAction(action)}
                        className={action.variant === "destructive" ? "text-red-600" : ""}>
                        {action.icon && <action.icon className="mr-2 h-4 w-4" />}{action.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Filter Popover */}
              {(filters.length > 0 || advancedFilters) && (
                <Popover open={filterPopoverOpen} onOpenChange={setFilterPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="rounded-full bg-gradient-to-br from-primary/80 via-primary/40 to-primary/60 relative">
                      <Filter className="mr-2 h-4 w-4" />Filters
                      {activeFiltersCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                          {activeFiltersCount}
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[500px] rounded-3xl border border-border/60 main-gradient-primary-bg p-6" align="end">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-semibold flex items-center gap-2"><Filter className="h-4 w-4" />Filters</h3>
                          <p className="text-xs text-muted-foreground">Filter data by criteria</p>
                        </div>
                        {advancedFilters && onAdvancedFiltersOpen && (
                          <Button variant="ghost" size="sm" className="rounded-full" onClick={() => { setFilterPopoverOpen(false); onAdvancedFiltersOpen(); }}>
                            <SlidersHorizontal className="mr-2 h-4 w-4" />Advanced
                          </Button>
                        )}
                      </div>
                      {/* Date Range Presets */}
                      {dateRangePresets.length > 0 && (
                        <div>
                          <Label className="text-xs text-muted-foreground mb-2 block">Quick Date Range</Label>
                          <div className="flex flex-wrap gap-1">
                            {dateRangePresets.slice(0, 5).map((preset) => (
                              <Button key={preset.label} variant="outline" size="sm" className="h-7 text-xs rounded-full"
                                onClick={() => {
                                  const range = preset.getValue();
                                  setFilterValues((prev) => ({
                                    ...prev,
                                    dateFrom: format(range.from, "yyyy-MM-dd"),
                                    dateTo: format(range.to, "yyyy-MM-dd"),
                                  }));
                                }}>
                                <Calendar className="mr-1 h-3 w-3" />{preset.label}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {/* Search */}
                        <div>
                          <Label className="text-xs text-muted-foreground mb-2 block">Search</Label>
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 rounded-full" />
                            {searchQuery && (
                              <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6" onClick={() => setSearchQuery("")}>
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                        {/* Dynamic Filters */}
                        {filters.map((filter) => (
                          <div key={filter.key}>
                            <Label className="text-xs text-muted-foreground mb-2 block">{filter.label}</Label>
                            {filter.type === "select" && filter.options && (
                              <Select value={filterValues[filter.key] ?? "all"} onValueChange={(value) => {
                                const newFilters = { ...filterValues, [filter.key]: value };
                                setFilterValues(newFilters);
                                onFilterChange?.(newFilters);
                              }}>
                                <SelectTrigger className="rounded-full"><SelectValue placeholder={filter.placeholder ?? `All`} /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">All {filter.label}</SelectItem>
                                  {filter.options.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            )}
                            {filter.type === "date" && (
                              <Input type="date" value={filterValues[filter.key] ?? ""} onChange={(e) => {
                                const newFilters = { ...filterValues, [filter.key]: e.target.value };
                                setFilterValues(newFilters);
                                onFilterChange?.(newFilters);
                              }} className="rounded-full" />
                            )}
                          </div>
                        ))}
                      </div>
                      {activeFiltersCount > 0 && (
                        <div className="flex items-center justify-between pt-2 border-t">
                          <p className="text-xs text-muted-foreground">{activeFiltersCount} filter(s) applied</p>
                          <Button variant="ghost" size="sm" onClick={handleResetFilters} className="text-xs h-7">
                            <X className="mr-1 h-3 w-3" />Clear all
                          </Button>
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              )}

              {/* Column Visibility */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-full"><Columns className="h-4 w-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {columns.map((column) => (
                    <DropdownMenuCheckboxItem key={column.key} checked={visibleColumns.has(column.key)}
                      onCheckedChange={(checked) => {
                        setVisibleColumns((prev) => {
                          const next = new Set(prev);
                          checked ? next.add(column.key) : (next.size > 1 && next.delete(column.key));
                          return next;
                        });
                      }}>
                      {column.header}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Refresh */}
              {onRefresh && (
                <Tooltip><TooltipTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-full" onClick={() => { onRefresh(); toast.success("Refreshed"); }}>
                    <RefreshCcw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger><TooltipContent>Refresh</TooltipContent></Tooltip>
              )}

              {/* Export */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-full">
                    <Download className="h-4 w-4" />
                    {selectedRows.size > 0 && <span className="ml-1 text-xs">({selectedRows.size})</span>}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Export</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleExport("csv")}><Download className="mr-2 h-4 w-4" />CSV</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport("excel")}><FileSpreadsheet className="mr-2 h-4 w-4" />Excel</DropdownMenuItem>
                  {enablePrint && <DropdownMenuItem onClick={() => printTable(processedData as unknown as Record<string, unknown>[], columns as ColumnDef<Record<string, unknown>>[], title ?? "Export")}>
                    <Printer className="mr-2 h-4 w-4" />Print
                  </DropdownMenuItem>}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Reset */}
              <Tooltip><TooltipTrigger asChild>
                <Button variant="default" size="sm" className="rounded-full" onClick={handleResetFilters}
                  disabled={activeFiltersCount === 0 && selectedRows.size === 0}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger><TooltipContent>Reset all</TooltipContent></Tooltip>
            </div>
          </div>

          {/* Quick Filters */}
          {quickFilters.length > 0 && (
            <QuickFilterChips filters={quickFilters} activeFilter={activeQuickFilter} onSelect={setActiveQuickFilter} />
          )}
        </div>
      </CardHeader>

      <CardContent>
        <ScrollArea className="w-full">
          <div className={cn("rounded-2xl border border-border/40 overflow-hidden", stickyHeader && "max-h-[600px] overflow-auto")}>
            <Table ref={tableRef} className={cn(stickyHeader && "relative")}>
              <TableHeader className={cn(stickyHeader && "sticky top-0 bg-background z-10")}>
                <TableRow className="border-border/40 hover:bg-muted/50">
                  {selectable && (
                    <TableHead className={cn("w-12", stickyFirstColumn && "sticky left-0 bg-background z-20")}>
                      <Checkbox checked={selectedRows.size === processedData.length && processedData.length > 0}
                        onCheckedChange={handleSelectAll} aria-label="Select all" />
                    </TableHead>
                  )}
                  {displayedColumns.map((column, colIndex) => {
                    const isSortable = column.sortable !== false; // Enable sorting by default
                    return (
                    <TableHead key={column.key} className={cn("font-semibold", isSortable && "cursor-pointer select-none hover:bg-muted/30 transition-colors",
                      pinnedColumns.has(column.key) && "sticky bg-background z-10")}
                      style={{ width: column.width, minWidth: column.minWidth, left: pinnedColumns.has(column.key) ? `${colIndex * 100}px` : undefined }}
                      onClick={() => isSortable && handleSort(column.key)}>
                      <div className="flex items-center gap-2">
                        {column.header}
                        {isSortable && (
                          <span className="text-muted-foreground">
                            {sortBy === column.key ? (sortOrder === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />) : <ArrowUpDown className="h-4 w-4 opacity-40" />}
                          </span>
                        )}
                      </div>
                    </TableHead>
                  );})}
                  {actions && actions.length > 0 && <TableHead className="font-semibold w-[50px]" />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {processedData.length === 0 ? (
                  <TableEmptyState title={emptyStateTitle} description={emptyStateDescription}
                    animationUrl={emptyStateAnimation} action={emptyStateAction}
                    hasFilters={activeFiltersCount > 0} onClearFilters={handleResetFilters} />
                ) : (
                  processedData.map((row, rowIndex) => (
                    <TableRow key={row.id} className={cn("border-border/40 hover:bg-muted/50", selectedRows.has(row.id) && "bg-primary/5",
                      onRowClick && "cursor-pointer")}
                      onClick={() => onRowClick?.(row)}>
                      {selectable && (
                        <TableCell className={cn(stickyFirstColumn && "sticky left-0 bg-background")}
                          onClick={(e) => e.stopPropagation()}>
                          <Checkbox checked={selectedRows.has(row.id)} onCheckedChange={() => handleSelectRow(row.id)} />
                        </TableCell>
                      )}
                      {displayedColumns.map((column, colIndex) => {
                        const isEditing = editingCell?.rowId === row.id && editingCell?.columnKey === column.key;
                        const isFocused = focusedCell?.row === rowIndex && focusedCell?.col === colIndex;
                        const value = typeof column.accessor === "function" ? column.accessor(row) : (row as Record<string, unknown>)[column.accessor as string];
                        const cellClass = typeof column.cellClassName === "function" ? column.cellClassName(value, row) : column.cellClassName;
                        const isFirstColumn = colIndex === 0;
                        const cellContent = isEditing ? (
                          <InlineEditCell value={value} row={row} column={column}
                            onSave={(newValue) => handleInlineEdit(row, column.key, newValue)}
                            onCancel={() => setEditingCell(null)} />
                        ) : (
                          <div className="flex items-center gap-1 group">
                            {getCellValue(row, column)}
                            {enableCopyCell && (
                              <Button variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover:opacity-100"
                                onClick={(e) => { e.stopPropagation(); copyToClipboard(String(value ?? "")); }}>
                                <Copy className="h-3 w-3" />
                              </Button>
                            )}
                            {column.editable && onInlineEdit && (
                              <Button variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover:opacity-100"
                                onClick={(e) => { e.stopPropagation(); setEditingCell({ rowId: row.id, columnKey: column.key }); }}>
                                <Pencil className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        );
                        
                        return (
                          <TableCell key={column.key} className={cn(cellClass, isFocused && "ring-2 ring-primary",
                            pinnedColumns.has(column.key) && "sticky bg-background")}
                            style={{ left: pinnedColumns.has(column.key) ? `${colIndex * 100}px` : undefined }}
                            onClick={(e) => { if (enableKeyboardNav) { e.stopPropagation(); setFocusedCell({ row: rowIndex, col: colIndex }); } }}
                            onDoubleClick={(e) => { if (column.editable && onInlineEdit) { e.stopPropagation(); setEditingCell({ rowId: row.id, columnKey: column.key }); } }}>
                            {/* Show HoverCard on first column if rowHoverCard is provided */}
                            {isFirstColumn && rowHoverCard ? (
                              <HoverCard openDelay={300} closeDelay={100}>
                                <HoverCardTrigger asChild>
                                  <div className="cursor-help">{cellContent}</div>
                                </HoverCardTrigger>
                                <HoverCardContent side="right" align="start" className="w-80 p-4">
                                  {rowHoverCard(row)}
                                </HoverCardContent>
                              </HoverCard>
                            ) : cellContent}
                          </TableCell>
                        );
                      })}
                      {actions && actions.length > 0 && (
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreVertical className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {actions.filter((a) => !a.hidden?.(row)).map((action, index) => {
                                const isDisabled = typeof action.disabled === "function" ? action.disabled(row) : action.disabled;
                                return (
                                <React.Fragment key={index}>
                                  {action.separator && <DropdownMenuSeparator />}
                                  <DropdownMenuItem onClick={() => !isDisabled && action.onClick(row)}
                                    disabled={isDisabled}
                                    className={cn(action.variant === "destructive" && "text-red-600 focus:text-red-600", isDisabled && "opacity-50 cursor-not-allowed")}>
                                    {action.icon && <action.icon className="mr-2 h-4 w-4" />}{action.label}
                                  </DropdownMenuItem>
                                </React.Fragment>
                              );})}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
              {showFooterAggregates && Object.keys(aggregates).length > 0 && (
                <TableFooter>
                  <TableRow className="bg-muted/50">
                    {selectable && <TableCell />}
                    {displayedColumns.map((column) => (
                      <TableCell key={column.key} className="font-semibold">
                        {aggregates[column.key] !== undefined ? (
                          <span>{column.aggregate}: {typeof aggregates[column.key] === "number" ? aggregates[column.key].toLocaleString(undefined, { maximumFractionDigits: 2 }) : aggregates[column.key]}</span>
                        ) : null}
                      </TableCell>
                    ))}
                    {actions && actions.length > 0 && <TableCell />}
                  </TableRow>
                </TableFooter>
              )}
            </Table>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* Pagination */}
        {(totalPages > 1 || onItemsPerPageChange) && onPageChange && (
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Rows per page:</span>
             <div className="w-[70px]">
               <Select  value={String(itemsPerPage)} onValueChange={(value) => onItemsPerPageChange?.(Number(value))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
             </div>
            <PaginationControls currentPage={currentPage} totalPages={totalPages}
              startIndex={startIndex} endIndex={endIndex} totalItems={total} onPageChange={onPageChange} />
          </div>
        )}
      </CardContent>

      {advancedFilters}
    </Card>
  );
}

export default ReusableDataTable;
