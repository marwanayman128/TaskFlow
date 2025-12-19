'use client';

import * as React from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { CalendarIcon, Repeat, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface RecurrenceRule {
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  interval: number;
  daysOfWeek?: number[]; // 0-6, Sunday = 0
  dayOfMonth?: number;
  monthOfYear?: number;
  endDate?: Date;
  count?: number;
}

interface RecurringTaskEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value?: RecurrenceRule | null;
  onChange: (rule: RecurrenceRule | null) => void;
}

const DAYS_OF_WEEK = [
  { label: 'S', fullLabel: 'Sunday', value: 0 },
  { label: 'M', fullLabel: 'Monday', value: 1 },
  { label: 'T', fullLabel: 'Tuesday', value: 2 },
  { label: 'W', fullLabel: 'Wednesday', value: 3 },
  { label: 'T', fullLabel: 'Thursday', value: 4 },
  { label: 'F', fullLabel: 'Friday', value: 5 },
  { label: 'S', fullLabel: 'Saturday', value: 6 },
];

const FREQUENCY_OPTIONS = [
  { value: 'DAILY', label: 'Day', plural: 'Days' },
  { value: 'WEEKLY', label: 'Week', plural: 'Weeks' },
  { value: 'MONTHLY', label: 'Month', plural: 'Months' },
  { value: 'YEARLY', label: 'Year', plural: 'Years' },
];

const QUICK_PRESETS = [
  { label: 'Every day', rule: { frequency: 'DAILY' as const, interval: 1 } },
  { label: 'Every weekday', rule: { frequency: 'WEEKLY' as const, interval: 1, daysOfWeek: [1, 2, 3, 4, 5] } },
  { label: 'Every week', rule: { frequency: 'WEEKLY' as const, interval: 1 } },
  { label: 'Every 2 weeks', rule: { frequency: 'WEEKLY' as const, interval: 2 } },
  { label: 'Every month', rule: { frequency: 'MONTHLY' as const, interval: 1 } },
  { label: 'Every year', rule: { frequency: 'YEARLY' as const, interval: 1 } },
];

export function RecurringTaskEditor({ open, onOpenChange, value, onChange }: RecurringTaskEditorProps) {
  const [rule, setRule] = React.useState<RecurrenceRule>({
    frequency: 'WEEKLY',
    interval: 1,
    daysOfWeek: [],
  });
  const [endType, setEndType] = React.useState<'never' | 'date' | 'count'>('never');

  // Initialize from value
  React.useEffect(() => {
    if (value) {
      setRule(value);
      if (value.endDate) {
        setEndType('date');
      } else if (value.count) {
        setEndType('count');
      } else {
        setEndType('never');
      }
    }
  }, [value, open]);

  const handleSave = () => {
    const finalRule: RecurrenceRule = {
      ...rule,
      endDate: endType === 'date' ? rule.endDate : undefined,
      count: endType === 'count' ? rule.count : undefined,
    };
    onChange(finalRule);
    onOpenChange(false);
  };

  const handleClear = () => {
    onChange(null);
    onOpenChange(false);
  };

  const toggleDayOfWeek = (day: number) => {
    const current = rule.daysOfWeek || [];
    if (current.includes(day)) {
      setRule(prev => ({ ...prev, daysOfWeek: current.filter(d => d !== day) }));
    } else {
      setRule(prev => ({ ...prev, daysOfWeek: [...current, day].sort() }));
    }
  };

  const getRecurrenceDescription = (r: RecurrenceRule): string => {
    const freq = FREQUENCY_OPTIONS.find(f => f.value === r.frequency);
    let desc = `Every ${r.interval === 1 ? freq?.label.toLowerCase() : `${r.interval} ${freq?.plural.toLowerCase()}`}`;
    
    if (r.frequency === 'WEEKLY' && r.daysOfWeek && r.daysOfWeek.length > 0) {
      const days = r.daysOfWeek.map(d => DAYS_OF_WEEK[d].fullLabel).join(', ');
      desc += ` on ${days}`;
    }
    
    if (r.endDate) {
      desc += ` until ${format(r.endDate, 'MMM d, yyyy')}`;
    } else if (r.count) {
      desc += `, ${r.count} times`;
    }
    
    return desc;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Repeat className="size-5 text-primary" />
            Repeat Task
          </DialogTitle>
          <DialogDescription>
            Set up a recurring schedule for this task
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Quick Presets */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Quick Select</Label>
            <div className="flex flex-wrap gap-2">
              {QUICK_PRESETS.map((preset) => (
                <Badge
                  key={preset.label}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => setRule({ ...rule, ...preset.rule })}
                >
                  {preset.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Custom Settings */}
          <div className="space-y-4 p-4 rounded-lg bg-muted/30">
            {/* Repeat every X frequency */}
            <div className="flex items-center gap-2">
              <Label className="shrink-0">Repeat every</Label>
              <Input
                type="number"
                min={1}
                max={99}
                value={rule.interval}
                onChange={(e) => setRule(prev => ({ ...prev, interval: parseInt(e.target.value) || 1 }))}
                className="w-16 text-center"
              />
              <Select
                value={rule.frequency}
                onValueChange={(v) => setRule(prev => ({ ...prev, frequency: v as RecurrenceRule['frequency'] }))}
              >
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FREQUENCY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {rule.interval === 1 ? option.label : option.plural}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Days of week (for weekly) */}
            {rule.frequency === 'WEEKLY' && (
              <div className="space-y-2">
                <Label className="text-sm">On these days</Label>
                <div className="flex gap-1">
                  {DAYS_OF_WEEK.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleDayOfWeek(day.value)}
                      className={cn(
                        "size-9 rounded-full text-sm font-medium transition-all",
                        rule.daysOfWeek?.includes(day.value)
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80 text-muted-foreground"
                      )}
                      title={day.fullLabel}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Day of month (for monthly) */}
            {rule.frequency === 'MONTHLY' && (
              <div className="flex items-center gap-2">
                <Label>On day</Label>
                <Input
                  type="number"
                  min={1}
                  max={31}
                  value={rule.dayOfMonth || 1}
                  onChange={(e) => setRule(prev => ({ ...prev, dayOfMonth: parseInt(e.target.value) || 1 }))}
                  className="w-16 text-center"
                />
                <span className="text-sm text-muted-foreground">of the month</span>
              </div>
            )}

            {/* End Type */}
            <div className="space-y-3 pt-3 border-t">
              <Label className="text-sm">Ends</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="end-never"
                    checked={endType === 'never'}
                    onCheckedChange={() => setEndType('never')}
                  />
                  <Label htmlFor="end-never" className="text-sm cursor-pointer">Never</Label>
                </div>
                
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="end-date"
                    checked={endType === 'date'}
                    onCheckedChange={() => setEndType('date')}
                  />
                  <Label htmlFor="end-date" className="text-sm cursor-pointer">On date</Label>
                  {endType === 'date' && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="ml-auto">
                          <CalendarIcon className="size-4 mr-2" />
                          {rule.endDate ? format(rule.endDate, 'MMM d, yyyy') : 'Pick date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={rule.endDate}
                          onSelect={(date) => setRule(prev => ({ ...prev, endDate: date || undefined }))}
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="end-count"
                    checked={endType === 'count'}
                    onCheckedChange={() => setEndType('count')}
                  />
                  <Label htmlFor="end-count" className="text-sm cursor-pointer">After</Label>
                  {endType === 'count' && (
                    <>
                      <Input
                        type="number"
                        min={1}
                        max={999}
                        value={rule.count || 10}
                        onChange={(e) => setRule(prev => ({ ...prev, count: parseInt(e.target.value) || 10 }))}
                        className="w-16 text-center"
                      />
                      <span className="text-sm text-muted-foreground">occurrences</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
            <Repeat className="size-4 text-primary shrink-0" />
            <span className="text-sm">{getRecurrenceDescription(rule)}</span>
          </div>
        </div>

        <DialogFooter className="gap-2">
          {value && (
            <Button variant="outline" onClick={handleClear} className="mr-auto">
              <X className="size-4 mr-1" />
              Remove
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Repeat className="size-4 mr-1" />
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Simple trigger button for use in forms
interface RecurringTaskButtonProps {
  value?: RecurrenceRule | null;
  onChange: (rule: RecurrenceRule | null) => void;
}

export function RecurringTaskButton({ value, onChange }: RecurringTaskButtonProps) {
  const [open, setOpen] = React.useState(false);

  const getShortDescription = (r: RecurrenceRule): string => {
    const freq = FREQUENCY_OPTIONS.find(f => f.value === r.frequency);
    if (r.interval === 1) {
      return `Every ${freq?.label.toLowerCase()}`;
    }
    return `Every ${r.interval} ${freq?.plural.toLowerCase()}`;
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className={cn(
          "h-8 rounded-lg gap-2 border-dashed bg-transparent hover:bg-primary/5 hover:border-primary/40 hover:text-primary transition-all",
          value && "text-primary border-primary/40 bg-primary/5"
        )}
      >
        <Repeat className="size-4 mr-1.5" />
        {value ? getShortDescription(value) : 'Repeat'}
      </Button>

      <RecurringTaskEditor
        open={open}
        onOpenChange={setOpen}
        value={value}
        onChange={onChange}
      />
    </>
  );
}

export default RecurringTaskEditor;
