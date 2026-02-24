'use client';

import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onDateChange: (start: Date | null, end: Date | null) => void;
  className?: string;
}

export default function DateRangePicker({
  startDate,
  endDate,
  onDateChange,
  className = ''
}: DateRangePickerProps) {
  const date: DateRange | undefined = startDate && endDate 
    ? { from: startDate, to: endDate } 
    : startDate 
      ? { from: startDate }
      : undefined;

  const formatDate = (date: Date | null) => {
    if (!date) return 'Pilih tanggal';
    return format(date, 'd MMM yyyy', { locale: id });
  };

  const handleSelect = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      onDateChange(range.from, range.to);
    } else if (range?.from) {
      onDateChange(range.from, null);
    } else {
      onDateChange(null, null);
    }
  };

  const clearDates = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDateChange(null, null);
  };

  const hasDateRange = startDate && endDate;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-medium text-sm px-4 py-2",
            !hasDateRange && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {hasDateRange ? (
            <>
              {formatDate(startDate)} - {formatDate(endDate)}
            </>
          ) : (
            <span>Semua Tanggal</span>
          )}
          {hasDateRange && (
            <X 
              className="ml-auto h-4 w-4 opacity-50 hover:opacity-100" 
              onClick={clearDates}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={startDate ?? undefined}
          selected={date}
          onSelect={handleSelect}
          numberOfMonths={1}
          locale={id}
        />
      </PopoverContent>
    </Popover>
  );
}
