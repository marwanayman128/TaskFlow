'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Icon } from '@iconify/react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  Plus, 
  MoreHorizontal,
  Trash2,
  Settings,
  Calendar,
  Flag,
  Palette,
} from 'lucide-react';
import { useTags, useTasksByTag, Task } from '@/hooks/use-tasks';
import { TaskDetailSheet } from '@/components/features/tasks/task-detail-sheet';

// Task Row Component
function TaskRow({ 
  task, 
  onToggle, 
  onDelete,
  onClick,
}: { 
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onClick: () => void;
}) {
  const [isHovered, setIsHovered] = React.useState(false);

  const priorityColors = {
    HIGH: 'border-red-500',
    MEDIUM: 'border-amber-500',
    LOW: 'border-blue-500',
    NONE: 'border-muted-foreground/30',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200",
        "hover:bg-muted/50 group cursor-pointer",
        task.completed && "opacity-60"
      )}
    >
      {/* Checkbox */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle(task.id);
        }}
        className={cn(
          "flex-shrink-0 size-5 rounded-full border-2 transition-all",
          priorityColors[task.priority],
          task.completed && "bg-primary border-primary"
        )}
      >
        {task.completed && (
          <Icon icon="solar:check-read-linear" className="size-3 text-primary-foreground m-auto" />
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm font-medium truncate",
          task.completed && "line-through text-muted-foreground"
        )}>
          {task.title}
        </p>
        
        {/* Meta info */}
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {/* List badge */}
          {task.listName && (
            <Badge 
              variant="outline" 
              className="text-[10px] px-1.5 py-0 h-5 font-normal"
              style={{ borderColor: task.listColor, color: task.listColor }}
            >
              {task.listName}
            </Badge>
          )}
          
          {/* Due date */}
          {task.dueDate && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="size-3" />
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* Priority */}
      {task.priority !== 'NONE' && (
        <Flag 
          className={cn(
            "size-4",
            task.priority === 'HIGH' && "text-red-500",
            task.priority === 'MEDIUM' && "text-amber-500",
            task.priority === 'LOW' && "text-blue-500"
          )}
        />
      )}

      {/* Actions */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Button 
              variant="ghost" 
              size="icon" 
              className="size-8 text-destructive hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task.id);
              }}
            >
              <Trash2 className="size-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Color picker for editing tag
const TAG_COLORS = [
  '#f59e0b', '#ef4444', '#f97316', '#eab308', '#84cc16', 
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', 
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', 
  '#ec4899', '#f43f5e',
];

export default function TagDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  
  const tagId = decodeURIComponent(params.id as string);
  
  const { tags } = useTags();
  const { tasks, isLoading, mutate: mutateTasks } = useTasksByTag(tagId);
  
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [tagName, setTagName] = React.useState('');
  const [tagColor, setTagColor] = React.useState('#f59e0b');
  const [showColorPicker, setShowColorPicker] = React.useState(false);

  // Find the current tag
  const currentTag = React.useMemo(() => {
    return tags.find(t => t.id === tagId);
  }, [tags, tagId]);

  React.useEffect(() => {
    if (currentTag) {
      setTagName(currentTag.name);
      setTagColor(currentTag.color);
    }
  }, [currentTag]);

  // Local tasks state for optimistic updates
  const [localTasks, setLocalTasks] = React.useState<Task[]>([]);

  React.useEffect(() => {
    if (tasks.length > 0) {
      setLocalTasks(tasks);
    }
  }, [tasks]);

  const handleToggleTask = async (id: string) => {
    // Optimistic update
    setLocalTasks(prev =>
      prev.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );

    try {
      await fetch(`/api/v1/tasks/${id}/complete`, { method: 'POST' });
      mutateTasks();
    } catch (error) {
      console.error('Failed to toggle task:', error);
      // Revert on error
      mutateTasks();
    }
  };

  const handleDeleteTask = async (id: string) => {
    // Optimistic update
    setLocalTasks(prev => prev.filter(task => task.id !== id));

    try {
      await fetch(`/api/v1/tasks/${id}`, { method: 'DELETE' });
      mutateTasks();
    } catch (error) {
      console.error('Failed to delete task:', error);
      mutateTasks();
    }
  };

  const handleUpdateTagColor = async (color: string) => {
    setTagColor(color);
    setShowColorPicker(false);

    try {
      await fetch(`/api/v1/tags/${tagId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ color }),
      });
    } catch (error) {
      console.error('Failed to update tag color:', error);
    }
  };

  const handleDeleteTag = async () => {
    if (!confirm('Are you sure you want to delete this tag?')) return;

    try {
      await fetch(`/api/v1/tags/${tagId}`, { method: 'DELETE' });
      router.push('/dashboard/tasks/all');
    } catch (error) {
      console.error('Failed to delete tag:', error);
    }
  };

  const incompleteTasks = localTasks.filter(t => !t.completed);
  const completedTasks = localTasks.filter(t => t.completed);

  // Loading state
  if (isLoading && localTasks.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="flex-shrink-0 px-6 py-6 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Tag color indicator */}
            <div 
              className="size-12 rounded-2xl flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity relative"
              style={{ backgroundColor: `${tagColor}20` }}
              onClick={() => setShowColorPicker(!showColorPicker)}
            >
              <span 
                className="text-2xl font-bold"
                style={{ color: tagColor }}
              >
                #
              </span>

              {/* Color picker popover */}
              <AnimatePresence>
                {showColorPicker && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute top-full left-0 mt-2 p-3 bg-popover border rounded-xl shadow-lg z-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex flex-wrap gap-2 w-48">
                      {TAG_COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={() => handleUpdateTagColor(color)}
                          className={cn(
                            "size-6 rounded-full transition-all hover:scale-110",
                            tagColor === color && "ring-2 ring-offset-2"
                          )}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Tag info */}
            <div>
              <div className="flex items-center gap-2">
                {isEditingName ? (
                  <Input
                    value={tagName}
                    onChange={(e) => setTagName(e.target.value)}
                    onBlur={() => setIsEditingName(false)}
                    onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                    className="text-2xl font-bold h-auto py-0 border-0 focus-visible:ring-0"
                    style={{ color: tagColor }}
                    autoFocus
                  />
                ) : (
                  <h1 
                    className="text-2xl font-bold cursor-text"
                    style={{ color: tagColor }}
                    onClick={() => setIsEditingName(true)}
                  >
                    #{tagName || 'Tag'}
                  </h1>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {localTasks.length} tasks tagged
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-xl">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowColorPicker(true)}>
                  <Palette className="size-4 mr-2" />
                  Change Color
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsEditingName(true)}>
                  <Settings className="size-4 mr-2" />
                  Rename Tag
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive"
                  onClick={handleDeleteTag}
                >
                  <Trash2 className="size-4 mr-2" />
                  Delete Tag
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Task List */}
      <div className="flex-1 overflow-auto px-6 py-4 space-y-4">
        {/* Active Tasks */}
        {incompleteTasks.length > 0 && (
          <div className="space-y-1">
            <AnimatePresence mode="popLayout">
              {incompleteTasks.map(task => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onToggle={handleToggleTask}
                  onDelete={handleDeleteTask}
                  onClick={() => setSelectedTask(task)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div className="pt-4 border-t">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-4">
              Completed ({completedTasks.length})
            </h3>
            <div className="space-y-1">
              <AnimatePresence mode="popLayout">
                {completedTasks.map(task => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onToggle={handleToggleTask}
                    onDelete={handleDeleteTask}
                    onClick={() => setSelectedTask(task)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Empty state */}
        {localTasks.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div 
              className="size-20 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: `${tagColor}10` }}
            >
              <span 
                className="text-4xl font-bold"
                style={{ color: tagColor }}
              >
                #
              </span>
            </div>
            <h3 className="text-lg font-semibold mb-1">No tasks with this tag</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Add the #{tagName} tag to your tasks to see them here
            </p>
          </motion.div>
        )}
      </div>

      {/* Task Detail Sheet */}
      <TaskDetailSheet
        task={selectedTask}
        open={!!selectedTask}
        onOpenChange={(open) => !open && setSelectedTask(null)}
        onUpdate={(updatedTask) => {
          setLocalTasks(prev =>
            prev.map(t => t.id === updatedTask.id ? updatedTask : t)
          );
          mutateTasks();
        }}
        onDelete={(taskId) => {
          setLocalTasks(prev => prev.filter(t => t.id !== taskId));
          mutateTasks();
        }}
      />
    </div>
  );
}
