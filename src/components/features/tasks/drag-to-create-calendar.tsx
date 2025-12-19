'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Task } from '@/hooks/use-tasks';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import { format, isSameDay, startOfDay, addDays, getDay } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

// Types
interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color?: string;
  task?: Task;
}

interface DragSelection {
  startDate: Date;
  startY: number;
  currentY: number;
  isActive: boolean;
  columnRef: HTMLDivElement | null;
}

// Props
interface DragToCreateCalendarProps {
  events: CalendarEvent[];
  currentDate: Date;
  onEventClick: (event: CalendarEvent) => void;
  onCreateEvent: (start: Date, end: Date) => void;
  onEventDrag?: (eventId: string, newStart: Date, newEnd: Date) => void;
}

// Constants
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const HOUR_HEIGHT = 60; // pixels per hour
const MIN_DURATION = 30; // minimum 30 minutes

// Helper to snap to 15-minute intervals
const snapToInterval = (minutes: number) => Math.round(minutes / 15) * 15;

// Calculate Y position to time
const yToTime = (y: number, startHour: number): { hours: number; minutes: number } => {
  const totalMinutes = (y / HOUR_HEIGHT) * 60;
  const snappedMinutes = snapToInterval(totalMinutes);
  const hours = Math.floor(snappedMinutes / 60) + startHour;
  const minutes = snappedMinutes % 60;
  return { hours: Math.min(23, Math.max(0, hours)), minutes };
};

// Event Component
function EventBlock({
  event,
  onClick,
}: {
  event: CalendarEvent;
  onClick: () => void;
}) {
  const eventStart = new Date(event.start);
  const eventEnd = new Date(event.end);
  const durationHours = (eventEnd.getTime() - eventStart.getTime()) / (1000 * 60 * 60);
  const topOffset = eventStart.getHours() * HOUR_HEIGHT + (eventStart.getMinutes() / 60) * HOUR_HEIGHT;
  const height = Math.max(durationHours * HOUR_HEIGHT, 24);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, x: -10 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      whileHover={{ scale: 1.02, zIndex: 30 }}
      whileTap={{ scale: 0.98 }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="absolute left-1 right-1 rounded-lg px-2 py-1 text-xs font-medium cursor-pointer overflow-hidden shadow-sm hover:shadow-md transition-shadow"
      style={{
        top: topOffset,
        height,
        backgroundColor: event.color || '#3b82f6',
        color: '#fff',
      }}
    >
      <div className="truncate font-semibold">{event.title}</div>
      {height > 30 && (
        <div className="text-[10px] opacity-80 mt-0.5">
          {format(eventStart, 'h:mm a')} - {format(eventEnd, 'h:mm a')}
        </div>
      )}
    </motion.div>
  );
}

// Drag Selection Overlay - The dashed placeholder
function DragSelectionOverlay({
  selection,
}: {
  selection: DragSelection;
}) {
  if (!selection.isActive || !selection.columnRef) return null;

  const columnRect = selection.columnRef.getBoundingClientRect();
  const startY = selection.startY - columnRect.top;
  const currentY = selection.currentY - columnRect.top;
  
  // Calculate start position and height
  const minY = Math.max(0, Math.min(startY, currentY));
  const maxY = Math.max(startY, currentY);
  const height = Math.max(maxY - minY, HOUR_HEIGHT / 2);
  
  // Calculate times
  const startHourOffset = minY / HOUR_HEIGHT;
  const startHour = Math.floor(startHourOffset);
  const startMinutes = snapToInterval((startHourOffset - startHour) * 60);
  
  const durationMinutes = snapToInterval((height / HOUR_HEIGHT) * 60);
  const endMinutesTotal = startHour * 60 + startMinutes + Math.max(durationMinutes, MIN_DURATION);
  const endHour = Math.floor(endMinutesTotal / 60);
  const endMinutes = endMinutesTotal % 60;
  
  const startTime = new Date(selection.startDate);
  startTime.setHours(startHour, startMinutes, 0, 0);
  
  const endTime = new Date(selection.startDate);
  endTime.setHours(endHour, endMinutes, 0, 0);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        height: Math.max(height, HOUR_HEIGHT / 2),
      }}
      transition={{ 
        type: "spring", 
        stiffness: 500, 
        damping: 30,
        mass: 0.5 
      }}
      className="absolute left-1 right-1 rounded-lg border-2 border-dashed border-primary bg-primary/20 backdrop-blur-sm z-20 pointer-events-none overflow-hidden"
      style={{
        top: minY,
      }}
    >
      <motion.div 
        className="p-2 text-xs font-medium text-primary"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex items-center gap-1.5">
          <Icon icon="solar:add-circle-bold" className="size-4" />
          <span className="font-semibold">New Task</span>
        </div>
        <motion.div 
          className="text-[10px] opacity-70 mt-0.5"
          key={`${startHour}-${endHour}`}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
        </motion.div>
      </motion.div>
      
      {/* Resize Handle Indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-2 flex items-center justify-center">
        <div className="w-8 h-1 rounded-full bg-primary/50" />
      </div>
    </motion.div>
  );
}

// Time Grid Cell
function TimeGridCell({
  hour,
}: {
  hour: number;
}) {
  return (
    <div
      className={cn(
        "h-[60px] border-b border-border/30 transition-colors",
        hour % 2 === 0 ? "bg-background" : "bg-muted/10"
      )}
    />
  );
}

// Day Column
function DayColumn({
  date,
  events,
  isToday,
  onEventClick,
  onDragStart,
  onDragMove,
  onDragEnd,
  isDragging,
  dragSelection,
}: {
  date: Date;
  events: CalendarEvent[];
  isToday: boolean;
  onEventClick: (event: CalendarEvent) => void;
  onDragStart: (e: React.MouseEvent, date: Date, columnRef: HTMLDivElement) => void;
  onDragMove: (e: React.MouseEvent) => void;
  onDragEnd: () => void;
  isDragging: boolean;
  dragSelection: DragSelection | null;
}) {
  const columnRef = React.useRef<HTMLDivElement>(null);
  const dayEvents = events.filter(event => isSameDay(new Date(event.start), date));
  const isThisColumnDragging = dragSelection && isSameDay(dragSelection.startDate, date);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (columnRef.current && e.button === 0) {
      onDragStart(e, date, columnRef.current);
    }
  };

  return (
    <div className="flex-1 min-w-[120px] relative border-r border-border/30 last:border-r-0">
      {/* Day Header */}
      <div className={cn(
        "sticky top-0 z-20 py-3 text-center border-b border-border/30 bg-background/95 backdrop-blur-sm",
        isToday && "bg-primary/5"
      )}>
        <div className={cn(
          "text-xs font-medium text-muted-foreground uppercase tracking-wider",
          isToday && "text-primary"
        )}>
          {format(date, 'EEE')}
        </div>
        <div className={cn(
          "text-2xl font-bold mt-0.5",
          isToday && "text-primary"
        )}>
          {format(date, 'd')}
        </div>
        {isToday && (
          <motion.div 
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full"
            layoutId="today-indicator"
          />
        )}
      </div>

      {/* Time Grid */}
      <div 
        ref={columnRef}
        className={cn(
          "relative cursor-crosshair select-none",
          isDragging && "cursor-ns-resize"
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={onDragMove}
        onMouseUp={onDragEnd}
        onMouseLeave={onDragEnd}
      >
        {/* Hour cells */}
        {HOURS.map(hour => (
          <TimeGridCell key={hour} hour={hour} />
        ))}

        {/* Events */}
        <AnimatePresence mode="popLayout">
          {dayEvents.map(event => (
            <EventBlock
              key={event.id}
              event={event}
              onClick={() => onEventClick(event)}
            />
          ))}
        </AnimatePresence>

        {/* Drag Selection Overlay */}
        <AnimatePresence>
          {isThisColumnDragging && dragSelection && (
            <DragSelectionOverlay selection={dragSelection} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Current Time Indicator
function CurrentTimeIndicator() {
  const [position, setPosition] = React.useState(0);

  React.useEffect(() => {
    const updatePosition = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      setPosition((hours * HOUR_HEIGHT) + ((minutes / 60) * HOUR_HEIGHT) + 72); // 72 = header height approx
    };

    updatePosition();
    const interval = setInterval(updatePosition, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      className="absolute left-16 right-0 h-0.5 bg-red-500 z-30 pointer-events-none"
      style={{ top: position }}
      initial={{ opacity: 0, scaleX: 0 }}
      animate={{ opacity: 1, scaleX: 1 }}
      transition={{ delay: 0.5 }}
    >
      <motion.div 
        className="absolute -left-1.5 -top-1.5 size-3.5 rounded-full bg-red-500 shadow-lg shadow-red-500/30"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
      />
    </motion.div>
  );
}

// Main Component
export function DragToCreateCalendar({
  events,
  currentDate,
  onEventClick,
  onCreateEvent,
}: DragToCreateCalendarProps) {
  const [dragSelection, setDragSelection] = React.useState<DragSelection | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Generate week days
  const weekStart = startOfDay(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const dayOffset = getDay(currentDate); // Get current day of week (0-6)
    return addDays(weekStart, i - dayOffset);
  });

  const today = startOfDay(new Date());

  const handleDragStart = (e: React.MouseEvent, date: Date, columnRef: HTMLDivElement) => {
    // Only left click
    if (e.button !== 0) return;
    
    e.preventDefault();

    setDragSelection({
      startDate: date,
      startY: e.clientY,
      currentY: e.clientY,
      isActive: true,
      columnRef,
    });
  };

  const handleDragMove = (e: React.MouseEvent) => {
    if (!dragSelection?.isActive) return;
    
    setDragSelection(prev => prev ? {
      ...prev,
      currentY: e.clientY,
    } : null);
  };

  const handleDragEnd = () => {
    if (!dragSelection?.isActive || !dragSelection.columnRef) return;

    const columnRect = dragSelection.columnRef.getBoundingClientRect();
    const startY = dragSelection.startY - columnRect.top;
    const endY = dragSelection.currentY - columnRect.top;
    
    const minY = Math.max(0, Math.min(startY, endY));
    const maxY = Math.max(startY, endY);
    
    // Calculate start time
    const startHourOffset = minY / HOUR_HEIGHT;
    const startHour = Math.floor(startHourOffset);
    const startMinutes = snapToInterval((startHourOffset - startHour) * 60);
    
    // Calculate duration
    const height = Math.max(maxY - minY, HOUR_HEIGHT / 2);
    const durationMinutes = Math.max(snapToInterval((height / HOUR_HEIGHT) * 60), MIN_DURATION);
    
    const startTime = new Date(dragSelection.startDate);
    startTime.setHours(startHour, startMinutes, 0, 0);
    
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + durationMinutes);

    // Create event
    onCreateEvent(startTime, endTime);

    setDragSelection(null);
  };

  // Handle mouse leave from container
  const handleMouseLeave = () => {
    if (dragSelection?.isActive) {
      setDragSelection(null);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="flex flex-col h-full overflow-hidden select-none bg-background"
      onMouseLeave={handleMouseLeave}
    >
      {/* Scrollable content */}
      <ScrollArea className="flex-1">
        <div className="flex min-w-max">
          {/* Time Labels */}
          <div className="w-16 flex-shrink-0 border-r border-border/30 bg-muted/20">
            <div className="h-[72px] border-b border-border/30" /> {/* Header spacer */}
            {HOURS.map(hour => (
              <div
                key={hour}
                className="h-[60px] pr-2 text-right text-[11px] text-muted-foreground font-medium flex items-start justify-end pt-0"
              >
                <span className="-mt-2">{format(new Date().setHours(hour, 0), 'h a')}</span>
              </div>
            ))}
          </div>

          {/* Day Columns */}
          <div className="flex-1 flex">
            {weekDays.map(date => (
              <DayColumn
                key={date.toISOString()}
                date={date}
                events={events}
                isToday={isSameDay(date, today)}
                onEventClick={onEventClick}
                onDragStart={handleDragStart}
                onDragMove={handleDragMove}
                onDragEnd={handleDragEnd}
                isDragging={!!dragSelection?.isActive}
                dragSelection={dragSelection}
              />
            ))}
          </div>
        </div>

        {/* Current Time Indicator */}
        <CurrentTimeIndicator />
      </ScrollArea>
    </div>
  );
}

export default DragToCreateCalendar;
