'use client';

import * as React from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Icon } from '@iconify/react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Loader2,
  X,
} from 'lucide-react';
import { useTasks, useCreateTask, useUpdateTaskMutation, useDeleteTaskMutation, useTags, Task } from '@/hooks/use-tasks';
import { TaskCard } from '@/components/features/tasks/task-card';
import { TaskDetailDialog } from '@/components/features/tasks/task-detail-dialog';
import { QuickAddTask } from '@/components/features/tasks/quick-add-task';
import { DragToCreateCalendar } from '@/components/features/tasks/drag-to-create-calendar';
import { toast } from 'sonner';

// Days of week (Google Calendar style - starts with Sunday)
const DAYS_OF_WEEK = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

// View types
type CalendarView = 'month' | 'week' | 'day';

// Calendar Day Cell - Google Style
function CalendarDay({ 
  date, 
  isCurrentMonth, 
  isToday, 
  isSelected,
  events,
  onClick,
  onEventClick,
  onAddTask,
}: { 
  date: Date; 
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  events: Task[];
  onClick: (date: Date) => void;
  onEventClick: (task: Task) => void;
  onAddTask: (date: Date) => void;
}) {
  const [isHovered, setIsHovered] = React.useState(false);
  const maxVisible = 3;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick(date)}
      className={cn(
        "relative flex flex-col min-h-[120px] border-r border-b border-border/40 p-1 transition-all cursor-pointer",
        "hover:bg-muted/30",
        !isCurrentMonth && "bg-muted/20",
        isSelected && "bg-primary/5 ring-2 ring-primary/30 ring-inset"
      )}
    >
      {/* Day number header */}
      <div className="flex items-center justify-between px-1 mb-1">
        <span className={cn(
          "flex items-center justify-center size-7 text-sm font-medium rounded-full transition-colors",
          isToday && "bg-primary text-primary-foreground",
          !isToday && !isCurrentMonth && "text-muted-foreground/50",
          !isToday && isCurrentMonth && "text-foreground"
        )}>
          {date.getDate()}
        </span>
        
        {/* Add button on hover */}
        <AnimatePresence>
          {isHovered && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={(e) => {
                e.stopPropagation();
                onAddTask(date);
              }}
              className="size-6 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center text-primary transition-colors"
            >
              <Plus className="size-3" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Events */}
      <div className="flex-1 space-y-0.5 overflow-hidden">
        {events.slice(0, maxVisible).map((event) => (
          <button
            key={event.id}
            onClick={(e) => {
              e.stopPropagation();
              onEventClick(event);
            }}
            className={cn(
              "w-full text-left text-[11px] px-2 py-1 rounded-md truncate transition-all",
              "hover:opacity-80 hover:ring-2 hover:ring-primary/30",
              event.completed && "line-through opacity-60"
            )}
            style={{ 
              backgroundColor: event.listColor || '#3b82f6',
              color: '#fff'
            }}
          >
            {event.title}
          </button>
        ))}
        {events.length > maxVisible && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onClick(date);
            }}
            className="text-[10px] text-primary font-medium px-2 hover:underline"
          >
            +{events.length - maxVisible} more
          </button>
        )}
      </div>
    </div>
  );
}

// Quick Add Task Modal with proper QuickAddTask component
function QuickAddModal({
  date,
  onClose,
  onAdd,
}: {
  date: Date;
  onClose: () => void;
  onAdd: (data: any) => Promise<void>;
}) {
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card rounded-2xl shadow-2xl border border-border/50 w-full max-w-md overflow-hidden"
      >
        <div className="p-4 border-b border-border/40 flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Add Task</h3>
            <p className="text-xs text-muted-foreground">{formattedDate}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="size-8">
            <X className="size-4" />
          </Button>
        </div>
        <div className="p-4">
          <QuickAddTask 
            onAdd={(data) => {
              onAdd({ ...data, dueDate: date });
              onClose();
              return Promise.resolve();
            }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

// Selected Date Sidebar Panel (Google Style)
function DatePanel({ 
  date, 
  events,
  onClose,
  onTaskClick,
  onAddTask,
  onToggle,
  onDelete,
  onArchive,
  onAddToMyDay,
}: { 
  date: Date; 
  events: Task[];
  onClose: () => void;
  onTaskClick: (task: Task) => void;
  onAddTask: (data: any) => Promise<void>;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onAddToMyDay: (id: string) => void;
}) {
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="w-80 border-l border-border/40 bg-card/50 backdrop-blur-sm flex flex-col"
    >
      <div className="p-4 border-b border-border/40 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">{date.getDate()}</h3>
          <p className="text-sm text-muted-foreground">{formattedDate}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="size-8">
          <X className="size-4" />
        </Button>
      </div>

      <div className="p-4">
        <QuickAddTask 
          onAdd={(data) => {
            return onAddTask({ ...data, dueDate: date });
          }}
        />
      </div>

      <div className="flex-1 overflow-auto px-4 pb-4 space-y-2">
        {events.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <Icon icon="solar:calendar-outline" className="size-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No tasks for this day</p>
            <p className="text-xs text-muted-foreground/70">Add a task using the form above</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {events.map(event => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <TaskCard
                  task={event}
                  onClick={() => onTaskClick(event)}
                  onToggle={onToggle}
                  onDelete={onDelete}
                  onArchive={onArchive}
                  onAddToMyDay={onAddToMyDay}
                  compact
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}

// Mini Calendar for sidebar navigation
function MiniCalendar({
  currentDate,
  onDateSelect,
  selectedDate,
}: {
  currentDate: Date;
  onDateSelect: (date: Date) => void;
  selectedDate: Date | null;
}) {
  const [viewDate, setViewDate] = React.useState(currentDate);

  const getCalendarDays = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
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

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">
          {viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </span>
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="size-6"
            onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
          >
            <ChevronLeft className="size-3" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="size-6"
            onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
          >
            <ChevronRight className="size-3" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} className="text-[10px] text-muted-foreground py-1">{d}</div>
        ))}
        {getCalendarDays().map((date, idx) => {
          const isCurrentMonth = date.getMonth() === viewDate.getMonth();
          const checkDate = new Date(date);
          checkDate.setHours(0, 0, 0, 0);
          const isToday = checkDate.getTime() === today.getTime();
          const isSelected = selectedDate && checkDate.getTime() === new Date(selectedDate.setHours(0,0,0,0)).getTime();

          return (
            <button
              key={idx}
              onClick={() => onDateSelect(date)}
              className={cn(
                "size-6 text-[11px] rounded-full transition-colors",
                !isCurrentMonth && "text-muted-foreground/40",
                isToday && "bg-primary text-primary-foreground",
                isSelected && !isToday && "bg-primary/20 text-primary",
                !isToday && !isSelected && "hover:bg-muted"
              )}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const { data: session } = useSession();
  
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  const [view, setView] = React.useState<CalendarView>('month');
  const [quickAddDate, setQuickAddDate] = React.useState<Date | null>(null);

  // Fetch all tasks
  const { tasks: apiTasks, isLoading, mutate } = useTasks();
  const { tags } = useTags();
  const { createTask } = useCreateTask();
  const { updateTask } = useUpdateTaskMutation();
  const { deleteTask } = useDeleteTaskMutation();

  const [localTasks, setLocalTasks] = React.useState<Task[]>([]);

  React.useEffect(() => {
    setLocalTasks(apiTasks);
  }, [apiTasks]);

  // Sync selectedTask with updated tasks data (to show newly added subtasks)
  React.useEffect(() => {
    if (selectedTask && apiTasks) {
      const updatedTask = apiTasks.find((t: Task) => t.id === selectedTask.id);
      if (updatedTask) {
        setSelectedTask(updatedTask);
      }
    }
  }, [apiTasks]);

  // Handlers
  const handleAddTask = async (data: any) => {
    try {
      await createTask({
        title: data.title,
        dueDate: data.dueDate?.toISOString() || new Date().toISOString(),
        priority: data.priority || 'NONE',
        listId: data.listId,
        tags: data.tags,
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

  // Get calendar days for month view
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
    return localTasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      taskDate.setHours(0, 0, 0, 0);
      const checkDate = new Date(date);
      checkDate.setHours(0, 0, 0, 0);
      return taskDate.getTime() === checkDate.getTime();
    });
  };

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const currentMonthYear = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="flex h-full bg-background">
      {/* Left Sidebar - Mini Calendar & Actions (Google Style) */}
      <div className="w-64 border-r border-border/40 flex flex-col bg-card/30">
        {/* Create Button */}
        <div className="p-4">
          <Button 
            className="w-full rounded-2xl gap-2 shadow-lg h-12 text-base"
            onClick={() => setQuickAddDate(selectedDate || new Date())}
          >
            <Plus className="size-5" />
            Create
          </Button>
        </div>

        {/* Mini Calendar */}
        <MiniCalendar
          currentDate={currentDate}
          onDateSelect={(date) => {
            setCurrentDate(new Date(date.getFullYear(), date.getMonth(), 1));
            setSelectedDate(date);
          }}
          selectedDate={selectedDate}
        />

        {/* Quick Stats */}
        <div className="mt-auto p-4 border-t border-border/40">
          <div className="text-xs text-muted-foreground space-y-2">
            <div className="flex justify-between">
              <span>Total Tasks</span>
              <span className="font-medium text-foreground">{localTasks.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Due Today</span>
              <span className="font-medium text-foreground">{getEventsForDate(today).length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Calendar Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex-shrink-0 px-6 py-3 border-b border-border/40 bg-card/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Navigation */}
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="rounded-lg"
                  onClick={goToToday}
                >
                  Today
                </Button>
                <div className="flex items-center">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="size-8 rounded-full"
                    onClick={() => navigateMonth(-1)}
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="size-8 rounded-full"
                    onClick={() => navigateMonth(1)}
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
              
              {/* Month Title */}
              <h1 className="text-xl font-semibold">{currentMonthYear}</h1>
            </div>
            
            {/* View Switcher */}
            <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
              {(['day', 'week', 'month'] as CalendarView[]).map((v) => (
                <Button
                  key={v}
                  variant={view === v ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "rounded-md capitalize text-xs h-7",
                    view === v && "shadow-sm"
                  )}
                  onClick={() => setView(v)}
                >
                  {v}
                </Button>
              ))}
            </div>
          </div>
        </header>

        {/* Calendar Grid */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col overflow-auto">
            {isLoading && localTasks.length === 0 && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="size-8 animate-spin text-primary" />
              </div>
            )}

            {/* Week View - Drag to Create Calendar */}
            {view === 'week' && (
              <DragToCreateCalendar
                currentDate={currentDate}
                events={localTasks.map(task => ({
                  id: task.id,
                  title: task.title,
                  start: task.dueDate ? new Date(task.dueDate) : new Date(),
                  end: task.dueDate 
                    ? new Date(new Date(task.dueDate).getTime() + 60 * 60 * 1000) 
                    : new Date(Date.now() + 60 * 60 * 1000),
                  color: task.listColor || '#3b82f6',
                  task,
                }))}
                onEventClick={(event) => setSelectedTask(event.task || null)}
                onCreateEvent={(start, end) => {
                  // Open quick add modal with the selected start time
                  setQuickAddDate(start);
                }}
              />
            )}

            {/* Day View - Single day with time grid */}
            {view === 'day' && (
              <DragToCreateCalendar
                currentDate={currentDate}
                events={localTasks.map(task => ({
                  id: task.id,
                  title: task.title,
                  start: task.dueDate ? new Date(task.dueDate) : new Date(),
                  end: task.dueDate 
                    ? new Date(new Date(task.dueDate).getTime() + 60 * 60 * 1000) 
                    : new Date(Date.now() + 60 * 60 * 1000),
                  color: task.listColor || '#3b82f6',
                  task,
                }))}
                onEventClick={(event) => setSelectedTask(event.task || null)}
                onCreateEvent={(start, end) => {
                  // Open quick add modal with the selected start time
                  setQuickAddDate(start);
                }}
              />
            )}

            {/* Month View */}
            {view === 'month' && (
              <>
                {/* Days of week header */}
                <div className="grid grid-cols-7 border-b border-border/40 bg-muted/20 sticky top-0 z-10">
                  {DAYS_OF_WEEK.map(day => (
                    <div 
                      key={day} 
                      className="text-center text-xs font-medium text-muted-foreground py-3 border-r border-border/40 last:border-r-0"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="flex-1 grid grid-cols-7 auto-rows-fr">
                  {calendarDays.map((date, idx) => {
                    const checkDate = new Date(date);
                    checkDate.setHours(0, 0, 0, 0);
                    const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                    const isToday = checkDate.getTime() === today.getTime();
                    const isSelected = selectedDate && checkDate.getTime() === new Date(selectedDate).setHours(0,0,0,0);
                    const dayEvents = getEventsForDate(date);

                    return (
                      <CalendarDay
                        key={idx}
                        date={date}
                        isCurrentMonth={isCurrentMonth}
                        isToday={isToday}
                        isSelected={!!isSelected}
                        events={dayEvents}
                        onClick={setSelectedDate}
                        onEventClick={setSelectedTask}
                        onAddTask={setQuickAddDate}
                      />
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Date Panel Sidebar */}
          <AnimatePresence>
            {selectedDate && view === 'month' && (
              <DatePanel
                date={selectedDate}
                events={getEventsForDate(selectedDate)}
                onClose={() => setSelectedDate(null)}
                onTaskClick={setSelectedTask}
                onAddTask={handleAddTask}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onArchive={handleArchive}
                onAddToMyDay={handleAddToMyDay}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Quick Add Modal */}
      <AnimatePresence>
        {quickAddDate && (
          <QuickAddModal
            date={quickAddDate}
            onClose={() => setQuickAddDate(null)}
            onAdd={handleAddTask}
          />
        )}
      </AnimatePresence>

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
