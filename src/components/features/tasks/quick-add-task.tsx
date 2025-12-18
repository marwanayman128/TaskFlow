'use client';

import * as React from 'react';
import { useLists, useTags, Tag, TaskList } from '@/hooks/use-tasks';
import { DateTimePicker } from './date-time-picker';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Icon } from '@iconify/react';
import { Calendar, ChevronUp, Plus, List, X, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

interface QuickAddTaskProps {
  onAdd: (data: { title: string; listId?: string; tags?: string[]; dueDate?: Date }) => Promise<void>;
  defaultListId?: string;
  isCreating?: boolean;
  compact?: boolean;
}

export function QuickAddTask({
  onAdd,
  defaultListId,
  isCreating = false,
  compact = false,
}: QuickAddTaskProps) {
  const [title, setTitle] = React.useState('');
  const [isFocused, setIsFocused] = React.useState(false);
  
  // Selection State
  const [selectedListId, setSelectedListId] = React.useState<string | undefined>(defaultListId);
  const [selectedTagIds, setSelectedTagIds] = React.useState<string[]>([]);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(undefined);
  
  // Popover States
  const [isListOpen, setIsListOpen] = React.useState(false);
  const [isTagOpen, setIsTagOpen] = React.useState(false);
  const [isDateOpen, setIsDateOpen] = React.useState(false);

  // Data Hooks
  const { lists } = useLists();
  const { tags } = useTags();

  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if any picker is open - if so, don't close focus
      if (isListOpen || isTagOpen || isDateOpen) return;

      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (!title.trim()) {
             setIsFocused(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [title, isListOpen, isTagOpen, isDateOpen]);


  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (title.trim()) {
      await onAdd({
        title: title.trim(),
        listId: selectedListId,
        tags: selectedTagIds,
        dueDate: selectedDate,
      });
      setTitle('');
      setSelectedTagIds([]);
      setSelectedDate(undefined);
      if (defaultListId) setSelectedListId(defaultListId);
    }
  };

  const selectedList = lists.find(l => l.id === selectedListId);

  return (
    <div ref={containerRef} className="relative">
      <div onSubmit={handleSubmit}>
        {/* Floating Toolbar - Modern with dividers (hidden in compact mode) */}
        {isFocused && !compact && (
          <div className="absolute bottom-full left-0 right-0 mb-3 animate-in fade-in slide-in-from-bottom-3 duration-300 ease-out">
            <div className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-xl shadow-black/5 overflow-hidden">
              <div className="flex items-stretch divide-x divide-border/50">
                {/* List Selector */}
                <div className="flex-1 flex items-center justify-center">
                  <Popover open={isListOpen} onOpenChange={setIsListOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        className={cn(
                          "h-14 w-full rounded-none hover:bg-muted/50 transition-all",
                          selectedListId && selectedList ? "text-primary hover:text-primary" : "text-muted-foreground hover:text-foreground flex flex-col gap-0.5"
                        )}
                        title="Select list"
                      >
                        {selectedListId && selectedList ? (
                          <span className="text-sm font-medium">{selectedList.name}</span>
                        ) : (
                          <>
                            <Icon icon="solar:list-linear" className="size-5" />
                            <span className="text-[10px] font-medium">List</span>
                          </>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-[200px]" align="start">
                      <Command>
                        <CommandInput placeholder="Select list..." />
                        <CommandList>
                          <CommandEmpty>No lists found.</CommandEmpty>
                          <CommandGroup>
                            {lists.map(list => (
                              <CommandItem
                                key={list.id}
                                value={list.name}
                                onSelect={() => {
                                  setSelectedListId(list.id);
                                  setIsListOpen(false);
                                }}
                                className="gap-2"
                              >
                                <Icon icon={list.icon || 'solar:list-linear'} className="size-4" style={{ color: list.color }} />
                                {list.name}
                                {selectedListId === list.id && <Icon icon="solar:check-read-linear" className="ml-auto size-4" />}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Date Picker Trigger */}
                <div className="flex-1 flex items-center justify-center">
                  <Button
                    type="button"
                    variant="ghost"
                    className={cn(
                      "h-14 w-full rounded-none hover:bg-muted/50 transition-all",
                      selectedDate ? "text-blue-500 hover:text-blue-600" : "text-muted-foreground hover:text-foreground flex flex-col gap-0.5"
                    )}
                    onClick={() => setIsDateOpen(true)}
                    title="Set due date"
                  >
                    {selectedDate ? (
                      <span className="text-sm font-medium">{format(selectedDate, 'h:mm a')}</span>
                    ) : (
                      <>
                        <Icon icon="solar:calendar-linear" className="size-5" />
                        <span className="text-[10px] font-medium">Date</span>
                      </>
                    )}
                  </Button>
                </div>

                {/* Tag Selector */}
                <div className="flex-1 flex items-center justify-center">
                  <Popover open={isTagOpen} onOpenChange={setIsTagOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        className={cn(
                          "h-14 w-full rounded-none hover:bg-muted/50 transition-all",
                          selectedTagIds.length > 0 ? "text-primary hover:text-primary" : "text-muted-foreground hover:text-foreground flex flex-col gap-0.5"
                        )}
                        title="Add tags"
                      >
                        {selectedTagIds.length > 0 ? (
                          <span className="text-sm font-medium">
                            {selectedTagIds.length === 1 
                              ? tags.find(t => t.id === selectedTagIds[0])?.name 
                              : `${selectedTagIds.length} tags`
                            }
                          </span>
                        ) : (
                          <>
                            <Icon icon="solar:hashtag-linear" className="size-5" />
                            <span className="text-[10px] font-medium">Tags</span>
                          </>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-[200px]" align="start">
                      <Command>
                        <CommandInput placeholder="Select tags..." />
                        <CommandList>
                          <CommandEmpty>No tags found.</CommandEmpty>
                          <CommandGroup>
                            {tags.map(tag => {
                              const isSelected = selectedTagIds.includes(tag.id);
                              return (
                                <CommandItem
                                  key={tag.id}
                                  value={tag.name}
                                  onSelect={() => {
                                    setSelectedTagIds(prev => 
                                      prev.includes(tag.id) 
                                        ? prev.filter(id => id !== tag.id) 
                                        : [...prev, tag.id]
                                    );
                                  }}
                                  className="gap-2"
                                >
                                  <div className="size-2 rounded-full" style={{ backgroundColor: tag.color }} />
                                  {tag.name}
                                  {isSelected && <Icon icon="solar:check-read-linear" className="ml-auto size-4" />}
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
            </div>
          </div>
        )}

        {/* Main Input Container - Modern Design */}
        <div 
          className={cn(
            "flex items-center gap-3 p-1 py-0 rounded-2xl border-2 transition-all duration-300 bg-background",
            isFocused 
              ? "border-primary/50 shadow-lg shadow-primary/5 ring-4 ring-primary/5" 
              : "border-dashed border-muted-foreground/20 hover:border-muted-foreground/40"
          )}
          onClick={() => setIsFocused(true)}
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-10 rounded-xl shrink-0 hover:bg-muted/50"
            style={{ color: selectedList?.color || 'inherit' }}
          >
            <Plus className="size-5" />
          </Button>
          
          <div className="flex-1">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="Add a task..."
              className="border-0 bg-transparent text-base p-0 h-auto focus-visible:ring-0 placeholder:text-muted-foreground/50 font-medium"
              disabled={isCreating}
              autoComplete="off"
              style={{ backgroundColor: selectedList?.color || 'inherit' }}
            />
          </div>

          {/* Submit Button - Modern Arrow */}
          <Button 
            type="button"
            onClick={handleSubmit}
            size="icon"
            className="rounded-xl size-8 shrink-0 shadow-sm hover:shadow transition-all" 
            disabled={!title.trim() || isCreating}
          >
            <ArrowRight className="size-5" />
          </Button>
        </div>
      </div>
      
      {/* Date Picker Dialog */}
      <DateTimePicker 
        isOpen={isDateOpen} 
        onClose={() => setIsDateOpen(false)} 
        onSelect={setSelectedDate}
        initialDate={selectedDate}
      />
    </div>
  );
}