'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Icon } from '@iconify/react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  Plus, 
  Search,
  Filter,
  SortAsc,
  CheckCircle2,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import { useTasks, useCreateTask, useUpdateTaskMutation, useDeleteTaskMutation, useTags, Task } from '@/hooks/use-tasks';
import { TaskCard } from '@/components/features/tasks/task-card';
import { TaskDetailDialog } from '@/components/features/tasks/task-detail-dialog';
import { QuickAddTask } from '@/components/features/tasks/quick-add-task';
import { toast } from 'sonner';

// Filter options
const FILTER_OPTIONS = [
  { label: 'All Tasks', value: 'all', icon: 'solar:checklist-minimalistic-outline' },
  { label: 'Active', value: 'active', icon: 'solar:play-circle-outline' },
  { label: 'Completed', value: 'completed', icon: 'solar:check-circle-outline' },
  { label: 'High Priority', value: 'high', icon: 'solar:flag-bold' },
];

// Sort options
const SORT_OPTIONS = [
  { label: 'Due Date', value: 'dueDate' },
  { label: 'Priority', value: 'priority' },
  { label: 'Alphabetical', value: 'title' },
  { label: 'Created Date', value: 'createdAt' },
];

export default function AllTasksPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filter, setFilter] = React.useState('all');
  const [sortBy, setSortBy] = React.useState('dueDate');
  const [showCompleted, setShowCompleted] = React.useState(true);
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);

  // API hooks
  const { tasks, isLoading, mutate } = useTasks();
  const { tags } = useTags();
  const { createTask } = useCreateTask();
  const { updateTask } = useUpdateTaskMutation();
  const { deleteTask } = useDeleteTaskMutation();

  // Sync selectedTask with updated tasks data (to show newly added subtasks)
  React.useEffect(() => {
    if (selectedTask && tasks) {
      const updatedTask = tasks.find((t: Task) => t.id === selectedTask.id);
      if (updatedTask) {
        setSelectedTask(updatedTask);
      }
    }
  }, [tasks]);

  // Handlers
  const handleAddTask = async (data: any) => {
    try {
      await createTask({
        title: data?.title || 'New Task',
        priority: data?.priority || 'NONE',
        dueDate: data?.dueDate,
        tags: data?.tags,
      });
      mutate();
      toast.success('Task created');
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  const handleToggle = async (id: string, completed: boolean) => {
    try {
      const status = completed ? 'COMPLETED' : 'TODO';
      await updateTask({ id, payload: { status } });
      mutate();
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleUpdate = async (id: string, data: any) => {
    try {
      await updateTask({ id, payload: data });
      mutate();
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTask(id);
      mutate();
      toast.success('Task deleted');
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await updateTask({ id, payload: { archived: true } });
      mutate();
      toast.success('Task archived');
    } catch (error) {
      toast.error('Failed to archive task');
    }
  };

  const handleAddToMyDay = async (id: string) => {
    try {
      await updateTask({ id, payload: { isMyDay: true } });
      mutate();
      toast.success('Added to My Day');
    } catch (error) {
      toast.error('Failed to add to My Day');
    }
  };

  // Filter and sort tasks
  const filteredTasks = React.useMemo(() => {
    if (!tasks) return [];
    let result = [...tasks];

    // Search filter
    if (searchQuery) {
      result = result.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (filter === 'active') {
      result = result.filter(task => !task.completed && task.status !== 'COMPLETED');
    } else if (filter === 'completed') {
      result = result.filter(task => task.completed || task.status === 'COMPLETED');
    } else if (filter === 'high') {
      result = result.filter(task => task.priority === 'HIGH');
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'priority') {
        const order = { HIGH: 0, MEDIUM: 1, LOW: 2, NONE: 3 };
        return (order[a.priority] || 3) - (order[b.priority] || 3);
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'dueDate') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      return 0;
    });

    return result;
  }, [tasks, searchQuery, filter, sortBy]);

  const incompleteTasks = filteredTasks.filter(t => !t.completed && t.status !== 'COMPLETED');
  const completedTasks = filteredTasks.filter(t => t.completed || t.status === 'COMPLETED');

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="flex-shrink-0 px-6 py-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Icon icon="solar:checklist-minimalistic-outline" className="size-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">All Tasks</h1>
              <p className="text-sm text-muted-foreground">
                {tasks?.length || 0} tasks, {incompleteTasks.length} remaining
              </p>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="pl-9 rounded-xl"
            />
          </div>

          {/* Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="rounded-xl gap-2">
                <Filter className="size-4" />
                Filter
                <ChevronDown className="size-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {FILTER_OPTIONS.map(option => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setFilter(option.value)}
                  className={cn(filter === option.value && "bg-primary/10")}
                >
                  <Icon icon={option.icon} className="size-4 mr-2" />
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="rounded-xl gap-2">
                <SortAsc className="size-4" />
                Sort
                <ChevronDown className="size-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {SORT_OPTIONS.map(option => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className={cn(sortBy === option.value && "bg-primary/10")}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Task List */}
      <div className="flex-1 overflow-auto px-6 py-4 space-y-4">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        )}

        {/* Quick Add */}
        <QuickAddTask 
          onAdd={(data) => handleAddTask(data)}
        />

        {/* Active Tasks */}
        <div className="space-y-1">
          <AnimatePresence mode="popLayout">
            {incompleteTasks.map(task => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <TaskCard
                  task={task}
                  onClick={() => setSelectedTask(task)}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  onArchive={handleArchive}
                  onAddToMyDay={handleAddToMyDay}
                  showListBadge
                  showDueDate
                  showPriority
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div className="pt-4 border-t">
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 hover:text-foreground transition-colors"
            >
              <CheckCircle2 className="size-4" />
              Completed ({completedTasks.length})
              <ChevronDown className={cn("size-3 transition-transform", !showCompleted && "-rotate-90")} />
            </button>
            {showCompleted && (
              <div className="space-y-1">
                <AnimatePresence mode="popLayout">
                  {completedTasks.map(task => (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <TaskCard
                        task={task}
                        onClick={() => setSelectedTask(task)}
                        onToggle={handleToggle}
                        onDelete={handleDelete}
                        onArchive={handleArchive}
                        onAddToMyDay={handleAddToMyDay}
                        showListBadge
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && filteredTasks.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="size-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <Icon icon="solar:checklist-minimalistic-outline" className="size-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No tasks found</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              {searchQuery ? `No tasks match "${searchQuery}"` : 'Create your first task to get started'}
            </p>
          </motion.div>
        )}
      </div>

      {/* Task Detail Dialog */}
      <TaskDetailDialog
        task={selectedTask}
        open={!!selectedTask}
        onOpenChange={(open) => !open && setSelectedTask(null)}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onToggle={handleToggle}
        onArchive={handleArchive}
        onAddToMyDay={handleAddToMyDay}
        onAddSubtask={handleAddTask}
        onSubtaskClick={setSelectedTask}
        availableTags={tags}
      />
    </div>
  );
}
