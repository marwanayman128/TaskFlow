"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

// Color options for tags
const TAG_COLORS = [
  { name: "Amber", value: "#f59e0b" },
  { name: "Red", value: "#ef4444" },
  { name: "Orange", value: "#f97316" },
  { name: "Yellow", value: "#eab308" },
  { name: "Lime", value: "#84cc16" },
  { name: "Green", value: "#22c55e" },
  { name: "Emerald", value: "#10b981" },
  { name: "Teal", value: "#14b8a6" },
  { name: "Cyan", value: "#06b6d4" },
  { name: "Sky", value: "#0ea5e9" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Indigo", value: "#6366f1" },
  { name: "Violet", value: "#8b5cf6" },
  { name: "Purple", value: "#a855f7" },
  { name: "Fuchsia", value: "#d946ef" },
  { name: "Pink", value: "#ec4899" },
  { name: "Rose", value: "#f43f5e" },
];

interface CreateTagModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name: string; color: string }) => Promise<void>;
}

export function CreateTagModal({ open, onOpenChange, onSubmit }: CreateTagModalProps) {
  const [name, setName] = React.useState("");
  const [selectedColor, setSelectedColor] = React.useState(TAG_COLORS[0].value);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      await onSubmit({
        name: name.trim().replace(/^#/, ""), // Remove # if user added it
        color: selectedColor,
      });
      // Reset form
      setName("");
      setSelectedColor(TAG_COLORS[0].value);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create tag:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[380px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span
                className="text-lg font-bold"
                style={{ color: selectedColor }}
              >
                #{name || "Tag"}
              </span>
            </DialogTitle>
            <DialogDescription>
              Create a new tag to categorize your tasks.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Tag Name */}
            <div className="grid gap-2">
              <Label htmlFor="tagName">Tag Name</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  #
                </span>
                <Input
                  id="tagName"
                  placeholder="Priority, Urgent, Review..."
                  value={name}
                  onChange={(e) => setName(e.target.value.replace(/^#/, ""))}
                  className="pl-7"
                  autoFocus
                />
              </div>
            </div>

            {/* Color Selection */}
            <div className="grid gap-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {TAG_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setSelectedColor(color.value)}
                    className={cn(
                      "size-7 rounded-full border-2 transition-all hover:scale-110",
                      selectedColor === color.value
                        ? "border-foreground ring-2 ring-offset-2 ring-offset-background"
                        : "border-transparent"
                    )}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="grid gap-2">
              <Label>Preview</Label>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                <span
                  className="text-sm font-medium px-2 py-1 rounded-md"
                  style={{
                    backgroundColor: `${selectedColor}20`,
                    color: selectedColor,
                  }}
                >
                  #{name || "Tag"}
                </span>
                <span className="text-sm text-muted-foreground">
                  will appear like this on tasks
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || isLoading}>
              {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
              Create Tag
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
