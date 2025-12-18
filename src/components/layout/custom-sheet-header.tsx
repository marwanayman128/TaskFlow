"use client";

import { SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { LucideIcon } from "lucide-react";

interface CustomSheetHeaderProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export function CustomSheetHeader({ title, description, icon: Icon }: CustomSheetHeaderProps) {
  return (
    <SheetHeader className="space-y-4 pb-4 border-b border-border bg-muted/40 rounded-br-2xl rounded-bl-2xl main-gradient-primary-bg">
      <div className="flex items-center gap-4">
        <div className="rounded-3xl bg-primary/10 p-3 shadow-sm">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div className="space-y-1">
          <SheetTitle className="text-lg font-semibold text-foreground">
            {title}
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground leading-relaxed">
            {description}
          </SheetDescription>
        </div>
      </div>
    </SheetHeader>
  );
}
