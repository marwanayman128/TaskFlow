'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@iconify/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  MoreVertical, 
  Trash2, 
  CheckCircle2,
  ChevronRight,
  Calendar,
  Flag,
} from 'lucide-react';
import { Task } from '@/hooks/use-tasks';

export interface TaskCardProps {
  task: Task;
  isSelected?: boolean;
  onClick?: () => void;
  onToggle?: (id: string, completed: boolean) => void;
  onDelete?: (id: string) => void;
  onArchive?: (id: string) => void;
  onAddToMyDay?: (id: string) => void;
  // Tree view props
  hasSubTasks?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: (e: React.MouseEvent) => void;
  // Display options
  showListBadge?: boolean;
  showDueDate?: boolean;
  showPriority?: boolean;
  compact?: boolean;
  maxTitleLength?: number;
}

const priorityConfig = {
  HIGH: { color: 'text-red-500', border: 'border-red-500', label: 'High' },
  MEDIUM: { color: 'text-amber-500', border: 'border-amber-500', label: 'Medium' },
  LOW: { color: 'text-blue-500', border: 'border-blue-500', label: 'Low' },
  NONE: { color: 'text-muted-foreground', border: 'border-muted-foreground/30', label: 'None' },
};

export function TaskCard({
  task,
  isSelected = false,
  onClick,
  onToggle,
  onDelete,
  onArchive,
  onAddToMyDay,
  hasSubTasks = false,
  isExpanded = false,
  onToggleExpand,
  showListBadge = false,
  showDueDate = false,
  showPriority = false,
  compact = false,
  maxTitleLength = 50,
}: TaskCardProps) {
  const isCompleted = task.status === 'COMPLETED' || task.completed;
  const priority = (task.priority as keyof typeof priorityConfig) || 'NONE';

  // Truncate text
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return 'Untitled';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div 
      className={cn(
        "group flex items-center gap-3 p-3 rounded-xl transition-all duration-200 cursor-pointer border border-transparent",
        isSelected ? "bg-primary/5 border-primary/10 shadow-sm" : "hover:bg-muted/50 border-border/20 bg-card/50",
        compact && "p-2"
      )}
      onClick={onClick}
    >
      {/* Checkbox */}
      <div className="flex-shrink-0 pt-0.5">
        <button 
          type="button" 
          role="checkbox" 
          aria-checked={isCompleted}
          className={cn(
            "size-5 rounded-full border-2 flex items-center justify-center transition-all hover:scale-110 z-10 relative",
            priority !== 'NONE' && priorityConfig[priority].border,
            priority === 'NONE' && "border-muted-foreground/30",
            isCompleted && "bg-primary border-primary text-primary-foreground"
          )}
          onClick={(e) => {
            e.stopPropagation();
            onToggle?.(task.id, !isCompleted);
          }}
        >
          {isCompleted && <CheckCircle2 className="size-3.5" />}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div 
          className={cn(
            "text-sm font-medium transition-all",
            isCompleted && "line-through text-muted-foreground"
          )} 
          title={task.title || 'Untitled'}
        >
          {truncateText(task.title || '', maxTitleLength)}
        </div>
        
        {/* Meta Info Row */}
        {(showListBadge || showDueDate || showPriority) && (
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {showListBadge && task.listName && (
              <Badge 
                variant="outline" 
                className="text-[10px] px-1.5 py-0 h-4 font-normal"
                style={{ borderColor: task.listColor, color: task.listColor }}
              >
                {task.listName}
              </Badge>
            )}
            {showDueDate && task.dueDate && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="size-3" />
                {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}
            {showPriority && priority !== 'NONE' && (
              <Badge 
                variant="outline"
                className={cn("text-[10px] gap-1 border-0 h-4", priorityConfig[priority].color)}
              >
                <Flag className="size-2.5" />
                {priorityConfig[priority].label}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Chevron for subtasks */}
      {hasSubTasks && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand?.(e);
          }}
          className="p-1 text-muted-foreground/50 hover:text-foreground transition-colors shrink-0 rounded-md hover:bg-muted/50"
        >
          <ChevronRight className={cn("size-4 transition-transform duration-200", isExpanded && "rotate-90")} />
        </button>
      )}

      {/* 3-dot Actions Menu */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="size-8 text-muted-foreground hover:text-foreground"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem 
              onClick={(e) => {
                e.stopPropagation();
                onAddToMyDay?.(task.id);
              }}
              className="gap-2"
            >
              <Icon icon="solar:sun-linear" className="size-4" />
              Add to My Day
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={(e) => e.stopPropagation()}
              className="gap-2"
            >
              <Icon icon="solar:bell-linear" className="size-4" />
              Reminder
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={(e) => e.stopPropagation()}
              className="gap-2"
            >
              <Icon icon="solar:document-text-linear" className="size-4" />
              Lists
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={(e) => e.stopPropagation()}
              className="gap-2"
            >
              <Icon icon="solar:hashtag-linear" className="size-4" />
              Tags
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={(e) => {
                e.stopPropagation();
                onArchive?.(task.id);
              }}
              className="gap-2"
            >
              <Icon icon="solar:archive-linear" className="size-4" />
              Archive
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(task.id);
              }}
              className="gap-2 text-destructive focus:text-destructive"
            >
              <Trash2 className="size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// Simple version for Kanban cards
export function TaskCardSimple({
  task,
  onClick,
  onToggle,
}: {
  task: Task;
  onClick?: () => void;
  onToggle?: (id: string, completed: boolean) => void;
}) {
  const isCompleted = task.status === 'COMPLETED' || task.completed;
  const priority = (task.priority as keyof typeof priorityConfig) || 'NONE';

  return (
    <div 
      onClick={onClick}
      className={cn(
        "p-3 bg-card rounded-lg shadow-sm border border-border/50 cursor-pointer group",
        "hover:shadow-md hover:border-primary/30 transition-all",
        isCompleted && "opacity-60"
      )}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle?.(task.id, !isCompleted);
          }}
          className={cn(
            "size-5 rounded-full border-2 flex-shrink-0 mt-0.5 transition-all flex items-center justify-center",
            priority !== 'NONE' && priorityConfig[priority].border,
            priority === 'NONE' && "border-muted-foreground/30 hover:border-primary",
            isCompleted && "bg-primary border-primary"
          )}
        >
          {isCompleted && (
            <Icon icon="solar:check-read-linear" className="size-3 text-primary-foreground" />
          )}
        </button>
        
        <div className="flex-1 min-w-0">
          <p className={cn(
            "text-sm font-medium",
            isCompleted && "line-through text-muted-foreground"
          )}>
            {task.title}
          </p>
          
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {task.dueDate && (
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Calendar className="size-3" />
                {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}
            {priority && priority !== 'NONE' && (
              <Badge variant="outline" className={cn(
                "text-[10px] h-4 px-1",
                priorityConfig[priority].border,
                priorityConfig[priority].color
              )}>
                {priority}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
