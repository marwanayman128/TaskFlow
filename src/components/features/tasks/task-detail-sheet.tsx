"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";
import { format } from "date-fns";
import { 
  Calendar as CalendarIcon, 
  Clock,
  Flag,
  Tag,
  List,
  Plus,
  Trash2,
  X,
  GripVertical,
  Loader2,
  Save,
} from "lucide-react";
import { Task, useLists, useTags, useUpdateTask, useDeleteTask } from "@/hooks/use-tasks";
import { AnimatePresence, motion, Reorder } from "framer-motion";

// Priority options
const PRIORITY_OPTIONS = [
  { value: 'NONE', label: 'No Priority', color: 'text-muted-foreground', bg: 'bg-muted' },
  { value: 'LOW', label: 'Low', color: 'text-blue-500', bg: 'bg-blue-500' },
  { value: 'MEDIUM', label: 'Medium', color: 'text-amber-500', bg: 'bg-amber-500' },
  { value: 'HIGH', label: 'High', color: 'text-red-500', bg: 'bg-red-500' },
];

// Subtask item component
function SubtaskItem({
  subtask,
  onToggle,
  onDelete,
  onUpdate,
}: {
  subtask: { id: string; title: string; completed: boolean };
  onToggle: () => void;
  onDelete: () => void;
  onUpdate: (title: string) => void;
}) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [title, setTitle] = React.useState(subtask.title);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="flex items-center gap-2 py-1.5 group"
    >
      <GripVertical className="size-3 text-muted-foreground/30 opacity-0 group-hover:opacity-100 cursor-grab" />
      <Checkbox
        checked={subtask.completed}
        onCheckedChange={onToggle}
        className="size-4"
      />
      {isEditing ? (
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => {
            setIsEditing(false);
            if (title.trim() && title !== subtask.title) {
              onUpdate(title);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setIsEditing(false);
              if (title.trim()) onUpdate(title);
            }
          }}
          className="h-6 text-sm flex-1 border-0 p-0 focus-visible:ring-0"
          autoFocus
        />
      ) : (
        <span
          className={cn(
            "flex-1 text-sm cursor-text",
            subtask.completed && "line-through text-muted-foreground"
          )}
          onClick={() => !subtask.completed && setIsEditing(true)}
        >
          {subtask.title}
        </span>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="size-6 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
        onClick={onDelete}
      >
        <X className="size-3" />
      </Button>
    </motion.div>
  );
}

interface TaskDetailSheetProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
}

export function TaskDetailSheet({
  task,
  open,
  onOpenChange,
  onUpdate,
  onDelete,
}: TaskDetailSheetProps) {
  const { lists } = useLists();
  const { tags } = useTags();
  
  // Local state for editing
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [priority, setPriority] = React.useState<string>('NONE');
  const [dueDate, setDueDate] = React.useState<Date | undefined>();
  const [selectedListId, setSelectedListId] = React.useState<string>('');
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const [subtasks, setSubtasks] = React.useState<{ id: string; title: string; completed: boolean }[]>([]);
  const [newSubtask, setNewSubtask] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);
  const [hasChanges, setHasChanges] = React.useState(false);

  // Initialize state when task changes
  React.useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority);
      setDueDate(task.dueDate ? new Date(task.dueDate) : undefined);
      setSelectedListId(task.listId || '');
      setSelectedTags(task.tags?.map(t => t.id) || []);
      setSubtasks(task.subtasks || []);
      setHasChanges(false);
    }
  }, [task]);

  const handleSave = async () => {
    if (!task) return;
    
    setIsSaving(true);
    try {
      const updatedTask: Partial<Task> = {
        title,
        description: description || undefined,
        priority: priority as Task['priority'],
        dueDate: dueDate?.toISOString(),
        listId: selectedListId || undefined,
        // Note: tags and subtasks would need proper API handling
      };
      
      const res = await fetch(`/api/v1/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask),
      });
      
      if (res.ok) {
        const updated = await res.json();
        onUpdate?.(updated);
        setHasChanges(false);
      }
    } catch (error) {
      console.error('Failed to save task:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    
    try {
      const res = await fetch(`/api/v1/tasks/${task.id}`, { method: 'DELETE' });
      if (res.ok) {
        onDelete?.(task.id);
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    
    setSubtasks(prev => [
      ...prev,
      { id: Date.now().toString(), title: newSubtask, completed: false }
    ]);
    setNewSubtask('');
    setHasChanges(true);
  };

  const handleToggleSubtask = (id: string) => {
    setSubtasks(prev =>
      prev.map(st => st.id === id ? { ...st, completed: !st.completed } : st)
    );
    setHasChanges(true);
  };

  const handleDeleteSubtask = (id: string) => {
    setSubtasks(prev => prev.filter(st => st.id !== id));
    setHasChanges(true);
  };

  const handleToggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
    setHasChanges(true);
  };

  const completedSubtasks = subtasks.filter(s => s.completed).length;

  if (!task) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="space-y-0 pb-4 border-b">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <Input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setHasChanges(true);
                }}
                className="text-lg font-semibold border-0 p-0 h-auto focus-visible:ring-0"
                placeholder="Task title"
              />
              <SheetDescription className="mt-1">
                {task.completed ? 'Completed' : 'In progress'} • Created {format(new Date(task.createdAt), 'MMM d, yyyy')}
              </SheetDescription>
            </div>
            {hasChanges && (
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className="gap-1"
              >
                {isSaving ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <Save className="size-3" />
                )}
                Save
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {/* Description */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setHasChanges(true);
              }}
              placeholder="Add a description..."
              className="min-h-[100px] resize-none"
            />
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase">Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 size-4" />
                  {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={(date) => {
                    setDueDate(date);
                    setHasChanges(true);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase">Priority</Label>
            <Select
              value={priority}
              onValueChange={(value) => {
                setPriority(value);
                setHasChanges(true);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <Flag className={cn("size-3", option.color)} />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* List */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase">List</Label>
            <Select
              value={selectedListId}
              onValueChange={(value) => {
                setSelectedListId(value);
                setHasChanges(true);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a list" />
              </SelectTrigger>
              <SelectContent>
                {lists.map((list) => (
                  <SelectItem key={list.id} value={list.id}>
                    <div className="flex items-center gap-2">
                      <Icon
                        icon={list.icon || 'solar:folder-outline'}
                        className="size-4"
                        style={{ color: list.color }}
                      />
                      {list.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase">Tags</Label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="outline"
                  className={cn(
                    "cursor-pointer transition-all",
                    selectedTags.includes(tag.id) && "ring-2 ring-offset-2"
                  )}
                  style={{
                    borderColor: tag.color,
                    color: tag.color,
                    backgroundColor: selectedTags.includes(tag.id) ? `${tag.color}20` : 'transparent',
                  }}
                  onClick={() => handleToggleTag(tag.id)}
                >
                  #{tag.name}
                </Badge>
              ))}
              {tags.length === 0 && (
                <span className="text-sm text-muted-foreground">No tags available</span>
              )}
            </div>
          </div>

          {/* Subtasks */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground uppercase">
                Subtasks {subtasks.length > 0 && `(${completedSubtasks}/${subtasks.length})`}
              </Label>
            </div>
            
            {/* Progress bar */}
            {subtasks.length > 0 && (
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${(completedSubtasks / subtasks.length) * 100}%` }}
                />
              </div>
            )}

            {/* Subtask list */}
            <div className="space-y-1">
              <AnimatePresence mode="popLayout">
                {subtasks.map((subtask) => (
                  <SubtaskItem
                    key={subtask.id}
                    subtask={subtask}
                    onToggle={() => handleToggleSubtask(subtask.id)}
                    onDelete={() => handleDeleteSubtask(subtask.id)}
                    onUpdate={(title) => {
                      setSubtasks(prev =>
                        prev.map(st => st.id === subtask.id ? { ...st, title } : st)
                      );
                      setHasChanges(true);
                    }}
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* Add subtask */}
            <div className="flex items-center gap-2 mt-2">
              <Input
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
                placeholder="Add a subtask..."
                className="h-8 text-sm"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={handleAddSubtask}
                disabled={!newSubtask.trim()}
              >
                <Plus className="size-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t pt-4 flex justify-between">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            className="gap-1"
          >
            <Trash2 className="size-3" />
            Delete Task
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
