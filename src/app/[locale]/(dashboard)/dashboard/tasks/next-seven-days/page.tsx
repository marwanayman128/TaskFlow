'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Icon } from '@iconify/react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  Loader2,
  Calendar,
  LayoutGrid,
  List as ListIcon,
} from 'lucide-react';
import { useTasks, useCreateTask, useUpdateTaskMutation, useDeleteTaskMutation, useTags, Task } from '@/hooks/use-tasks';
import { KanbanBoard, KanbanColumn } from '@/components/features/tasks/kanban-board';
import { TaskCard } from '@/components/features/tasks/task-card';
import { TaskDetailDialog } from '@/components/features/tasks/task-detail-dialog';
import { QuickAddTask } from '@/components/features/tasks/quick-add-task';
import { toast } from 'sonner';

// View types
type ViewType = 'kanban' | 'list';

// Day colors for kanban
const DAY_COLORS = [
  '#ef4444', // Today - red
  '#f97316', // Tomorrow - orange
  '#f59e0b', // Day 3 - amber
  '#eab308', // Day 4 - yellow
  '#84cc16', // Day 5 - lime
  '#22c55e', // Day 6 - green
  '#14b8a6', // Day 7 - teal
];

export default function Next7DaysPage() {
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  const [viewType, setViewType] = React.useState<ViewType>('kanban');

  // API hooks
  const { tasks, isLoading, mutate } = useTasks();
  const { tags } = useTags();
  const { createTask } = useCreateTask();
  const { updateTask } = useUpdateTaskMutation();
  const { deleteTask } = useDeleteTaskMutation();

  // Local tasks for optimistic updates
  const [localTasks, setLocalTasks] = React.useState<Task[]>([]);

  React.useEffect(() => {
    if (tasks) {
      setLocalTasks(tasks);
    }
  }, [tasks]);

  // Sync selectedTask with updated tasks data (to show newly added subtasks)
  React.useEffect(() => {
    if (selectedTask && tasks) {
      const updatedTask = tasks.find((t: Task) => t.id === selectedTask.id);
      if (updatedTask) {
        setSelectedTask(updatedTask);
      }
    }
  }, [tasks]);

  // Generate next 7 days
  const next7Days = React.useMemo(() => {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      date.setHours(0, 0, 0, 0);
      days.push(date);
    }
    return days;
  }, []);

  // Get day label - format like "Today (Thursday)", "Tomorrow (Friday)", "Sat 20"
  const getDayLabel = (date: Date, index: number) => {
    const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
    const shortWeekday = date.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNum = date.getDate();
    
    if (index === 0) return `Today (${weekday})`;
    if (index === 1) return `Tomorrow (${weekday})`;
    return `${shortWeekday} ${dayNum}`;
  };

  // Get tasks for a specific date
  const getTasksForDate = (date: Date) => {
    return localTasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate.getTime() === date.getTime();
    });
  };

  // Create kanban columns from days
  const kanbanColumns: KanbanColumn[] = next7Days.map((date, index) => ({
    id: date.toISOString(),
    title: getDayLabel(date, index),
    color: DAY_COLORS[index],
    tasks: getTasksForDate(date),
  }));

  // Handlers
  const handleAddTask = async (data: any) => {
    try {
      await createTask({
        title: data?.title || 'New Task',
        priority: data?.priority || 'NONE',
        dueDate: data?.dueDate?.toISOString() || new Date().toISOString(),
        tags: data?.tags,
      });
      mutate();
      toast.success('Task created');
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  const handleAddTaskToColumn = async (columnId: string, title: string) => {
    try {
      const date = new Date(columnId);
      await createTask({
        title,
        priority: 'NONE',
        dueDate: date.toISOString(),
      });
      mutate();
      toast.success('Task created');
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  const handleToggle = async (id: string, completed: boolean) => {
    // Optimistic update
    setLocalTasks(prev => prev.map(t => 
      t.id === id ? { ...t, completed, status: completed ? 'COMPLETED' : 'TODO' } : t
    ));

    try {
      const status = completed ? 'COMPLETED' : 'TODO';
      await updateTask({ id, payload: { status } });
      mutate();
    } catch (error) {
      toast.error('Failed to update task');
      mutate();
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
    // Optimistic update
    setLocalTasks(prev => prev.filter(t => t.id !== id));

    try {
      await deleteTask(id);
      mutate();
      toast.success('Task deleted');
    } catch (error) {
      toast.error('Failed to delete task');
      mutate();
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

  // Kanban drag handlers
  const handleTaskMove = async (taskId: string, sourceColumnId: string, targetColumnId: string, newIndex: number) => {
    // Optimistic update
    const task = localTasks.find(t => t.id === taskId);
    if (!task) return;

    const newDate = new Date(targetColumnId);
    setLocalTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, dueDate: newDate.toISOString() } : t
    ));

    try {
      await updateTask({ id: taskId, payload: { dueDate: newDate.toISOString() } });
      mutate();
    } catch (error) {
      toast.error('Failed to move task');
      mutate();
    }
  };

  const handleTaskReorder = async (columnId: string, reorderedTasks: Task[]) => {
    // For now just update local state - could add position-based sorting
    const taskIdsInColumn = new Set(reorderedTasks.map(t => t.id));
    setLocalTasks(prev => {
      const otherTasks = prev.filter(t => !taskIdsInColumn.has(t.id));
      return [...otherTasks, ...reorderedTasks];
    });
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalTasks = localTasks?.length || 0;
  const completedTasks = localTasks?.filter(t => t.completed || t.status === 'COMPLETED').length || 0;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 p-6  ">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Icon icon="solar:calendar-date-outline" className="size-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Next 7 Days</h1>
              <p className="text-sm text-muted-foreground">
                {totalTasks} tasks, {completedTasks} completed
              </p>
            </div>
          </div>

          {/* View Switcher */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-muted/50 p-1 rounded-lg">
              <Button
                variant={viewType === 'kanban' ? 'default' : 'ghost'}
                size="sm"
                className="gap-2 rounded-md text-xs h-8"
                onClick={() => setViewType('kanban')}
              >
                <LayoutGrid className="size-4" />
                <span className="hidden sm:inline">Kanban</span>
              </Button>
              <Button
                variant={viewType === 'list' ? 'default' : 'ghost'}
                size="sm"
                className="gap-2 rounded-md text-xs h-8"
                onClick={() => setViewType('list')}
              >
                <ListIcon className="size-4" />
                <span className="hidden sm:inline">List</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {isLoading && localTasks.length === 0 && (
          <div className="flex items-center justify-center py-12 h-full">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        )}

        {/* Kanban View */}
        {viewType === 'kanban' && !isLoading && (
          <KanbanBoard
            columns={kanbanColumns}
            onTaskMove={handleTaskMove}
            onTaskReorder={handleTaskReorder}
            onTaskClick={setSelectedTask}
            onTaskToggle={handleToggle}
            onAddTask={handleAddTaskToColumn}
          />
        )}

        {/* List View */}
        {viewType === 'list' && !isLoading && (
          <div className="p-6 overflow-auto h-full space-y-6">
            {/* Quick Add */}
            <QuickAddTask onAdd={handleAddTask} />

            {/* Day Groups */}
            {next7Days.map((date, idx) => {
              const dayTasks = getTasksForDate(date);
              const isToday = date.getTime() === today.getTime();

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="space-y-2"
                >
                  {/* Day header */}
                  <div className="flex items-center gap-3 px-2 py-2">
                    <div className={cn(
                      "flex items-center gap-2",
                      isToday && "text-primary"
                    )}>
                      <Calendar className="size-4" />
                      <span className="font-semibold">{getDayLabel(date, idx)}</span>
                      <span className="text-muted-foreground text-sm">
                        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    {dayTasks.length > 0 && (
                      <Badge variant="secondary" className="text-[10px] h-5">
                        {dayTasks.length}
                      </Badge>
                    )}
                  </div>

                  {/* Tasks */}
                  <div className="space-y-1 pl-6">
                    <AnimatePresence mode="popLayout">
                      {dayTasks.map(task => (
                        <motion.div
                          key={task.id}
                          layout
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                        >
                          <TaskCard
                            task={task}
                            onClick={() => setSelectedTask(task)}
                            onToggle={handleToggle}
                            onDelete={handleDelete}
                            onArchive={handleArchive}
                            onAddToMyDay={handleAddToMyDay}
                            showPriority
                            compact
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {dayTasks.length === 0 && (
                      <div className="text-sm text-muted-foreground py-2 px-3">
                        No tasks scheduled
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}

            {/* No tasks message */}
            {totalTasks === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Icon icon="solar:calendar-date-outline" className="size-10 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-1">No upcoming tasks</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Tasks with due dates in the next 7 days will appear here
                </p>
              </motion.div>
            )}
          </div>
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
