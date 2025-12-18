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
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

// Icon options for lists
const LIST_ICONS = [
  { name: "User", icon: "solar:user-outline" },
  { name: "Briefcase", icon: "solar:suitcase-outline" },
  { name: "Cart", icon: "solar:cart-3-outline" },
  { name: "Home", icon: "solar:home-2-outline" },
  { name: "Heart", icon: "solar:heart-outline" },
  { name: "Star", icon: "solar:star-outline" },
  { name: "Book", icon: "solar:book-outline" },
  { name: "Music", icon: "solar:music-note-outline" },
  { name: "Camera", icon: "solar:camera-outline" },
  { name: "Gift", icon: "solar:gift-outline" },
  { name: "Plane", icon: "solar:airplane-outline" },
  { name: "Fitness", icon: "solar:dumbbell-outline" },
];

// Color options for lists
const LIST_COLORS = [
  { name: "Default", value: "#6366f1" },
  { name: "Red", value: "#ef4444" },
  { name: "Orange", value: "#f97316" },
  { name: "Yellow", value: "#eab308" },
  { name: "Green", value: "#22c55e" },
  { name: "Teal", value: "#14b8a6" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Purple", value: "#a855f7" },
  { name: "Pink", value: "#ec4899" },
];

interface CreateListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name: string; icon: string; color: string }) => Promise<void>;
}

export function CreateListModal({ open, onOpenChange, onSubmit }: CreateListModalProps) {
  const [name, setName] = React.useState("");
  const [selectedIcon, setSelectedIcon] = React.useState(LIST_ICONS[0].icon);
  const [selectedColor, setSelectedColor] = React.useState(LIST_COLORS[0].value);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      await onSubmit({
        name: name.trim(),
        icon: selectedIcon,
        color: selectedColor,
      });
      // Reset form
      setName("");
      setSelectedIcon(LIST_ICONS[0].icon);
      setSelectedColor(LIST_COLORS[0].value);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create list:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div
                className="flex size-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${selectedColor}20` }}
              >
                <Icon
                  icon={selectedIcon}
                  className="size-5"
                  style={{ color: selectedColor }}
                />
              </div>
              <span>Create New List</span>
            </DialogTitle>
            <DialogDescription>
              Create a new list to organize your tasks.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* List Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">List Name</Label>
              <Input
                id="name"
                placeholder="e.g., Shopping, Fitness, Travel..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>

            {/* Icon Selection */}
            <div className="grid gap-2">
              <Label>Icon</Label>
              <div className="flex flex-wrap gap-2">
                {LIST_ICONS.map((item) => (
                  <button
                    key={item.icon}
                    type="button"
                    onClick={() => setSelectedIcon(item.icon)}
                    className={cn(
                      "flex size-10 items-center justify-center rounded-lg border-2 transition-all",
                      selectedIcon === item.icon
                        ? "border-primary bg-primary/10"
                        : "border-transparent bg-muted hover:bg-muted/80"
                    )}
                  >
                    <Icon icon={item.icon} className="size-5" />
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div className="grid gap-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {LIST_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setSelectedColor(color.value)}
                    className={cn(
                      "size-8 rounded-full border-2 transition-all",
                      selectedColor === color.value
                        ? "border-foreground scale-110"
                        : "border-transparent hover:scale-105"
                    )}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
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
              Create List
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
