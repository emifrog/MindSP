"use client";

import { cn } from "@/lib/utils";
import {
  DAYS_OF_WEEK_SHORT,
  getCalendarDays,
  isSameDay,
} from "@/lib/calendar-utils";
import { EventCard } from "./EventCard";
import type { AgendaEventType } from "@prisma/client";

interface CalendarEvent {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  type: AgendaEventType;
  location?: string | null;
  color?: string | null;
  allDay?: boolean;
  _count?: {
    participants: number;
  };
}

interface CalendarGridProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick?: (eventId: string) => void;
  onDayClick?: (date: Date) => void;
}

export function CalendarGrid({
  currentDate,
  events,
  onEventClick,
  onDayClick,
}: CalendarGridProps) {
  const days = getCalendarDays(
    currentDate.getFullYear(),
    currentDate.getMonth()
  );

  // Grouper les événements par jour
  const eventsByDay = events.reduce(
    (acc, event) => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);

      // Trouver tous les jours où l'événement est actif
      days.forEach(({ date }) => {
        if (
          (isSameDay(date, eventStart) ||
            isSameDay(date, eventEnd) ||
            (date > eventStart && date < eventEnd)) &&
          date.getMonth() === currentDate.getMonth()
        ) {
          const key = date.toISOString().split("T")[0];
          if (!acc[key]) {
            acc[key] = [];
          }
          // Éviter les doublons
          if (!acc[key].find((e) => e.id === event.id)) {
            acc[key].push(event);
          }
        }
      });

      return acc;
    },
    {} as Record<string, CalendarEvent[]>
  );

  return (
    <div className="flex-1 overflow-auto">
      <div className="grid grid-cols-7 border-b bg-muted/50">
        {DAYS_OF_WEEK_SHORT.map((day) => (
          <div
            key={day}
            className="border-r p-2 text-center text-sm font-medium last:border-r-0"
          >
            {day}
          </div>
        ))}
      </div>

      <div
        className="grid grid-cols-7"
        style={{ gridAutoRows: "minmax(120px, 1fr)" }}
      >
        {days.map(({ date, day, isCurrentMonth, isToday }) => {
          const dateKey = date.toISOString().split("T")[0];
          const dayEvents = eventsByDay[dateKey] || [];

          return (
            <button
              key={date.toISOString()}
              onClick={() => onDayClick?.(date)}
              className={cn(
                "group relative border-b border-r p-2 text-left transition-colors last:border-r-0",
                "hover:bg-accent focus:outline-none focus:ring-2 focus:ring-inset focus:ring-ring",
                !isCurrentMonth && "bg-muted/30 text-muted-foreground",
                isToday && "bg-primary/5"
              )}
            >
              <div className="mb-1 flex items-center justify-between">
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-sm",
                    isToday &&
                      "bg-primary font-semibold text-primary-foreground",
                    !isCurrentMonth && "opacity-50"
                  )}
                >
                  {day}
                </span>
              </div>

              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick?.(event.id);
                    }}
                  >
                    <EventCard
                      id={event.id}
                      title={event.title}
                      startDate={new Date(event.startDate)}
                      endDate={new Date(event.endDate)}
                      type={event.type}
                      location={event.location}
                      color={event.color}
                      allDay={event.allDay}
                      participantCount={event._count?.participants}
                    />
                  </div>
                ))}

                {dayEvents.length > 3 && (
                  <div className="rounded-md bg-muted px-2 py-1 text-center text-xs text-muted-foreground">
                    +{dayEvents.length - 3} autre
                    {dayEvents.length - 3 > 1 ? "s" : ""}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
