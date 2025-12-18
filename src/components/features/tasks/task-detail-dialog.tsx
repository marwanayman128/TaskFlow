'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from '@/components/ui/dialog';
import { Icon } from '@iconify/react';
import { format } from 'date-fns';
import { 
  CheckCircle2, 
  ChevronRight, 
  Paperclip,
} from 'lucide-react';
import { Task } from '@/hooks/use-tasks';
import { QuickAddTask } from './quick-add-task';
import { DateTimePicker } from './date-time-picker';

export interface TaskDetailDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: (id: string, data: Partial<Task>) => void;
  onDelete?: (id: string) => void;
  onToggle?: (id: string, completed: boolean) => void;
  onArchive?: (id: string) => void;
  onAddToMyDay?: (id: string) => void;
  onAddSubtask?: (data: any) => Promise<void>;
  onSubtaskClick?: (subtask: Task) => void;
  availableTags?: { id: string; name: string; color: string }[];
  // For breadcrumb navigation
  parentTask?: Task | null;
  onParentClick?: () => void;
}

export function TaskDetailDialog({
  task,
  open,
  onOpenChange,
  onUpdate,
  onDelete,
  onToggle,
  onArchive,
  onAddToMyDay,
  onAddSubtask,
  onSubtaskClick,
  availableTags = [],
  parentTask,
  onParentClick,
}: TaskDetailDialogProps) {
  const [isReminderOpen, setIsReminderOpen] = React.useState(false);
  const [isTagOpen, setIsTagOpen] = React.useState(false);

  if (!task) return null;

  const isCompleted = task.status === 'COMPLETED' || task.completed;
  // Check if task is in My Day list - this should check a myDay flag, not dueDate
  const isMyDay = (task as any).isMyDay || (task as any).myDay;
  const subTasks = (task as any).subTasks || [];
  const completedSubtasks = subTasks.filter((t: any) => t.status === 'COMPLETED' || t.completed).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-4 pb-3 border-b border-border/40">
          <div className="flex items-center justify-between">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 text-primary">
                <Icon icon="solar:list-linear" className="size-3.5" />
                Tasks
              </span>
              <ChevronRight className="size-4 opacity-50" />
              {parentTask && (
                <>
                  <button 
                    onClick={onParentClick}
                    className="hover:text-foreground hover:underline truncate max-w-[100px]"
                  >
                    {parentTask.title}
                  </button>
                  <ChevronRight className="size-4 opacity-50" />
                </>
              )}
              <span className="font-medium text-foreground truncate max-w-[150px]">
                {task.title || "Untitled"}
              </span>
            </div>
            
            {/* Actions - removed delete button */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "size-9 rounded-lg transition-all",
                  isCompleted 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                )}
                onClick={() => onToggle?.(task.id, !isCompleted)}
                title={isCompleted ? "Mark as incomplete" : "Mark as complete"}
              >
                <CheckCircle2 className="size-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "size-9 rounded-lg transition-all",
                  isMyDay
                    ? "text-amber-500 bg-amber-500/10" 
                    : "text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10"
                )}
                onClick={() => onAddToMyDay?.(task.id)}
                title={isMyDay ? "Remove from My Day" : "Add to My Day"}
              >
                <Icon icon="solar:sun-bold" className="size-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="size-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                onClick={() => onArchive?.(task.id)}
                title="Archive task"
              >
                <Icon icon="solar:archive-linear" className="size-5" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <ScrollArea className="flex-1 max-h-[calc(85vh-80px)]">
          <div className="p-6 space-y-8">
            {/* Title Area */}
            <div className="space-y-4">
              <div className="relative group">
                <textarea 
                  className="w-full bg-transparent text-2xl font-bold resize-none focus:outline-none placeholder:text-muted-foreground/40 leading-normal"
                  placeholder="Task title"
                  defaultValue={task.title || ""}
                  key={task.id + "_title"}
                  rows={1}
                  style={{ minHeight: '40px' }}
                  onInput={(e) => {
                    e.currentTarget.style.height = 'auto';
                    e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
                  }}
                  onBlur={(e) => {
                    if (e.target.value !== task.title) {
                      onUpdate?.(task.id, { title: e.target.value });
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      e.currentTarget.blur();
                    }
                  }}
                />
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-border group-focus-within:bg-primary group-focus-within:shadow-[0_0_8px_rgba(var(--primary),0.3)] transition-all" />
              </div>

              {/* Inline Reminders / Tags */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Reminder - opens DateTimePicker dialog */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 rounded-lg gap-2 border-dashed bg-transparent hover:bg-primary/5 hover:border-primary/40 hover:text-primary transition-all"
                  onClick={() => setIsReminderOpen(true)}
                >
                  <Icon icon="solar:alarm-add-linear" className="size-4" />
                  {task.dueDate ? format(new Date(task.dueDate), 'MMM d, h:mm a') : "Remind me"}
                </Button>

                <Popover open={isTagOpen} onOpenChange={setIsTagOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 rounded-lg gap-2 border-dashed bg-transparent hover:bg-primary/5 hover:border-primary/40 hover:text-primary transition-all">
                      <Icon icon="solar:hashtag-linear" className="size-4" />
                      {(task as any).tags && (task as any).tags.length > 0 ? (
                        <span className="flex items-center gap-1">
                          {(task as any).tags.length} Tags
                        </span>
                      ) : "Tags"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search tags..." />
                      <CommandList>
                        <CommandEmpty>No tags found.</CommandEmpty>
                        <CommandGroup>
                          {availableTags.map((tag) => {
                            const currentTags = (task as any).tags || [];
                            const isSelected = currentTags.some((t: any) => t.id === tag.id || t.tagId === tag.id);
                            return (
                              <CommandItem
                                key={tag.id}
                                value={tag.name}
                                onSelect={() => {
                                  let newTags;
                                  if (isSelected) {
                                    newTags = currentTags.filter((t: any) => (t.id !== tag.id && t.tagId !== tag.id));
                                  } else {
                                    newTags = [...currentTags, { id: tag.id, name: tag.name, color: tag.color }];
                                  }
                                  const newTagIds = newTags.map((t: any) => t.id || t.tagId);
                                  onUpdate?.(task.id, { tagIds: newTagIds } as any);
                                }}
                              >
                                <div className="flex items-center gap-2 w-full">
                                  <div className="size-2 rounded-full shrink-0" style={{ backgroundColor: tag.color }} />
                                  <span className="truncate">{tag.name}</span>
                                  {isSelected && <Icon icon="solar:check-read-linear" className="ml-auto size-4 shrink-0" />}
                                </div>
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2 group">
              <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <Icon icon="solar:notes-minimalistic-linear" className="size-4 text-primary/70" />
                Notes
              </h4>
              <textarea 
                className="w-full bg-muted/20 p-4 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-primary/5 min-h-[100px] transition-all"
                placeholder="Insert your notes here..."
                defaultValue={(task as any).description || ""}
                key={task.id + "_description"}
                onBlur={(e) => {
                  const newVal = e.target.value;
                  if (newVal !== (task as any).description) {
                    onUpdate?.(task.id, { description: newVal } as any);
                  }
                }}
              />
            </div>

            {/* Subtasks */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <Icon icon="solar:list-check-linear" className="size-4 text-primary/70" />
                  Subtasks
                </h4>
                <span className="text-xs text-muted-foreground bg-primary/10 px-2 py-0.5 rounded-full">
                  {completedSubtasks}/{subTasks.length}
                </span>
              </div>

              {/* Subtask List */}
              <div className="space-y-2">
                {subTasks.length > 0 ? (
                  subTasks.map((subtask: Task) => (
                    <button
                      key={subtask.id}
                      onClick={() => onSubtaskClick?.(subtask)}
                      className={cn(
                        "flex items-center gap-3 w-full p-3 rounded-xl text-left transition-all",
                        "hover:bg-muted/50 group/subtask",
                        subtask.completed && "opacity-60"
                      )}
                    >
                      <div className={cn(
                        "size-4 rounded-full border-2 flex items-center justify-center transition-all shrink-0",
                        "border-muted-foreground/30",
                        (subtask.status === 'COMPLETED' || subtask.completed) && "bg-primary border-primary"
                      )}>
                        {(subtask.status === 'COMPLETED' || subtask.completed) && (
                          <Icon icon="solar:check-read-linear" className="size-2.5 text-primary-foreground" />
                        )}
                      </div>
                      <span className={cn(
                        "text-sm flex-1",
                        (subtask.status === 'COMPLETED' || subtask.completed) && "line-through text-muted-foreground"
                      )}>
                        {subtask.title}
                      </span>
                      <ChevronRight className="size-4 text-muted-foreground opacity-0 group-hover/subtask:opacity-100 transition-opacity" />
                    </button>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground py-3 px-4 bg-muted/10 rounded-xl text-center">
                    No subtasks yet. Add one below.
                  </div>
                )}
              </div>

              {/* Add Subtask - Always visible */}
              <div className="pt-2">
                <QuickAddTask 
                  onAdd={(data) => {
                    if (onAddSubtask) {
                      return onAddSubtask({ 
                        ...data, 
                        parentTaskId: task.id 
                      });
                    }
                    return Promise.resolve();
                  }}
                  compact
                />
              </div>
            </div>

            {/* Attachments Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <Paperclip className="size-4 text-primary/70" />
                  Attachments
                </h4>
              </div>
              
              <div className="text-sm text-muted-foreground py-3 px-4 bg-muted/10 rounded-xl text-center border-2 border-dashed border-muted-foreground/20">
                <Paperclip className="size-5 mx-auto mb-2 opacity-50" />
                Drag files here or click to upload
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* DateTimePicker Dialog for Reminder */}
        <DateTimePicker
          isOpen={isReminderOpen}
          onClose={() => setIsReminderOpen(false)}
          onSelect={(date) => {
            if (date) {
              onUpdate?.(task.id, { dueDate: date.toISOString() });
            }
          }}
          initialDate={task.dueDate ? new Date(task.dueDate) : undefined}
        />
      </DialogContent>
    </Dialog>
  );
}

export default TaskDetailDialog;
