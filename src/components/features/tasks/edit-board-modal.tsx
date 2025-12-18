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

const BOARD_COLORS = [
  "#6366f1", "#ef4444", "#f97316", "#eab308", 
  "#22c55e", "#14b8a6", "#3b82f6", "#a855f7",
  "#ec4899"
];

interface EditBoardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  board?: Board;
  onSubmit: (id: string, data: { name: string; description?: string; color: string }) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export function EditBoardModal({ open, onOpenChange, board, onSubmit, onDelete }: EditBoardModalProps) {
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [selectedColor, setSelectedColor] = React.useState(BOARD_COLORS[0]);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (board) {
      setName(board.name);
      setDescription(board.description || '');
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
              <Icon icon="solar:kanban-board-outline" className="size-5" style={{ color: selectedColor }} />
              <span>Edit Board</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-6 py-6">
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

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {BOARD_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={cn(
                      "size-6 rounded-full border-2 border-transparent transition-all hover:scale-110",
                      selectedColor === color && "border-foreground ring-2 ring-offset-2"
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
