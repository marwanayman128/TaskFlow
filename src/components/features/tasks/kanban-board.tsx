'use client';

import * as React from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
  useDroppable,
  rectIntersection,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/hooks/use-tasks';
import { QuickAddTask } from './quick-add-task';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Icon } from '@iconify/react';
import { GripVertical } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

// Column definition
export interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  tasks: Task[];
}

// Props for the Kanban Board
export interface KanbanBoardProps {
  columns: KanbanColumn[];
  onTaskMove: (taskId: string, sourceColumnId: string, targetColumnId: string, newIndex: number) => void;
  onTaskReorder: (columnId: string, tasks: Task[]) => void;
  onTaskClick: (task: Task) => void;
  onTaskToggle: (id: string, completed: boolean) => void;
  onAddTask: (columnId: string, title: string) => void;
}

// Sortable Task Item for Kanban
function SortableKanbanTask({
  task,
  onClick,
  onToggle,
}: {
  task: Task;
  onClick: () => void;
  onToggle: (id: string, completed: boolean) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: task.id,
    data: { type: 'task', task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isCompleted = task.status === 'COMPLETED' || task.completed;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "touch-none",
        isDragging && "opacity-50 z-50"
      )}
    >
      <div 
        className={cn(
          "p-3 bg-card rounded-lg shadow-sm border border-border/50 cursor-pointer group",
          "hover:shadow-md hover:border-primary/30 transition-all",
          isCompleted && "opacity-60"
        )}
      >
        <div className="flex items-start gap-3">
          {/* Drag Handle */}
          <button
            {...attributes}
            {...listeners}
            className="mt-0.5 touch-none cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="size-4 text-muted-foreground/30 hover:text-muted-foreground transition-colors" />
          </button>

          {/* Checkbox */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle(task.id, !isCompleted);
            }}
            className={cn(
              "size-5 rounded-full border-2 flex-shrink-0 transition-all flex items-center justify-center",
              "border-muted-foreground/30 hover:border-primary",
              isCompleted && "bg-primary border-primary"
            )}
          >
            {isCompleted && (
              <Icon icon="solar:check-read-linear" className="size-3 text-primary-foreground" />
            )}
          </button>
          
          {/* Content */}
          <div className="flex-1 min-w-0" onClick={onClick}>
            <p className={cn(
              "text-sm font-medium",
              isCompleted && "line-through text-muted-foreground"
            )}>
              {task.title}
            </p>
            
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {task.dueDate && (
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Icon icon="solar:calendar-linear" className="size-3" />
                  {new Date(task.dueDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                </span>
              )}
              {task.priority && task.priority !== 'NONE' && (
                <Badge variant="outline" className={cn(
                  "text-[10px] h-4 px-1",
                  task.priority === 'HIGH' && "border-red-500 text-red-500",
                  task.priority === 'MEDIUM' && "border-amber-500 text-amber-500",
                  task.priority === 'LOW' && "border-blue-500 text-blue-500"
                )}>
                  {task.priority}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Droppable area for empty columns
function DroppableColumn({ columnId, children }: { columnId: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({
    id: columnId,
    data: { type: 'column', columnId },
  });

  return (
    <div 
      ref={setNodeRef} 
      className={cn(
        "flex-1 min-h-[100px] transition-all rounded-lg",
        isOver && "bg-primary/5 ring-2 ring-primary/30 ring-dashed"
      )}
    >
      {children}
    </div>
  );
}

// Droppable Column
function KanbanColumnComponent({
  column,
  onTaskClick,
  onTaskToggle,
  onAddTask,
}: {
  column: KanbanColumn;
  onTaskClick: (task: Task) => void;
  onTaskToggle: (id: string, completed: boolean) => void;
  onAddTask: (columnId: string, title: string) => void;
}) {
  return (
    <div className="w-80 flex-shrink-0 bg-muted/30 rounded-xl flex flex-col max-h-full min-h-[400px]">
      {/* Column Header */}
      <div className="p-4 border-b border-border/30">
        <div className="flex items-center gap-2">
          <span className="size-3 rounded-full" style={{ backgroundColor: column.color }} />
          <h3 className="font-semibold text-sm truncate flex-1">{column.title}</h3>
          <Badge variant="secondary" className="text-xs h-5 px-1.5">{column.tasks.length}</Badge>
        </div>
      </div>

      {/* Tasks - Droppable area */}
      <DroppableColumn columnId={column.id}>
        <SortableContext
          items={column.tasks.map(t => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            <AnimatePresence mode="popLayout">
              {column.tasks.map(task => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <SortableKanbanTask
                    task={task}
                    onClick={() => onTaskClick(task)}
                    onToggle={onTaskToggle}
                  />
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Empty State - still droppable */}
            {column.tasks.length === 0 && (
              <div className="text-center py-8 text-sm text-muted-foreground italic border-2 border-dashed border-muted rounded-lg">
                Drop tasks here
              </div>
            )}
          </div>
        </SortableContext>
      </DroppableColumn>

      {/* Always visible QuickAddTask Footer */}
      <div className="p-2 border-t border-border/30 mt-auto">
        <QuickAddTask 
          onAdd={(data) => {
            onAddTask(column.id, data.title);
            return Promise.resolve();
          }}
          compact
        />
      </div>
    </div>
  );
}

// Drag Overlay for tasks being dragged
function DragOverlayTask({ task }: { task: Task }) {
  const isCompleted = task.status === 'COMPLETED' || task.completed;

  return (
    <div className="p-3 bg-card rounded-lg shadow-xl border-2 border-primary/50 w-72">
      <div className="flex items-start gap-3">
        <GripVertical className="size-4 text-muted-foreground mt-0.5" />
        <div className={cn(
          "size-5 rounded-full border-2 flex-shrink-0",
          "border-muted-foreground/30",
          isCompleted && "bg-primary border-primary"
        )}>
          {isCompleted && (
            <Icon icon="solar:check-read-linear" className="size-3 text-primary-foreground m-auto" />
          )}
        </div>
        <span className={cn(
          "text-sm font-medium",
          isCompleted && "line-through text-muted-foreground"
        )}>
          {task.title}
        </span>
      </div>
    </div>
  );
}

// Main Kanban Board Component
export function KanbanBoard({
  columns,
  onTaskMove,
  onTaskReorder,
  onTaskClick,
  onTaskToggle,
  onAddTask,
}: KanbanBoardProps) {
  const [activeTask, setActiveTask] = React.useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const findColumnByTaskId = (taskId: UniqueIdentifier) => {
    return columns.find(col => col.tasks.some(t => t.id === taskId));
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = columns.flatMap(c => c.tasks).find(t => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeColumn = findColumnByTaskId(active.id);
    
    // Check if dropping over a column (empty area or column itself)
    const overColumn = columns.find(c => c.id === over.id);
    
    // If dragging over a task in a different column
    const overTaskColumn = findColumnByTaskId(over.id);

    if (!activeColumn) return;

    // Moving to a different column (dropping on column area)
    if (overColumn && activeColumn.id !== overColumn.id) {
      // Move task to end of new column
      onTaskMove(active.id as string, activeColumn.id, overColumn.id, overColumn.tasks.length);
    } else if (overTaskColumn && activeColumn.id !== overTaskColumn.id) {
      // Moving over a task in a different column
      const overIndex = overTaskColumn.tasks.findIndex(t => t.id === over.id);
      onTaskMove(active.id as string, activeColumn.id, overTaskColumn.id, overIndex);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeColumn = findColumnByTaskId(active.id);
    
    // Check if dropped on a column
    const overColumn = columns.find(c => c.id === over.id);
    const overTaskColumn = findColumnByTaskId(over.id);
    
    const targetColumn = overColumn || overTaskColumn;

    if (!activeColumn || !targetColumn) return;

    // Different column - the move was already handled in dragOver
    if (activeColumn.id !== targetColumn.id) {
      return;
    }

    // Same column - reorder
    const oldIndex = activeColumn.tasks.findIndex(t => t.id === active.id);
    const newIndex = activeColumn.tasks.findIndex(t => t.id === over.id);

    if (oldIndex !== newIndex && newIndex !== -1) {
      const reorderedTasks = arrayMove(activeColumn.tasks, oldIndex, newIndex);
      onTaskReorder(activeColumn.id, reorderedTasks);
    }
  };

  const handleDragCancel = () => {
    setActiveTask(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <ScrollArea className="h-full w-full">
        <div className="flex gap-4 p-6 min-w-max">
          {columns.map(column => (
            <KanbanColumnComponent
              key={column.id}
              column={column}
              onTaskClick={onTaskClick}
              onTaskToggle={onTaskToggle}
              onAddTask={onAddTask}
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <DragOverlay>
        {activeTask ? <DragOverlayTask task={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
  );
}

export default KanbanBoard;
