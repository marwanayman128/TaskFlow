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
import { Textarea } from "@/components/ui/textarea";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

// Board view options
const BOARD_VIEWS = [
  { name: "Kanban", value: "KANBAN", icon: "solar:clipboard-list-outline", description: "Column-based workflow" },
  { name: "List", value: "LIST", icon: "solar:list-outline", description: "Simple list view" },
  { name: "Calendar", value: "CALENDAR", icon: "solar:calendar-outline", description: "Timeline view" },
  { name: "Table", value: "TABLE", icon: "solar:widget-outline", description: "Spreadsheet style" },
];

// Color options for boards
const BOARD_COLORS = [
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

interface CreateBoardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { 
    name: string; 
    description?: string;
    color: string;
    defaultView: string;
  }) => Promise<void>;
}

export function CreateBoardModal({ open, onOpenChange, onSubmit }: CreateBoardModalProps) {
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [selectedView, setSelectedView] = React.useState(BOARD_VIEWS[0].value);
  const [selectedColor, setSelectedColor] = React.useState(BOARD_COLORS[0].value);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
        color: selectedColor,
        defaultView: selectedView,
      });
      // Reset form
      setName("");
      setDescription("");
      setSelectedView(BOARD_VIEWS[0].value);
      setSelectedColor(BOARD_COLORS[0].value);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create board:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div
                className="flex size-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${selectedColor}20` }}
              >
                <Icon
                  icon="solar:clipboard-list-outline"
                  className="size-5"
                  style={{ color: selectedColor }}
                />
              </div>
              <span>Create New Board</span>
            </DialogTitle>
            <DialogDescription>
              Create a board to manage projects with your team.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Board Name */}
            <div className="grid gap-2">
              <Label htmlFor="boardName">Board Name</Label>
              <Input
                id="boardName"
                placeholder="e.g., Marketing Campaign, Product Launch..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Describe the purpose of this board..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>

            {/* Default View Selection */}
            <div className="grid gap-2">
              <Label>Default View</Label>
              <div className="grid grid-cols-2 gap-2">
                {BOARD_VIEWS.map((view) => (
                  <button
                    key={view.value}
                    type="button"
                    onClick={() => setSelectedView(view.value)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left",
                      selectedView === view.value
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:border-muted-foreground/30"
                    )}
                  >
                    <Icon icon={view.icon} className="size-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium text-sm">{view.name}</div>
                      <div className="text-xs text-muted-foreground">{view.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div className="grid gap-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {BOARD_COLORS.map((color) => (
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
              Create Board
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
