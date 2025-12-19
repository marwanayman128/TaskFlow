'use client';

import * as React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Task } from '@/hooks/use-tasks';
import { TaskCommentsSection } from './task-comments-section';
import { TaskActivitySection } from './task-activity-section';
import { TaskTimeTrackingSection } from './task-time-tracking-section';
import { 
  MessageSquare, 
  Clock, 
  Activity, 
  Paperclip,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskDetailTabsProps {
  task: Task;
  onUpdate?: (data: Partial<Task>) => void;
  className?: string;
  // Attachments Tab
  attachments?: { id: string; name: string; url: string; mimeType: string; size: number; createdAt: string }[];
  attachmentsContent?: React.ReactNode;
}

export function TaskDetailTabs({ 
  task, 
  onUpdate, 
  className,
  attachments = [],
  attachmentsContent,
}: TaskDetailTabsProps) {
  const [activeTab, setActiveTab] = React.useState('comments');
  const hasAttachments = attachments.length > 0;

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className={cn(
          "mx-4 mt-4 mb-2",
          hasAttachments ? "grid grid-cols-4" : "grid grid-cols-3"
        )}>
          <TabsTrigger value="comments" className="text-xs gap-1">
            <MessageSquare className="size-3.5" />
            Comments
          </TabsTrigger>
          <TabsTrigger value="activity" className="text-xs gap-1">
            <Activity className="size-3.5" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="time" className="text-xs gap-1">
            <Clock className="size-3.5" />
            Time
          </TabsTrigger>
          {hasAttachments && (
            <TabsTrigger value="files" className="text-xs gap-1">
              <Paperclip className="size-3.5" />
              Files
              <span className="ml-1 text-[10px] bg-muted px-1 rounded">{attachments.length}</span>
            </TabsTrigger>
          )}
        </TabsList>

        <ScrollArea className="flex-1 px-4">
          {/* Comments Tab */}
          <TabsContent value="comments" className="mt-0">
            <TaskCommentsSection taskId={task.id} />
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="mt-0">
            <TaskActivitySection taskId={task.id} />
          </TabsContent>

          {/* Time Tracking Tab */}
          <TabsContent value="time" className="mt-0">
            <TaskTimeTrackingSection taskId={task.id} />
          </TabsContent>

          {/* Files Tab - Only shown when there are attachments */}
          {hasAttachments && (
            <TabsContent value="files" className="mt-0">
              {attachmentsContent}
            </TabsContent>
          )}
        </ScrollArea>
      </Tabs>
    </div>
  );
}

export default TaskDetailTabs;
