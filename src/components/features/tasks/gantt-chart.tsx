'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { 
  addDays, 
  differenceInDays, 
  format, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
  isWeekend,
} from 'date-fns';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Calendar } from 'lucide-react';

export interface GanttTask {
  id: string;
  title: string;
  startDate?: Date | string;
  dueDate?: Date | string;
  status: string;
  priority: string;
  assignee?: {
    name: string;
    avatar?: string;
  };
  progress?: number; // 0-100
  dependencies?: string[]; // Task IDs
  color?: string;
}

interface GanttChartProps {
  tasks: GanttTask[];
  onTaskClick?: (task: GanttTask) => void;
  startDate?: Date;
  endDate?: Date;
}

const PRIORITY_COLORS: Record<string, string> = {
  HIGH: '#EF4444',
  MEDIUM: '#F59E0B',
  LOW: '#22C55E',
  NONE: '#6B7280',
};

const STATUS_COLORS: Record<string, string> = {
  TODO: '#6366F1',
  IN_PROGRESS: '#F59E0B',
  COMPLETED: '#22C55E',
};

const DAY_WIDTH = 40;
const ROW_HEIGHT = 48;
const HEADER_HEIGHT = 80;

export function GanttChart({ 
  tasks, 
  onTaskClick,
  startDate: propStartDate,
  endDate: propEndDate,
}: GanttChartProps) {
  const [viewMode, setViewMode] = React.useState<'week' | 'month' | 'quarter'>('month');
  const [currentDate, setCurrentDate] = React.useState(new Date());
  
  // Calculate date range
  const getDateRange = () => {
    switch (viewMode) {
      case 'week':
        return {
          start: startOfWeek(currentDate),
          end: endOfWeek(addDays(currentDate, 13)),
        };
      case 'month':
        return {
          start: startOfMonth(currentDate),
          end: endOfMonth(addDays(currentDate, 45)),
        };
      case 'quarter':
        return {
          start: startOfMonth(currentDate),
          end: endOfMonth(addDays(currentDate, 90)),
        };
      default:
        return {
          start: propStartDate || startOfMonth(currentDate),
          end: propEndDate || endOfMonth(addDays(currentDate, 30)),
        };
    }
  };

  const { start: rangeStart, end: rangeEnd } = getDateRange();
  const days = eachDayOfInterval({ start: rangeStart, end: rangeEnd });
  const totalWidth = days.length * DAY_WIDTH;

  // Filter tasks with dates
  const tasksWithDates = tasks.filter(t => t.startDate || t.dueDate);

  // Navigation
  const navigatePrev = () => {
    const amount = viewMode === 'week' ? 7 : viewMode === 'month' ? 30 : 90;
    setCurrentDate(addDays(currentDate, -amount));
  };

  const navigateNext = () => {
    const amount = viewMode === 'week' ? 7 : viewMode === 'month' ? 30 : 90;
    setCurrentDate(addDays(currentDate, amount));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get task position and width
  const getTaskPosition = (task: GanttTask) => {
    const taskStart = task.startDate ? new Date(task.startDate) : task.dueDate ? new Date(task.dueDate) : null;
    const taskEnd = task.dueDate ? new Date(task.dueDate) : task.startDate ? new Date(task.startDate) : null;
    
    if (!taskStart || !taskEnd) return null;

    const startOffset = Math.max(0, differenceInDays(taskStart, rangeStart));
    const duration = Math.max(1, differenceInDays(taskEnd, taskStart) + 1);
    const endOffset = startOffset + duration;

    // Check if task is visible in current range
    if (endOffset < 0 || startOffset > days.length) return null;

    return {
      left: startOffset * DAY_WIDTH,
      width: duration * DAY_WIDTH,
    };
  };

  // Group days by month for header
  const monthGroups = React.useMemo(() => {
    const groups: { month: string; days: Date[] }[] = [];
    let currentMonth = '';
    
    days.forEach(day => {
      const month = format(day, 'MMMM yyyy');
      if (month !== currentMonth) {
        currentMonth = month;
        groups.push({ month, days: [day] });
      } else {
        groups[groups.length - 1].days.push(day);
      }
    });
    
    return groups;
  }, [days]);

  return (
    <div className="flex flex-col h-full bg-background rounded-xl border overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={navigatePrev}>
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            <Calendar className="size-4 mr-1" />
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={navigateNext}>
            <ChevronRight className="size-4" />
          </Button>
          <span className="text-sm font-medium ml-2">
            {format(rangeStart, 'MMM d')} - {format(rangeEnd, 'MMM d, yyyy')}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {(['week', 'month', 'quarter'] as const).map((mode) => (
            <Button
              key={mode}
              variant={viewMode === mode ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode(mode)}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Gantt Content */}
      <ScrollArea className="flex-1">
        <div style={{ minWidth: totalWidth + 250 }}>
          {/* Timeline Header */}
          <div className="sticky top-0 z-10 bg-background border-b" style={{ height: HEADER_HEIGHT }}>
            <div className="flex">
              {/* Task List Header */}
              <div className="w-[250px] shrink-0 border-r bg-muted/20 flex items-center px-4">
                <span className="text-sm font-semibold text-muted-foreground">Tasks</span>
              </div>
              
              {/* Timeline Header */}
              <div className="flex-1 relative">
                {/* Month Row */}
                <div className="flex border-b h-10">
                  {monthGroups.map(({ month, days: monthDays }) => (
                    <div
                      key={month}
                      className="border-r flex items-center justify-center text-xs font-semibold text-muted-foreground"
                      style={{ width: monthDays.length * DAY_WIDTH }}
                    >
                      {month}
                    </div>
                  ))}
                </div>
                
                {/* Days Row */}
                <div className="flex h-10">
                  {days.map((day) => (
                    <div
                      key={day.toISOString()}
                      className={cn(
                        "border-r flex flex-col items-center justify-center text-xs",
                        isToday(day) && "bg-primary/10 font-bold",
                        isWeekend(day) && "bg-muted/50"
                      )}
                      style={{ width: DAY_WIDTH }}
                    >
                      <span className={cn(
                        "text-muted-foreground",
                        isToday(day) && "text-primary"
                      )}>
                        {format(day, 'dd')}
                      </span>
                      <span className="text-[10px] text-muted-foreground/60">
                        {format(day, 'EEE')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Task Rows */}
          <div>
            {tasksWithDates.length === 0 ? (
              <div className="flex items-center justify-center py-20 text-muted-foreground">
                <div className="text-center">
                  <Calendar className="size-12 mx-auto mb-3 opacity-30" />
                  <p>No tasks with dates to display</p>
                  <p className="text-sm">Add due dates to your tasks to see them here</p>
                </div>
              </div>
            ) : (
              tasksWithDates.map((task, index) => {
                const position = getTaskPosition(task);
                const color = task.color || STATUS_COLORS[task.status] || PRIORITY_COLORS[task.priority];

                return (
                  <div
                    key={task.id}
                    className="flex border-b hover:bg-muted/20 transition-colors"
                    style={{ height: ROW_HEIGHT }}
                  >
                    {/* Task Info */}
                    <div className="w-[250px] shrink-0 border-r flex items-center px-4 gap-3">
                      <div
                        className="w-1 h-6 rounded-full shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{task.title}</p>
                        {task.assignee && (
                          <p className="text-xs text-muted-foreground truncate">
                            {task.assignee.name}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="flex-1 relative">
                      {/* Grid */}
                      <div className="absolute inset-0 flex">
                        {days.map((day) => (
                          <div
                            key={day.toISOString()}
                            className={cn(
                              "border-r h-full",
                              isToday(day) && "bg-primary/5",
                              isWeekend(day) && "bg-muted/30"
                            )}
                            style={{ width: DAY_WIDTH }}
                          />
                        ))}
                      </div>

                      {/* Task Bar */}
                      {position && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <motion.div
                                initial={{ opacity: 0, scaleX: 0 }}
                                animate={{ opacity: 1, scaleX: 1 }}
                                transition={{ delay: index * 0.03 }}
                                className="absolute top-2 h-8 rounded-md cursor-pointer shadow-sm hover:shadow-md transition-shadow flex items-center px-2 overflow-hidden"
                                style={{
                                  left: position.left,
                                  width: position.width,
                                  backgroundColor: color,
                                  transformOrigin: 'left',
                                }}
                                onClick={() => onTaskClick?.(task)}
                              >
                                {position.width > 60 && (
                                  <span className="text-xs font-medium text-white truncate">
                                    {task.title}
                                  </span>
                                )}
                                
                                {/* Progress Bar */}
                                {task.progress !== undefined && task.progress > 0 && (
                                  <div
                                    className="absolute bottom-0 left-0 h-1 bg-white/30"
                                    style={{ width: `${task.progress}%` }}
                                  />
                                )}
                              </motion.div>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <div className="text-sm">
                                <p className="font-medium">{task.title}</p>
                                <p className="text-muted-foreground">
                                  {task.startDate && format(new Date(task.startDate), 'MMM d')}
                                  {task.startDate && task.dueDate && ' → '}
                                  {task.dueDate && format(new Date(task.dueDate), 'MMM d')}
                                </p>
                                {task.progress !== undefined && (
                                  <p className="text-muted-foreground">{task.progress}% complete</p>
                                )}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}

                      {/* Today Line */}
                      {days.some(d => isToday(d)) && (
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-primary z-10"
                          style={{
                            left: differenceInDays(new Date(), rangeStart) * DAY_WIDTH + DAY_WIDTH / 2,
                          }}
                        />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}

export default GanttChart;
