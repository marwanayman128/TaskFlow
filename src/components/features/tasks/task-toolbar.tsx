'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Task } from '@/hooks/use-tasks';
import { RecurringTaskButton, RecurrenceRule } from './recurring-task-editor';
import { LocationReminderButton, LocationReminder } from './location-reminder-editor';
import { 
  Flag,
  AlertCircle,
  Tag,
  Calendar,
  Repeat,
  MapPin,
  Paperclip,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Icon } from '@iconify/react';
import { format } from 'date-fns';

// Priority options
type PriorityType = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';

const PRIORITY_OPTIONS: { value: PriorityType; label: string; color: string; icon: string }[] = [
  { value: 'NONE', label: 'No Priority', color: 'text-muted-foreground', icon: '' },
  { value: 'LOW', label: 'Low', color: 'text-blue-500', icon: '🔵' },
  { value: 'MEDIUM', label: 'Medium', color: 'text-amber-500', icon: '🟡' },
  { value: 'HIGH', label: 'High', color: 'text-red-500', icon: '🔴' },
];

interface TaskToolbarProps {
  task: Task;
  onUpdate?: (data: Partial<Task>) => void;
  availableTags?: { id: string; name: string; color: string }[];
  onTagsChange?: (tagIds: string[]) => void;
  showReminder?: boolean;
  onReminderClick?: () => void;
  className?: string;
}

export function TaskToolbar({ 
  task, 
  onUpdate, 
  availableTags = [],
  onTagsChange,
  showReminder = true,
  onReminderClick,
  className 
}: TaskToolbarProps) {
  const [recurrence, setRecurrence] = React.useState<RecurrenceRule | null>(null);
  const [locationReminder, setLocationReminder] = React.useState<LocationReminder | null>(null);

  // Handle priority change
  const handlePriorityChange = (priority: PriorityType) => {
    onUpdate?.({ priority });
  };

  // Handle recurrence change
  const handleRecurrenceChange = (rule: RecurrenceRule | null) => {
    setRecurrence(rule);
    // TODO: Save to backend
  };

  // Handle location reminder change
  const handleLocationReminderChange = (reminder: LocationReminder | null) => {
    setLocationReminder(reminder);
    // TODO: Save to backend
  };

  // Get selected tags
  const selectedTagIds = task.tags?.map(t => t.id) || [];

  // Current priority display
  const currentPriority = PRIORITY_OPTIONS.find(p => p.value === task.priority) || PRIORITY_OPTIONS[0];

  return (
    <div className={cn("flex flex-wrap items-center gap-2 py-3", className)}>
      {/* Priority Dropdown */}
      <Select
        value={task.priority || 'NONE'}
        onValueChange={(value) => handlePriorityChange(value as PriorityType)}
      >
        <SelectTrigger className="w-[130px] h-8">
          <div className="flex items-center gap-2">
            <Flag className={cn("size-3.5", currentPriority.color)} />
            <SelectValue placeholder="Priority" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {PRIORITY_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center gap-2">
                <Flag className={cn("size-3.5", option.color)} />
                {option.label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Due Date / Reminder */}
      {showReminder && (
        <Button
          variant={task.dueDate ? 'secondary' : 'outline'}
          size="sm"
          onClick={onReminderClick}
          className={cn(
            "h-8 gap-1.5",
            task.dueDate && "bg-primary/10 text-primary hover:bg-primary/20"
          )}
        >
          <Calendar className="size-3.5" />
          {task.dueDate ? format(new Date(task.dueDate), 'MMM d') : 'Reminder'}
        </Button>
      )}

      {/* Tags */}
      {availableTags.length > 0 && task.tags && task.tags.length > 0 && (
        <div className="flex items-center gap-1">
          {task.tags.slice(0, 3).map((tag) => (
            <Badge
              key={tag.id}
              variant="outline"
              className="h-6 text-xs"
              style={{
                borderColor: tag.color,
                color: tag.color,
                backgroundColor: `${tag.color}15`,
              }}
            >
              #{tag.name}
            </Badge>
          ))}
          {task.tags.length > 3 && (
            <Badge variant="secondary" className="h-6 text-xs">
              +{task.tags.length - 3}
            </Badge>
          )}
        </div>
      )}

      {/* Recurring Task */}
      <RecurringTaskButton
        value={recurrence}
        onChange={handleRecurrenceChange}
      />

      {/* Location Reminder */}
      <LocationReminderButton
        value={locationReminder}
        onChange={handleLocationReminderChange}
      />

      {/* Attachments indicator */}
      {(task as any).attachments?.length > 0 && (
        <Badge variant="secondary" className="h-6 gap-1">
          <Paperclip className="size-3" />
          {(task as any).attachments.length}
        </Badge>
      )}
    </div>
  );
}

export default TaskToolbar;
