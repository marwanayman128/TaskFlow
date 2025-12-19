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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import { Board } from '@/hooks/use-tasks';

// Icon options for boards
const BOARD_ICONS = [
  { name: "Kanban", icon: "solar:clipboard-list-outline" },
  { name: "Project", icon: "solar:folder-with-files-outline" },
  { name: "Rocket", icon: "solar:rocket-2-outline" },
  { name: "Target", icon: "solar:target-outline" },
  { name: "Lightning", icon: "solar:bolt-outline" },
  { name: "Chart", icon: "solar:chart-square-outline" },
  { name: "Calendar", icon: "solar:calendar-outline" },
  { name: "Team", icon: "solar:users-group-rounded-outline" },
  { name: "Star", icon: "solar:star-outline" },
  { name: "Flag", icon: "solar:flag-outline" },
  { name: "Briefcase", icon: "solar:suitcase-outline" },
  { name: "Code", icon: "solar:code-square-outline" },
];

const BOARD_COLORS = [
  "#6366f1", "#ef4444", "#f97316", "#eab308", 
  "#22c55e", "#14b8a6", "#3b82f6", "#a855f7",
  "#ec4899"
];

interface EditBoardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  board?: Board;
  onSubmit: (id: string, data: { name: string; description?: string; icon?: string; color: string }) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export function EditBoardModal({ open, onOpenChange, board, onSubmit, onDelete }: EditBoardModalProps) {
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [selectedIcon, setSelectedIcon] = React.useState(BOARD_ICONS[0].icon);
  const [selectedColor, setSelectedColor] = React.useState(BOARD_COLORS[0]);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (board) {
      setName(board.name);
      setDescription(board.description || '');
      setSelectedIcon(board.icon || BOARD_ICONS[0].icon);
      setSelectedColor(board.color || BOARD_COLORS[0]);
    }
  }, [board]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !board) return;

    setIsLoading(true);
    try {
      await onSubmit(board.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        icon: selectedIcon,
        color: selectedColor,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update board:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!board || !onDelete) return;
    if (confirm('Are you sure you want to delete this board? All tasks in it will be lost.')) {
        setIsLoading(true);
        try {
            await onDelete(board.id);
            onOpenChange(false);
        } catch (error) {
            console.error('Failed to delete board:', error);
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
                <Icon icon={selectedIcon} className="size-5" style={{ color: selectedColor }} />
              </div>
              <span>Edit Board</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="boardName">Board Name</Label>
              <Input
                id="boardName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter board name..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description..."
                className="resize-none h-20"
              />
            </div>

            {/* Icon Selection */}
            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="flex flex-wrap gap-2">
                {BOARD_ICONS.map((item) => (
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
                    title={item.name}
                  >
                    <Icon icon={item.icon} className="size-5" />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {BOARD_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={cn(
                      "size-8 rounded-full border-2 transition-all",
                      selectedColor === color
                        ? "border-foreground scale-110"
                        : "border-transparent hover:scale-105"
                    )}
                    style={{ backgroundColor: color }}
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
             <div className="flex gap-2 ml-auto">
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
