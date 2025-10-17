"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Icons } from "@/lib/icons";
import { MonthCalendar } from "@/components/calendar/MonthCalendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CalendarEvent } from "@/types/calendar";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function AgendaPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [showEventDialog, setShowEventDialog] = useState(false);

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/calendar/events`);

      if (!response.ok) throw new Error("Erreur de chargement");

      const data = await response.json();

      // Convertir les dates string en Date objects et ajouter les couleurs
      const eventsWithDates = data.events.map((event: any) => ({
        ...event,
        startDate: new Date(event.startDate),
        endDate: new Date(event.endDate),
        color: getEventColor(event.type),
      }));

      setEvents(eventsWithDates);
    } catch (error) {
      console.error("Erreur chargement événements:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les événements",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getEventColor = (type: string) => {
    const colors: Record<string, string> = {
      FMPA: "#3b82f6",
      FORMATION: "#10b981",
      MEETING: "#a855f7",
      INTERVENTION: "#ef4444",
      GARDE: "#f97316",
      ASTREINTE: "#eab308",
      OTHER: "#6b7280",
    };
    return colors[type] || colors.OTHER;
  };

  const getEventTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      FMPA: "FMPA",
      FORMATION: "Formation",
      MEETING: "Réunion",
      INTERVENTION: "Intervention",
      GARDE: "Garde",
      ASTREINTE: "Astreinte",
      OTHER: "Autre",
    };
    return labels[type] || type;
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventDialog(true);
  };

  const handleDateClick = (date: Date) => {
    // Ouvrir formulaire de création d'événement avec date pré-remplie
    console.log("Date clicked:", date);
  };

  const handleAddEvent = () => {
    // Rediriger vers formulaire de création
    window.location.href = "/agenda/nouveau";
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Icon name={Icons.ui.menu} size="2xl" className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold">
            <Icon name={Icons.nav.calendar} size="xl" />
            Agenda
          </h1>
          <p className="text-muted-foreground">
            Gérez votre planning et vos disponibilités
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/agenda/disponibilites">
            <Icon name={Icons.info.date} size="sm" className="mr-2" />
            Mes disponibilités
          </Link>
        </Button>
      </div>

      {/* Calendar */}
      <MonthCalendar
        events={events}
        onEventClick={handleEventClick}
        onDateClick={handleDateClick}
        onAddEvent={handleAddEvent}
      />

      {/* Event Dialog */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent className="max-w-2xl">
          {selectedEvent && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <DialogTitle className="text-2xl">
                      {selectedEvent.title}
                    </DialogTitle>
                    <DialogDescription className="mt-2">
                      <div className="flex items-center gap-2">
                        <Icon name={Icons.info.date} size="sm" />
                        <span>
                          {format(selectedEvent.startDate, "PPP à HH:mm", {
                            locale: fr,
                          })}
                          {" - "}
                          {format(selectedEvent.endDate, "HH:mm", {
                            locale: fr,
                          })}
                        </span>
                      </div>
                    </DialogDescription>
                  </div>
                  <Badge
                    style={{
                      backgroundColor: `${selectedEvent.color}20`,
                      color: selectedEvent.color,
                      borderColor: selectedEvent.color,
                    }}
                    className="border"
                  >
                    {getEventTypeLabel(selectedEvent.type)}
                  </Badge>
                </div>
              </DialogHeader>

              <div className="mt-4 space-y-4">
                {selectedEvent.description && (
                  <div>
                    <h3 className="mb-2 text-sm font-medium">Description</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedEvent.description}
                    </p>
                  </div>
                )}

                {selectedEvent.location && (
                  <div>
                    <h3 className="mb-2 text-sm font-medium">Lieu</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon name={Icons.info.location} size="sm" />
                      <span>{selectedEvent.location}</span>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="mb-2 text-sm font-medium">Organisateur</h3>
                  <div className="flex items-center gap-2">
                    <Icon name={Icons.info.user} size="sm" />
                    <span className="text-sm">
                      {selectedEvent.creator.firstName}{" "}
                      {selectedEvent.creator.lastName}
                    </span>
                  </div>
                </div>

                {selectedEvent.participants.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-sm font-medium">
                      Participants ({selectedEvent.participants.length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedEvent.participants.map((p, i) => (
                        <Badge key={i} variant="secondary">
                          {p.user.firstName} {p.user.lastName}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button asChild className="flex-1">
                    <Link href={`/agenda/${selectedEvent.id}`}>
                      <Icon name={Icons.ui.eye} size="sm" className="mr-2" />
                      Voir les détails
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href={`/agenda/${selectedEvent.id}/edit`}>
                      <Icon
                        name={Icons.action.edit}
                        size="sm"
                        className="mr-2"
                      />
                      Modifier
                    </Link>
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
