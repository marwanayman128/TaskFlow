'use client';

import * as React from 'react';
import { format, addDays, nextDay, Day } from 'date-fns';
import { Calendar as CalendarIcon, Clock, ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DateTimePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (date: Date | undefined) => void;
  initialDate?: Date;
}

export function DateTimePicker({
  isOpen,
  onClose,
  onSelect,
  initialDate,
}: DateTimePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(initialDate || new Date());
  const [time, setTime] = React.useState(initialDate ? format(initialDate, 'h:mm a') : '12:00 PM');
  
  // Update internal state when opened
  React.useEffect(() => {
    if (isOpen) {
        if (initialDate) {
            setDate(initialDate);
            setTime(format(initialDate, 'h:mm a'));
        } else {
            setDate(new Date());
            setTime(format(new Date(), 'h:mm a'));
        }
    }
  }, [isOpen, initialDate]);

  const handleDateSelect = (newDate: Date | undefined) => {
    setDate(newDate);
  };

  const handleSet = () => {
    if (date) {
        // Parse time string and combine with date
        // Simple parser for demo (assumes "H:mm A" or "HH:mm")
        const [timePart, period] = time.split(' ');
        const [hours, minutes] = timePart.split(':').map(Number);
        
        let finalHours = hours;
        if (period?.toLowerCase() === 'pm' && hours < 12) finalHours += 12;
        if (period?.toLowerCase() === 'am' && hours === 12) finalHours = 0;

        const combinedDate = new Date(date);
        combinedDate.setHours(finalHours || 0);
        combinedDate.setMinutes(minutes || 0);
        
        onSelect(combinedDate);
    } else {
        onSelect(undefined);
    }
    onClose();
  };

  const setQuickDate = (type: 'tomorrow' | 'nextWeek' | 'someday') => {
      const today = new Date();
      let newDate = new Date();
      
      if (type === 'tomorrow') {
          newDate = addDays(today, 1);
      } else if (type === 'nextWeek') {
          newDate = addDays(today, 7);
      } else if (type === 'someday') {
          newDate = addDays(today, 30); // Placeholder
      }
      setDate(newDate);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[580px] p-0 gap-0 overflow-hidden bg-popover text-popover-foreground border-border shadow-xl">
        <div className="p-4 text-center border-b border-border bg-muted/40 backdrop-blur-sm">
          <DialogTitle className="text-sm font-semibold tracking-tight">Pick date & time</DialogTitle>
        </div>
        
        <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-border">
            {/* Left/Main Content */}
            <div className="flex-1 p-5">
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Date</Label>
                        <div className="relative">
                            <Input 
                                value={date ? format(date, 'MMM d, yyyy') : ''}
                                onChange={() => {}} // Read only
                                className="bg-background border-input hover:border-ring/50 focus-visible:ring-ring h-9 text-sm font-medium"
                            />
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Time</Label>
                        <div className="relative">
                            <Input 
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="bg-background border-input hover:border-ring/50 focus-visible:ring-ring h-9 text-sm font-medium"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-background/50 rounded-xl border border-border p-3 flex justify-center">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={handleDateSelect}
                        initialFocus
                        className="p-0 pointer-events-auto"
                        classNames={{
                           month: "space-y-4",
                           caption: "flex justify-between pt-1 relative items-center px-2",
                           caption_label: "text-sm font-semibold",
                           nav: "space-x-1 flex items-center",
                           nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-muted rounded-md transition-colors",
                           table: "w-full border-collapse space-y-1",
                           head_row: "flex",
                           head_cell: "text-muted-foreground rounded-md w-9 font-medium text-[0.8rem]",
                           row: "flex w-full mt-2",
                           cell: "text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                           day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-muted rounded-md transition-colors",
                           day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                           day_today: "bg-accent text-accent-foreground font-medium",
                           day_outside: "text-muted-foreground opacity-50",
                           day_disabled: "text-muted-foreground opacity-50",
                           day_hidden: "invisible",
                        }}
                    />
                </div>
            </div>

            {/* Right/Side Panel (Shortcuts) */}
            <div className="p-4 min-w-[160px] bg-muted/10 flex flex-col gap-1">
                 <Label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2 px-2">Quick Select</Label>
                 <Button 
                    variant="ghost" 
                    className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted h-9 px-2 font-normal"
                    onClick={() => setQuickDate('tomorrow')}
                >
                    <span className="flex-1 text-left">Tomorrow</span>
                    <span className="text-xs opacity-50">{format(addDays(new Date(), 1), 'EEE')}</span>
                </Button>
                 <Button 
                    variant="ghost" 
                    className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted h-9 px-2 font-normal"
                    onClick={() => setQuickDate('nextWeek')}
                >
                    <span className="flex-1 text-left">Next Week</span>
                    <span className="text-xs opacity-50">{format(addDays(new Date(), 7), 'EEE')}</span>
                </Button>
                 <Button 
                    variant="ghost" 
                    className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted h-9 px-2 font-normal"
                    onClick={() => setQuickDate('someday')}
                >
                    <span className="flex-1 text-left">Someday</span>
                </Button>
            </div>
        </div>

        <DialogFooter className="p-4 bg-muted/20 border-t border-border">
             <div className="flex w-full justify-between items-center">
                <Button variant="ghost" onClick={onClose} className="text-muted-foreground hover:text-foreground">
                    Cancel
                </Button>
                 <Button onClick={handleSet} className="font-medium px-8 shadow-sm">
                    Set Date
                </Button>
             </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
