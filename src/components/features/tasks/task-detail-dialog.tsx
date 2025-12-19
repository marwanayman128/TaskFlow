'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Task } from '@/hooks/use-tasks';
import { TaskDetailContent, TaskDetailContentProps } from './task-detail-content';

export interface TaskDetailDialogProps extends Omit<TaskDetailContentProps, 'showHeader' | 'className'> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskDetailDialog({
  task,
  open,
  onOpenChange,
  ...contentProps
}: TaskDetailDialogProps) {
  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0 flex flex-col overflow-hidden">
        <TaskDetailContent
          task={task}
          showHeader={true}
          className="flex-1 min-h-0 overflow-hidden"
          {...contentProps}
        />
      </DialogContent>
    </Dialog>
  );
}

export default TaskDetailDialog;
