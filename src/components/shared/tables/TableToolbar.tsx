"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Column } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  SlidersHorizontal,
  Settings2,
  X,
  CalendarIcon,
  Plus,
} from "lucide-react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";

export type FilterType = "select" | "multiselect" | "date" | "daterange" | "text";

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterConfig {
  id: string;
  label: string;
  type: FilterType;
  options?: FilterOption[];
  placeholder?: string;
}

interface TableToolbarProps {
  searchValue?: string;
  onSearch?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: FilterConfig[];
  activeFilters?: Record<string, unknown>;
  onFilter?: (filters: Record<string, unknown>) => void;
  columns?: Column<unknown>[];
  onColumnVisibilityChange?: (columnId: string, visible: boolean) => void;
  actions?: React.ReactNode;
  className?: string;
}

export function TableToolbar({
  searchValue = "",
  onSearch,
  searchPlaceholder = "Search...",
  filters = [],
  activeFilters = {},
  onFilter,
  columns = [],
  onColumnVisibilityChange,
  actions,
  className,
}: TableToolbarProps) {
  const [localFilters, setLocalFilters] = React.useState<Record<string, unknown>>(activeFilters);
  const [isFiltersOpen, setIsFiltersOpen] = React.useState(false);

  const activeFilterCount = Object.values(localFilters).filter(
    (v) => v !== undefined && v !== null && v !== ""
  ).length;

  const handleFilterChange = (id: string, value: unknown) => {
    const newFilters = { ...localFilters, [id]: value };
    setLocalFilters(newFilters);
  };

  const handleApplyFilters = () => {
    onFilter?.(localFilters);
    setIsFiltersOpen(false);
  };

  const handleClearFilters = () => {
    setLocalFilters({});
    onFilter?.({});
    setIsFiltersOpen(false);
  };

  const handleRemoveFilter = (id: string) => {
    const newFilters = { ...localFilters };
    delete newFilters[id];
    setLocalFilters(newFilters);
    onFilter?.(newFilters);
  };

  const renderFilterInput = (filter: FilterConfig) => {
    const value = localFilters[filter.id];

    switch (filter.type) {
      case "select":
        return (
          <Select
            value={value as string}
            onValueChange={(v) => handleFilterChange(filter.id, v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={filter.placeholder || `Select ${filter.label}`} />
            </SelectTrigger>
            <SelectContent>
              {filter.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "date":
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !value && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? format(value as Date, "PPP") : filter.placeholder || "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={value as Date}
                onSelect={(date) => handleFilterChange(filter.id, date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );

      case "daterange":
        const dateRange = value as DateRange | undefined;
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dateRange?.from && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd")} -{" "}
                      {format(dateRange.to, "LLL dd")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  filter.placeholder || "Select date range"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={(range) => handleFilterChange(filter.id, range)}
                numberOfMonths={2}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );

      default:
        return (
          <Input
            placeholder={filter.placeholder || `Enter ${filter.label}`}
            value={(value as string) || ""}
            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
          />
        );
    }
  };

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        {onSearch && (
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Filters */}
          {filters.length > 0 && (
            <Popover open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="relative">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-2 rounded-full px-1.5 py-0.5 text-xs"
                    >
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Filters</h4>
                    {activeFilterCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearFilters}
                        className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                      >
                        Clear all
                      </Button>
                    )}
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    {filters.map((filter) => (
                      <div key={filter.id} className="space-y-2">
                        <label className="text-sm font-medium">{filter.label}</label>
                        {renderFilterInput(filter)}
                      </div>
                    ))}
                  </div>
                  <Separator />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsFiltersOpen(false)}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleApplyFilters}>
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}

          {/* Column Visibility */}
          {columns.length > 0 && onColumnVisibilityChange && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings2 className="mr-2 h-4 w-4" />
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {columns
                  .filter((col) => col.getCanHide())
                  .map((col) => (
                    <DropdownMenuCheckboxItem
                      key={col.id}
                      className="capitalize"
                      checked={col.getIsVisible()}
                      onCheckedChange={(value) => onColumnVisibilityChange(col.id, value)}
                    >
                      {col.id.replace(/_/g, " ")}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Custom Actions */}
          {actions}
        </div>
      </div>

      {/* Active Filter Badges */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(localFilters).map(([id, value]) => {
            if (!value) return null;
            const filter = filters.find((f) => f.id === id);
            if (!filter) return null;

            let displayValue = String(value);
            if (filter.type === "select" && filter.options) {
              displayValue = filter.options.find((o) => o.value === value)?.label || displayValue;
            } else if (filter.type === "date" && value instanceof Date) {
              displayValue = format(value, "PPP");
            }

            return (
              <Badge key={id} variant="secondary" className="gap-1">
                {filter.label}: {displayValue}
                <button
                  className="ml-1 rounded-full hover:bg-muted-foreground/20"
                  onClick={() => handleRemoveFilter(id)}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
