import * as React from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useMemo, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DateRange } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

interface EnhancedDatePickerProps {
  value?: string | Date;
  onChange?: (date: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  date?: Date;
  onDateChange?: (date: Date | undefined) => void;
}

// Constants outside component
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
const MONTH_NAMES_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEK_DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

// Date utility functions
const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();
const normalizeDate = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

const formatDateShort = (date: Date) => 
  `${MONTH_NAMES_SHORT[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;

const formatDate = (date: Date) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return `${days[date.getDay()]}, ${MONTH_NAMES[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

export const EnhancedDatePicker = React.memo(function EnhancedDatePicker({ 
  value, 
  onChange, 
  placeholder = "Pick a date", 
  className,
  disabled = false,
  minDate,
  maxDate,
  date,
  onDateChange
}: EnhancedDatePickerProps) {
  const parseValue = (val?: string | Date) => {
    if (!val) return new Date();
    return typeof val === 'string' ? new Date(val) : val;
  };

  const initialDate = parseValue(value || date);
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    (value || date) ? parseValue(value || date) : undefined
  );
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  const [isOpen, setIsOpen] = useState(false);
  const [animationDirection, setAnimationDirection] = useState<'left' | 'right' | null>(null);
  const prevValueRef = useRef(value || date);

  // Pre-calculate timestamps
  const todayTimestamp = useMemo(() => normalizeDate(new Date()), []);
  const selectedTimestamp = useMemo(() => selectedDate ? normalizeDate(selectedDate) : null, [selectedDate]);
  const minTimestamp = useMemo(() => minDate ? normalizeDate(minDate) : null, [minDate]);
  const maxTimestamp = useMemo(() => maxDate ? normalizeDate(maxDate) : null, [maxDate]);

  const isTodayDisabled = (minTimestamp !== null && todayTimestamp < minTimestamp) || 
                          (maxTimestamp !== null && todayTimestamp > maxTimestamp);

  // Handlers
  const handleButtonClick = useCallback(() => {
    if (disabled) return;
    
    const currentValue = value || date;
    if (currentValue !== prevValueRef.current) {
      if (currentValue) {
        const newDate = parseValue(currentValue);
        setSelectedDate(newDate);
        setCurrentMonth(newDate.getMonth());
        setCurrentYear(newDate.getFullYear());
      } else {
        setSelectedDate(undefined);
      }
      prevValueRef.current = currentValue;
    }
    setIsOpen(true);
  }, [disabled, value, date]);

  const handleDateSelect = useCallback((day: number, isCurrentMonth: boolean, isDisabled: boolean) => {
    if (!isCurrentMonth || isDisabled) return;
    
    const newDate = new Date(currentYear, currentMonth, day);
    setSelectedDate(newDate);
    prevValueRef.current = undefined;
    
    if (onChange) {
      const year = newDate.getFullYear();
      const month = String(newDate.getMonth() + 1).padStart(2, '0');
      const dayStr = String(newDate.getDate()).padStart(2, '0');
      onChange(`${year}-${month}-${dayStr}`);
    }

    if (onDateChange) {
      onDateChange(newDate);
    }
    
    setIsOpen(false);
  }, [currentYear, currentMonth, onChange, onDateChange]);

  const handleToday = useCallback(() => {
    if (isTodayDisabled) return;
    
    const todayDate = new Date();
    setSelectedDate(todayDate);
    setCurrentMonth(todayDate.getMonth());
    setCurrentYear(todayDate.getFullYear());
    prevValueRef.current = undefined;
    
    if (onChange) {
      const year = todayDate.getFullYear();
      const month = String(todayDate.getMonth() + 1).padStart(2, '0');
      const day = String(todayDate.getDate()).padStart(2, '0');
      onChange(`${year}-${month}-${day}`);
    }

    if (onDateChange) {
      onDateChange(todayDate);
    }
    
    setIsOpen(false);
  }, [isTodayDisabled, onChange, onDateChange]);

  const changeMonth = useCallback((delta: number) => {
    setAnimationDirection(delta > 0 ? 'left' : 'right');
    const newMonth = currentMonth + delta;
    if (newMonth < 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else if (newMonth > 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(newMonth);
    }
  }, [currentMonth, currentYear]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);
    const daysInPrevMonth = getDaysInMonth(currentYear, currentMonth - 1);
    const days = [];

    // Previous month days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push({ day: daysInPrevMonth - i, isCurrentMonth: false, isToday: false, isSelected: false, isDisabled: true });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const dayTimestamp = normalizeDate(new Date(currentYear, currentMonth, i));
      const isDisabled = (minTimestamp !== null && dayTimestamp < minTimestamp) || 
                        (maxTimestamp !== null && dayTimestamp > maxTimestamp);
      
      days.push({
        day: i,
        isCurrentMonth: true,
        isToday: dayTimestamp === todayTimestamp,
        isSelected: selectedTimestamp !== null && dayTimestamp === selectedTimestamp,
        isDisabled,
      });
    }

    // Next month days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ day: i, isCurrentMonth: false, isToday: false, isSelected: false, isDisabled: true });
    }

    return days;
  }, [currentYear, currentMonth, todayTimestamp, selectedTimestamp, minTimestamp, maxTimestamp]);

  const displayDate = (value || date) ? parseValue(value || date) : selectedDate;

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        onClick={handleButtonClick}
        disabled={disabled}
        className={cn(
          "justify-start text-left font-normal w-full h-9 cursor-pointer rounded-full",
          !displayDate && "text-muted-foreground",
          className
        )}
      >
        <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
        <span className="truncate">{displayDate ? formatDateShort(displayDate) : placeholder}</span>
      </Button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute z-50 bottom-full mb-1 rounded-lg border bg-popover shadow-lg p-2 w-[260px]">
            {/* Header */}
            <div className="flex items-center justify-between mb-2 px-1">
              <button
                type="button"
                onClick={() => changeMonth(-1)}
                className="h-6 w-6 rounded hover:bg-accent flex items-center justify-center"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>

              <div className="flex items-center gap-1.5">
                <Select 
                  value={currentMonth.toString()}
                  onValueChange={(val) => {
                    const newMonth = parseInt(val);
                    setAnimationDirection(newMonth > currentMonth ? 'left' : 'right');
                    setCurrentMonth(newMonth);
                  }}
                >
                  <SelectTrigger className="w-[95px] h-6 text-xs px-2 py-0">
                    <SelectValue>{MONTH_NAMES[currentMonth]}</SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {MONTH_NAMES.map((month, index) => (
                      <SelectItem key={month} value={index.toString()} className="text-xs">
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select 
                  value={currentYear.toString()}
                  onValueChange={(val) => {
                    const newYear = parseInt(val);
                    setAnimationDirection(newYear > currentYear ? 'left' : 'right');
                    setCurrentYear(newYear);
                  }}
                >
                  <SelectTrigger className="w-[70px] h-6 text-xs px-2 py-0">
                    <SelectValue>{currentYear}</SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {Array.from({ length: 41 }, (_, i) => 2000 + i).map((year) => (
                      <SelectItem key={year} value={year.toString()} className="text-xs">
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <button
                type="button"
                onClick={() => changeMonth(1)}
                className="h-6 w-6 rounded hover:bg-accent flex items-center justify-center"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="overflow-hidden">
              <AnimatePresence mode="wait" custom={animationDirection}>
                <motion.div
                  key={`${currentYear}-${currentMonth}`}
                  custom={animationDirection}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  variants={{
                    enter: (direction: 'left' | 'right' | null) => ({
                      x: direction === 'left' ? 10 : direction === 'right' ? -10 : 0,
                      opacity: 0,
                    }),
                    center: {
                      x: 0,
                      opacity: 1,
                    },
                    exit: (direction: 'left' | 'right' | null) => ({
                      x: direction === 'left' ? -10 : direction === 'right' ? 10 : 0,
                      opacity: 0,
                    }),
                  }}
                  transition={{
                    x: { type: "spring", stiffness: 500, damping: 20 },
                    opacity: { duration: 0.1 },
                  }}
                  className="w-full"
                >
                  {/* Week days */}
                  <div className="grid grid-cols-7 mb-1">
                    {WEEK_DAYS.map((day) => (
                      <div key={day} className="h-6 flex items-center justify-center text-[10px] font-medium text-muted-foreground">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Days */}
                  <div className="grid grid-cols-7 gap-0.5">
                    {calendarDays.map((dayObj, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleDateSelect(dayObj.day, dayObj.isCurrentMonth, dayObj.isDisabled)}
                        disabled={!dayObj.isCurrentMonth || dayObj.isDisabled}
                        className={cn(
                          "h-7 w-7 rounded text-xs transition-colors",
                          (!dayObj.isCurrentMonth || dayObj.isDisabled) && "text-muted-foreground/30 cursor-default",
                          dayObj.isCurrentMonth && !dayObj.isDisabled && "hover:bg-accent",
                          dayObj.isSelected && "bg-primary text-primary-foreground hover:bg-primary font-semibold",
                          dayObj.isToday && !dayObj.isSelected && !dayObj.isDisabled && "bg-accent/50 font-semibold"
                        )}
                      >
                        {dayObj.day}
                      </button>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Today button */}
            <div className="mt-2 pt-2 border-t">
              <button
                type="button"
                onClick={handleToday}
                disabled={isTodayDisabled}
                className="w-full h-7 text-xs rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Today
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
});

export function DatePickerWithRange({
  className,
  value,
  onChange,
  minDate,
  maxDate,
}: {
  className?: string;
  value: DateRange | undefined;
  onChange: (date: DateRange | undefined) => void;
  minDate?: Date;
  maxDate?: Date;
}) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal rounded-full",
              !value && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value?.from ? (
              value.to ? (
                <>
                  {format(value.from, "LLL dd, y")} -{" "}
                  {format(value.to, "LLL dd, y")}
                </>
              ) : (
                format(value.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={value?.from}
            selected={value}
            onSelect={onChange}
            numberOfMonths={2}
            disabled={(date) => {
              if (minDate && date < new Date(new Date(minDate).setHours(0, 0, 0, 0))) return true;
              if (maxDate && date > new Date(new Date(maxDate).setHours(0, 0, 0, 0))) return true;
              return false;
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export { formatDate, formatDateShort };