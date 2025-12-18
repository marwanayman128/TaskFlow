'use client';

import * as React from 'react';
import { useSession } from 'next-auth/react';
import { useLocale, useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Icon } from '@iconify/react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  Sparkles,
  Sun,
  CloudSun,
  Moon,
  Sunrise,
  Loader2,
  ChevronDown,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DynamicAnimation } from '@/components/ui/dynamic-animation';
import { useTodayTasks, useCreateTask, useUpdateTaskMutation, useDeleteTaskMutation, useTags, Task } from '@/hooks/use-tasks';
import { TaskCard } from '@/components/features/tasks/task-card';
import { TaskDetailDialog } from '@/components/features/tasks/task-detail-dialog';
import { QuickAddTask } from '@/components/features/tasks/quick-add-task';
import { toast } from 'sonner';

// Motivational quotes for My Day
const MOTIVATIONAL_QUOTES = [
  "Be so good no one can ignore you",
  "The only way to do great work is to love what you do",
  "Success is not final, failure is not fatal",
  "Every accomplishment starts with a decision to try",
  "Your limitation—it's only your imagination",
  "Push yourself, because no one else is going to do it for you",
  "Great things never come from comfort zones",
  "Dream it. Wish it. Do it.",
  "Success doesn't just find you. You have to go out and get it",
  "The harder you work for something, the greater you'll feel when you achieve it",
];

// Get time-based icon
function getTimeIcon(hour: number) {
  if (hour >= 5 && hour < 12) return <Sunrise className="size-5 text-amber-500" />;
  if (hour >= 12 && hour < 17) return <Sun className="size-5 text-yellow-500" />;
  if (hour >= 17 && hour < 21) return <CloudSun className="size-5 text-orange-500" />;
  return <Moon className="size-5 text-indigo-400" />;
}

// Calendar Events Widget
function CalendarWidget() {
  const today = new Date();
  const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'short' });
  const dayOfMonth = today.getDate();
  const month = today.toLocaleDateString('en-US', { month: 'long' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent"
    >
      <div className="text-center">
        <div className="text-xs font-medium text-muted-foreground uppercase">{dayOfWeek}</div>
        <div className="text-3xl font-bold text-primary">{dayOfMonth}</div>
        <div className="text-xs text-muted-foreground">{month}</div>
      </div>
      <div className="flex-1">
        <p className="text-sm text-muted-foreground">
          You have no events scheduled for today
        </p>
      </div>
    </motion.div>
  );
}

export default function MyDayPage() {
  const { data: session } = useSession();
  const t = useTranslations('dashboard');
  const locale = useLocale();
  const isArabic = locale.startsWith('ar');
  
  // Fetch today's tasks from API
  const { tasks: apiTasks, isLoading, mutate } = useTodayTasks();
  const { tags } = useTags();
  const { createTask, isCreating } = useCreateTask();
  const { updateTask } = useUpdateTaskMutation();
  const { deleteTask } = useDeleteTaskMutation();
  
  const [currentTime, setCurrentTime] = React.useState(new Date());
  const [quote, setQuote] = React.useState("");
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  const [showCompleted, setShowCompleted] = React.useState(true);
  
  // Local tasks state for optimistic updates
  const [localTasks, setLocalTasks] = React.useState<Task[]>([]);

  React.useEffect(() => {
    setQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
  }, []);

  React.useEffect(() => {
    if (apiTasks.length > 0) {
      setLocalTasks(apiTasks);
    }
  }, [apiTasks]);

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Sync selectedTask with updated tasks data (to show newly added subtasks)
  React.useEffect(() => {
    if (selectedTask && apiTasks) {
      const updatedTask = apiTasks.find((t: Task) => t.id === selectedTask.id);
      if (updatedTask) {
        setSelectedTask(updatedTask);
      }
    }
  }, [apiTasks]);

  const userName = session?.user?.name || session?.user?.email?.split('@')[0] || 'there';
  const hour = currentTime.getHours();

  const getTimeGreeting = () => {
    if (hour >= 5 && hour < 12) return t('greeting.morning');
    if (hour >= 12 && hour < 17) return t('greeting.afternoon');
    if (hour >= 17 && hour < 21) return t('greeting.evening');
    return t('greeting.night');
  };

  // Handlers
  const handleAddTask = async (data: any) => {
    try {
      // Optimistic update
      const tempTask: Task = {
        id: `temp-${Date.now()}`,
        title: data.title,
        completed: false,
        priority: 'NONE',
        position: 0,
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setLocalTasks(prev => [tempTask, ...prev]);

      // Create via API
      await createTask({ 
        title: data.title, 
        priority: data.priority || 'NONE',
        listId: data.listId,
        tags: data.tags || [],
        dueDate: data.dueDate?.toISOString() || new Date().toISOString(),
      });
      
      mutate();
      toast.success('Task created');
    } catch (error) {
      console.error('Failed to create task:', error);
      mutate();
      toast.error('Failed to create task');
    }
  };

  const handleToggle = async (id: string, completed: boolean) => {
    // Optimistic update
    setLocalTasks(prev =>
      prev.map(task =>
        task.id === id ? { ...task, completed, status: completed ? 'COMPLETED' : 'TODO' } : task
      )
    );

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
    setLocalTasks(prev => prev.filter(task => task.id !== id));

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
    // Already on My Day, so this could set a specific time
    toast.info('Task is already in My Day');
  };

  const incompleteTasks = localTasks.filter(t => !t.completed && t.status !== 'COMPLETED');
  const completedTasks = localTasks.filter(t => t.completed || t.status === 'COMPLETED');

  return (
    <div className="h-full flex flex-col bg-background/50">
      {/* Header */}
      <div className="flex-none p-8 pb-4">
        <div className="w-full space-y-8">
          {/* Greeting Section (New Design) */}
          <section className="relative z-10 space-y-6">
            <div className="relative rounded-3xl border bg-gradient-to-br from-primary/10 via-background to-primary/10 p-6 shadow-sm overflow-hidden">
              {/* Animation bottom right absolute */}
              <div
                className={cn(
                  'hidden md:block w-64 absolute top-1/2 -translate-y-1/2 pointer-events-none',
                  isArabic ? 'left-6' : 'right-6'
                )}
              >
                <DynamicAnimation animationUrl="/animations/woman-sitting-with-calendar-illustration-2025-10-20-23-53-12-utc.json" />
              </div>

              <div className="flex flex-wrap gap-6 relative z-10">
                <div className="flex min-w-60 flex-1 flex-col gap-3">
                  <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <Sparkles className="h-4 w-4 text-primary" />
                    {t('overview')}
                  </div>

                  <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-bold tracking-tight">
                      {getTimeGreeting()}
                    </h2>
                    <Badge
                      variant="outline"
                      className="rounded-full bg-primary/10 text-primary border-primary/20 font-mono"
                      suppressHydrationWarning
                    >
                      {currentTime.toLocaleTimeString(locale, {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Welcome back, {userName}!</p>
                    <p className="text-xs text-muted-foreground italic">"{quote}"</p>
                  </div>

                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date().toLocaleString(locale, {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Button variant="outline" size="sm" className="rounded-full h-8 bg-background/50 backdrop-blur-sm">
                      <Clock className="mr-2 h-3.5 w-3.5" />
                      {t('quickRanges.today')}
                    </Button>
                    <Button variant="ghost" size="sm" className="rounded-full h-8">
                      {t('quickRanges.week')}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main Input Area */}
            <div className="md:col-span-2 space-y-6">
              {/* Quick Add Task */}
              <QuickAddTask 
                onAdd={handleAddTask} 
                isCreating={isCreating} 
              />
              
              <div className="pl-2">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="size-4 text-primary" />
                  Today's Focus
                  <span className="text-sm font-normal text-muted-foreground">
                    ({incompleteTasks.length} tasks)
                  </span>
                </h2>
                
                {/* Task List */}
                <div className="space-y-2">
                  {isLoading && localTasks.length === 0 ? (
                    <div className="py-10 text-center text-muted-foreground">
                      <Loader2 className="size-6 animate-spin mx-auto mb-2" />
                      Loading your day...
                    </div>
                  ) : localTasks.length === 0 ? (
                    <div className="py-10 text-center space-y-3 bg-muted/20 rounded-2xl border border-dashed border-border/50">
                      <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary">
                        <Icon icon="solar:checklist-minimalistic-outline" className="size-6" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium">All caught up!</p>
                        <p className="text-sm text-muted-foreground">Enjoy your free time or add a new task</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Incomplete Tasks */}
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
                              showDueDate
                              showPriority
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      {/* Completed Tasks */}
                      {completedTasks.length > 0 && (
                        <div className="pt-6 mt-6 border-t border-border/50">
                          <button
                            onClick={() => setShowCompleted(!showCompleted)}
                            className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-4 hover:text-foreground transition-colors"
                          >
                            <CheckCircle2 className="size-4" />
                            Completed
                            <span className="bg-muted px-1.5 py-0.5 rounded-full text-xs">{completedTasks.length}</span>
                            <ChevronDown className={cn("size-3 transition-transform", !showCompleted && "-rotate-90")} />
                          </button>
                          
                          {showCompleted && (
                            <div className="space-y-2 opacity-60">
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
                                    />
                                  </motion.div>
                                ))}
                              </AnimatePresence>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Side Widgets */}
            <div className="space-y-6">
              <CalendarWidget />
            </div>
          </div>
        </div>
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
