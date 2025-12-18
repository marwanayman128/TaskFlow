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
import { Tag } from '@/hooks/use-tasks';

const TAG_COLORS = [
  "#6366f1", "#ef4444", "#f97316", "#eab308", 
  "#22c55e", "#14b8a6", "#3b82f6", "#a855f7",
  "#ec4899", "#78716c"
];

interface EditTagModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tag?: Tag;
  onSubmit: (id: string, data: { name: string; color: string }) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export function EditTagModal({ open, onOpenChange, tag, onSubmit, onDelete }: EditTagModalProps) {
  const [name, setName] = React.useState('');
  const [selectedColor, setSelectedColor] = React.useState(TAG_COLORS[0]);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (tag) {
      setName(tag.name);
      setSelectedColor(tag.color);
    }
  }, [tag]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !tag) return;

    setIsLoading(true);
    try {
      await onSubmit(tag.id, {
        name: name.trim(),
        color: selectedColor,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update tag:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
     if (!tag || !onDelete) return;
     if (confirm('Are you sure you want to delete this tag?')) {
         setIsLoading(true);
         try {
             await onDelete(tag.id);
             onOpenChange(false);
         } catch (error) {
             console.error('Failed to delete tag:', error);
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
              <Icon icon="solar:hashtag-square-linear" className="size-5" style={{ color: selectedColor }} />
              <span>Edit Tag</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-6 py-6">
            <div className="space-y-2">
              <Label htmlFor="tagName">Tag Name</Label>
              <Input
                id="tagName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter tag name..."
              />
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {TAG_COLORS.map((color) => (
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
