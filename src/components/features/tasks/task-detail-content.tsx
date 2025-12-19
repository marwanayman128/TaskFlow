'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Icon } from '@iconify/react';
import { format } from 'date-fns';
import { 
  CheckCircle2, 
  ChevronRight, 
  Paperclip,
  Flag,
  Loader2,
  Upload,
  X,
  Download,
} from 'lucide-react';
import { Task } from '@/hooks/use-tasks';
import { QuickAddTask } from './quick-add-task';
import { DateTimePicker } from './date-time-picker';
import { TaskDetailTabs } from './task-detail-tabs';
import { RecurringTaskButton, RecurrenceRule } from './recurring-task-editor';
import { LocationReminderButton, LocationReminder } from './location-reminder-editor';

// Priority options
type PriorityType = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
const PRIORITY_OPTIONS: { value: PriorityType; label: string; color: string }[] = [
  { value: 'NONE', label: 'No Priority', color: 'text-muted-foreground' },
  { value: 'LOW', label: 'Low', color: 'text-blue-500' },
  { value: 'MEDIUM', label: 'Medium', color: 'text-amber-500' },
  { value: 'HIGH', label: 'High', color: 'text-red-500' },
];

// Attachment type
interface Attachment {
  id: string;
  name: string;
  url: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

export interface TaskDetailContentProps {
  task: Task;
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
  // Attachments
  attachments?: Attachment[];
  onUploadAttachment?: (files: File[]) => Promise<void>;
  onDeleteAttachment?: (id: string) => Promise<void>;
  // Layout options
  showHeader?: boolean;
  className?: string;
}

export function TaskDetailContent({
  task,
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
  attachments = [],
  onUploadAttachment,
  onDeleteAttachment,
  showHeader = true,
  className,
}: TaskDetailContentProps) {
  const [isReminderOpen, setIsReminderOpen] = React.useState(false);
  const [isPriorityOpen, setIsPriorityOpen] = React.useState(false);
  const [isTagOpen, setIsTagOpen] = React.useState(false);
  const [isAttachmentOpen, setIsAttachmentOpen] = React.useState(false);
  const [recurrence, setRecurrence] = React.useState<RecurrenceRule | null>(null);
  const [locationReminder, setLocationReminder] = React.useState<LocationReminder | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Get current priority
  const currentPriority = PRIORITY_OPTIONS.find(p => p.value === task?.priority) || PRIORITY_OPTIONS[0];

  const isCompleted = task.status === 'COMPLETED' || task.completed;
  const isMyDay = (task as any).isMyDay || (task as any).myDay;
  const subTasks = (task as any).subTasks || [];
  const completedSubtasks = subTasks.filter((t: any) => t.status === 'COMPLETED' || t.completed).length;

  // Handle file upload
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !onUploadAttachment) return;
    setIsUploading(true);
    try {
      await onUploadAttachment(Array.from(files));
    } finally {
      setIsUploading(false);
    }
  };

  // Format file size
  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header Actions */}
      {showHeader && (
        <div className="flex items-center justify-between p-4 pb-3 border-b border-border/40">
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
          
          {/* Header Actions */}
          <div className="flex items-center gap-1">
            {/* Attachments Button */}
            <Popover open={isAttachmentOpen} onOpenChange={setIsAttachmentOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "size-9 rounded-lg transition-all relative",
                    attachments.length > 0
                      ? "text-primary bg-primary/10" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                  title="Attachments"
                >
                  <Paperclip className="size-5" />
                  {attachments.length > 0 && (
                    <span className="absolute -top-1 -right-1 size-4 rounded-full bg-primary text-[10px] text-primary-foreground flex items-center justify-center font-medium">
                      {attachments.length}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="p-4 border-b">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Paperclip className="size-4" />
                    Attachments
                  </h4>
                </div>
                
                {/* Upload Section */}
                <div className="p-4 border-b">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files)}
                  />
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Upload className="size-4" />
                    )}
                    {isUploading ? 'Uploading...' : 'Upload Files'}
                  </Button>
                </div>

                {/* Attachments List */}
                {attachments.length > 0 ? (
                  <ScrollArea className="max-h-[200px]">
                    <div className="p-2 space-y-1">
                      {attachments.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 group"
                        >
                          <Icon icon="solar:file-text-linear" className="size-5 text-muted-foreground" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                            <Button variant="ghost" size="icon" className="size-7" asChild>
                              <a href={file.url} download={file.name} target="_blank" rel="noopener noreferrer">
                                <Download className="size-3.5" />
                              </a>
                            </Button>
                            {onDeleteAttachment && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-7 text-destructive hover:text-destructive"
                                onClick={() => onDeleteAttachment(file.id)}
                              >
                                <X className="size-3.5" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="p-6 text-center text-muted-foreground text-sm">
                    No attachments yet
                  </div>
                )}
              </PopoverContent>
            </Popover>

            {/* Complete Toggle */}
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

            {/* My Day Toggle */}
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

            {/* Archive */}
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
      )}

      {/* Main Content */}
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
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

            {/* Task Toolbar - Priority, Reminder, Tags, Recurring, Location */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Reminder */}
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 rounded-lg gap-2 border-dashed bg-transparent hover:bg-primary/5 hover:border-primary/40 hover:text-primary transition-all"
                onClick={() => setIsReminderOpen(true)}
              >
                <Icon icon="solar:alarm-add-linear" className="size-4" />
                {task.dueDate ? format(new Date(task.dueDate), 'MMM d, h:mm a') : "Remind me"}
              </Button>

              {/* Tags Popover */}
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

              {/* Priority Dropdown */}
              <Popover open={isPriorityOpen} onOpenChange={setIsPriorityOpen}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={cn(
                      "h-8 rounded-lg gap-2 border-dashed bg-transparent hover:bg-primary/5 hover:border-primary/40 hover:text-primary transition-all w-auto min-w-[100px] justify-start",
                      task.priority && task.priority !== 'NONE' && "text-primary border-primary/40 bg-primary/5"
                    )}
                  >
                    <Flag className={cn("size-3.5", currentPriority.color)} />
                    {currentPriority.label}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[150px] p-0" align="start">
                  <Command>
                    <CommandList>
                      <CommandGroup>
                        {PRIORITY_OPTIONS.map((option) => (
                          <CommandItem
                            key={option.value}
                            value={option.value}
                            onSelect={() => {
                              onUpdate?.(task.id, { priority: option.value });
                              setIsPriorityOpen(false);
                            }}
                          >
                            <div className="flex items-center gap-2 w-full">
                              <Flag className={cn("size-3.5", option.color)} />
                              <span>{option.label}</span>
                              {task.priority === option.value && (
                                <Icon icon="solar:check-read-linear" className="ml-auto size-4 shrink-0" />
                              )}
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {/* Recurring Task */}
              <RecurringTaskButton
                value={recurrence}
                onChange={(rule) => setRecurrence(rule)}
              />

              {/* Location Reminder */}
              <LocationReminderButton
                value={locationReminder}
                onChange={(loc) => setLocationReminder(loc)}
              />
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
              placeholder="Add notes..."
              defaultValue={task.description || ""}
              key={task.id + "_description"}
              onBlur={(e) => {
                if (e.target.value !== task.description) {
                  onUpdate?.(task.id, { description: e.target.value });
                }
              }}
            />
          </div>

          {/* Subtasks */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <Icon icon="solar:checklist-linear" className="size-4 text-primary/70" />
                Subtasks
                {subTasks.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 text-xs">
                    {completedSubtasks}/{subTasks.length}
                  </Badge>
                )}
              </h4>
            </div>

            {/* Progress bar */}
            {subTasks.length > 0 && (
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
                  style={{ width: `${(completedSubtasks / subTasks.length) * 100}%` }}
                />
              </div>
            )}

            {/* Subtasks List */}
            <div className="space-y-1">
              {subTasks.length > 0 ? (
                subTasks.map((subtask: any) => (
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

            {/* Add Subtask - Using QuickAddTask */}
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
        </div>
      </ScrollArea>

      {/* Bottom Tabs for Comments, Activity, Time Tracking */}
      <div className="border-t">
        <TaskDetailTabs 
          task={task} 
          onUpdate={(data) => onUpdate?.(task.id, data)}
          className="h-[280px]"
        />
      </div>

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
    </div>
  );
}

export default TaskDetailContent;
