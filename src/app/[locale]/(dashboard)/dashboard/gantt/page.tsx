'use client';

import * as React from 'react';
import { GanttChart, GanttTask } from '@/components/features/tasks/gantt-chart';
import { useTasks } from '@/hooks/use-tasks';
import { Loader2 } from 'lucide-react';

export default function GanttPage() {
  const { tasks, isLoading } = useTasks();

  const ganttTasks: GanttTask[] = React.useMemo(() => {
    if (!tasks) return [];
    
    return tasks
      .filter((task: any) => task.dueDate || task.startDate)
      .map((task: any) => ({
        id: task.id,
        title: task.title,
        startDate: task.startDate,
        dueDate: task.dueDate,
        status: task.status,
        priority: task.priority,
        assignee: task.assignee ? {
          name: task.assignee.name || 'Unknown',
          avatar: task.assignee.image,
        } : undefined,
        progress: task.status === 'COMPLETED' ? 100 : task.status === 'IN_PROGRESS' ? 50 : 0,
      }));
  }, [tasks]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container max-w-full mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Gantt Chart</h1>
        <p className="text-sm text-muted-foreground">
          Visualize your tasks on a timeline
        </p>
      </div>

      <div className="h-[calc(100vh-220px)]">
        <GanttChart
          tasks={ganttTasks}
          onTaskClick={(task) => {
            // Could open task detail dialog
            console.log('Task clicked:', task);
          }}
        />
      </div>
    </div>
  );
}
