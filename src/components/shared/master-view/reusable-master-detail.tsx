"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Plus, 
  Trash2, 
  CheckCircle2,
  ChevronRight,
  MoreVertical,
} from "lucide-react";
import { Icon } from "@iconify/react";
import { format } from "date-fns";
import type { DataTableProps } from "@/components/shared/tables/reusable-data-table";
import { QuickAddTask } from "@/components/features/tasks/quick-add-task";
import { TaskCard } from "@/components/features/tasks/task-card";
import { DynamicAnimation } from '@/components/layout/dynamic-animation';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Interface for Task Item
export interface MasterDetailProps<T extends { id: string }> extends DataTableProps<T> {
  renderMasterItem?: (item: T, isSelected: boolean) => React.ReactNode;
  renderDetailView?: (item: T) => React.ReactNode;
  renderDetailHeader?: (item: T, actions?: React.ReactNode) => React.ReactNode;
  actions?: any[]; 
  onToggle?: (id: string, completed: boolean) => void;
  onDelete?: (id: string) => void;
  onArchive?: (id: string) => void;
  onAddToMyDay?: (id: string) => void;
  onAdd?: (data?: any) => Promise<void> | void;
  onUpdate?: (id: string, data: any) => void;
  availableTags?: { id: string; name: string; color: string }[];
  title?: string;
}

export function ReusableMasterDetail<T extends { id: string, title?: string, completed?: boolean, dueDate?: string | Date }>({
  data, columns, loading = false,
  title, onAdd,
  onRowClick,
  className,
  renderMasterItem,
  renderDetailHeader,
  onToggle, onDelete, onArchive, onAddToMyDay, onUpdate,
  availableTags = []
}: MasterDetailProps<T>) {

  
  // Recursively find task
  const findTaskById = (items: T[], id: string): T | undefined => {
    for (const item of items) {
      if (item.id === id) return item;
      if ((item as any).subTasks && (item as any).subTasks.length > 0) {
        const found = findTaskById((item as any).subTasks, id);
        if (found) return found;
      }
    }
    return undefined;
  };

  // State
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [isReminderOpen, setIsReminderOpen] = React.useState(false);
  const [isTagOpen, setIsTagOpen] = React.useState(false);
  const [expandedTasks, setExpandedTasks] = React.useState<Set<string>>(new Set());
  
  const selectedItem = React.useMemo(() => 
    selectedId ? findTaskById(data, selectedId) : undefined
  , [data, selectedId]);

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedTasks(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Default Master Item Renderer (Task Item Style)
  // Now accepts subtask expansion props to render chevron inside the card
  const defaultRenderMasterItem = (
    item: T, 
    isSelected: boolean,
    options?: { hasSubTasks?: boolean; isExpanded?: boolean; onToggleExpand?: (e: React.MouseEvent) => void }
  ) => {
    const { hasSubTasks, isExpanded, onToggleExpand } = options || {};
    
    return (
      <div 
        className={cn(
            "group flex items-center gap-3 p-3 rounded-xl transition-all duration-200 cursor-pointer border border-transparent",
            isSelected ? "bg-primary/5 border-primary/10 shadow-sm" : "hover:bg-muted/50 border-border/20 bg-card/50"
        )}
        onClick={() => {
            setSelectedId(item.id);
            onRowClick?.(item);
        }}
      >
        {/* Checkbox Wrapper */}
        <div className="flex-shrink-0 pt-0.5">
           <button 
             type="button" 
             role="checkbox" 
             aria-checked={(item as any).status === 'COMPLETED' || item.completed}
             className={cn(
                 "size-5 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center transition-all hover:scale-110 z-10 relative",
                 ((item as any).status === 'COMPLETED' || item.completed) && "bg-primary border-primary text-primary-foreground"
             )}
             onClick={(e) => {
                 e.stopPropagation();
                 onToggle?.(item.id, !((item as any).status === 'COMPLETED' || item.completed));
             }}
           >
              {((item as any).status === 'COMPLETED' || item.completed) && <CheckCircle2 className="size-3.5" />}
           </button>
        </div>

        {/* Main Content - Truncate to 50 chars */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
            <div className={cn(
                "text-sm font-medium transition-all",
                ((item as any).status === 'COMPLETED' || item.completed) && "line-through text-muted-foreground"
            )} title={item.title || (item as any).name || "Untitled"}>
                {(() => {
                    const text = item.title || (item as any).name || "Untitled";
                    return text.length > 50 ? text.substring(0, 50) + '...' : text;
                })()}
            </div>
        </div>

        {/* Chevron for expansion - inside the card, center-right */}
        {hasSubTasks && (
          <button 
              onClick={(e) => {
                  e.stopPropagation();
                  onToggleExpand?.(e);
              }}
              className="p-1 text-muted-foreground/50 hover:text-foreground transition-colors shrink-0 rounded-md hover:bg-muted/50"
          >
              <ChevronRight className={cn("size-4 transition-transform duration-200", isExpanded && "rotate-90")} />
          </button>
        )}

        {/* 3-dot Actions Menu */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="size-8 text-muted-foreground hover:text-foreground"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <MoreVertical className="size-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem 
                        onClick={(e) => {
                            e.stopPropagation();
                            onAddToMyDay?.(item.id);
                        }}
                        className="gap-2"
                    >
                        <Icon icon="solar:sun-linear" className="size-4" />
                        Add to My Day
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                        onClick={(e) => {
                            e.stopPropagation();
                            // Reminder - sets due date to today with a time (for now)
                            // This would ideally open a date/time picker
                        }}
                        className="gap-2"
                    >
                        <Icon icon="solar:bell-linear" className="size-4" />
                        Reminder
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                        onClick={(e) => e.stopPropagation()}
                        className="gap-2"
                    >
                        <Icon icon="solar:document-text-linear" className="size-4" />
                        Lists
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                        onClick={(e) => e.stopPropagation()}
                        className="gap-2"
                    >
                        <Icon icon="solar:hashtag-linear" className="size-4" />
                        Tags
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                        onClick={(e) => {
                            e.stopPropagation();
                            onArchive?.(item.id);
                        }}
                        className="gap-2"
                    >
                        <Icon icon="solar:archive-linear" className="size-4" />
                        Archive
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete?.(item.id);
                        }}
                        className="gap-2 text-destructive focus:text-destructive"
                    >
                        <Trash2 className="size-4" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>
    );
  };


  const isMyDay = selectedItem?.dueDate && new Date(selectedItem.dueDate).toDateString() === new Date().toDateString();

  // Render Tree Function - Max 3 levels: parent (0), child (1), grandchild (2)
  const MAX_TREE_DEPTH = 3;
  
  const renderTree = (items: T[], level = 0) => {
    if (!items || items.length === 0) return null;
    
    return items.map(item => {
       const subTasks = (item as any).subTasks || [];
       // Only show subtasks if within max depth limit
       const canHaveSubTasks = level < MAX_TREE_DEPTH - 1;
       const hasSubTasks = canHaveSubTasks && subTasks.length > 0;
       const isExpanded = expandedTasks.has(item.id);
       const isSelected = selectedId === item.id;

       return (
         <div key={item.id} className="relative">
             <div className="flex items-center gap-1 group/tree-row">
                 {/* Indent spacer for tree hierarchy */}
                 <div style={{ width: level * 20 }} className="shrink-0" />
                 
                 {/* Main content with chevron inside the card */}
                 <div className="flex-1 min-w-0">
                    {renderMasterItem 
                          ? renderMasterItem(item, isSelected) 
                          : defaultRenderMasterItem(item, isSelected, {
                              hasSubTasks,
                              isExpanded,
                              onToggleExpand: (e) => toggleExpand(item.id, e)
                            })
                    }
                 </div>
             </div>

             {/* Recursion for subtasks */}
             {hasSubTasks && (
                <div className={cn(
                    "grid transition-all duration-200 ease-in-out",
                    isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                )}>
                     <div className="overflow-hidden">
                        {renderTree(subTasks, level + 1)}
                     </div>
                 </div>
             )}
         </div>
       );
    });
  };

  return (
    <div className={cn("flex flex-row gap-8 mt-6 h-[calc(100vh-8rem)] w-full overflow-hidden", className)}>
        {/* MASTER VIEW (CardScrollView) */}
        <div className={cn(
            "flex-1 flex flex-col min-w-0 transition-all duration-300 relative bg-card rounded-3xl",
            selectedId ? "lg:mr-0 hidden md:flex md:w-[400px] md:flex-none border-border/40" : "mr-0"
        )}>
           
           <div className="h-4 shrink-0" />

           {/* Task List Container */}
           <ScrollArea className="flex-1 px-4">
              <div className="space-y-1 pb-20">
                  {loading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="h-12 rounded-xl bg-muted/20 animate-pulse w-full" />
                      ))
                  ) : data.length === 0 ? (
                       <div className="flex flex-col items-center justify-center  text-center text-muted-foreground">
            <DynamicAnimation animationUrl="/animations/man-completes-tasks-on-laptop-illustration-2025-10-20-23-53-14-utc.json" />
                           <p className="text-lg">No tasks found</p>
                       </div>
                  ) : (
                      renderTree(data)
                  )}
              </div>
           </ScrollArea>

           {/* Quick Add Task Input */}
           <div className="p-4">
               <div className="bg-background/80 backdrop-blur-sm p-1 rounded-xl shadow-lg border border-border/40">
                  <QuickAddTask 
                    onAdd={(data) => {
                         if (onAdd) {
                             return Promise.resolve(onAdd(data));
                         }
                         return Promise.resolve();
                    }}
                  />
               </div>
           </div>
        </div>

        {/* DETAIL VIEW (TaskEditPane) */}
       <div className={cn(
            "flex-1 min-w-0 backdrop-blur-sm transition-all duration-300 flex flex-col",
            !selectedItem && "hidden md:flex md:items-center md:justify-center bg-muted/5"
        )}>
             {selectedItem ? (
                 <div className="flex flex-col h-full w-full rounded-3xl border-border/40 shadow-2xl md:shadow-none bg-card overflow-hidden">
                     {/* Header */}
                     <header className="h-14 border-b border-border/40 flex items-center justify-between px-4 shrink-0 bg-primary/5">
                         {/* Breadcrumb / Back (Mobile) */}
                         <div className="flex items-center gap-2 overflow-hidden">
                             <Button 
                               variant="ghost" 
                               size="icon" 
                               className="md:hidden mr-1 hover:bg-primary/10"
                               onClick={() => setSelectedId(null)}
                             >
                                 <ChevronRight className="size-5 rotate-180" />
                             </Button>
                             
                             <div className="flex items-center text-sm text-muted-foreground truncate">
                                 <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 text-primary">
                                     <Icon icon="solar:list-linear" className="size-3.5" />
                                     Lists
                                 </span>
                                 <ChevronRight className="size-4 opacity-50" />
                                 {(selectedItem as any).parentTask && (
                                     <>
                                        <button 
                                            onClick={() => setSelectedId((selectedItem as any).parentTask.id)}
                                            className="hover:text-foreground hover:underline truncate max-w-[100px]"
                                        >
                                            {(selectedItem as any).parentTask.title}
                                        </button>
                                        <ChevronRight className="size-4 opacity-50" />
                                     </>
                                 )}
                                 <span className="font-medium text-foreground truncate max-w-[150px]">
                                     {selectedItem.title || "Untitled"}
                                 </span>
                             </div>
                         </div>
                         
                         {/* Actions */}
                         {renderDetailHeader ? renderDetailHeader(selectedItem) : (
                               <div className="flex items-center gap-1">
                                    {/* Mark as Completed */}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className={cn(
                                            "size-9 rounded-lg transition-all",
                                            ((selectedItem as any).status === 'COMPLETED' || selectedItem.completed) 
                                                ? "text-primary bg-primary/10" 
                                                : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                                        )}
                                        onClick={() => onToggle?.(selectedItem.id, !((selectedItem as any).status === 'COMPLETED' || selectedItem.completed))}
                                        title={((selectedItem as any).status === 'COMPLETED' || selectedItem.completed) ? "Mark as incomplete" : "Mark as complete"}
                                    >
                                        <CheckCircle2 className="size-5" />
                                    </Button>

                                    {/* Add to My Day */}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className={cn(
                                            "size-9 rounded-lg transition-all",
                                            isMyDay
                                                ? "text-amber-500 bg-amber-500/10" 
                                                : "text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10"
                                        )}
                                        onClick={() => onAddToMyDay?.(selectedItem.id)}
                                        title={isMyDay ? "Added to My Day" : "Add to My Day"}
                                    >
                                        <Icon icon="solar:sun-bold" className="size-5" />
                                    </Button>

                                    {/* Archive */}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                                        onClick={() => onArchive?.(selectedItem.id)}
                                        title="Archive task"
                                    >
                                        <Icon icon="solar:archive-linear" className="size-5" />
                                    </Button>
                               </div>
                         )}
                     </header>

                     {/* Content */}
                     <ScrollArea className="flex-1">
                         <div className="p-6 space-y-8">
                             
                             {/* Title Area */}
                             <div className="space-y-4">
                                 <div className="relative group">
                                     <textarea 
                                        className="w-full bg-transparent text-2xl font-bold resize-none focus:outline-none placeholder:text-muted-foreground/40 leading-normal"
                                        placeholder="Task title"
                                        defaultValue={selectedItem.title || ""}
                                        key={selectedItem.id + "_title"}
                                        rows={1}
                                        style={{ minHeight: '40px' }}
                                        onInput={(e) => {
                                            e.currentTarget.style.height = 'auto';
                                            e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
                                        }}
                                        onBlur={(e) => {
                                            if (e.target.value !== selectedItem.title) {
                                                onUpdate?.(selectedItem.id, { title: e.target.value } as unknown as Partial<T>);
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                e.currentTarget.blur();
                                            }
                                        }}
                                     />
                                     <div className="absolute bottom-0 left-0 w-full h-0.5 bg-border group-focus-within:bg-primary group-focus-within:shadow-[0_0_8px_rgba(var(--primary),0.3)] transition-all" />
                                 </div>

                                 {/* Inline Reminders / Tags */}
                                 {/* Inline Reminders / Tags */}
                                 <div className="flex flex-wrap items-center gap-2">
                                     <Popover open={isReminderOpen} onOpenChange={setIsReminderOpen}>
                                       <PopoverTrigger asChild>
                                          <Button variant="outline" size="sm" className="h-8 rounded-lg gap-2 border-dashed bg-transparent hover:bg-primary/5 hover:border-primary/40 hover:text-primary transition-all">
                                              <Icon icon="solar:alarm-add-linear" className="size-4" />
                                              {selectedItem.dueDate ? format(new Date(selectedItem.dueDate), 'MMM d, h:mm a') : "Remind me"}
                                          </Button>
                                       </PopoverTrigger>
                                       <PopoverContent className="w-auto p-0" align="start">
                                          <Calendar
                                            mode="single"
                                            selected={selectedItem.dueDate ? new Date(selectedItem.dueDate) : undefined}
                                            onSelect={(date) => {
                                                if (date) {
                                                    onUpdate?.(selectedItem.id, { dueDate: date?.toISOString() } as any);
                                                    setIsReminderOpen(false);
                                                }
                                            }}
                                            initialFocus
                                          />
                                       </PopoverContent>
                                     </Popover>

                                     <Popover open={isTagOpen} onOpenChange={setIsTagOpen}>
                                        <PopoverTrigger asChild>
                                           <Button variant="outline" size="sm" className="h-8 rounded-lg gap-2 border-dashed bg-transparent hover:bg-primary/5 hover:border-primary/40 hover:text-primary transition-all">
                                               <Icon icon="solar:hashtag-linear" className="size-4" />
                                               {(selectedItem as any).tags && (selectedItem as any).tags.length > 0 ? (
                                                  <span className="flex items-center gap-1">
                                                    {(selectedItem as any).tags.length} Tags
                                                  </span>
                                               ) : "Tags"}
                                           </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[200px] p-0" align="start">
                                            <Command>
                                              <CommandInput placeholder="Search tags..." />
                                              <CommandList>
                                                <CommandEmpty>No tags found.</CommandEmpty>
                                                <CommandGroup>
                                                  {availableTags.map((tag) => {
                                                    const currentTags = (selectedItem as any).tags || [];
                                                    const isSelected = currentTags.some((t: any) => t.id === tag.id || t.tagId === tag.id);
                                                    return (
                                                      <CommandItem
                                                        key={tag.id}
                                                        value={tag.name}
                                                        onSelect={() => {
                                                            let newTags;
                                                            if (isSelected) {
                                                              newTags = currentTags.filter((t: any) => (t.id !== tag.id && t.tagId !== tag.id));
                                                            } else {
                                                              newTags = [...currentTags, { id: tag.id, name: tag.name, color: tag.color }];
                                                            }
                                                            // Transform to ID array for API
                                                            const newTagIds = newTags.map((t:any) => t.id || t.tagId);
                                                            onUpdate?.(selectedItem.id, { tagIds: newTagIds } as any);
                                                        }}
                                                      >
                                                        <div className="flex items-center gap-2 w-full">
                                                          <div className="size-2 rounded-full shrink-0" style={{ backgroundColor: tag.color }} />
                                                          <span className="truncate">{tag.name}</span>
                                                          {isSelected && <Icon icon="solar:check-read-linear" className="ml-auto size-4 shrink-0" />}
                                                        </div>
                                                      </CommandItem>
                                                    );
                                                  })}
                                                </CommandGroup>
                                              </CommandList>
                                            </Command>
                                        </PopoverContent>
                                     </Popover>
                                 </div>
                             </div>

                             {/* Notes */}
                             <div className="space-y-2 group">
                                 <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                                     <Icon icon="solar:notes-minimalistic-linear" className="size-4 text-primary/70" />
                                     Notes
                                 </h4>
                                 <textarea 
                                    className="w-full bg-muted/20 p-4 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-primary/5 min-h-[100px] transition-all"
                                    placeholder="Insert your notes here..."
                                    defaultValue={(selectedItem as any).description || ""}
                                    key={selectedItem.id + "_description"}
                                    onBlur={(e) => {
                                         const newVal = e.target.value;
                                         if (newVal !== (selectedItem as any).description) {
                                             onUpdate?.(selectedItem.id, { description: newVal } as unknown as Partial<T>);
                                         }
                                    }}
                                 />
                             </div>

                             {/* Subtasks */}
                             {/* Subtasks */}
                             <div className="space-y-3">
                                 <div className="flex items-center justify-between">
                                     <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                                         <Icon icon="solar:list-check-linear" className="size-4 text-primary/70" />
                                         Subtasks
                                     </h4>
                                     <span className="text-xs text-muted-foreground bg-primary/10 px-2 py-0.5 rounded-full">
                                        {((selectedItem as any).subTasks || []).filter((t: any) => t.status === 'COMPLETED' || t.completed).length}
                                        /
                                        {((selectedItem as any).subTasks || []).length}
                                     </span>
                                 </div>
                                 
                                 {/* Subtasks List */}
                                 <div className="space-y-1">
                                    {((selectedItem as any).subTasks || []).map((subtask: any) => (
                                        <div key={subtask.id} className="group flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                            <button 
                                                className={cn(
                                                    "size-4 rounded-full border-2 transition-all flex items-center justify-center shrink-0",
                                                    (subtask.status === 'COMPLETED' || subtask.completed) 
                                                        ? "bg-primary border-primary text-primary-foreground" 
                                                        : "border-muted-foreground/30 hover:border-primary"
                                                )}
                                                onClick={() => onToggle?.(subtask.id, !((subtask.status === 'COMPLETED' || subtask.completed)))}
                                            >
                                                {(subtask.status === 'COMPLETED' || subtask.completed) && <Icon icon="solar:check-read-linear" className="size-3" />}
                                            </button>
                                            <span className={cn(
                                                "text-sm flex-1 truncate transition-all",
                                                (subtask.status === 'COMPLETED' || subtask.completed) && "line-through text-muted-foreground"
                                            )}>
                                                {subtask.title}
                                            </span>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="size-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                                                onClick={() => onDelete?.(subtask.id)}
                                            >
                                                <Icon icon="solar:trash-bin-trash-linear" className="size-3.5" />
                                            </Button>
                                        </div>
                                    ))}
                                 </div>

                                 {/* Add Subtask Input */}
                                 <form 
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        const form = e.target as HTMLFormElement;
                                        const input = form.elements.namedItem('subtaskTitle') as HTMLInputElement;
                                        if (input.value.trim()) {
                                            onAdd?.({ title: input.value.trim(), parentTaskId: selectedItem.id });
                                            input.value = '';
                                        }
                                    }}
                                    className="relative group"
                                 >
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 size-4 rounded-full border-2 border-muted-foreground/30 group-focus-within:border-primary transition-colors" />
                                    <input 
                                        name="subtaskTitle"
                                        className="w-full bg-transparent p-2 pl-10 rounded-xl text-sm border border-dashed border-border/60 hover:bg-primary/5 hover:border-primary/40 focus:bg-primary/5 focus:border-primary focus:outline-none transition-all placeholder:text-muted-foreground"
                                        placeholder="Add a new subtask..."
                                        autoComplete="off"
                                    />
                                    <Button type="submit" size="icon" variant="ghost" className="absolute right-1 top-1/2 -translate-y-1/2 size-7 text-primary opacity-0 group-focus-within:opacity-100 transition-opacity">
                                        <Plus className="size-4" />
                                    </Button>
                                 </form>
                             </div>

                             {/* Attachments */}
                             <div className="space-y-3">
                                 <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                                     <Icon icon="solar:paperclip-linear" className="size-4 text-primary/70" />
                                     Attachments
                                 </h4>
                                 <div className="border-2 border-dashed border-border/40 rounded-xl p-6 flex flex-col items-center justify-center text-center gap-2 hover:bg-primary/5 hover:border-primary/40 transition-all cursor-pointer group">
                                     <Icon icon="solar:upload-minimalistic-linear" className="size-8 text-muted-foreground/50 group-hover:text-primary/70 transition-colors" />
                                     <p className="text-sm text-muted-foreground group-hover:text-primary transition-colors">Click to add / drop your files here</p>
                                 </div>
                             </div>
                         </div>
                     </ScrollArea>
                 </div>
             ) : (
                 <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                      <div className="size-24 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 rotate-3 shadow-lg shadow-primary/20">
                           <Icon icon="solar:checklist-minimalistic-bold-duotone" className="size-12 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">Select a task</h3>
                      <p className="max-w-xs text-sm">Select a task from the list to view details, notes, and subtasks.</p>
                 </div>
             )}
        </div>
    </div>
  );
}
