'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { useBoard, useTasks, useTags, useCreateTask, useUpdateTaskMutation, useDeleteTaskMutation, Task } from '@/hooks/use-tasks';
import { Icon } from '@iconify/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MoreHorizontal, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  LayoutGrid, 
  List, 
  Calendar as CalendarIcon,
  Table2,
  Loader2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ReusableMasterDetail } from '@/components/shared/master-view/reusable-master-detail';
import { TaskCard } from '@/components/features/tasks/task-card';
import { TaskDetailDialog } from '@/components/features/tasks/task-detail-dialog';
import { QuickAddTask } from '@/components/features/tasks/quick-add-task';
import { KanbanBoard, KanbanColumn } from '@/components/features/tasks/kanban-board';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

// View types
type BoardView = 'KANBAN' | 'LIST' | 'CALENDAR' | 'TABLE';

// Board Calendar View Component
function BoardCalendarView({
  tasks,
  onTaskClick,
  onAddTask,
}: {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask: (date: Date) => void;
}) {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  
  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();
    const days: Date[] = [];
    
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push(new Date(year, month, -i));
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i));
    }
    return days;
  };

  const calendarDays = getCalendarDays();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getEventsForDate = (date: Date) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      taskDate.setHours(0, 0, 0, 0);
      const checkDate = new Date(date);
      checkDate.setHours(0, 0, 0, 0);
      return taskDate.getTime() === checkDate.getTime();
    });
  };

  return (
    <div className="flex-1 flex flex-col p-6 overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <h2 className="text-lg font-semibold min-w-[180px] text-center">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
        <Button variant="outline" onClick={() => setCurrentDate(new Date())}>
          Today
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 border rounded-xl overflow-hidden">
        {/* Days header */}
        <div className="grid grid-cols-7 bg-muted/30 border-b">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2 border-r last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar cells */}
        <div className="grid grid-cols-7 grid-rows-6 h-[calc(100%-32px)]">
          {calendarDays.map((date, idx) => {
            const isCurrentMonth = date.getMonth() === currentDate.getMonth();
            const checkDate = new Date(date);
            checkDate.setHours(0, 0, 0, 0);
            const isToday = checkDate.getTime() === today.getTime();
            const dayEvents = getEventsForDate(date);

            return (
              <div
                key={idx}
                className={cn(
                  "border-r border-b last:border-r-0 p-1 min-h-[100px] cursor-pointer hover:bg-muted/30 transition-colors",
                  !isCurrentMonth && "bg-muted/20 text-muted-foreground/50"
                )}
                onClick={() => onAddTask(date)}
              >
                <span className={cn(
                  "inline-flex items-center justify-center size-6 text-xs font-medium rounded-full mb-1",
                  isToday && "bg-primary text-primary-foreground"
                )}>
                  {date.getDate()}
                </span>
                <div className="space-y-0.5">
                  {dayEvents.slice(0, 3).map(event => (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onTaskClick(event);
                      }}
                      className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded truncate cursor-pointer",
                        "hover:ring-2 hover:ring-primary/30",
                        event.completed && "line-through opacity-60"
                      )}
                      style={{ 
                        backgroundColor: event.listColor || '#3b82f6', 
                        color: '#fff' 
                      }}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-[10px] text-muted-foreground px-1.5">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Board Table View Component
function BoardTableView({
  tasks,
  onTaskClick,
  onToggle,
}: {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onToggle: (id: string, completed: boolean) => void;
}) {
  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="bg-card rounded-xl border overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-muted/30 border-b text-xs font-medium text-muted-foreground uppercase">
          <div className="col-span-1">Status</div>
          <div className="col-span-5">Task</div>
          <div className="col-span-2">Due Date</div>
          <div className="col-span-2">Priority</div>
          <div className="col-span-2">Actions</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-border">
          {tasks.map(task => (
            <div
              key={task.id}
              onClick={() => onTaskClick(task)}
              className="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-muted/30 cursor-pointer transition-colors"
            >
              <div className="col-span-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggle(task.id, !task.completed);
                  }}
                  className={cn(
                    "size-5 rounded-full border-2 flex items-center justify-center transition-all",
                    "border-muted-foreground/30 hover:border-primary",
                    task.completed && "bg-primary border-primary"
                  )}
                >
                  {task.completed && (
                    <Icon icon="solar:check-read-linear" className="size-3 text-primary-foreground" />
                  )}
                </button>
              </div>
              <div className="col-span-5">
                <span className={cn(
                  "text-sm font-medium",
                  task.completed && "line-through text-muted-foreground"
                )}>
                  {task.title}
                </span>
              </div>
              <div className="col-span-2 text-sm text-muted-foreground">
                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
              </div>
              <div className="col-span-2">
                {task.priority && task.priority !== 'NONE' && (
                  <Badge variant="outline" className={cn(
                    "text-xs",
                    task.priority === 'HIGH' && "border-red-500 text-red-500",
                    task.priority === 'MEDIUM' && "border-amber-500 text-amber-500",
                    task.priority === 'LOW' && "border-blue-500 text-blue-500"
                  )}>
                    {task.priority}
                  </Badge>
                )}
              </div>
              <div className="col-span-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="size-8">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}

          {tasks.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              <Icon icon="solar:checklist-minimalistic-outline" className="size-12 mx-auto mb-3 opacity-30" />
              <p>No tasks yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BoardDetailPage() {
  const params = useParams();
  const boardId = params.id as string;

  const { board, isLoading: isBoardLoading } = useBoard(boardId);
  const { tasks, isLoading: isTasksLoading, mutate } = useTasks({ boardId });
  const { tags } = useTags();

  // Mutation hooks
  const { createTask } = useCreateTask();
  const { updateTask } = useUpdateTaskMutation();
  const { deleteTask } = useDeleteTaskMutation();

  // Local state
  const [localTasks, setLocalTasks] = React.useState<Task[]>([]);
  const [currentView, setCurrentView] = React.useState<BoardView>('KANBAN');
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);

  // Sync tasks
  React.useEffect(() => {
    if (tasks) {
      setLocalTasks(tasks);
    }
  }, [tasks]);

  // Update view when board loads
  React.useEffect(() => {
    if (board?.defaultView) {
      setCurrentView(board.defaultView as BoardView);
    }
  }, [board]);

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
  const handleAddTask = async (data?: any) => {
    try {
      await createTask({
        title: data?.title || 'New Task',
        boardId: boardId,
        dueDate: data?.dueDate,
        status: data?.status || 'TODO',
        priority: data?.priority || 'NONE',
      });
      mutate();
      toast.success('Task created');
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  const handleAddTaskWithStatus = async (columnId: string, title: string) => {
    try {
      await createTask({
        title,
        boardId: boardId,
        status: columnId as any,
        priority: 'NONE',
      });
      mutate();
      toast.success('Task created');
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  const handleUpdateTask = async (id: string, data: any) => {
    try {
      await updateTask({ id, payload: data });
      mutate();
    } catch (error) {
      toast.error('Failed to update task');
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

  const handleDeleteTask = async (id: string) => {
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
    setLocalTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, status: targetColumnId as Task['status'] } : t
    ));

    try {
      await updateTask({ id: taskId, payload: { status: targetColumnId as Task['status'] } });
      mutate();
    } catch (error) {
      toast.error('Failed to move task');
      mutate();
    }
  };

  const handleTaskReorder = async (columnId: string, reorderedTasks: Task[]) => {
    // Update local state with new positions
    const taskIdsInColumn = new Set(reorderedTasks.map(t => t.id));
    setLocalTasks(prev => {
      const otherTasks = prev.filter(t => !taskIdsInColumn.has(t.id));
      return [...otherTasks, ...reorderedTasks.map((t, idx) => ({ ...t, position: idx }))];
    });

    // Could add API call to persist positions
  };

  if (isBoardLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  const boardName = board?.name || 'Board';

  // Group tasks by status for Kanban
  const kanbanColumns: KanbanColumn[] = [
    {
      id: 'TODO',
      title: 'To Do',
      color: '#64748b',
      tasks: localTasks.filter(t => t.status === 'TODO' || (!t.status && !t.completed)),
    },
    {
      id: 'IN_PROGRESS',
      title: 'In Progress',
      color: '#3b82f6',
      tasks: localTasks.filter(t => t.status === 'IN_PROGRESS'),
    },
    {
      id: 'COMPLETED',
      title: 'Done',
      color: '#22c55e',
      tasks: localTasks.filter(t => t.status === 'COMPLETED' || t.completed),
    },
  ];

  // View icons
  const viewIcons = {
    KANBAN: LayoutGrid,
    LIST: List,
    CALENDAR: CalendarIcon,
    TABLE: Table2,
  };

  // Render logic based on view type
  const renderView = () => {
    switch (currentView) {
      case 'LIST':
        return (
          <ReusableMasterDetail 
            title={boardName}
            data={localTasks || []}
            columns={[{ key: 'title', header: 'Task', accessor: 'title' }]}
            loading={isTasksLoading}
            onAdd={handleAddTask}
            onUpdate={handleUpdateTask}
            onDelete={handleDeleteTask}
            onToggle={handleToggle}
            onArchive={handleArchive}
            onAddToMyDay={handleAddToMyDay}
            availableTags={tags}
            className="flex-1 mt-0 h-full"
          />
        );
      
      case 'TABLE':
        return (
          <>
            <div className="px-6 pt-4">
              <QuickAddTask onAdd={(data) => handleAddTask(data)} />
            </div>
            <BoardTableView
              tasks={localTasks || []}
              onTaskClick={setSelectedTask}
              onToggle={handleToggle}
            />
          </>
        );

      case 'CALENDAR':
        return (
          <BoardCalendarView
            tasks={localTasks || []}
            onTaskClick={setSelectedTask}
            onAddTask={(date) => handleAddTask({ title: 'New Task', dueDate: date.toISOString() })}
          />
        );

      case 'KANBAN':
      default:
        return (
          <KanbanBoard
            columns={kanbanColumns}
            onTaskMove={handleTaskMove}
            onTaskReorder={handleTaskReorder}
            onTaskClick={setSelectedTask}
            onTaskToggle={handleToggle}
            onAddTask={handleAddTaskWithStatus}
          />
        );
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-background/50 overflow-hidden">
      {/* Header */}
      <div className="flex-none p-6 border-b">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
             <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
               <Icon icon={board?.icon || "solar:kanban-board-outline"} className="size-6" style={{ color: board?.color }} />
             </div>
             <div>
               <h1 className="text-2xl font-bold tracking-tight">{boardName}</h1>
               <p className="text-sm text-muted-foreground capitalize">{currentView.toLowerCase()} View</p>
             </div>
            </div>

            {/* View Switcher */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-muted/50 p-1 rounded-lg">
                {(['KANBAN', 'LIST', 'TABLE', 'CALENDAR'] as BoardView[]).map((v) => {
                  const ViewIcon = viewIcons[v];
                  return (
                    <Button
                      key={v}
                      variant={currentView === v ? "default" : "ghost"}
                      size="sm"
                      className={cn(
                        "gap-2 rounded-md text-xs h-8",
                        currentView === v && "shadow-sm"
                      )}
                      onClick={() => setCurrentView(v)}
                    >
                      <ViewIcon className="size-4" />
                      <span className="hidden sm:inline capitalize">{v.toLowerCase()}</span>
                    </Button>
                  );
                })}
              </div>
            </div>
        </div>
      </div>
      
      {renderView()}

      {/* Task Detail Dialog */}
      <TaskDetailDialog
        task={selectedTask}
        open={!!selectedTask}
        onOpenChange={(open) => !open && setSelectedTask(null)}
        onUpdate={handleUpdateTask}
        onDelete={handleDeleteTask}
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
