'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import { TaskList } from '@/hooks/use-tasks';

// Use same constants as CreateListModal or import them if exported
// For speed, duplicate
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

interface EditListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  list?: TaskList;
  onSubmit: (id: string, data: { name: string; icon: string; color: string }) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export function EditListModal({ open, onOpenChange, list, onSubmit, onDelete }: EditListModalProps) {
  const [name, setName] = React.useState('');
  const [selectedIcon, setSelectedIcon] = React.useState(LIST_ICONS[0].icon);
  const [selectedColor, setSelectedColor] = React.useState(LIST_COLORS[0].value);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (list) {
      setName(list.name);
      setSelectedIcon(list.icon || LIST_ICONS[0].icon);
      setSelectedColor(list.color || LIST_COLORS[0].value);
    }
  }, [list]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !list) return;

    setIsLoading(true);
    try {
      await onSubmit(list.id, {
        name: name.trim(),
        icon: selectedIcon,
        color: selectedColor,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update list:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!list || !onDelete) return;
    if (confirm('Are you sure you want to delete this list? All tasks will be deleted.')) {
        setIsLoading(true);
        try {
            await onDelete(list.id);
            onOpenChange(false);
        } catch (error) {
            console.error('Failed to delete list:', error);
        } finally {
            setIsLoading(false);
        }
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
              <span>Edit List</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-6 py-6">
            <div className="space-y-2">
              <Label htmlFor="name">List Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter list name..."
              />
            </div>

            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="grid grid-cols-6 gap-2">
                {LIST_ICONS.map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setSelectedIcon(item.icon)}
                    className={cn(
                      "flex size-9 items-center justify-center rounded-lg border border-transparent transition-all hover:bg-muted",
                      selectedIcon === item.icon && "border-primary bg-primary/10 text-primary"
                    )}
                  >
                    <Icon icon={item.icon} className="size-5" />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {LIST_COLORS.map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setSelectedColor(item.value)}
                    className={cn(
                      "size-6 rounded-full border-2 border-transparent transition-all hover:scale-110",
                      selectedColor === item.value && "border-foreground ring-2 ring-offset-2"
                    )}
                    style={{ backgroundColor: item.value }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            {onDelete && (
                <Button type="button" variant="destructive" size="sm" onClick={handleDelete} disabled={isLoading}>
                    Delete
                </Button>
            )}
            <div className="flex gap-2">
                 <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isLoading}>
                    Cancel
                </Button>
                <Button type="submit" disabled={!name.trim() || isLoading}>
                    {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
