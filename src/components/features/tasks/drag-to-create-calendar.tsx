'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Task } from '@/hooks/use-tasks';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import { format, isSameDay, startOfDay, addDays, getDay } from 'date-fns';

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

// Time Grid Cell
function TimeGridCell({
  date,
  hour,
  events,
  onEventClick,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  dragSelection,
}: {
  date: Date;
  hour: number;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onMouseDown: (e: React.MouseEvent, date: Date, hour: number) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
  dragSelection: DragSelection | null;
}) {
  const cellRef = React.useRef<HTMLDivElement>(null);
  const cellDate = new Date(date);
  cellDate.setHours(hour, 0, 0, 0);

  // Get events for this hour
  const cellEvents = events.filter(event => {
    const eventStart = new Date(event.start);
    const eventHour = eventStart.getHours();
    return isSameDay(eventStart, date) && eventHour === hour;
  });

  // Check if this cell is in the drag selection
  const isInDragSelection = dragSelection?.isActive && 
    isSameDay(dragSelection.startDate, date) &&
    dragSelection.startDate.getHours() <= hour;

  return (
    <div
      ref={cellRef}
      className={cn(
        "relative h-[60px] border-b border-r border-border/30 transition-colors",
        "hover:bg-muted/20 cursor-crosshair"
      )}
      onMouseDown={(e) => onMouseDown(e, date, hour)}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
    >
      {/* Events */}
      {cellEvents.map(event => {
        const eventStart = new Date(event.start);
        const eventEnd = new Date(event.end);
        const durationHours = (eventEnd.getTime() - eventStart.getTime()) / (1000 * 60 * 60);
        const topOffset = ((eventStart.getMinutes() / 60) * HOUR_HEIGHT);
        const height = Math.max(durationHours * HOUR_HEIGHT, 24);

        return (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => {
              e.stopPropagation();
              onEventClick(event);
            }}
            className="absolute left-0.5 right-0.5 rounded-md px-2 py-1 text-xs font-medium cursor-pointer overflow-hidden z-10"
            style={{
              top: topOffset,
              height,
              backgroundColor: event.color || '#3b82f6',
              color: '#fff',
            }}
          >
            <div className="truncate">{event.title}</div>
            <div className="text-[10px] opacity-80">
              {format(eventStart, 'h:mm a')} - {format(eventEnd, 'h:mm a')}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// Drag Selection Overlay
function DragSelectionOverlay({
  selection,
  containerRef,
}: {
  selection: DragSelection;
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  if (!selection.isActive || !containerRef.current) return null;

  const startHour = selection.startDate.getHours();
  const containerRect = containerRef.current.getBoundingClientRect();
  
  const top = startHour * HOUR_HEIGHT + (selection.startY - containerRect.top);
  const height = Math.max(selection.currentY - selection.startY, HOUR_HEIGHT / 2);

  // Calculate time from height
  const durationMinutes = snapToInterval((height / HOUR_HEIGHT) * 60);
  const endDate = new Date(selection.startDate);
  endDate.setMinutes(endDate.getMinutes() + durationMinutes);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute left-0.5 right-0.5 rounded-md border-2 border-dashed border-primary bg-primary/20 z-20 pointer-events-none"
      style={{
        top: startHour * HOUR_HEIGHT,
        height: Math.max(height, HOUR_HEIGHT / 2),
      }}
    >
      <div className="p-2 text-xs font-medium text-primary">
        <div>New Task</div>
        <div className="text-[10px] opacity-70">
          {format(selection.startDate, 'h:mm a')} - {format(endDate, 'h:mm a')}
        </div>
      </div>
    </motion.div>
  );
}

// Day Column
function DayColumn({
  date,
  events,
  isToday,
  onEventClick,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  dragSelection,
}: {
  date: Date;
  events: CalendarEvent[];
  isToday: boolean;
  onEventClick: (event: CalendarEvent) => void;
  onMouseDown: (e: React.MouseEvent, date: Date, hour: number) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
  dragSelection: DragSelection | null;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const dayEvents = events.filter(event => isSameDay(new Date(event.start), date));

  return (
    <div className="flex-1 min-w-[100px] relative" ref={containerRef}>
      {/* Day Header */}
      <div className={cn(
        "sticky top-0 z-20 py-2 text-center border-b border-r border-border/30 bg-background/95 backdrop-blur-sm",
        isToday && "bg-primary/5"
      )}>
        <div className={cn(
          "text-xs font-medium text-muted-foreground",
          isToday && "text-primary"
        )}>
          {format(date, 'EEE')}
        </div>
        <div className={cn(
          "text-xl font-bold",
          isToday && "text-primary"
        )}>
          {format(date, 'd')}
        </div>
      </div>

      {/* Time Grid */}
      <div className="relative">
        {HOURS.map(hour => (
          <TimeGridCell
            key={hour}
            date={date}
            hour={hour}
            events={dayEvents}
            onEventClick={onEventClick}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            dragSelection={dragSelection && isSameDay(dragSelection.startDate, date) ? dragSelection : null}
          />
        ))}

        {/* Drag Selection */}
        {dragSelection && isSameDay(dragSelection.startDate, date) && (
          <DragSelectionOverlay selection={dragSelection} containerRef={containerRef} />
        )}
      </div>
    </div>
  );
}

// Main Component
export function DragToCreateCalendar({
  events,
  currentDate,
  onEventClick,
  onCreateEvent,
  onEventDrag,
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

  const handleMouseDown = (e: React.MouseEvent, date: Date, hour: number) => {
    // Only left click
    if (e.button !== 0) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const minuteOffset = snapToInterval(((e.clientY - rect.top) / HOUR_HEIGHT) * 60);
    
    const startDate = new Date(date);
    startDate.setHours(hour, minuteOffset, 0, 0);

    setDragSelection({
      startDate,
      startY: e.clientY,
      currentY: e.clientY,
      isActive: true,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragSelection?.isActive) return;
    
    setDragSelection(prev => prev ? {
      ...prev,
      currentY: e.clientY,
    } : null);
  };

  const handleMouseUp = () => {
    if (!dragSelection?.isActive) return;

    // Calculate duration
    const heightDiff = Math.max(dragSelection.currentY - dragSelection.startY, HOUR_HEIGHT / 2);
    const durationMinutes = snapToInterval((heightDiff / HOUR_HEIGHT) * 60);
    const endDate = new Date(dragSelection.startDate);
    endDate.setMinutes(endDate.getMinutes() + Math.max(durationMinutes, MIN_DURATION));

    // Create event
    onCreateEvent(dragSelection.startDate, endDate);

    setDragSelection(null);
  };

  // Handle mouse leave to cancel drag
  const handleMouseLeave = () => {
    if (dragSelection?.isActive) {
      setDragSelection(null);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="flex flex-col h-full overflow-hidden select-none"
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
    >
      {/* Week View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Time Labels */}
        <div className="w-16 flex-shrink-0 border-r border-border/30">
          <div className="h-[52px] border-b border-border/30" /> {/* Header spacer */}
          {HOURS.map(hour => (
            <div
              key={hour}
              className="h-[60px] pr-2 text-right text-[10px] text-muted-foreground font-medium"
            >
              {format(new Date().setHours(hour, 0), 'h a')}
            </div>
          ))}
        </div>

        {/* Day Columns */}
        <div className="flex-1 flex overflow-x-auto">
          {weekDays.map(date => (
            <DayColumn
              key={date.toISOString()}
              date={date}
              events={events}
              isToday={isSameDay(date, today)}
              onEventClick={onEventClick}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              dragSelection={dragSelection}
            />
          ))}
        </div>
      </div>

      {/* Current Time Indicator */}
      <CurrentTimeIndicator containerRef={containerRef} />
    </div>
  );
}

// Current Time Line
function CurrentTimeIndicator({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  const [position, setPosition] = React.useState(0);

  React.useEffect(() => {
    const updatePosition = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      setPosition((hours * HOUR_HEIGHT) + ((minutes / 60) * HOUR_HEIGHT) + 52); // 52 = header height
    };

    updatePosition();
    const interval = setInterval(updatePosition, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className="absolute left-16 right-0 h-0.5 bg-red-500 z-30 pointer-events-none"
      style={{ top: position }}
    >
      <div className="absolute -left-1.5 -top-1.5 size-3 rounded-full bg-red-500" />
    </div>
  );
}

export default DragToCreateCalendar;
