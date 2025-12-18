"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { CustomSheetHeader } from "@/components/layout/custom-sheet-header";
import { RotateCcw, Check, LucideIcon, SlidersHorizontal } from "lucide-react";

// =============================================
// TYPES
// =============================================

export interface AdvancedFilterField {
  key: string;
  label: string;
  type: "text" | "select" | "date" | "checkbox" | "number" | "dateRange";
  options?: { value: string; label: string }[];
  placeholder?: string;
  defaultValue?: string | boolean;
  section?: string;
}

export interface AdvancedFilterSection {
  title: string;
  icon?: LucideIcon;
  fields: AdvancedFilterField[];
}

export interface AdvancedFilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  icon?: LucideIcon;
  sections: AdvancedFilterSection[];
  values: Record<string, string | boolean>;
  onChange: (values: Record<string, string | boolean>) => void;
  onApply?: () => void;
  onReset?: () => void;
}

// =============================================
// ADVANCED FILTER SHEET COMPONENT
// =============================================

export function AdvancedFilterSheet({
  open,
  onOpenChange,
  title = "Advanced Filters",
  description = "Apply advanced filtering options to narrow down results.",
  icon: Icon = SlidersHorizontal,
  sections,
  values,
  onChange,
  onApply,
  onReset,
}: AdvancedFilterSheetProps) {
  
  const handleFieldChange = (key: string, value: string | boolean) => {
    onChange({ ...values, [key]: value });
  };

  const handleReset = () => {
    // Reset all values to defaults
    const resetValues: Record<string, string | boolean> = {};
    sections.forEach((section) => {
      section.fields.forEach((field) => {
        if (field.defaultValue !== undefined) {
          resetValues[field.key] = field.defaultValue;
        } else if (field.type === "checkbox") {
          resetValues[field.key] = false;
        } else {
          resetValues[field.key] = "";
        }
      });
    });
    onChange(resetValues);
    onReset?.();
  };

  const handleApply = () => {
    onApply?.();
    onOpenChange(false);
  };

  const renderField = (field: AdvancedFilterField) => {
    const value = values[field.key];

    switch (field.type) {
      case "text":
        return (
          <div key={field.key} className="space-y-2">
            <Label className="text-xs text-muted-foreground">{field.label}</Label>
            <Input
              type="text"
              placeholder={field.placeholder}
              value={(value as string) ?? ""}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
              className="rounded-full"
            />
          </div>
        );

      case "number":
        return (
          <div key={field.key} className="space-y-2">
            <Label className="text-xs text-muted-foreground">{field.label}</Label>
            <Input
              type="number"
              placeholder={field.placeholder}
              value={(value as string) ?? ""}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
              className="rounded-full"
            />
          </div>
        );

      case "date":
        return (
          <div key={field.key} className="space-y-2">
            <Label className="text-xs text-muted-foreground">{field.label}</Label>
            <Input
              type="date"
              value={(value as string) ?? ""}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
              className="rounded-full"
            />
          </div>
        );

      case "select":
        return (
          <div key={field.key} className="space-y-2">
            <Label className="text-xs text-muted-foreground">{field.label}</Label>
            <Select
              value={(value as string) ?? "all"}
              onValueChange={(v) => handleFieldChange(field.key, v)}
            >
              <SelectTrigger className="rounded-full">
                <SelectValue placeholder={field.placeholder ?? `Select ${field.label}`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {field.options?.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case "checkbox":
        return (
          <div key={field.key} className="flex items-center space-x-3">
            <Checkbox
              id={field.key}
              checked={(value as boolean) ?? false}
              onCheckedChange={(checked) => handleFieldChange(field.key, checked as boolean)}
              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <Label
              htmlFor={field.key}
              className="text-sm text-muted-foreground cursor-pointer"
            >
              {field.label}
            </Label>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="gap-0 overflow-y-auto overflow-visible">
        <CustomSheetHeader
          title={title}
          description={description}
          icon={Icon}
        />

        <ScrollArea className="h-[calc(100vh-150px)] pr-4 px-5 overflow-x-visible">
          <div className="space-y-6 py-6">
            {sections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="rounded-3xl border border-border/60 bg-card/50 p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  {section.icon && <section.icon className="h-4 w-4 text-muted-foreground" />}
                  {section.title}
                </h3>
                <div className="grid gap-4">
                  {section.fields.map((field) => renderField(field))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <SheetFooter className="flex gap-2 pt-4 border-t border-border/60">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="rounded-full"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <SheetClose asChild>
            <Button variant="outline" className="flex-1 rounded-full">
              Cancel
            </Button>
          </SheetClose>
          <Button onClick={handleApply} className="rounded-full">
            <Check className="mr-2 h-4 w-4" />
            Apply Filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export default AdvancedFilterSheet;
