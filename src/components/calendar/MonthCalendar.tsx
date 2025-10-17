"use client";

import { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Icons } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { CalendarEvent } from "@/types/calendar";

interface MonthCalendarProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
  onAddEvent?: () => void;
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function MonthCalendar({
  events,
  onEventClick,
  onDateClick,
  onAddEvent,
}: MonthCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const getEventsForDay = (day: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.startDate);
      return (
        eventDate.getDate() === day.getDate() &&
        eventDate.getMonth() === day.getMonth() &&
        eventDate.getFullYear() === day.getFullYear()
      );
    });
  };

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handleToday = () => setCurrentDate(new Date());

  const totalEvents = events.filter((event) => {
    const eventDate = new Date(event.startDate);
    return (
      eventDate.getMonth() === currentDate.getMonth() &&
      eventDate.getFullYear() === currentDate.getFullYear()
    );
  }).length;

  return (
    <div className="rounded-lg border bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-4">
          {/* Date Badge */}
          <div className="flex h-16 w-16 flex-col items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-xs font-semibold uppercase">
              {format(currentDate, "MMM", { locale: fr })}
            </span>
            <span className="text-2xl font-bold">
              {format(currentDate, "dd")}
            </span>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
              <Icon name={Icons.ui.chevronLeft} size="sm" />
            </Button>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">
                {format(currentDate, "MMMM d, yyyy", { locale: fr })}
              </h2>
              <span className="text-sm text-muted-foreground">
                {totalEvents} événements
              </span>
            </div>
            <Button variant="ghost" size="icon" onClick={handleNextMonth}>
              <Icon name={Icons.ui.chevronRight} size="sm" />
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleToday}>
            <Icon name={Icons.info.date} size="sm" className="mr-2" />
            Aujourd&apos;hui
          </Button>
          <Button variant="outline" size="icon">
            <Icon name={Icons.action.filter} size="sm" />
          </Button>
          <Button variant="outline" size="icon">
            <Icon name={Icons.ui.menu} size="sm" />
          </Button>
          <Button size="sm" onClick={onAddEvent}>
            <Icon name={Icons.action.add} size="sm" className="mr-2" />
            Add Event
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Weekday Headers */}
        <div className="mb-2 grid grid-cols-7 gap-px">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="py-2 text-center text-sm font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg bg-border">
          {calendarDays.map((day, index) => {
            const dayEvents = getEventsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isTodayDate = isToday(day);
            const visibleEvents = dayEvents.slice(0, 3);
            const moreCount = dayEvents.length - visibleEvents.length;

            return (
              <div
                key={index}
                className={cn(
                  "min-h-[120px] cursor-pointer bg-background p-2 transition-colors hover:bg-accent/50",
                  !isCurrentMonth && "bg-muted/30 text-muted-foreground"
                )}
                onClick={() => onDateClick?.(day)}
              >
                {/* Day Number */}
                <div className="mb-1 flex items-center justify-between">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isTodayDate &&
                        "flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground"
                    )}
                  >
                    {format(day, "d")}
                  </span>
                </div>

                {/* Events */}
                <div className="space-y-1">
                  {visibleEvents.map((event) => (
                    <div
                      key={event.id}
                      className={cn(
                        "cursor-pointer truncate rounded-md px-2 py-1 text-xs transition-opacity hover:opacity-80",
                        "border"
                      )}
                      style={{
                        backgroundColor: `${event.color}20`,
                        borderColor: event.color,
                        color: event.color,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick?.(event);
                      }}
                    >
                      <span className="font-medium">{event.title}</span>
                      <span className="ml-1">
                        {format(event.startDate, "h:mm a")}
                      </span>
                    </div>
                  ))}
                  {moreCount > 0 && (
                    <button
                      className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDateClick?.(day);
                      }}
                    >
                      +{moreCount} more
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
