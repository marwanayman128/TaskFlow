'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@iconify/react';
import { format, formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useTimeEntries, useActiveTimer, useTimeTracking, TimeEntry } from '@/hooks/use-tasks';
import { Loader2, Clock, Play, Square, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TaskTimeTrackingSectionProps {
  taskId: string;
}

export function TaskTimeTrackingSection({ taskId }: TaskTimeTrackingSectionProps) {
  const { entries, totalTime, isLoading, mutate } = useTimeEntries(taskId);
  const { activeTimer, mutate: mutateActiveTimer } = useActiveTimer();
  const { startTimer, stopTimer, addManualEntry, isLoading: isActionLoading } = useTimeTracking();
  
  const [showManualEntry, setShowManualEntry] = React.useState(false);
  const [manualEntry, setManualEntry] = React.useState({
    description: '',
    startTime: '',
    endTime: '',
  });

  const isTimerActive = activeTimer?.taskId === taskId;
  const [elapsedTime, setElapsedTime] = React.useState(0);

  // Update elapsed time every second when timer is active
  React.useEffect(() => {
    if (!isTimerActive || !activeTimer?.startTime) return;

    const updateElapsed = () => {
      const start = new Date(activeTimer.startTime).getTime();
      const now = Date.now();
      setElapsedTime(Math.floor((now - start) / 1000));
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);

    return () => clearInterval(interval);
  }, [isTimerActive, activeTimer?.startTime]);

  const handleStartTimer = async () => {
    try {
      await startTimer(taskId);
      mutate();
      mutateActiveTimer();
    } catch (error) {
      console.error('Failed to start timer:', error);
    }
  };

  const handleStopTimer = async () => {
    if (!activeTimer?.id) return;
    try {
      await stopTimer(activeTimer.id);
      mutate();
      mutateActiveTimer();
    } catch (error) {
      console.error('Failed to stop timer:', error);
    }
  };

  const handleAddManualEntry = async () => {
    if (!manualEntry.startTime || !manualEntry.endTime) return;
    try {
      await addManualEntry(taskId, {
        description: manualEntry.description || undefined,
        startTime: new Date(manualEntry.startTime).toISOString(),
        endTime: new Date(manualEntry.endTime).toISOString(),
      });
      setManualEntry({ description: '', startTime: '', endTime: '' });
      setShowManualEntry(false);
      mutate();
    } catch (error) {
      console.error('Failed to add time entry:', error);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatElapsed = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '??';
  };

  return (
    <div className="space-y-4">
      {/* Header with total time */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
          <Clock className="size-4 text-primary/70" />
          Time Tracking
        </h4>
        <Badge variant="secondary" className="text-xs">
          Total: {formatDuration(totalTime)}
        </Badge>
      </div>

      {/* Timer controls */}
      <div className="flex items-center gap-2">
        {isTimerActive ? (
          <motion.div
            className="flex-1 flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/20"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
          >
            <motion.div 
              className="size-3 rounded-full bg-primary"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            />
            <span className="font-mono text-lg font-semibold text-primary">
              {formatElapsed(elapsedTime)}
            </span>
            <span className="text-sm text-primary/70 flex-1">
              Timer running...
            </span>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleStopTimer}
              disabled={isActionLoading}
            >
              {isActionLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  <Square className="size-4 mr-1" />
                  Stop
                </>
              )}
            </Button>
          </motion.div>
        ) : (
          <>
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleStartTimer}
              disabled={isActionLoading}
            >
              {isActionLoading ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : (
                <Play className="size-4 mr-2" />
              )}
              Start Timer
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowManualEntry(true)}
            >
              <Plus className="size-4" />
            </Button>
          </>
        )}
      </div>

      {/* Time entries list */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-sm text-muted-foreground py-4 text-center bg-muted/30 rounded-xl">
            <Clock className="size-6 mx-auto mb-2 opacity-30" />
            No time entries yet. Start tracking!
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {entries.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <Avatar className="size-6 shrink-0">
                  <AvatarImage src={entry.user?.avatar || undefined} />
                  <AvatarFallback className="text-[9px] bg-primary/10 text-primary">
                    {getInitials(entry.user?.fullName || '')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">
                      {entry.user?.fullName || 'Unknown'}
                    </span>
                    {entry.isBillable && (
                      <Badge variant="outline" className="text-[9px] px-1 py-0">
                        $
                      </Badge>
                    )}
                  </div>
                  {entry.description && (
                    <p className="text-[11px] text-muted-foreground truncate">
                      {entry.description}
                    </p>
                  )}
                </div>
                
                <div className="text-right shrink-0">
                  <div className="text-sm font-semibold">
                    {entry.duration ? formatDuration(entry.duration) : '—'}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {format(new Date(entry.startTime), 'MMM d, h:mm a')}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Manual entry dialog */}
      <Dialog open={showManualEntry} onOpenChange={setShowManualEntry}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="size-5 text-primary" />
              Add Time Entry
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                placeholder="What did you work on?"
                value={manualEntry.description}
                onChange={(e) => setManualEntry(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={manualEntry.startTime}
                  onChange={(e) => setManualEntry(prev => ({ ...prev, startTime: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={manualEntry.endTime}
                  onChange={(e) => setManualEntry(prev => ({ ...prev, endTime: e.target.value }))}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowManualEntry(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddManualEntry}
              disabled={!manualEntry.startTime || !manualEntry.endTime || isActionLoading}
            >
              {isActionLoading ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
              Add Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TaskTimeTrackingSection;
