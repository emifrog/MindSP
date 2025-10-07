"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, List, Grid } from "lucide-react";
import Link from "next/link";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { fr } from "date-fns/locale";

interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  type: string;
  color: string | null;
  location: string | null;
  creator: {
    firstName: string;
    lastName: string;
  };
  participants: Array<{
    status: string;
    user: {
      firstName: string;
      lastName: string;
    };
  }>;
}

export default function AgendaPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "list">("month");

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);

      const response = await fetch(
        `/api/calendar/events?start=${start.toISOString()}&end=${end.toISOString()}`
      );
      const data = await response.json();

      if (response.ok) {
        setEvents(data.events);
      }
    } catch (error) {
      console.error("Erreur chargement événements:", error);
    } finally {
      setLoading(false);
    }
  };

  const getEventColor = (type: string) => {
    const colors: Record<string, string> = {
      FMPA: "bg-blue-500",
      FORMATION: "bg-green-500",
      MEETING: "bg-purple-500",
      INTERVENTION: "bg-red-500",
      GARDE: "bg-orange-500",
      ASTREINTE: "bg-yellow-500",
      OTHER: "bg-gray-500",
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agenda</h1>
          <p className="text-muted-foreground">
            Gérez votre planning et vos disponibilités
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/agenda/disponibilites">
              <Calendar className="mr-2 h-4 w-4" />
              Mes disponibilités
            </Link>
          </Button>
          <Button asChild>
            <Link href="/agenda/nouveau">
              <Plus className="mr-2 h-4 w-4" />
              Nouvel événement
            </Link>
          </Button>
        </div>
      </div>

      {/* Navigation mois */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentDate(
                    new Date(currentDate.setMonth(currentDate.getMonth() - 1))
                  )
                }
              >
                ← Précédent
              </Button>
              <h2 className="text-xl font-semibold">
                {format(currentDate, "MMMM yyyy", { locale: fr })}
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentDate(
                    new Date(currentDate.setMonth(currentDate.getMonth() + 1))
                  )
                }
              >
                Suivant →
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
              >
                Aujourd&apos;hui
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant={view === "month" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("month")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={view === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Liste des événements */}
      {loading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Chargement...</p>
          </CardContent>
        </Card>
      ) : events.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Aucun événement</h3>
            <p className="text-muted-foreground">
              Aucun événement prévu pour ce mois
            </p>
            <Button className="mt-4" asChild>
              <Link href="/agenda/nouveau">
                <Plus className="mr-2 h-4 w-4" />
                Créer un événement
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => (
            <Card key={event.id} className="cursor-pointer hover:shadow-lg">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-1 h-3 w-3 rounded-full ${getEventColor(
                        event.type
                      )}`}
                    />
                    <div>
                      <CardTitle>{event.title}</CardTitle>
                      <CardDescription>
                        {format(new Date(event.startDate), "PPP à HH:mm", {
                          locale: fr,
                        })}
                        {" - "}
                        {format(new Date(event.endDate), "HH:mm", {
                          locale: fr,
                        })}
                      </CardDescription>
                    </div>
                  </div>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {getEventTypeLabel(event.type)}
                  </span>
                </div>
              </CardHeader>
              {(event.description || event.location) && (
                <CardContent>
                  {event.description && (
                    <p className="text-sm text-muted-foreground">
                      {event.description}
                    </p>
                  )}
                  {event.location && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      📍 {event.location}
                    </p>
                  )}
                  {event.participants.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-muted-foreground">
                        Participants ({event.participants.length})
                      </p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {event.participants.slice(0, 5).map((p, i) => (
                          <span
                            key={i}
                            className="rounded-full bg-secondary px-2 py-1 text-xs"
                          >
                            {p.user.firstName} {p.user.lastName}
                          </span>
                        ))}
                        {event.participants.length > 5 && (
                          <span className="rounded-full bg-secondary px-2 py-1 text-xs">
                            +{event.participants.length - 5}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
