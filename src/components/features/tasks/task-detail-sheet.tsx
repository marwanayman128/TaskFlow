"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { Task } from "@/hooks/use-tasks";
import { TaskDetailContent, TaskDetailContentProps } from "./task-detail-content";

export interface TaskDetailSheetProps extends Omit<TaskDetailContentProps, 'showHeader' | 'className'> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskDetailSheet({
  task,
  open,
  onOpenChange,
  ...contentProps
}: TaskDetailSheetProps) {
  if (!task) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col overflow-hidden">
        <TaskDetailContent
          task={task}
          showHeader={true}
          className="flex-1 min-h-0 overflow-hidden"
          {...contentProps}
        />
      </SheetContent>
    </Sheet>
  );
}

export default TaskDetailSheet;
