'use client';

import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Icon } from '@iconify/react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useTaskActivity, TaskActivity } from '@/hooks/use-tasks';
import { Loader2, Activity, CheckCircle, Circle, Clock, Tag, User, AlertCircle, Calendar, Edit, Trash } from 'lucide-react';

interface TaskActivitySectionProps {
  taskId: string;
}

// Map action types to icons and colors
const ACTION_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  CREATED: { icon: <Circle className="size-3" />, color: 'text-blue-500', label: 'created this task' },
  COMPLETED: { icon: <CheckCircle className="size-3" />, color: 'text-green-500', label: 'completed this task' },
  REOPENED: { icon: <Circle className="size-3" />, color: 'text-yellow-500', label: 'reopened this task' },
  UPDATED: { icon: <Edit className="size-3" />, color: 'text-purple-500', label: 'updated this task' },
  ASSIGNED: { icon: <User className="size-3" />, color: 'text-indigo-500', label: 'assigned this task' },
  UNASSIGNED: { icon: <User className="size-3" />, color: 'text-gray-500', label: 'unassigned this task' },
  DUE_DATE_SET: { icon: <Calendar className="size-3" />, color: 'text-orange-500', label: 'set the due date' },
  DUE_DATE_CHANGED: { icon: <Calendar className="size-3" />, color: 'text-orange-500', label: 'changed the due date' },
  PRIORITY_CHANGED: { icon: <AlertCircle className="size-3" />, color: 'text-red-500', label: 'changed the priority' },
  TAG_ADDED: { icon: <Tag className="size-3" />, color: 'text-cyan-500', label: 'added a tag' },
  TAG_REMOVED: { icon: <Tag className="size-3" />, color: 'text-gray-500', label: 'removed a tag' },
  COMMENT_ADDED: { icon: <Icon icon="solar:chat-round-outline" className="size-3" />, color: 'text-blue-500', label: 'added a comment' },
  DELETED: { icon: <Trash className="size-3" />, color: 'text-red-500', label: 'deleted this task' },
  SUBTASK_ADDED: { icon: <Icon icon="solar:list-check-outline" className="size-3" />, color: 'text-teal-500', label: 'added a subtask' },
  TIME_LOGGED: { icon: <Clock className="size-3" />, color: 'text-emerald-500', label: 'logged time' },
};

export function TaskActivitySection({ taskId }: TaskActivitySectionProps) {
  const { activities, isLoading } = useTaskActivity(taskId);

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '??';
  };

  const getActionConfig = (action: string) => {
    return ACTION_CONFIG[action] || { 
      icon: <Activity className="size-3" />, 
      color: 'text-muted-foreground', 
      label: action.toLowerCase().replace(/_/g, ' ') 
    };
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
          <Activity className="size-4 text-primary/70" />
          Activity
          {activities.length > 0 && (
            <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full">
              {activities.length}
            </span>
          )}
        </h4>
      </div>

      {/* Activity list */}
      <div className="space-y-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : activities.length === 0 ? (
          <div className="text-sm text-muted-foreground py-6 text-center">
            <Activity className="size-8 mx-auto mb-2 opacity-30" />
            No activity recorded yet.
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-px bg-border/50" />
            
            <AnimatePresence mode="popLayout">
              {activities.map((activity, index) => {
                const config = getActionConfig(activity.action);
                
                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative flex gap-3 py-2"
                  >
                    {/* Timeline dot */}
                    <div className={`relative z-10 flex items-center justify-center size-8 rounded-full bg-background border-2 border-border ${config.color}`}>
                      {config.icon}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0 pt-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Avatar className="size-5">
                          <AvatarImage src={activity.user?.avatar || undefined} />
                          <AvatarFallback className="text-[8px] bg-primary/10 text-primary">
                            {getInitials(activity.user?.fullName || '')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">
                          {activity.user?.fullName || 'Unknown'}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {config.label}
                        </span>
                      </div>
                      
                      {/* Details */}
                      {activity.details && Object.keys(activity.details).length > 0 && (
                        <div className="mt-1 text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-md inline-block">
                          {formatActivityDetails(activity.details)}
                        </div>
                      )}
                      
                      <div className="text-[11px] text-muted-foreground/60 mt-1">
                        {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

function formatActivityDetails(details: Record<string, unknown>): string {
  const parts: string[] = [];
  
  if (details.content) {
    parts.push(`"${String(details.content).substring(0, 50)}..."`);
  }
  if (details.from && details.to) {
    parts.push(`${details.from} → ${details.to}`);
  }
  if (details.duration) {
    parts.push(`${details.duration} minutes`);
  }
  if (details.tagName) {
    parts.push(`#${details.tagName}`);
  }
  
  return parts.join(' • ') || JSON.stringify(details);
}

export default TaskActivitySection;
