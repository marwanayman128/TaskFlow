"use client";

import * as React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  UniqueIdentifier,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GripVertical, Calendar, Flag, MoreHorizontal, Trash2 } from "lucide-react";
import { Task } from "@/hooks/use-tasks";
import { motion, AnimatePresence } from "framer-motion";

// Priority configurations
const PRIORITY_CONFIG = {
  HIGH: { color: 'text-red-500', borderColor: 'border-red-500', label: 'High' },
  MEDIUM: { color: 'text-amber-500', borderColor: 'border-amber-500', label: 'Medium' },
  LOW: { color: 'text-blue-500', borderColor: 'border-blue-500', label: 'Low' },
  NONE: { color: 'text-muted-foreground', borderColor: 'border-muted-foreground/30', label: 'None' },
};

// Sortable Task Item
interface SortableTaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onClick: (task: Task) => void;
  isDragging?: boolean;
}

function SortableTaskItem({
  task,
  onToggle,
  onDelete,
  onClick,
  isDragging,
}: SortableTaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [isHovered, setIsHovered] = React.useState(false);

  const priorityConfig = PRIORITY_CONFIG[task.priority];

  return (
    <div
      ref={setNodeRef}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all bg-card",
        "hover:bg-muted/50 group cursor-pointer",
        task.completed && "opacity-60",
        (isSortableDragging || isDragging) && "opacity-50 shadow-lg z-50"
      )}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="touch-none cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="size-4 text-muted-foreground/30 hover:text-muted-foreground transition-colors" />
      </button>

      {/* Checkbox */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle(task.id);
        }}
        className={cn(
          "flex-shrink-0 size-5 rounded-full border-2 transition-all",
          priorityConfig.borderColor,
          task.completed && "bg-primary border-primary"
        )}
      >
        {task.completed && (
          <Icon icon="solar:check-read-linear" className="size-3 text-primary-foreground m-auto" />
        )}
      </button>

      {/* Content */}
      <div 
        className="flex-1 min-w-0"
        onClick={() => onClick(task)}
      >
        <p className={cn(
          "text-sm font-medium truncate",
          task.completed && "line-through text-muted-foreground"
        )}>
          {task.title}
        </p>
        
        {/* Meta info */}
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {task.listName && (
            <Badge 
              variant="outline" 
              className="text-[10px] px-1.5 py-0 h-4 font-normal"
              style={{ borderColor: task.listColor, color: task.listColor }}
            >
              {task.listName}
            </Badge>
          )}
          
          {task.dueDate && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="size-3" />
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}

          {task.tags?.map(tag => (
            <span 
              key={tag.id}
              className="text-[10px] px-1.5 py-0.5 rounded-md"
              style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
            >
              #{tag.name}
            </span>
          ))}
        </div>
      </div>

      {/* Priority */}
      {task.priority !== 'NONE' && (
        <Flag className={cn("size-4", priorityConfig.color)} />
      )}

      {/* Actions */}
      <AnimatePresence>
        {isHovered && !task.completed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Button 
              variant="ghost" 
              size="icon" 
              className="size-7 text-destructive hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task.id);
              }}
            >
              <Trash2 className="size-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Drag overlay component (shown while dragging)
function DragOverlayItem({ task }: { task: Task }) {
  const priorityConfig = PRIORITY_CONFIG[task.priority];

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-card shadow-xl border">
      <GripVertical className="size-4 text-muted-foreground" />
      <div className={cn(
        "flex-shrink-0 size-5 rounded-full border-2",
        priorityConfig.borderColor,
        task.completed && "bg-primary border-primary"
      )}>
        {task.completed && (
          <Icon icon="solar:check-read-linear" className="size-3 text-primary-foreground m-auto" />
        )}
      </div>
      <span className={cn(
        "text-sm font-medium",
        task.completed && "line-through text-muted-foreground"
      )}>
        {task.title}
      </span>
    </div>
  );
}

// Main Draggable Task List Component
interface DraggableTaskListProps {
  tasks: Task[];
  onReorder: (tasks: Task[]) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onClick: (task: Task) => void;
  className?: string;
}

export function DraggableTaskList({
  tasks,
  onReorder,
  onToggle,
  onDelete,
  onClick,
  className,
}: DraggableTaskListProps) {
  const [activeId, setActiveId] = React.useState<UniqueIdentifier | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = tasks.findIndex((t) => t.id === active.id);
      const newIndex = tasks.findIndex((t) => t.id === over.id);

      const reorderedTasks = arrayMove(tasks, oldIndex, newIndex).map(
        (task, index) => ({
          ...task,
          position: index,
        })
      );

      onReorder(reorderedTasks);
    }

    setActiveId(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className={cn("space-y-1", className)}>
          {tasks.map((task) => (
            <SortableTaskItem
              key={task.id}
              task={task}
              onToggle={onToggle}
              onDelete={onDelete}
              onClick={onClick}
              isDragging={activeId === task.id}
            />
          ))}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeTask ? <DragOverlayItem task={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
  );
}

// Export individual components for flexibility
export { SortableTaskItem, DragOverlayItem };
